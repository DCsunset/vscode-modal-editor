/*
 * Generated type guards for "actions.ts".
 * WARNING: Do not manually change this file.
 */
import { Command, NormalCommand, ParameterizedCommand, CommandList, ConditionalCommand } from "./actions";

export function isCommand(obj: any, _argumentName?: string): obj is Command {
    return (
        (isNormalCommand(obj) as boolean ||
            isConditionalCommand(obj) as boolean ||
            isCommandList(obj) as boolean)
    )
}

export function isNormalCommand(obj: any, _argumentName?: string): obj is NormalCommand {
    return (
        typeof obj === "string"
    )
}

export function isParameterizedCommand(obj: any, _argumentName?: string): obj is ParameterizedCommand {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isNormalCommand(obj.command) as boolean
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

export function isConditionalCommand(obj: any, _argumentName?: string): obj is ConditionalCommand {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isCommand(obj.command) as boolean &&
        isNormalCommand(obj.when) as boolean
    )
}
