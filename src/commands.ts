import * as vscode from "vscode";
import * as os from "os";
import { readConfig } from "./config";
import { isKeybindings } from "./keybindings.guard";
import { AppState, NORMAL, INSERT, SELECT, COMMAND, Command } from "./actions";
import { isCommand } from "./actions.guard";
import { isFindTextArgs, isYankArgs, isPasteArgs } from "./commands.guard";

/// Current app state
let appState: AppState;
/// Subscription to type command
let typeCommandSubscription: vscode.Disposable | null = null;

/// Get command id from command function
function commandId(command: (_: any) => any) {
	return `modalEditor.${command.name}`;
}

/**
 * Load keybindings from a URI
 */
async function loadKeybindings(uri: vscode.Uri) {
	const fs = vscode.workspace.fs;
	try {
		let data = Buffer.from(await fs.readFile(uri)).toString("utf-8");
		if (uri.fsPath.match(/json[5c]?$/))
			data = `(${data})`;

		const keybindings = eval(data);
		if (!isKeybindings(keybindings)) {
			throw new Error("invalid keybindings");
		}
		appState.updateConfig({ keybindings });
		const config = vscode.workspace.getConfiguration("modalEditor");
		config.update("keybindings", keybindings, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage("Modal Editor: Keybindings imported");
	}
	catch (err: any) {
		vscode.window.showErrorMessage(`Modal Editor: Failed to import keybindings: ${err.message}`);
	}
}

interface PickItem extends vscode.QuickPickItem {
	type: "file" | "uri" | "preset"
}

/// Expand tilde to home directory
function expandHome(filePath: string) {
	const home = os.homedir();
	// Use lookahead to match the tilde
	const regex = /^~(?=$|\/|\\)/;
	return filePath.replace(regex, home);
}

async function importPreset(directory?: string) {
	const presetDir = directory ?? appState.config.misc.presetDirectory;
	const dir = vscode.Uri.file(expandHome(presetDir));
	const entries = await vscode.workspace.fs.readDirectory(dir);
	// Filter entries
	const files = entries
		.filter(([name, type]) => (
			/\.(js)|(jsonc?)$/.test(name) && type === vscode.FileType.File
		))
		.map(([name]) => ({
			path: vscode.Uri.joinPath(dir, name),
			label: name
		}));
	
	const choice = await vscode.window.showQuickPick(files, {
		placeHolder: "Warning: importing keybindings will overwrite current ones in settings.json"
	});
	
	if (choice) {
		await loadKeybindings(choice.path);
	}
}

async function importKeybindings() {
	const choices: PickItem[] = [
		{
			label: "Import from preset directory...",
			type: "preset"
		},
		{
			label: "Import from a file...",
			type: "file"
		},
		{
			label: "Import from a URI...",
			type: "uri"
		}
	];
	
	const choice = await vscode.window.showQuickPick(choices, {
		placeHolder: "Warning: importing keybindings will overwrite current ones in settings.json"
	});

	switch (choice?.type) {
		case "file": {
			const files = await vscode.window.showOpenDialog({
				title: "Import keybindings from file",
				openLabel: "Import",
				filters: {
				  "Keybindings": ["json", "jsonc", "js"]
				},
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: false
			});

			if (files && files.length > 0) {
				await loadKeybindings(files[0]);
			}
			break;
		}

		case "uri": {
			const uri = await vscode.window.showInputBox({
				prompt: "Enter a valid URI"
			})
			if (uri) {
				await loadKeybindings(vscode.Uri.parse(uri, true));
			}
			break;
		}
		
		case "preset": {
			await importPreset();
			break;
		}
	}
}

/**
 * Handle key event.
 *
 * The event gets one character each time
 */
async function onType(event: { text: string }) {
	await appState.handleKey(event.text);
}

export async function onSelectionChange(editor: vscode.TextEditor) {
	if (appState.config.misc.inclusiveRange
		&& appState.mode === SELECT
		&& appState.anchor) {
		// Make the current anchor always included in selection
		const anchor = appState.anchor;
		const selection = editor.selection;
		const anchorNext = anchor.translate(0, 1);
		if (anchor.isAfter(selection.active)) {
			if (!selection.anchor.isEqual(anchorNext))
				editor.selection = new vscode.Selection(anchorNext, selection.active);
		}
		else {
			if (!selection.anchor.isEqual(anchor))
				editor.selection = new vscode.Selection(anchor, selection.active);
		}
	}
	appState.updateStatus(editor);
}

export async function setMode(mode: string) {
	try {
		// cancel selection or inserting may replace selected texts.
		await vscode.commands.executeCommand("cancelSelection");
		appState.setMode(mode);
		await vscode.commands.executeCommand("setContext", "modalEditor.mode", mode);
		if (mode === INSERT) {
			if (typeCommandSubscription) {
				typeCommandSubscription.dispose();
				typeCommandSubscription = null;
			}
		}
		else {
			if (!typeCommandSubscription) {
				// Handle type events
				typeCommandSubscription = vscode.commands.registerCommand("type", onType);
			}
		}
	}
	catch (err: any) {
		vscode.window.showErrorMessage(`Modal Editor: ${err.message}`);
	}
}

export async function setInsertMode() {
	await setMode(INSERT);
}

export async function setNormalMode() {
	await setMode(NORMAL);
}

export async function setSelectMode() {
	await setMode(SELECT);
}

export async function setCommandMode() {
	await setMode(COMMAND);
}

/**
 * Change the current key sequence but not applying them
 * Arg is a js expression
 * Useful for display or command mode
 */
export function setKeys(expr: string) {
	const keys = appState.jsEval(expr, {
		keys: appState.keyEventHandler.keys,
		count: 1
	});
	if (typeof keys !== "string") {
		vscode.window.showErrorMessage("Modal Editor:")
		return;
	}
	appState.log(`Set keys to: "${keys}"`);
	appState.keyEventHandler.setKeys(keys);
}

/**
 * Go to a specified line
 */
export function gotoLine(num: number) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const lineCount = editor.document.lineCount;
		const line = num < lineCount ? num : lineCount;
		const range = editor.document.lineAt(line-1).range;
		// go to the start of that line
		editor.selection = new vscode.Selection(range.start, range.start);
		editor.revealRange(range);
	}
};

