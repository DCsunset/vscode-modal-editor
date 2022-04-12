/*
 * Generated type guards for "keybindings.ts".
 * WARNING: Do not manually change this file.
 */
import { KeyMap, KeyBindings } from "./keybindings";

export function isKeyMap(obj: any, _argumentName?: string): obj is KeyMap {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function")
    )
}

export function isKeyBindings(obj: any, _argumentName?: string): obj is KeyBindings {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function")
    )
}
