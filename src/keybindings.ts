import { Command } from "./actions";
import { isCommand } from "./actions.guard";

/**
 * Each key can be mapped to a command or a sub key map
 *
 * @see {isKeyMap} ts-auto-guard:type-guard
 */
export type KeyMap = {
	[key: string]: KeyMap | Command
}

/**
 * There are multiple modes in the key bindings.
 * Each mode has a key map
 *
 * @see {isKeyBindings} ts-auto-guard:type-guard
 */
export type KeyBindings = {
	[mode: string]: KeyMap
}


export class KeyEventHandler {
	/// The current key map (because there could be sub key maps)
	currentKeyMap: KeyMap;
	
	constructor(public keyMap: KeyMap) {
		this.currentKeyMap = keyMap;
	}

	handle(key: string) {
		if (key in this.keyMap) {
			const value = this.currentKeyMap[key];
			if (isCommand(value))
				return value;
			else {
				// value is a key map
				this.currentKeyMap = value;
			}
		}
	}
	
	/// Clear state
	clear() {
		this.currentKeyMap = this.keyMap;
	}
}
