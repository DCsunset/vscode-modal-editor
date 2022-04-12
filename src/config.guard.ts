/*
 * Generated type guards for "config.ts".
 * WARNING: Do not manually change this file.
 */
import { Styles, Config } from "./config";
import { isKeybindings } from "./keybindings.guard";

export function isStyles(obj: any, _argumentName?: string): obj is Styles {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function")
    )
}

export function isConfig(obj: any, _argumentName?: string): obj is Config {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isStyles(obj.styles) as boolean &&
        isKeybindings(obj.keybindings) as boolean
    )
}
