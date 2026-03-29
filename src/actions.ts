import * as vscode from "vscode";
import {
	isCommandList,
	isSimpleCommand,
	isComplexCommand
} from "./actions.guard";
import { KeyEventHandler } from "./keybindings";
import { Config, getStyle, cursorStyleMap } from "./config";
import { KeyError } from "./error";

/**
 * Standard modes
 */
export const NORMAL = "normal";
export const INSERT = "insert";
export const SELECT = "select";
export const COMMAND = "command";
export const SELECTION_SEARCH = "selectionSearch";

/**
 * Command types:
 *  string: the name of VS Code command
 *  Conditional: condition command with an when condition
 *  Command[]: a list of commands
 *
 * @see {isCommand} ts-auto-guard:type-guard
 */
export type Command = SimpleCommand | ComplexCommand | CommandList;

/**
 * @see {isSimpleCommand} ts-auto-guard:type-guard
 */
export type SimpleCommand = string;

/**
 * @see {isComplexCommand} ts-auto-guard:type-guard
 */
export type ComplexCommand = {
	command: Command,
	/// args for that command (only if it's a simple command)
	args?: any,
	/// whether to use JS expression for args
	computedArgs?: boolean,
	/// condition to execute the above command
	when?: string,
	/// run this command for count times (a js expression)
	count?: string,
	/**
	 * Whether to record the key sequence for this command in a register
	 * (only works for top-level command)
	 */
	record?: string
};

/**
 * Context for eval js expressions
 *
 * @see {isCommandContext} ts-auto-guard:type-guard
 */
export type CommandContext = {
	/// Key sequence to invoke this command or unexecuted keys
	keys: string,
	/// Count of the current command
	count?: number
};

/// Register to store yanked contents
export type YankRegisters = {
	// A list of strings for multi-cursor yanking
	[reg: string]: string[]
};

/// Register to store records
export type RecordRegisters = {
	[reg: string]: string
};

/**
 * @see {isCommandList} ts-auto-guard:type-guard
 */
export type CommandList = Command[];

export class AppState {
	// Allow initialization in a method
	keyEventHandler!: KeyEventHandler;
	mode!: string;
	/// registers for copy/paste
	registers: YankRegisters;
	/// record registers for history key sequences
	records: RecordRegisters;
	/// Last record reg
	lastRecordReg: string | undefined;
	/// anchors when entering select mode
	anchors: vscode.Position[];
	/// selection before last command
	lastSelections: readonly vscode.Selection[] | undefined;
	/// selection search state
	selectionSearchPattern: string;
	/// original selections before entering selection search
	originalSelections: readonly vscode.Selection[] | undefined;
	/// index of primary selection for multi-selection navigation
	primarySelectionIndex: number;
	/// decorations for primary and secondary selections
	primarySelectionDecoration: vscode.TextEditorDecorationType | undefined;
	secondarySelectionDecoration: vscode.TextEditorDecorationType | undefined;

	constructor(
		mode: string,
		public config: Config,
		public outputChannel: vscode.OutputChannel,
		public modeStatusBar: vscode.StatusBarItem,
		public keyStatusBar: vscode.StatusBarItem
	) {
		this.registers = {};
		this.records = {};
		this.anchors = [];
		this.selectionSearchPattern = "";
		this.originalSelections = undefined;
		this.primarySelectionIndex = 0;
		this.initializeDecorations();
		this.setMode(mode);
	}

	/// Update cursor and status bar
	updateStatus(editor?: vscode.TextEditor) {
		if (editor) {
			const { cursorStyle, statusText } = getStyle(this.mode, this.config.styles);
			// default cursorStyle
			editor.options.cursorStyle = cursorStyleMap[cursorStyle || "block"];
			if (this.mode !== SELECTION_SEARCH) {
				// default statusText (except for selection search mode that has its own status)
				this.modeStatusBar.text = statusText || `-- ${this.mode.toUpperCase()} --`;
			}

			this.modeStatusBar.show();
			this.keyStatusBar.show();
		}
		else {
			this.modeStatusBar.hide();
			this.keyStatusBar.hide();
		}
	}

