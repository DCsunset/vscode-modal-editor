import * as vscode from "vscode";
import { Command, CommandContext } from "./actions";
import { isCommand } from "./actions.guard";
import { KeyError } from "./error";

/**
 * Each key can be mapped to a command or a sub key map
 *
 * @see {isKeymap} ts-auto-guard:type-guard
 */
export type Keymap = {
	[key: string]: Keymap | Command
};

/**
 * There are multiple modes in the key bindings.
 * Each mode has a key map
 *
 * @see {isKeybindings} ts-auto-guard:type-guard
 */
export type Keybindings = {
	[mode: string]: Keymap | undefined
};

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

function isNum(key: string, isFirst?: boolean) {
	const regex = isFirst ? /^[1-9]$/ : /^\d$/;
	return regex.test(key);
}

export class KeyEventHandler {
	/// The current keymap (because there could be sub key maps)
	currentKeymap?: Keymap;
	/// Current common keymap
	currentCommonKeymap?: Keymap;
	/// Key sequence encountered so far
	keys!: string;
	/// Count prefix
	count!: string;
	/// Whether it is parsing the number prefix
	parsingCount!: boolean;
	
	constructor(
		public keyStatusBar: vscode.StatusBarItem,
		public keymap: Keymap | undefined,
		public commonKeymap: Keymap | undefined,
		public commandMode: boolean,
    /// Whether to parse number prefix
    public parseNumberPrefix: boolean,
	) {
		this.reset();
	}
	
	statusBarPrefix() {
		return this.commandMode ? ":" : "";
	}
	
	/**
	 * Change the current key sequence but not applying them
	 * Useful for display or command mode
	 */
	setKeys(keys: string) {
		this.keys = keys;
		this.updateStatus();
	}
	
	getCtx(): CommandContext {
		return {
			keys: this.keys,
			// default count is 1
			count: this.count.length === 0 ? undefined: parseInt(this.count)
		};
	}
	
	updateStatus() {
		this.keyStatusBar.text = `${this.statusBarPrefix()}${this.count}${this.keys}`;
	}

	handle(key: string) {
		if (this.parsingCount && !this.commandMode && isNum(key, this.count.length === 0)) {
			this.count += key;
			this.updateStatus();
			return;
		}

		this.parsingCount = false;
		
		/** Command mode */
		// Handle keys only until newline characters
		if (this.commandMode) {
			if (key !== "\n") {
				this.setKeys(this.keys + key);
				return;
			}
			
			const value = getFromKeymap(this.keymap, this.keys);
			if (value && isCommand(value)) {
				// reset keymap since this sequence is finished
				const ctx = this.getCtx();
				this.reset();
				return {
					command: value,
					ctx
				};
			}

			const keys = this.keys;
			this.reset();
			throw new KeyError(`undefined command: "${keys}"`);
		}
		
		/** Other modes */
		this.setKeys(this.keys + key);

		// try currentKeymap first
		let value = getFromKeymap(this.currentKeymap, key);
		if (value) {
			if (isCommand(value)) {
				const ctx = this.getCtx();
				// reset keymap since this sequence is finished
				this.reset();
				return {
					command: value,
					ctx
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
				const ctx = this.getCtx();
				// reset keymap since this sequence is finished
				this.reset();
				return {
					command: value,
					ctx
				};
			}
			// Keep only commonKeymap
			this.currentKeymap = undefined;
			this.currentCommonKeymap = value;

			return;
		}

		// reset keymap when the key is invalid
		const keys = this.keys;
		this.reset();
		throw new KeyError(`undefined key sequence: "${keys}"`);
	}
	
	reset() {
		this.currentKeymap = this.keymap;
		this.currentCommonKeymap = this.commonKeymap;
		this.count = "";
		this.parsingCount = this.parseNumberPrefix;
		this.setKeys("");
	}

	/// Clear state
	clear() {
		this.currentKeymap = this.keymap;
	}
}
