import * as vscode from "vscode";
import * as os from "os";
import { readConfig } from "./config";
import { isKeybindings } from "./keybindings.guard";
import { AppState, NORMAL, INSERT, SELECT, COMMAND, Command } from "./actions";
import { isCommand } from "./actions.guard";
import { isFindTextArgs, isYankArgs, isPasteArgs } from "./commands.guard";

/// Current app state
let appState: AppState;

/// Get command id from command function (with an optional name)
function commandId(command: ((_: any) => any) | string) {
	const name = typeof command === "string" ? command : command.name;
	return `modalEditor.${name}`;
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
			});
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

export async function onSelectionChange(e: vscode.TextEditorSelectionChangeEvent) {
	const editor = e.textEditor;
	if (appState.config.misc.inclusiveRange
		&& appState.mode === SELECT
		&& appState.anchor) {
		// Make the current anchor always included in selection
		const anchor = appState.anchor;
		const anchorNext = anchor.translate(0, 1);
		const anchorRange = new vscode.Range(anchor, anchorNext);
		const selection = e.selections[0];
		// Update selection if anchor not included
		if (!selection.contains(anchorRange)) {
			const anchorNext = anchor.translate(0, 1);
			if (anchor.isAfter(selection.active)) {
				if (!selection.anchor.isEqual(anchorNext))
					editor.selection = new vscode.Selection(anchorNext, selection.active);
			}
			else {
				if (!selection.anchor.isEqual(anchor))
					editor.selection = new vscode.Selection(anchor, selection.active);
			}
		}
	}
	appState.updateStatus(editor);
}

export async function setMode(mode: string) {
	try {
		appState.setMode(mode);
		if (mode === INSERT) {
			// cancel selection or inserting may replace selected texts.
			await vscode.commands.executeCommand("cancelSelection");
		}
		await vscode.commands.executeCommand("setContext", "modalEditor.mode", mode);
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

/**
 * Change the current key sequence but not applying them
 * Arg is a js expression
 * Useful for display or command mode
 */
export function setKeys(expr: string) {
	const keys = appState.jsEval(expr, {
		keys: appState.keyEventHandler.keys,
		count: 1
	});
	if (typeof keys !== "string") {
		vscode.window.showErrorMessage("Modal Editor:");
		return;
	}
	appState.keyEventHandler.setKeys(keys);
}

/**
 * Go to a specified line
 */
export function gotoLine(num: number) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const lineCount = editor.document.lineCount;
		const line = num < lineCount ? num : lineCount;
		const range = editor.document.lineAt(line-1).range;
		// go to the start of that line
		editor.selection = new vscode.Selection(range.start, range.start);
		editor.revealRange(range);
	}
};

/**
 * Args for findText command
 * 
 * @see {isFindTextArgs} ts-auto-guard:type-guard
 */
export type FindTextArgs = {
	/// String to find
	text: string,
	/// Whether to select text
	select: boolean,
	/// Whether to move till the text rather than to the text (default: false)
	till?: boolean,
	/// Within the ine of current cursor (default: false)
	withinLine?: boolean,
	/// Search backward (default: false)
	backward?: boolean,
};

/**
 * Find text and move cursor towards it
 */
