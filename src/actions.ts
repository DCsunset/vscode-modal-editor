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
	/// anchor when entering select mode
	anchor: vscode.Position | undefined;
	/// cursor position before last command
	lastPos: vscode.Position | undefined;
	/// selection before last command
	lastSelection: vscode.Selection | undefined;
	
	constructor(
		mode: string,
		public config: Config,
		public outputChannel: vscode.OutputChannel,
		public modeStatusBar: vscode.StatusBarItem,
		public keyStatusBar: vscode.StatusBarItem
	) {
		this.registers = {};
		this.records = {};
		this.setMode(mode);
	}

	/// Update cursor and status bar
	updateStatus(editor?: vscode.TextEditor) {
		if (editor) {
			const { cursorStyle, statusText } = getStyle(this.mode, this.config.styles);
			// default cursorStyle
			editor.options.cursorStyle = cursorStyleMap[cursorStyle || "block"];
			// default statusText
			this.modeStatusBar.text = statusText || `-- ${this.mode.toUpperCase()} --`;
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
	
	setMode(mode: string) {
		this.mode = mode;
		this.updateStatus(vscode.window.activeTextEditor);
		if (mode === SELECT) {
			// record anchor
			this.anchor = vscode.window.activeTextEditor?.selection.active;
		}
		this.keyEventHandler = new KeyEventHandler(
			mode === COMMAND ? this.modeStatusBar : this.keyStatusBar,
			// keymap in this mode
			this.config.keybindings[mode],
			// common keymap
			this.config.keybindings[""],
			// whether it's command mode
			mode === COMMAND
		);
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
			lastPos: this.lastPos,
			// current cursor position
			pos: editor?.selection.active,
			// get the line
			lineAt: editor?.document.lineAt,
			// last selection
			lastSelection: this.lastSelection,
			// current selection
			selection: editor?.selection,
		};

		return eval(`(${expressions})`);
	}
	
	async executeVSCommand(command: string, ...rest: any[]) {
		const editor = vscode.window.activeTextEditor;
		this.lastSelection = editor?.selection;
		this.lastPos = this.lastSelection?.active;
		try {
			await vscode.commands.executeCommand(command, ...rest);
		}
		catch (error: any) {
			vscode.window.showErrorMessage(error.message);
		}
	}
}


