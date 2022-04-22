/**
 * Keybindings for helix editor
 */

// add count argument
function repeatable(command) {
	return {
		command,
		count: "_ctx.count"
	};
}

module.exports = {
	// Common keybindings (except for insert mode)
	"": {
		u: repeatable("undo"),
		U: repeatable("redo"),
		d: "deleteRight",
		c: [
			"deleteRight",
			"modalEditor.setInsertMode"
		],
		x: repeatable("expandLineSelection"),
		"<": repeatable("editor.action.outdentLines"),
		">": repeatable("editor.action.indentLines"),
		y: "editor.action.clipboardCopyAction",
		p: [
			"cursorRight",
			"editor.action.clipboardPasteAction"
		],
		P: "editor.action.clipboardPasteAction",

		// into command mode
		":": "modalEditor.setCommandMode",

		// into insert mode
		i: "modalEditor.setInsertMode",
		I: [
			"cursorHome",
			"modalEditor.setInsertMode"
		],
		a: [
			"cursorRight",
			"modalEditor.setInsertMode"
		],
		A: [
			"cursorEnd",
			"modalEditor.setInsertMode"
		],
		o: [
			"editor.action.insertLineAfter",
			"modalEditor.setInsertMode"
		],
		O: [
			"editor.action.insertLineBefore",
			"modalEditor.setInsertMode"
		],
		
		// goto mode
		g: {
			p: "workbench.action.previousEditor",
			n: "workbench.action.nextEditor",
			d: "editor.action.revealDefinition"
		},
		
		// space mode
		" ": {
			f: "workbench.action.quickOpen",
			b: "workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup",
			k: "editor.action.showHover"
		},
		
		// search
		"/": "actions.find",
		n: "editor.action.nextMatchFindAction",
		N: "editor.action.previousMatchFindAction"
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
	
		// goto mode
		g: {
			h: "cursorHome",
			j: "cursorEnd",
			g: "cursorTop",
			e: "cursorBottom",
		},
	
		// set to select mode
		v: "modalEditor.setSelectMode"
	},

	select: {
		// cursor movement
		h: repeatable("cursorLeftSelect"),
		j: repeatable("cursorDownSelect"),
		k: repeatable("cursorUpSelect"),
		l: repeatable("cursorRightSelect"),
		w: repeatable("cursorWordStartRightSelect"),
		b: repeatable("cursorWordStartLeftSelect"),
	
		// goto mode
		g: {
			h: "cursorHomeSelect",
			l: "cursorEndSelect",
			g: "cursorTopSelect",
			e: "cursorBottomSelect",
		},
	},

	// Command mode
	command: {
		// save file
		"w": "workbench.action.files.save"
	}
};

