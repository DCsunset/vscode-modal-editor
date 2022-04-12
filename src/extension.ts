/**
 * Entry point of the extension
 */
import * as vscode from 'vscode';
import * as commands from "./commands";
import * as actions from "./actions";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Create output channel for this extension
	const channel = vscode.window.createOutputChannel("Modal Editor")

	// Register all commands
	commands.register(context, channel);
	
	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(e => commands.onStatusChange(e.textEditor)),
		vscode.workspace.onDidChangeConfiguration(commands.onConfigUpdate)
	);

	// Set mode to Normal by default
	commands.setMode(actions.NORMAL);
}

// this method is called when your extension is deactivated
export function deactivate() {
	commands.setMode(actions.INSERT);
}