	updateConfig(config: Partial<Config>) {
		this.config = {
			...this.config,
			...config
		};
		this.setMode(this.config.misc.defaultMode);
	}

	log(message: string) {
		this.outputChannel.appendLine(message);
	}

	/// Reset internal state
	reset() {
		this.keyEventHandler.reset();
		this.updateStatus(vscode.window.activeTextEditor);
	}

	statusBarForMode(mode: string): vscode.StatusBarItem {
		switch (mode) {
			case COMMAND:
			case SELECTION_SEARCH:
				return this.modeStatusBar;
			default:
				return this.keyStatusBar;
		}
	}

	setMode(mode: string) {
		// Clear decorations when leaving any mode
		this.clearSelectionDecorations();
		this.mode = mode;
		this.updateStatus(vscode.window.activeTextEditor);
		if (mode === SELECT) {
			// record anchor
			this.anchors = vscode.window.activeTextEditor?.selections.map(sel => sel.anchor) ?? [];
		} else if (mode === SELECTION_SEARCH) {
			// record original selections before making new ones during search
			this.originalSelections = vscode.window.activeTextEditor?.selections;
			this.selectionSearchPattern = "";
		}
		this.keyEventHandler = new KeyEventHandler(
			this.statusBarForMode(mode),
			// keymap in this mode
			this.config.keybindings[mode],
			// common keymap
			this.config.keybindings[""],
			// whether it's command mode
			mode === COMMAND,
			this.config.misc.parseNumberPrefix
		);

		if (mode === SELECTION_SEARCH) {
			this.updateSearchStatus();
		}
	}

	async replayRecord(reg: string) {
		const record = this.records[reg];
		if (record) {
			for (const key of record) {
				await this.handleKey(key);
			}
			this.setMode(NORMAL);
		}
	}

	async handleKey(key: string) {
		try {
			if (this.mode === INSERT) {
				if (this.lastRecordReg) {
					// record the keys in insert mode as well
					// if the last command is recorded
					this.records[this.lastRecordReg] += key;
				}

				// call default handler for type
				vscode.commands.executeCommand("default:type", {
					text: key
				});
				return;
			}

			if (this.mode === SELECTION_SEARCH) {
				// Handle selection search input
				await this.handleSelectionSearchKey(key);
				return;
			}

			const result = this.keyEventHandler.handle(key);
			if (result) {
				const previousMode = this.mode;
				const { command, ctx } = result;
				// Record key sequence that triggers this command
				if (isComplexCommand(command) && command.record) {
					this.records[command.record] = ctx.keys;
					this.lastRecordReg = command.record;
				}
				else {
					this.lastRecordReg = undefined;
				}

				await this.executeCommand(command, ctx);

				// Exit command mode if previous and current modes are command
				// (mode may change after executing some command)
				if (previousMode === COMMAND && this.mode === COMMAND)
					this.setMode(NORMAL);
			}
		}
		catch (err: any) {
			if (err instanceof KeyError && this.config.misc.ignoreUndefinedKeys) {
				// don't show any error message
				this.log(err.message);
			}
			else {
				vscode.window.showErrorMessage(`Modal Editor: ${err.message}`);
			}

			// Exit command mode
			if (this.mode === COMMAND)
				this.setMode(NORMAL);
		}
	}

	/**
	 * Execute a command with a context
	 */
	async executeCommand(command: Command, ctx: CommandContext) {
		if (isSimpleCommand(command)) {
			await this.executeVSCommand(command);
		}
		else if (isComplexCommand(command)) {
			// Execute it if when is not defined or condition is true
			if (!command.when || this.jsEval(command.when, ctx)) {
				const count = (command.count && this.jsEval(command.count, ctx)) ?? 1;
				if (!Number.isInteger(count)) {
					vscode.window.showErrorMessage(`Invalid count for command ${command.command}`);
					return;
				}

				// run the command for count times
				for (let i = 0; i < count; ++i) {
					if (isSimpleCommand(command.command)) {
						// evaluate args only for simple command inside this complex command
						let args = command.args;
						if (command.computedArgs) {
							if (typeof args !== "string") {
								vscode.window.showErrorMessage(`Invalid args for command ${command.command}`);
								return;
							}
							args = this.jsEval(args, ctx);
						}
						await this.executeVSCommand(command.command, args);
					}
					else {
						await this.executeCommand(command.command, ctx);
					}
				}
			}
		}
		else if (isCommandList(command)) {
			for (const c of command) {
				await this.executeCommand(c, ctx);
			}
		}
		else {
			vscode.window.showErrorMessage(`Invalid command: ${command}`);
		}
	}

