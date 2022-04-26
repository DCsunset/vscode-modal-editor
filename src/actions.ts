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
	count?: string
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
	count: number
};

/**
 * @see {isCommandList} ts-auto-guard:type-guard
 */
export type CommandList = Command[];

export class AppState {
	// Allow initialization in a method
	keyEventHandler!: KeyEventHandler;
	mode!: string;
	
	constructor(
		mode: string,
		public config: Config,
		public outputChannel: vscode.OutputChannel,
		public modeStatusBar: vscode.StatusBarItem,
		public keyStatusBar: vscode.StatusBarItem
	) {
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
		this.setMode(NORMAL);
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
	
	async handleKey(key: string) {
		try {
			const result = this.keyEventHandler.handle(key);
			if (result) {
				const previousMode = this.mode;
				const { command, ctx } = result;
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
				const count = command.count ? this.jsEval(command.count, ctx) : 1;
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
	jsEval(expressions: string, _ctx: CommandContext) {
		// _ctx is accessible in side eval
		return eval(`(${expressions})`);
	}
	
	async executeVSCommand(command: string, ...rest: any[]) {
		try {
			await vscode.commands.executeCommand(command, ...rest);
		}
		catch (error: any) {
			vscode.window.showErrorMessage(error.message);
		}
	}
}


