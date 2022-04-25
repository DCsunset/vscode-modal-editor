# vscode-modal-editor

[![version](https://badgen.net/open-vsx/version/DCsunset/vscode-modal-editor)](https://open-vsx.org/extension/DCsunset/vscode-modal-editor)

Customizable extension to turn VS Code into a modal editor

## Installation

Currently it is published on [Open VSX](https://open-vsx.org/extension/DCsunset/vscode-modal-editor),
which is believed to be a vendor-neutral
open-source alternative to the Visual Studio Marketplace.

You can also download the extension directly from GitHub [releases](https://github.com/DCsunset/vscode-modal-editor/releases).

## Usage

To use this extension, first you need to import keybindings.
You can define your own keybindings based on the tutorial.
Or you can use the preset in this repository as a start point.

You can put different keybindings in the preset directory (default is `~/.config/vscode-modal-editor`),
so that you can switch between them quickly.


## Features

* Easy to customize your key type to emulate other modal editors.
* Recursive keymaps (easy to add multi-stage keybindings)


## How it works

This extension can only capture normal characters typed in modes except for insert mode.
For special keys like `Esc`, `Ctrl` or `Alt`, they are handled by VS Code directly.
So if you want to bind those keys to commands,
you can directly map them in `keybindings.json`.

This extension sets the context `modalEditor.mode`
so you can use it in `when` conditions in `keybinding.json`.

## Importing Keybindings

To add keybindings, you can create a config file in `json`, `jsonc`, or `js` format.
(for `js` format, export the configuration object using `module.exports`).

To import existing keybindings, run the command "Modal Editor: Import Keybindings" from the command palette.
You can select a file or use a URI.

There is a preset for helix in this repository.
It is just a demo and you can easily create your own based on it.


## Presets

I am currently a user of [helix](https://github.com/helix-editor/helix),
so I only create a preliminary [preset](./presets/helix.js) for it.
It doesn't implement all helix features and some actions may have slight differences.

You are encouraged to define your own keybindings
since this extension aims at a general modal editor.


## Commands

This extension define some extra VS commands.
They are listed as follows:

| Command | Arguments | Description |
| - | - | - |
| `modalEditor.setMode` | `string` | Set the current mode |
| `modalEditor.setInsertMode` | - | Set to insert mode |
| `modalEditor.setNormalMode` | - | Set to normal mode |
| `modalEditor.setSelectMode` | - | Set to select mode |
| `modalEditor.setCommandMode` | - | Set to command mode |
| `modalEditor.setKeys` | `string` | Change current key sequence without applying it. Value should be a js expression (useful for modifying unexecuted commands) |
| `modalEditor.gotoLine` | `number` | Go to the specified line |
| `modalEditor.gotoLineSelect` | `number` | Go to the specified line and select content in between |
| `modalEditor.findText` | `FindTextArgs` | Find and move cursor to text |
| `modalEditor.importKeybindings` | - | Import keybindings |
| `modalEditor.importPreset` | `string?` | Import keybindings from preset dir or a specified dir |


Types defined in the above table:

```ts
type FindTextArgs = {
	/// String to find
	text: string,
	/// Whether to select text
	select: boolean,
	/// Whether to move till the text rather than to the text (default: false)
	till?: boolean,
	/// Within the ine of current cursor (default: false)
	withinLine?: boolean,
	/// Search backward (default: false)
	backward?: boolean,
};
```


## Tutorial to Customize Keybindings

### Basics

There are 4 predefined modes (`normal`, `insert`, `select`, `command`) in this extension,
but you are free to add more modes.

Keybindings can be defined for all modes except for insert mode,
because this extension will handle over to VS Code in insert mode.

Each key sequence can be prefixed with a number indicating the count.
The count value will be stored in the `CommandContext`,
which can be used in the js expression of `ComplexCommand`.

Command mode is another different mode because it maps a key sequence instead of each key to a command.
It doesn't support sub-keymap or count prefix as well.
A newline character is used to indicate the end of a command.

The keybindings object is defined in the following format (in TypeScript):

```ts
type Keymap = {
	[key: string]: Keymap | Command
}
type Keybindings = {
	[mode: string]: Keymap
}
```

The above definition means that each mode has a separate keymap,
each keymap maps a key to a sub-keymap or a command.
Recursive keymaps are useful to define multi-stage commands.
Note that the key must be a single character.
If you need map a key sequence to a command, you can use a recursive keymap.

There's a special mode `""` in `Keybindings` which means common keybindings.
It is shared by all the modes (except insert mode),
and it can be overwritten by other modes.

There's also a special key `""` in `Keymap` which represents a wildcard character
to match any character.
It has the lowest priority and can be overwritten by other keys.

### Commands

The command can be a string (which means a VS Code command),
a list of commmands,
or a complex command object:

```ts
type ComplexCommand = {
	command: Command,
	/// args for that command (only if it's a simple command)
	args?: any,
	/// whether to use JS expression for args
	computedArgs?: boolean,
	/// condition to execute the above command
	when?: string,
	/// run this command for count times (a js expression)
	count?: string
};
```

The arguments of a complex command can be a JS expression,
which depends on the `computedArgs` field.
For computed arguments, the `args` must be a string for JS expressions.

The condition `when` and `count` are also JS expressions.


### Command Context

In the JS expression in a complex command, a context object `_ctx` is available.

The definion of `_ctx` is defined as follows:

```ts
type CommandContext = {
	/// Key sequence to invoke this command or unexecuted keys
	keys: string,
	/// Count of the current command
	count: number
};
```


### Example

Here is an example code snippet for `helix.js` preset:

```js
// add count argument
function repeatable(command) {
	return {
		command,
		count: "_ctx.count"
	};
}

module.exports = {
	"": {
		// Common keybindings
		i: "modalEditor.setInsertMode",
	},
	normal: {
		// replace the character at the cursor
		r: {
			// Wildcard character
			"": {
				command: "compositionType",
				computedArgs: true,
				// use a js expression for computed args
				args: `{
					// replace with last key in the key sequence
					text: _ctx.keys.charAt(_ctx.keys.length-1),
					replaceNextCharCnt: 1,
					positionDelta: -1
				}`
			}
		},

		// cursor movement
		h: repeatable("cursorLeft"),
		j: repeatable("cursorDown"),
		k: repeatable("cursorUp"),
		l: repeatable("cursorRight"),
		w: repeatable([
			"cancelSelection",
			"cursorWordStartRightSelect",
		]),
		b: repeatable([
			"cancelSelection",
			"cursorWordStartLeftSelect"
		]),
	}
}
```

So it maps some movement keys to some existing commands in VS Code,
which leverages the built-in text manipulation.
You can refer to the `presets/helix.js` for more examples.


## Acknowledgement

This extension is greatly inspired by
[ModalKeys](https://github.com/haberdashPI/vscode-modal-keys)
and
[ModalEdit](https://github.com/johtela/vscode-modaledit).
This extension borrows a lot of ideas from them
thanks to their detailed documentation.

The main difference between this extension and the above two is the philosophy:
this extension tries to reuse most VS Code native commands
and avoids adding more state control.
This makes it easier to understand the code and further extend it.

The logo of this extension is modified based on the icon credited to
[Material Design Icons](https://materialdesignicons.com/).


## License

Copyright (C) 2022 DCsunset

Licensed under the [AGPLv3](LICENSE) license.