export function findText(args: FindTextArgs) {
	if (!isFindTextArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: findText: invalid arguments`);
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		// Go to position after successfully finding it
		const gotoPos = (lineNum: number, pos: number) => {
			let newPos = new vscode.Position(lineNum, pos);

			// Add one if the range is not inclusive
			if (!args.backward && !appState.config.misc.inclusiveRange)
				newPos = newPos.translate(0, 1);
			
			// Move to the text instead of till the text
			if (args.till)
				newPos = newPos.translate(0, args.backward ? 1 : -1);

			if (args.select) {
				// merge with previous selection using anchor
				editor.selection = new vscode.Selection(editor.selection.anchor, newPos);
			}
			else
				editor.selection = new vscode.Selection(newPos, newPos);
			// Focus on active cursor
			editor.revealRange(new vscode.Range(newPos, newPos.translate(0, 1)));
		};

		/** Find in current line first */
		// Set the pos to the cursor
		const curPos = editor.selection.active;
		const curLine = editor.document.lineAt(curPos.line);
		const pos = args.backward ?
			curLine.text.lastIndexOf(args.text, curPos.character-1) :
			curLine.text.indexOf(args.text, curPos.character+1);
		
		if (pos >= 0) {
			gotoPos(curLine.lineNumber, pos);
			return;
		}

		/** Find line by line (because of VSCode API limit) **/
		if (!args.withinLine) {
			if (args.backward) {
				const start = curLine.lineNumber - 1; 
				const end = 0;
				for (let l = start; l >= end; l--) {
					const line = editor.document.lineAt(l);
					const pos = line.text.lastIndexOf(args.text);
					if (pos >= 0) {
						gotoPos(l, pos);
						return;
					}
				}
			}
			else {
				const start = curLine.lineNumber + 1; 
				const end = editor.document.lineCount;
				for (let l = start; l < end; l++) {
					const line = editor.document.lineAt(l);
					const pos = line.text.indexOf(args.text);
					if (pos >= 0) {
						gotoPos(l, pos);
						return;
					}
				}
			}
		}
	}
}

/**
 * Get current editor's selection
 * Always include the character under cursor if inclusiveRange
 */
export function getSelections(editor: vscode.TextEditor): vscode.Range[] {
	return editor.selections.map(selection => {
		let { active, start, end } = selection;
		const activeRange = new vscode.Range(active, active.translate(0, 1));
		if (appState.config.misc.inclusiveRange && !editor.selection.contains(activeRange)) {
			// always include the character under cursor
			const line = editor.document.lineAt(end.line);
			if (line.range.end.isEqual(end)) {
				// include the newline character
				end = line.rangeIncludingLineBreak.end;
			}
			else
				end = end.translate(0, 1);
		}
		const range = new vscode.Range(start, end);
		return range;
	});
}


/**
 * Args for yank command
 *
 * @see {isYankArgs} ts-auto-guard:type-guard
 */
export type YankArgs = {
	/**
	 * Yank to a register (default: ")
	 * (empty string for system clipboard)
	 */
	register?: string
};

/**
 * Yank content to a register
 */
export async function yank(args?: YankArgs) {
	if (args && !isYankArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: yank: invalid arguments`);
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const texts = getSelections(editor).map(editor.document.getText);
		const reg = args?.register ?? '"';
		// yank to clipboard if reg is empty
		if (reg === "") {
			await vscode.env.clipboard.writeText(texts.join("\n"));
		}
		else {
			appState.registers[reg] = texts;
		}
	}
}

/**
 * Delete selection
 */
export async function deleteSelections() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		await editor.edit(editBuilder => {
			getSelections(editor)
				.forEach(sel => editBuilder.delete(sel));
		});
	}
}

/**
 * Args for paste command
 *
 * @see {isPasteArgs} ts-auto-guard:type-guard
 */
export type PasteArgs = {
	/**
	 * Paste from a register (default: ")
	 * (empty string for system clipboard)
	 */
	register?: string,
	/// Paste before the current selection
	before?: boolean
};

/**
 * Paste content from a register
 */
