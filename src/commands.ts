import * as vscode from "vscode";
import * as os from "os";
import { readConfig } from "./config";
import { isKeybindings } from "./keybindings.guard";
import { AppState, NORMAL, INSERT, SELECT, COMMAND } from "./actions";

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
	type: "file" | "uri" | "preset"
}

/// Expand tilde to home directory
function expandHome(filePath: string) {
	const home = os.homedir();
	// Use lookahead to match the tilde
	const regex = /^~(?=$|\/|\\)/;
	return filePath.replace(regex, home);
}

async function importPreset(directory?: string) {
	const presetDir = directory ?? appState.config.misc.presetDirectory;
	const dir = vscode.Uri.file(expandHome(presetDir));
	const entries = await vscode.workspace.fs.readDirectory(dir);
	// Filter entries
	const files = entries
		.filter(([name, type]) => (
			/\.(js)|(jsonc?)$/.test(name) && type === vscode.FileType.File
		))
		.map(([name]) => ({
			path: vscode.Uri.joinPath(dir, name),
			label: name
		}));
	
	const choice = await vscode.window.showQuickPick(files, {
		placeHolder: "Warning: importing keybindings will overwrite current ones in settings.json"
	});
	
	if (choice) {
		await loadKeybindings(choice.path);
	}
}

async function importKeybindings() {
	const choices: PickItem[] = [
		{
			label: "Import from preset directory...",
			type: "preset"
		},
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

	switch (choice?.type) {
		case "file": {
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
				await loadKeybindings(files[0]);
			}
			break;
		}

		case "uri": {
			const uri = await vscode.window.showInputBox({
				prompt: "Enter a valid URI"
			})
			if (uri) {
				await loadKeybindings(vscode.Uri.parse(uri, true));
			}
			break;
		}
		
		case "preset": {
			await importPreset();
			break;
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
		vscode.window.showErrorMessage(`Modal Editor: ${err.message}`);
	}
}

export async function setInsertMode() {
	await setMode(INSERT);
}

export async function setNormalMode() {
	await setMode(NORMAL);
}

export async function setSelectMode() {
	await setMode(SELECT);
}

export async function setCommandMode() {
	await setMode(COMMAND);
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
		registerCommand(setCommandMode),
		registerCommand(importKeybindings),
		registerCommand(importPreset),
	);
		
	const config = readConfig();
	const modeStatusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		config.misc.modeStatusBarPriority
	);
	const keyStatusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		config.misc.keyStatusBarPriority
	);
	appState = new AppState(NORMAL, config, outputChannel, modeStatusBar, keyStatusBar);
}

