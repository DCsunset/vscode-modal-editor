import * as vscode from "vscode";
import {
	isCommand,
	isCommandList,
	isSimpleCommand,
	isComplexCommand
} from "./actions.guard";
import { KeyBindings, KeyEventHandler } from "./keybindings";

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
	keyEventHandler: KeyEventHandler;
	
	constructor(public mode: string, public keyBindings: KeyBindings) {
		this.keyEventHandler = new KeyEventHandler(
			keyBindings[mode]
		);
	}
	
	setMode(mode: string) {
		if (!(mode in this.keyBindings)) {
			throw new Error(`Mode not defined in key bindings: ${mode}`);
		}
		this.mode = mode;
		this.keyEventHandler = new KeyEventHandler(
			this.keyBindings[mode]
		);
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


