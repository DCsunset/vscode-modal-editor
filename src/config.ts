import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import axios from "axios";
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

/// Expand tilde to home directory
export function expandHome(filePath: string) {
	const home = os.homedir();
	// Use lookahead to match the tilde
	const regex = /^~(?=$|\/|\\)/;
	return filePath.replace(regex, home);
}


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
	/// Save loaded keybindings in settings.json
	keybindingsInSettings: boolean,
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
	/// Preset file name to autoload (only works when keybindingsInSettings is false; empty means no autoloading)
	autoloadPreset: string;
	/// Default to use when extension starts
	defaultMode: string,
	/// Clear selections when running command setInsertMode (deprecated)
	clearSelectionsOnInsertMode: boolean
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
	keybindingsInSettings: true,
	inclusiveRange: true,
	ignoreUndefinedKeys: false,
	modeStatusBarPriority: 0,
	keyStatusBarPriority: 10000,
	presetDirectory: "~/.config/vscode-modal-editor",
	autoloadPreset: "",
	defaultMode: NORMAL,
	clearSelectionsOnInsertMode: true
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

/**
 * Load keybindings from a URI
 */
export async function loadKeybindings(uri: vscode.Uri) {
	const fs = vscode.workspace.fs;
	try {
		let data: string;
		if (uri.scheme === "http" || uri.scheme === "https") {
			const res = await axios.get(uri.toString());
			data = res.data;
		}
		else {
			data = Buffer.from(await fs.readFile(uri)).toString("utf-8");
		}
		if (uri.fsPath.match(/json[5c]?$/))
			data = `(${data})`;

		const keybindings = eval(data);
		if (!isKeybindings(keybindings)) {
			throw new Error("invalid keybindings");
		}
		return keybindings;
	}
	catch (err: any) {
		vscode.window.showErrorMessage(`Modal Editor: Failed to load keybindings: ${err.message}`);
		return null;
	}
}



/// Read config from settings.json
export async function readConfig() {
	const config = vscode.workspace.getConfiguration("modalEditor");
	
	let misc: Misc | undefined = config.get("misc");
	if (!isMisc(misc)) {
		vscode.window.showErrorMessage("Invalid misc config");
		misc = defaultMisc;
	}
	// Merge with default config
	misc = {
		...defaultMisc,
		...misc
	};
	
	let keybindings = {};
	if (misc.keybindingsInSettings) {
		let keybindings = config.get("keybindings");
		if (!isKeybindings(keybindings)) {
			vscode.window.showErrorMessage("Invalid keybindings in config");
			keybindings = {};
		}
	}
	else if (misc.autoloadPreset.length > 0) {
		// Read from preset dir
		const file = vscode.Uri.file(path.join(
			expandHome(misc.presetDirectory),
			misc.autoloadPreset
		));
		const ret = await loadKeybindings(file);
		if (ret !== null) {
			keybindings = ret;
		}
	}

	let styles = config.get("styles");
	if (!isStyles(styles)) {
		vscode.window.showErrorMessage("Invalid styles in config");
		styles = {};
	}
	
	return {
		styles,
		keybindings,
		misc
	} as Config;
}

