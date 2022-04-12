/**
 * Entry point of the extension
 */
import * as vscode from 'vscode';
import * as commands from "./commands";
import * as config from "./config";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Register all commands
	commands.register(context);

	config.readConfig();
	
	// context.subscriptions.push(
	// 	vscode.window.onDidChangeTextEditorSelection(e => commands.updateStatus(e.textEditor))
	// );

	// Set mode to Normal by default
	commands.setMode(commands.NORMAL);
}

// this method is called when your extension is deactivated
export function deactivate() {
	commands.setMode(commands.INSERT);
}