	/**
	 * jsEval evaluates JS expressions
	 */
	jsEval(expressions: string, ctx: CommandContext) {
		const editor = vscode.window.activeTextEditor;
		// _ctx is accessible in side eval
		const _ctx = {
			...ctx,
			// cursor position before last command
			lastPos: this.lastSelections?.[0].active,
			// current cursor position
			pos: editor?.selection.active,
			// get the line
			lineAt: editor?.document.lineAt,
			// primary selection before last command
			// (alias for this.lastSelections?.[0])
			lastSelection: this.lastSelections?.[0],
			// selections before last command
			lastSelections: this.lastSelections,
			// current primary selection
			selection: editor?.selection,
			// current selections
			selections: editor?.selections,
			// language Id of current document
			languageId: editor?.document.languageId,
		};

		return eval(`(${expressions})`);
	}

	async executeVSCommand(command: string, ...rest: any[]) {
		const editor = vscode.window.activeTextEditor;
		this.lastSelections = editor?.selections;
		try {
			await vscode.commands.executeCommand(command, ...rest);
		}
		catch (error: any) {
			vscode.window.showErrorMessage(error.message);
		}
	}

	async handleSelectionSearchKey(key: string) {
		const editor = vscode.window.activeTextEditor;
		if (!editor || !this.originalSelections) {
			return;
		}

		switch (key) {
			case '\n':
			case '\r':
				// Enter key - confirm search and exit to normal mode
				this.setMode(NORMAL);
				return;
			case '\u001b':
				// Escape key - cancel search and restore original selections
				if (this.originalSelections) {
					editor.selections = Array.from(this.originalSelections);
				}
				this.setMode(NORMAL);
				return;
			case '\b':
			case '\u007f':
				// Backspace or Delete - remove last character
				if (this.selectionSearchPattern.length > 0) {
					this.selectionSearchPattern = this.selectionSearchPattern.slice(0, -1);
					this.updateSelectionSearch(editor);
				}
				return;
			default:
				// Regular character - add to pattern
				this.selectionSearchPattern += key;
				this.updateSelectionSearch(editor);
				return;
		}
	}

	updateSelectionSearch(editor: vscode.TextEditor) {
		// If no pattern, restore original selections
		if (!this.originalSelections || this.selectionSearchPattern === "") {
			if (this.originalSelections) {
				editor.selections = Array.from(this.originalSelections);
			}
			this.updateSearchStatus();
			return;
		}

		let regex: RegExp;
		try {
			regex = new RegExp(this.selectionSearchPattern, 'gm');
		} catch (error) {
			if (this.originalSelections) {
				editor.selections = Array.from(this.originalSelections);
			}
			this.updateSearchStatus("invalid regex");
			return;
		}

		const newSelections: vscode.Selection[] = [];

		// Search within each original selection
		for (const originalSel of this.originalSelections) {
			const text = editor.document.getText(originalSel);
			let match;
			regex.lastIndex = 0; // Reset regex state

			while ((match = regex.exec(text)) !== null) {
				// Calculate absolute positions
				const startOffset = editor.document.offsetAt(originalSel.start) + match.index;
				const endOffset = startOffset + Math.max(0, match[0].length - 1);
				const startPos = editor.document.positionAt(startOffset);
				const endPos = editor.document.positionAt(endOffset);
				if (match[0].length > 0) {
					newSelections.push(new vscode.Selection(startPos, endPos));
				}
				else {
					// Prevent infinite loop with zero-length matches
					regex.lastIndex = match.index + 1;
				}
			}
		}

		// Update editor selections
		if (newSelections.length > 0) {
			editor.selections = newSelections;
			// Reset primary selection to first result
			this.primarySelectionIndex = 0;
			// Ensure the first selection is visible
			editor.revealRange(newSelections[0], vscode.TextEditorRevealType.InCenterIfOutsideViewport);
			// Update decorations for multiple selections
			if (newSelections.length > 1) {
				this.updateSelectionDecorations();
			}
			this.updateSearchStatus(undefined, newSelections.length);
		} else {
			// No matches found - restore original selections
			if (this.originalSelections) {
				editor.selections = Array.from(this.originalSelections);
			}
			this.updateSearchStatus(undefined, 0);
		}
	}