/**
 * Go to a specified line and select text
 */
export function gotoLineSelect(num: number) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const lineCount = editor.document.lineCount;
		const line = num < lineCount ? num : lineCount;
		const range = editor.document.lineAt(line-1).range;
		// The position to go to (focus)
		const nextPos = range.start;
		// current position
		let curPos = editor.selection.start;
		if (nextPos.isBeforeOrEqual(curPos)) {
			// include the current char if nextPos is before or equal
			curPos = curPos.translate(0, 1);
		}
		
		// update selection (nextPos is active)
		editor.selection = new vscode.Selection(curPos, nextPos);
		editor.revealRange(range);
	}
};

/**
 * Args for findText command
 * 
 * @see {isFindTextArgs} ts-auto-guard:type-guard
 */
export type FindTextArgs = {
	/// String to find
	text: string,
	/// Whether to select text
	select: boolean,
	/// Whether to move till the text rather than to the text (default: false)
	till?: boolean,
	/// Within the ine of current cursor (default: false)
	withinLine?: boolean,
	/// Search backward (default: false)
	backward?: boolean,
};

/**
 * Find text and move cursor towards it
 */
export function findText(args: FindTextArgs) {
	if (!isFindTextArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: findText: invalid arguments`);
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		// Go to position after successfully finding it
		const gotoPos = (lineNum: number, pos: number) => {
			let newPos = new vscode.Position(lineNum, pos);

			// Add one since end position is not inclusive in vscode
			if (!args.backward)
				newPos = newPos.translate(0, 1);
			
			// Move to the text instead of till the text
			if (args.till)
				newPos = newPos.translate(0, args.backward ? 1 : -1);

			if (args.select) {
				// merge with previous selection using anchor
				editor.selection = new vscode.Selection(editor.selection.anchor, newPos);
			}
			else
				editor.selection = new vscode.Selection(newPos, newPos);
			// Focus on active cursor
			editor.revealRange(new vscode.Range(newPos, newPos.translate(0, 1)));
		};

		/** Find in current line first */
		// Set the pos to the cursor
		const curPos = editor.selection.active;
		const curLine = editor.document.lineAt(curPos.line);
		const pos = args.backward ?
			curLine.text.lastIndexOf(args.text, curPos.character-1) :
			curLine.text.indexOf(args.text, curPos.character+1);
		
		if (pos >= 0) {
			gotoPos(curLine.lineNumber, pos);
			return;
		}

		/** Find line by line (because of VSCode API limit) **/
		if (!args.withinLine) {
			if (args.backward) {
				const start = curLine.lineNumber - 1; 
				const end = 0;
				for (let l = start; l >= end; l--) {
					const line = editor.document.lineAt(l);
					const pos = line.text.lastIndexOf(args.text);
					if (pos >= 0) {
						gotoPos(l, pos);
						return;
					}
				}
			}
			else {
				const start = curLine.lineNumber + 1; 
				const end = editor.document.lineCount;
				for (let l = start; l < end; l++) {
					const line = editor.document.lineAt(l);
					const pos = line.text.indexOf(args.text);
					if (pos >= 0) {
						gotoPos(l, pos);
						return;
					}
				}
			}
		}
	}
}

/**
 * Get current editor's selection
 * Always include the character under cursor if inclusiveRange
 */
export function getSelection(editor: vscode.TextEditor): vscode.Range {
	let { active, start, end } = editor.selection;
	if (appState.config.misc.inclusiveRange) {
		// always include the character under cursor
		end = end.translate(0, 1);
	}
	return new vscode.Range(start, end);
}


/**
 * Args for yank command
 *
 * @see {isYankArgs} ts-auto-guard:type-guard
 */
export type YankArgs = {
	/**
	 * Yank to a register (default: ")
	 * (empty string for system clipboard)
	 */
	register?: string
};

/**
 * Yank content to a register
 */
export function yank(args?: YankArgs) {
	if (args && !isYankArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: yank: invalid arguments`);
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const text = editor.document.getText(getSelection(editor));
		// store in registers
		const reg = args?.register ?? '"';
		// TODO: yank to clipboard if reg is empty
		appState.registers[reg] = text;
	}
}


