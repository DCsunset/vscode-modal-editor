import * as vscode from "vscode";
import { Keybindings } from "./keybindings";
import { isKeybindings } from "./keybindings.guard";
import { isMisc } from "./config.guard";


/**
 * Styles: Styles for cursor and statusBar
 *
 * @see {isStyles} ts-auto-guard:type-guard
 */
export type Styles = {
	[mode: string]: {
		cursorStyle: vscode.TextEditorCursorStyle,
		statusText: string
	}
};

/**
 * Misc Miscellaneous config
 *
 * @see {isMisc} ts-auto-guard:type-guard
 */
export type Misc = {
	/// Do not show error message for undefined keys
	ignoreUndefinedKeys: boolean
};

/**
 * Config: including styles and keybindings
 *
 * @see {isConfig} ts-auto-guard:type-guard
 */
export type Config = {
	styles: Styles,
	keybindings: Keybindings,
	misc: Misc
};

/// Default config
const defaultStyles: Styles = {
	insert: {
		cursorStyle: vscode.TextEditorCursorStyle.Line,
		statusText: "-- INS --"
	},
	normal: {
		cursorStyle: vscode.TextEditorCursorStyle.Block,
		statusText: "-- NOR --"
	},
	select: {
		cursorStyle: vscode.TextEditorCursorStyle.Block,
		statusText: "-- SEL --"
	}
};

const defaultKeybindings: Keybindings = {};

const defaultMisc: Misc = {
	ignoreUndefinedKeys: false
};

/// Read config from settings.json
export function readConfig() {
	const config = vscode.workspace.getConfiguration("modalEditor");
	let keybindings = config.get("keybindings");
	if (!isKeybindings(keybindings)) {
		vscode.window.showErrorMessage("Invalid keybindings in config");
		keybindings = defaultKeybindings;
	}

	// TODO: convert cursor styles from string to style and merge them)
	let styles = defaultStyles;
	
	let misc = config.get("misc");
	if (!isMisc(misc)) {
		vscode.window.showErrorMessage("Invalid misc config");
		misc = defaultMisc;
	}
	
	return {
		styles,
		keybindings,
		misc
	} as Config;
}

