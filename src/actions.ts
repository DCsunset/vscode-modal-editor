import * as vscode from "vscode";
import {
	isCommand,
	isCommandList,
	isNormalCommand,
	isParameterizedCommand,
	isConditionalCommand
} from "./actions.guard";

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
export type Command = NormalCommand | ConditionalCommand | CommandList;

/**
 * @see {isNormalCommand} ts-auto-guard:type-guard
 */
export type NormalCommand = string;

/**
 * @see {isParameterizedCommand} ts-auto-guard:type-guard
 */
export type ParameterizedCommand = {
	command: string,
	args?: any
};

/**
 * @see {isCommandList} ts-auto-guard:type-guard
 */
export type CommandList = Command[];

/**
 * @see {isConditionalCommand} ts-auto-guard:type-guard
 */
export type ConditionalCommand = {
	command: Command,
	// Condition to execute the above command
	when: string
};

export class AppState {
	/// Execute an action
	async executeAction(action: Action) {
		if (isCommand(action)) {
			await this.executeAction(action);
		}
		
	}
	
	async executeCommand(command: Command) {
		if (isNormalCommand(command)) {
			await this.executeVSCommand(command);
		}
		else if (isParameterizedCommand(command)) {
			await this.executeVSCommand(command.command, command.args);
		}
		else if (isConditionalCommand(command)) {
			if (this.jsEval(command.when)) {
				await this.executeCommand(command.command);
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
		// TODO: define some variables
		return eval(expressions);
	}
	
	async executeVSCommand(command: NormalCommand, ...rest: any[]) {
		try {
			await vscode.commands.executeCommand(command, ...rest);
		}
		catch (error: any) {
			vscode.window.showErrorMessage(error.message);
		}
	}
}

