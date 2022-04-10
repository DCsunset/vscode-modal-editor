import * as vscode from "vscode";

type Config = {
	[mode: string]: {
		cursorStyle: vscode.TextEditorCursorStyle;
		statusText: string;
	}
};

/// Config for the plugin (default)
export const config: Config = {
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
	},
	search: {
		cursorStyle: vscode.TextEditorCursorStyle.Underline,
		statusText: "SEARCH"
	}
};

/// Read config from settings.json
export function readConfig() {
	// TODO
}

