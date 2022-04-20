/**
 * Keybindings for helix editor
 */

module.exports = {
	// Common keybindings (except for insert mode)
	"": {
		u: "undo",
		U: "redo",
		d: "deleteRight",
		c: [
			"deleteRight",
			"modalEditor.setInsertMode"
		],
		x: "expandLineSelection",
		"<": "editor.action.outdentLines",
		">": "editor.action.indentLines",
		y: "editor.action.clipboardCopyAction",
		p: [
			"cursorRight",
			"editor.action.clipboardPasteAction"
		],
		P: "editor.action.clipboardPasteAction",

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
		h: "cursorLeft",
		j: "cursorDown",
		k: "cursorUp",
		l: "cursorRight",
		w: [
			"cancelSelection",
			"cursorWordStartRightSelect",
		],
		b: [
			"cancelSelection",
			"cursorWordStartLeftSelect"
		],
	
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
		h: "cursorLeftSelect",
		j: "cursorDownSelect",
		k: "cursorUpSelect",
		l: "cursorRightSelect",
		w: "cursorWordStartRightSelect",
		b: "cursorWordStartLeftSelect",
	
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

