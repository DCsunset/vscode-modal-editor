import * as vscode from "vscode";
import * as config from "./config";

/**
 * Standard Commands
 */
export const NORMAL = "normal";
export const INSERT = "insert";
export const SELECT = "select";
export const SEARCH = "search";
export const REPLACE = 'replace';
export const CAPTURE = 'capture';

/// Current mode
let curMode = NORMAL;
/// Status bar
let statusBar: vscode.StatusBarItem;

/// Get command id from command function
function commandId(command: (_: any) => any) {
	return `modal-editor.${command.name}`;
}

/// Update cursor and status bar
export function updateStatus(editor?: vscode.TextEditor) {
	if (editor) {
		const { cursorStyle, statusText } = config.config[curMode];
		editor.options.cursorStyle = cursorStyle;
		statusBar.text = statusText;
		statusBar.show();
	}
	else {
		statusBar.hide();
	}
}


export async function setMode(mode: string) {
	curMode = mode;
	await vscode.commands.executeCommand("setContext", "modal-editor.mode", mode);
	updateStatus(vscode.window.activeTextEditor);
}

/**
 * Register all commands
 */
export function register(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand(commandId(setMode), setMode)
	);
	
	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
}

