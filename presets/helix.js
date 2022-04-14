/**
 * Keybindings for helix editor
 */

// actions shared by normal and select mode
const actions = {
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
};

module.exports = {
	normal: {
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
		
		// actions
		...actions,
	
	// goto mode
	g: {
	h: "cursorHome",
	l: "cursorEnd",
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
		
		// actions
		...actions
	}
};

