/*
 * Generated type guards for "actions.ts".
 * WARNING: Do not manually change this file.
 */
import { Command, SimpleCommand, ComplexCommand, CommandList } from "./actions";

export function isCommand(obj: any, _argumentName?: string): obj is Command {
    return (
        (isSimpleCommand(obj) as boolean ||
            isComplexCommand(obj) as boolean ||
            isCommandList(obj) as boolean)
    )
}

export function isSimpleCommand(obj: any, _argumentName?: string): obj is SimpleCommand {
    return (
        typeof obj === "string"
    )
}

export function isComplexCommand(obj: any, _argumentName?: string): obj is ComplexCommand {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isSimpleCommand(obj.command) as boolean &&
        (typeof obj.when === "undefined" ||
            isSimpleCommand(obj.when) as boolean)
    )
}

export function isCommandList(obj: any, _argumentName?: string): obj is CommandList {
    return (
        Array.isArray(obj) &&
        obj.every((e: any) =>
            isCommand(e) as boolean
        )
    )
}