/**
 * Args for paste command
 *
 * @see {isPasteArgs} ts-auto-guard:type-guard
 */
export type PasteArgs = {
	/**
	 * Paste from a register (default: ")
	 * (empty string for system clipboard)
	 */
	register?: string,
	/// Paste before the current selection
	before?: boolean
}

/**
 * Paste content from a register
 */
export function paste(args?: PasteArgs) {
	if (args && !isPasteArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: paste: invalid arguments`);
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		// read from clipboard
		const reg = args?.register ?? '"';
		// TODO: paste from clipboard if reg is empty
		let text = appState.registers[reg];
		if (!text) {
			// empty register
			return;
		}

		// insert
		editor.edit(editBuilder => {
			// insert before or after the current selection
			const selection = getSelection(editor);
			let pos = args?.before ? selection.start : selection.end;
			// paste in previous or next line if content ends with newline
			// (which means copy a line)
			if (text.endsWith("\n")) {
				const curLine = editor.document.lineAt(pos.line).range;
				if (args?.before) {
					// move to start of line
					pos = curLine.start;
				}
				else {
					// remove last new line to the begin to create a new line
					text = `\n${text.substring(0, text.length - 1)}`;
					// move to end of line
					pos = curLine.end;
				}
			}
			
			editBuilder.insert(pos, text);
		});
	}
}

// Execute a command with the current context
export async function executeCommand(command: Command) {
	if (!isCommand(command)) {
		vscode.window.showErrorMessage(`Modal Editor: executeCommand: invalid command`);
		return;
	}
	const ctx = appState.keyEventHandler.getCtx();
	await appState.executeCommand(command, ctx);
}

/// Reset internal state
export function resetState() {
	appState.reset();
}

/// Event handler for config update
export function onConfigUpdate() {
	// Read config from file
	const config = readConfig();
	appState.updateConfig(config);
	setMode(NORMAL);
}

function registerCommand(command: (_: any) => any) {
	return vscode.commands.registerCommand(commandId(command), command);
}

/**
 * Register all commands
 */
export function register(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
	context.subscriptions.push(
		registerCommand(setMode),
		registerCommand(setInsertMode),
		registerCommand(setNormalMode),
		registerCommand(setSelectMode),
		registerCommand(setCommandMode),
		registerCommand(setKeys),
		registerCommand(gotoLine),
		registerCommand(gotoLineSelect),
		registerCommand(findText),
		registerCommand(yank),
		registerCommand(paste),
		registerCommand(executeCommand),
		registerCommand(resetState),
		registerCommand(importKeybindings),
		registerCommand(importPreset),
	);
		
	const config = readConfig();
	const modeStatusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		config.misc.modeStatusBarPriority
	);
	const keyStatusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		config.misc.keyStatusBarPriority
	);
	appState = new AppState(NORMAL, config, outputChannel, modeStatusBar, keyStatusBar);
}

