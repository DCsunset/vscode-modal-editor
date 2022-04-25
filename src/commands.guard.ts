/*
 * Generated type guards for "commands.ts".
 * WARNING: Do not manually change this file.
 */
import { isSimpleCommand } from "./actions.guard";
import { FindTextArgs } from "./commands";

export function isFindTextArgs(obj: any, _argumentName?: string): obj is FindTextArgs {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isSimpleCommand(obj.text) as boolean &&
        typeof obj.select === "boolean" &&
        (typeof obj.till === "undefined" ||
            obj.till === false ||
            obj.till === true) &&
        (typeof obj.withinLine === "undefined" ||
            obj.withinLine === false ||
            obj.withinLine === true) &&
        (typeof obj.backward === "undefined" ||
            obj.backward === false ||
            obj.backward === true)
    )
}
