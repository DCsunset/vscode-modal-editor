import * as vscode from "vscode";
import { Command } from "./actions";
import { isCommand } from "./actions.guard";
import { KeyError } from "./error";

/**
 * Each key can be mapped to a command or a sub key map
 *
 * @see {isKeymap} ts-auto-guard:type-guard
 */
export type Keymap = {
	[key: string]: Keymap | Command
}

/**
 * There are multiple modes in the key bindings.
 * Each mode has a key map
 *
 * @see {isKeybindings} ts-auto-guard:type-guard
 */
export type Keybindings = {
	[mode: string]: Keymap | undefined
}

function getFromKeymap(keymap: Keymap | undefined, key: string) {
	if (keymap) {
		if (key in keymap)
			return keymap[key];
		// wildcard
		if ("" in keymap)
			return keymap[""];
	}
	return undefined;
}

export class KeyEventHandler {
	/// The current keymap (because there could be sub key maps)
	currentKeymap?: Keymap;
	/// Current common keymap
	currentCommonKeymap?: Keymap;
	/// Key sequence encountered so far
	keys!: string;
	
	constructor(
		public keyStatusBar: vscode.StatusBarItem,
		public keymap?: Keymap,
		public commonKeymap?: Keymap,
	) {
		this.reset();
	}

	handle(key: string) {
		this.keys += key;
		this.keyStatusBar.text = this.keys;

		// try currentKeymap first
		let value = getFromKeymap(this.currentKeymap, key);
		if (value) {
			if (isCommand(value)) {
				const keys = this.keys;
				// reset keymap since this sequence is finished
				this.reset();
				return {
					command: value,
					keys
				};
			}
			// Continue to use subkeymap
			this.currentKeymap = value;

			// Update currentCommonKeymap as well because it is a fallback
			value = getFromKeymap(this.currentCommonKeymap, key);
			if (value) {
				if (!isCommand(value))
					this.currentCommonKeymap = value;
			}
			else {
				this.currentCommonKeymap = undefined;
			}
			
			return;
		}
		
		// currentCommonKeymap as a fallback
		value = getFromKeymap(this.currentCommonKeymap, key);
		if (value) {
			if (isCommand(value)) {
				let keys = this.keys;
				// reset keymap since this sequence is finished
				this.reset();
				return {
					command: value,
					keys
				};
			}
			// Keep only commonKeymap
			this.currentKeymap = undefined;
			this.currentCommonKeymap = value;

			return;
		}

		// reset keymap when the key is invalid
		let keys = this.keys;
		this.reset();
		throw new KeyError(`undefined key sequence: "${keys}"`);
	}
	
	reset() {
		this.currentKeymap = this.keymap;
		this.currentCommonKeymap = this.commonKeymap;
		this.keys = "";
		this.keyStatusBar.text = "";
	}

	/// Clear state
	clear() {
		this.currentKeymap = this.keymap;
	}
}
