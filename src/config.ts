import * as vscode from "vscode";
import { Keybindings } from "./keybindings";
import { isKeybindings } from "./keybindings.guard";
import { isStyles, isMisc } from "./config.guard";
import { NORMAL } from "./actions";

/**
 * CursorStyle: styles for cursor
 *
 * @see {isCursorStyle} ts-auto-guard:type-guard
 */
type CursorStyle = "line" | "block" | "underline" | "line-thin" | "block-outline" | "underline-thin";

export const cursorStyleMap: { [style in CursorStyle]: vscode.TextEditorCursorStyle } = {
	"line": vscode.TextEditorCursorStyle.Line,
	"block": vscode.TextEditorCursorStyle.Block,
	"underline": vscode.TextEditorCursorStyle.Underline,
	"line-thin": vscode.TextEditorCursorStyle.LineThin,
	"block-outline": vscode.TextEditorCursorStyle.BlockOutline,
	"underline-thin": vscode.TextEditorCursorStyle.UnderlineThin,
};

/**
 * Styles: Styles for cursor and statusBar
 *
 * @see {isStyles} ts-auto-guard:type-guard
 */
export type Styles = {
	[mode: string]: {
		cursorStyle: CursorStyle,
		statusText: string
	}
};

/**
 * Misc Miscellaneous config
 *
 * @see {isMisc} ts-auto-guard:type-guard
 */
export type Misc = {
	/// Always include the character under cursor in selection
	inclusiveRange: boolean,
	/// Do not show error message for undefined keys
	ignoreUndefinedKeys: boolean,
	/// Priority of mode status bar which shows the current mode
	modeStatusBarPriority: number,
	/// Priority of key status bar which shows the current key sequence
	keyStatusBarPriority: number,
	/// Preset directory to easily import keybindings
	presetDirectory: string,
	/// Default to use when extension starts
	defaultMode: string
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

/// Default styles
const defaultStyles: Styles = {
	insert: {
		cursorStyle: "block",
		statusText: "-- INS --"
	},
	normal: {
		cursorStyle: "block",
		statusText: "-- NOR --"
	},
	select: {
		cursorStyle: "block",
		statusText: "-- SEL --"
	}
};

const defaultMisc: Misc = {
	inclusiveRange: true,
	ignoreUndefinedKeys: false,
	modeStatusBarPriority: 0,
	keyStatusBarPriority: 10000,
	presetDirectory: "~/.config/vscode-modal-editor",
	defaultMode: NORMAL
};

export function getStyle(mode: string, styles: Styles) {
	if (mode in styles) {
		// Merge styles with default ones
		return {
			...defaultStyles[mode],
			...styles[mode]
		};
	}
	else {
		return defaultStyles[mode] ?? {};
	}
}

/// Read config from settings.json
export function readConfig() {
	const config = vscode.workspace.getConfiguration("modalEditor");
	let keybindings = config.get("keybindings");
	if (!isKeybindings(keybindings)) {
		vscode.window.showErrorMessage("Invalid keybindings in config");
		keybindings = {};
	}

	let styles = config.get("styles");
	if (!isStyles(styles)) {
		vscode.window.showErrorMessage("Invalid styles in config");
		styles = {};
	}
	
	let misc = config.get("misc");
	if (!isMisc(misc)) {
		vscode.window.showErrorMessage("Invalid misc config");
		misc = defaultMisc;
	}
	else {
		// Merge with default config
		misc = {
			...defaultMisc,
			...misc
		};
	}
	
	return {
		styles,
		keybindings,
		misc
	} as Config;
}

