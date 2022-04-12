/*
 * Generated type guards for "keybindings.ts".
 * WARNING: Do not manually change this file.
 */
import { Keymap, Keybindings } from "./keybindings";

export function isKeymap(obj: any, _argumentName?: string): obj is Keymap {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function")
    )
}

export function isKeybindings(obj: any, _argumentName?: string): obj is Keybindings {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function")
    )
}
