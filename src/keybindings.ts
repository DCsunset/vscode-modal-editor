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


export class KeyEventHandler {
	/// The current keymap (because there could be sub key maps)
	currentKeymap?: Keymap;
	/// Current common keymap
	currentCommonKeymap?: Keymap;
	/// Key sequence encountered so far
	keySequence!: string;
	
	constructor(
		public keyStatusBar: vscode.StatusBarItem,
		public keymap?: Keymap,
		public commonKeymap?: Keymap,
	) {
		this.reset();
	}

	handle(key: string) {
		this.keySequence += key;
		this.keyStatusBar.text = this.keySequence;

		if (this.currentKeymap && (key in this.currentKeymap)) {
			// try currentKeymap first
			const value = this.currentKeymap[key];
			if (isCommand(value)) {
				// reset keymap since this sequence is finished
				this.reset();
				return value;
			}
			// Continue to use subkeymap
			this.currentKeymap = value;
			// Update currentCommonKeymap as well because it is a fallback
			if (this.currentCommonKeymap && (key in this.currentCommonKeymap)) {
				const value = this.currentCommonKeymap[key];
				if (!isCommand(value))
					this.currentCommonKeymap = value;
			}
			else {
				this.currentCommonKeymap = undefined;
			}
		}
		else if (this.currentCommonKeymap && (key in this.currentCommonKeymap)) {
			// currentCommonKeymap as a fallback
			const value = this.currentCommonKeymap[key];
			if (isCommand(value)) {
				// reset keymap since this sequence is finished
				this.reset();
				return value;
			}
			// Keep only commonKeymap
			this.currentKeymap = undefined;
			this.currentCommonKeymap = value;
		}
		else {
			// reset keymap when the key is invalid
			let keySeq = this.keySequence;
			this.reset();
			throw new KeyError(`undefined key sequence: ${keySeq}`);
		}
	}
	
	reset() {
		this.currentKeymap = this.keymap;
		this.currentCommonKeymap = this.commonKeymap;
		this.keySequence = "";
		this.keyStatusBar.text = "";
	}

	/// Clear state
	clear() {
		this.currentKeymap = this.keymap;
	}
}
