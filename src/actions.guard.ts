/*
 * Generated type guards for "actions.ts".
 * WARNING: Do not manually change this file.
 */
import { Command, SimpleCommand, ComplexCommand, CommandContext, CommandList } from "./actions";

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
        isCommand(obj.command) as boolean &&
        (typeof obj.computedArgs === "undefined" ||
            obj.computedArgs === false ||
            obj.computedArgs === true) &&
        (typeof obj.when === "undefined" ||
            isSimpleCommand(obj.when) as boolean) &&
        (typeof obj.count === "undefined" ||
            isSimpleCommand(obj.count) as boolean) &&
        (typeof obj.record === "undefined" ||
            isSimpleCommand(obj.record) as boolean)
    )
}

export function isCommandContext(obj: any, _argumentName?: string): obj is CommandContext {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isSimpleCommand(obj.keys) as boolean &&
        (typeof obj.count === "undefined" ||
            typeof obj.count === "number")
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