	updateSearchStatus(error?: string, matchCount?: number) {
		if (this.mode !== SELECTION_SEARCH) {
			return;
		}

		const editor = vscode.window.activeTextEditor;
		let actualMatchCount = 0;
		if (matchCount === undefined) {
			if (this.selectionSearchPattern === "") {
				error = "enter regex";
			}
			else if (editor && editor.selections) {
				actualMatchCount = editor.selections.length;
			}
		}
		else {
			actualMatchCount = matchCount;
		}

		const statusText = error
			? `SEL: ${this.selectionSearchPattern} (${error})`
			: `SEL: ${this.selectionSearchPattern} (${actualMatchCount} matches)`;
		this.modeStatusBar.text = statusText;
	}

	initializeDecorations() {
		this.primarySelectionDecoration = vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('editor.selectionBackground'),
			border: '2px solid',
			borderColor: new vscode.ThemeColor('editor.selectionForeground')
		});

		this.secondarySelectionDecoration = vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('editor.inactiveSelectionBackground'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('editor.selectionForeground')
		});
	}

	updateSelectionDecorations() {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.selections.length <= 1) {
			return;
		}

		const primaryRanges: vscode.Range[] = [];
		const secondaryRanges: vscode.Range[] = [];

		editor.selections.forEach((selection, index) => {
			if (index === this.primarySelectionIndex) {
				primaryRanges.push(selection);
			} else {
				secondaryRanges.push(selection);
			}
		});

		if (this.primarySelectionDecoration) {
			editor.setDecorations(this.primarySelectionDecoration, primaryRanges);
		}
		if (this.secondarySelectionDecoration) {
			editor.setDecorations(this.secondarySelectionDecoration, secondaryRanges);
		}
	}

	clearSelectionDecorations() {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		if (this.primarySelectionDecoration) {
			editor.setDecorations(this.primarySelectionDecoration, []);
		}
		if (this.secondarySelectionDecoration) {
			editor.setDecorations(this.secondarySelectionDecoration, []);
		}
	}

	navigateToNextSelection() {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.selections.length <= 1) {
			return;
		}

		this.primarySelectionIndex = (this.primarySelectionIndex + 1) % editor.selections.length;
		this.updateSelectionDecorations();

		// Ensure the primary selection is visible
		const primarySelection = editor.selections[this.primarySelectionIndex];
		editor.revealRange(primarySelection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
	}

	navigateToPreviousSelection() {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.selections.length <= 1) {
			return;
		}

		this.primarySelectionIndex = this.primarySelectionIndex === 0
			? editor.selections.length - 1
			: this.primarySelectionIndex - 1;
		this.updateSelectionDecorations();

		// Ensure the primary selection is visible
		const primarySelection = editor.selections[this.primarySelectionIndex];
		editor.revealRange(primarySelection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
	}

	unselectPrimarySelection() {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.selections.length <= 1) {
			return;
		}

		const newSelections = editor.selections.filter((_, index) => index !== this.primarySelectionIndex);
		editor.selections = newSelections;

		// Adjust primary selection index
		if (this.primarySelectionIndex >= newSelections.length) {
			this.primarySelectionIndex = Math.max(0, newSelections.length - 1);
		}

		this.updateSelectionDecorations();

		// Ensure the new primary selection is visible if any selections remain
		if (newSelections.length > 0) {
			const primarySelection = newSelections[this.primarySelectionIndex];
			editor.revealRange(primarySelection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
		}
	}

	dispose() {
		this.primarySelectionDecoration?.dispose();
		this.secondarySelectionDecoration?.dispose();
	}
}
