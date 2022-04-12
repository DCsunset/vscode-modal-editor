import * as vscode from "vscode";
import * as config from "./config";
import { AppState } from "./actions";

/**
 * Standard Commands
 */
export const NORMAL = "normal";
export const INSERT = "insert";
export const SELECT = "select";
export const SEARCH = "search";
export const REPLACE = 'replace';
export const CAPTURE = 'capture';

/// Current app state
let appState: AppState;
/// Status bar
let statusBar: vscode.StatusBarItem;
/// Subscription to type command
let typeCommandSubscription: vscode.Disposable | null = null;

/// Get command id from command function
function commandId(command: (_: any) => any) {
	return `modalEditor.${command.name}`;
}

/// Update cursor and status bar
export function updateStatus(editor?: vscode.TextEditor) {
	if (editor) {
		const { cursorStyle, statusText } = config.config[appState.mode];
		editor.options.cursorStyle = cursorStyle;
		statusBar.text = statusText;
		statusBar.show();
	}
	else {
		statusBar.hide();
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

export async function setMode(mode: string) {
	try {
		appState.setMode(mode);
		await vscode.commands.executeCommand("setContext", "modal-editor.mode", mode);
		updateStatus(vscode.window.activeTextEditor);
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
		vscode.window.showErrorMessage(err.message);
	}
}

/**
 * Register all commands
 */
export function register(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
	context.subscriptions.push(
		vscode.commands.registerCommand(commandId(setMode), setMode)
	);
	
	// Read config from file
	config.readConfig();

	appState = new AppState(NORMAL, {
		normal: {},
		insert: {}
	}, outputChannel);
	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
}

