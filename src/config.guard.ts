/*
 * Generated type guards for "config.ts".
 * WARNING: Do not manually change this file.
 */
import { CursorStyle, Styles, Misc, Config } from "./config";
import { isKeybindings } from "./keybindings.guard";

export function isCursorStyle(obj: any, _argumentName?: string): obj is CursorStyle {
    return (
        (obj === "line" ||
            obj === "block" ||
            obj === "underline" ||
            obj === "line-thin" ||
            obj === "block-outline" ||
            obj === "underline-thin")
    )
}

export function isStyles(obj: any, _argumentName?: string): obj is Styles {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function")
    )
}

export function isMisc(obj: any, _argumentName?: string): obj is Misc {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.ignoreUndefinedKeys === "boolean"
    )
}

export function isConfig(obj: any, _argumentName?: string): obj is Config {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isStyles(obj.styles) as boolean &&
        isKeybindings(obj.keybindings) as boolean &&
        isMisc(obj.misc) as boolean
    )
}
