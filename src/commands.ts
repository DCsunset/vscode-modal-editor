import * as vscode from "vscode";
import { readConfig } from "./config";
import { isKeybindings } from "./keybindings.guard";
import { AppState, NORMAL, INSERT, SELECT } from "./actions";

/// Current app state
let appState: AppState;
/// Subscription to type command
let typeCommandSubscription: vscode.Disposable | null = null;

/// Get command id from command function
function commandId(command: (_: any) => any) {
	return `modalEditor.${command.name}`;
}

/**
 * Load keybindings from a URI
 */
async function loadKeybindings(uri: vscode.Uri) {
	const fs = vscode.workspace.fs;
	try {
		let data = Buffer.from(await fs.readFile(uri)).toString("utf-8");
		if (uri.fsPath.match(/json[5c]?$/))
			data = `(${data})`;

		const keybindings = eval(data);
		if (!isKeybindings(keybindings)) {
			throw new Error("invalid keybindings");
		}
		appState.updateConfig({ keybindings });
		const config = vscode.workspace.getConfiguration("modalEditor");
		config.update("keybindings", keybindings, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage("Modal Editor: Keybindings imported");
	}
	catch (err: any) {
		vscode.window.showErrorMessage(`Modal Editor: Failed to import keybindings: ${err.message}`);
	}
}

interface PickItem extends vscode.QuickPickItem {
	type: "file" | "uri"
}

async function importKeybindings() {
	// TODO: read from user keybindings direction
	const choices: PickItem[] = [
		{
			label: "Import from a file...",
			type: "file"
		},
		{
			label: "Import from a URI...",
			type: "uri"
		}
	];
	
	const choice = await vscode.window.showQuickPick(choices, {
		placeHolder: "Warning: importing keybindings will overwrite current ones in settings.json"
	});

	if (choice) {
		if (choice.type === "file") {
			const files = await vscode.window.showOpenDialog({
				title: "Import keybindings from file",
				openLabel: "Import",
				filters: {
				  "Keybindings": ["json", "jsonc", "js"]
				},
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: false
			});

			if (files && files.length > 0) {
				loadKeybindings(files[0]);
			}
		}
		else if (choice.type === "uri") {
			let uri = await vscode.window.showInputBox({
				prompt: "Enter a valid URI"
			})
			if (uri) {
				loadKeybindings(vscode.Uri.parse(uri, true));
			}
		}
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

export async function onStatusChange(editor?: vscode.TextEditor) {
	appState.updateStatus(editor);
}

export async function setMode(mode: string) {
	try {
		// cancel selection or inserting may replace selected texts.
		await vscode.commands.executeCommand("cancelSelection");
		appState.setMode(mode);
		await vscode.commands.executeCommand("setContext", "modalEditor.mode", mode);
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

export async function setInsertMode() {
	setMode(INSERT);
}

export async function setNormalMode() {
	setMode(NORMAL);
}

export async function setSelectMode() {
	setMode(SELECT);
}

export function onConfigUpdate() {
	// Read config from file
	const config = readConfig();
	appState.updateConfig(config);
	setMode(NORMAL);
}

function registerCommand(command: (_: any) => any) {
	return vscode.commands.registerCommand(commandId(command), command);
}

/**
 * Register all commands
 */
export function register(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
	context.subscriptions.push(
		registerCommand(setMode),
		registerCommand(setInsertMode),
		registerCommand(setNormalMode),
		registerCommand(setSelectMode),
		registerCommand(importKeybindings)
	);
		
	const config = readConfig();
	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	appState = new AppState(NORMAL, config, outputChannel, statusBar);
}

