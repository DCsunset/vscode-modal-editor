import * as vscode from "vscode";
import { Keybindings } from "./keybindings";
import { isKeybindings } from "./keybindings.guard";
import { isStyles, isMisc } from "./config.guard";

/**
 * CursorStyle: styles for cursor
 *
 * @see {isCursorStyle} ts-auto-guard:type-guard
 */
export type CursorStyle = "line" | "block" | "underline" | "line-thin" | "block-outline" | "underline-thin";

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
		cursorStyle: "line",
		statusText: "-- INS --"
	},
	normal: {
		cursorStyle: "block",
		statusText: "-- NOR --"
	},
	select: {
		cursorStyle: "line",
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

	let styles = config.get("styles");
	if (!isStyles(styles)) {
		vscode.window.showErrorMessage("Invalid styles in config");
		styles = defaultStyles;
	}
	
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

