import * as vscode from "vscode";
import {
	isCommand,
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

/**
 * Action defined for each key
 */
export type Action = Command;

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
	command: string,
	args?: any,
	// Condition to execute the above command
	when?: string
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
		public statusBar: vscode.StatusBarItem
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
			this.statusBar.text = statusText || `-- ${this.mode.toUpperCase()} --`;
			this.statusBar.show();
		}
		else {
			this.statusBar.hide();
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
	
	setMode(mode: string) {
		this.mode = mode;
		this.keyEventHandler = new KeyEventHandler(
			// keymap in this mode
			this.config.keybindings[mode],
			// common keymap
			this.config.keybindings._
		);
		this.updateStatus(vscode.window.activeTextEditor);
	}
	
	async handleKey(key: string) {
		try {
			const command = this.keyEventHandler.handle(key);
			if (command) {
				await this.executeCommand(command);
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
		}
	}

	/// Execute an action
	async executeAction(action: Action) {
		if (isCommand(action)) {
			await this.executeAction(action);
		}
	}
	
	async executeCommand(command: Command) {
		if (isSimpleCommand(command)) {
			await this.executeVSCommand(command);
		}
		else if (isComplexCommand(command)) {
			// Execute it if when is not defined or condition is true
			if (!command.when || this.jsEval(command.when)) {
				await this.executeVSCommand(command.command, command.args);
			}
		}
		else if (isCommandList(command)) {
			for (const c of command) {
				await this.executeCommand(c);
			}
		}
		else {
			vscode.window.showErrorMessage(`Invalid command: ${command}`);
		}
	}
	
	/**
	 * jsEval evaluates JS expressions
	 */
	jsEval(expressions: string) {
		// TODO: define some variables (modalEditor.xxx)
		return eval(expressions);
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


