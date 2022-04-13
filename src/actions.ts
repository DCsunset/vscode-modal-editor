import * as vscode from "vscode";
import {
	isCommand,
	isCommandList,
	isSimpleCommand,
	isComplexCommand
} from "./actions.guard";
import { KeyEventHandler } from "./keybindings";
import { Config } from "./config";


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
			const { cursorStyle, statusText } = this.config.styles[this.mode];
			editor.options.cursorStyle = cursorStyle;
			this.statusBar.text = statusText;
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
			this.config.keybindings[mode]
		);
		this.updateStatus(vscode.window.activeTextEditor);
	}
	
	async handleKey(key: string) {
		this.log("Handle key: " + key);
		try {
			const command = this.keyEventHandler.handle(key);
			if (command) {
				await this.executeCommand(command);
			}
		}
		catch (err: any) {
			vscode.window.showErrorMessage(`Modal Editor: ${err.message}`);
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