export async function paste(args?: PasteArgs) {
	if (args && !isPasteArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: paste: invalid arguments`);
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const reg = args?.register ?? '"';
		// If from clipboard, use it for all selections
		// Otherwise, use corresponding selection
		const texts = reg === ""
			? [await vscode.env.clipboard.readText()]
			: appState.registers[reg];
		if (!texts) {
			// empty register
			return;
		}

		// insert
		await editor.edit(editBuilder => {
			// insert before or after the current selection
			getSelections(editor)
				.forEach((selection, i) => {
					let pos = args?.before ? selection.start : selection.end;
					const text = texts[Math.min(i, texts.length-1)];

					// paste in previous or next line if content ends with newline
					// (which means copy a line)
					if (text.endsWith("\n")) {
						let lineNum = pos.line;
						// If char === 0 at selection.end, the cursor is at the previous line
						if (pos.character === 0 && !args?.before)
							lineNum--;
						const curLine = editor.document.lineAt(lineNum).rangeIncludingLineBreak;

						if (args?.before) {
							// move to start of line
							pos = curLine.start;
						}
						else {
							// move to end of line
							pos = curLine.end;
						}
					}
					
					editBuilder.insert(pos, text);
				});
		});
	}
}

/// Cut: yank + delete
async function cut(args?: YankArgs) {
	if (args && !isYankArgs(args)) {
		vscode.window.showErrorMessage(`Modal Editor: cut: invalid arguments`);
		return;
	}

	await yank(args);
	await deleteSelections();
}

/// Transform selected text
async function transformSelection(
	transformer: (_: string) => string
) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		await editor.edit(editBuilder => {
			getSelections(editor)
				.forEach(selection => {
					const text = editor.document.getText(selection);
					editBuilder.replace(selection, transformer(text));
				});
		});
	}
}

/// Transform current selection to upper case
async function toUpperCase() {
	const transformer = (text: string) => (
		text.toUpperCase()
	);
	await transformSelection(transformer);
}

/// Transform current selection to lower case
async function toLowerCase() {
	const transformer = (text: string) => (
		text.toLowerCase()
	);
	await transformSelection(transformer);
}

/// Create position with valid line number
function createPosition(editor: vscode.TextEditor, line: number, character: number) {
	const lineCount = editor.document.lineCount;
	if (line < 0)
		line = 0;
	if (line >= lineCount)
		line = lineCount - 1;
	return new vscode.Position(line, character);
}


/**
 * Move half page up or down
 */
function moveHalfPage(direction: "up" | "down") {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const origPos = editor.selection.active;
		const { start, end } = editor.visibleRanges[0];
		// height of half page
		const height = Math.ceil((end.line - start.line) / 2);
		// line delta
		const delta = direction === "up" ? -height : height;
		const newPos = createPosition(editor, origPos.line + delta, origPos.character);
		// If it's in select mode, the selection will be updated by onSelectionChange
		editor.selection = new vscode.Selection(newPos, newPos);
		editor.revealRange(editor.selection);
	}
}

function halfPageUp() {
	moveHalfPage("up");
}

function halfPageDown() {
	moveHalfPage("down");
}

/// Replay a record from a register (key sequence)
async function replayRecord(reg: string) {
	await appState.replayRecord(reg);
}

// Execute a command with the current context
export async function executeCommand(command: Command) {
	if (!isCommand(command)) {
		vscode.window.showErrorMessage(`Modal Editor: executeCommand: invalid command`);
		return;
	}
	const ctx = appState.keyEventHandler.getCtx();
	await appState.executeCommand(command, ctx);
}

/// Reset internal state
export function resetState() {
	appState.reset();
}

/// Event handler for config update
export function onConfigUpdate() {
	// Read config from file
	const config = readConfig();
	appState.updateConfig(config);
	setMode(NORMAL);
}

function registerCommand(command: (_: any) => any, name?: string) {
	return vscode.commands.registerCommand(commandId(name ?? command), command);
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
		registerCommand(setKeys),
		registerCommand(gotoLine),
		registerCommand(findText),
		registerCommand(cut),
		registerCommand(yank),
		registerCommand(paste),
		registerCommand(deleteSelections, "delete"),
		registerCommand(halfPageUp),
		registerCommand(halfPageDown),
		registerCommand(toLowerCase),
		registerCommand(toUpperCase),
		registerCommand(replayRecord),
		registerCommand(executeCommand),
		registerCommand(resetState),
		registerCommand(importKeybindings),
		registerCommand(importPreset),
		// Handle type events
		vscode.commands.registerCommand("type", onType)
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

