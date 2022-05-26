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
		c: [
			"modalEditor.cut",
			"modalEditor.setInsertMode"
		],
		/* Mutli-cursor
		 * (for insert cursor above, use keybindings.json for Alt-Shift-C)
		 */
		C: repeatable("editor.action.insertCursorBelow"),
		",": "removeSecondaryCursors",

		J: repeatable("editor.action.joinLines"),
		x: repeatable([
			{
				command: "cursorRightSelect",
				// move right when this line is alreay selected (because of inclusive range)
				when: "_ctx.selection.contains(_ctx.lineAt(_ctx.pos.line).range)"
			},
			"expandLineSelection",
			{
				// move left when it expands to a new line (because of inclusive range)
				command: "cursorLeftSelect",
				when: "!_ctx.lastSelection.contains(_ctx.lineAt(_ctx.lastPos.line).range)"
			}
		]),
		"<": repeatable("editor.action.outdentLines"),
		">": repeatable("editor.action.indentLines"),
		y: [
			"modalEditor.yank",
			"modalEditor.setNormalMode"
		],
		d: [
			"modalEditor.cut",
			"modalEditor.setNormalMode"
		],
		p: "modalEditor.paste",
		P: {
			command: "modalEditor.paste",
			args: {
				before: true
			}
		},

		// into command mode
		":": "modalEditor.setCommandMode",

		// into insert mode
		i: "modalEditor.setInsertMode",
		I: [
			"cursorLineStart",
			"modalEditor.setInsertMode"
		],
		a: [
			"cursorRight",
			"modalEditor.setInsertMode"
		],
		A: [
			"cursorLineEnd",
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
		G: {
			command: "modalEditor.gotoLine",
			// line number is prefix count
			computedArgs: true,
			args: "_ctx.count",
			// only when there is a prefix count
			when: "_ctx.count !== undefined"
		},
		
		// match mode
		m: {
			m: "editor.action.jumpToBracket"
		},

		// goto mode
		g: {
			g: {
				command: "modalEditor.gotoLine",
				// line number is prefix count
				computedArgs: true,
				args: "_ctx.count || 1"
			},
			e: "cursorBottom",
			".": "workbench.action.navigateToLastEditLocation",
			p: "workbench.action.previousEditor",
			n: "workbench.action.nextEditor",
			d: "editor.action.revealDefinition"
		},
		
		// space mode
		" ": {
			// yank to clipboard
			y: [
				{
					command: "modalEditor.yank",
					args: {
						register: ""
					}
				},
				"modalEditor.setNormalMode"
			],
			// paste from clipbard
			p: {
				command: "modalEditor.paste",
				args: {
					register: ""
				}
			},
			P: {
				command: "modalEditor.paste",
				args: {
					register: "",
					before: true
				}
			},
			f: "workbench.action.quickOpen",
			b: "workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup",
			k: "editor.action.showHover",
			"?": "workbench.action.showCommands"
		},
		
		// search
		"/": "actions.find",
		n: [
			// move right to find the next instead of current
			"cursorRight",
			"editor.action.nextMatchFindAction",
			{
				// move left because of inclusive range
				command: "cursorLeftSelect",
				when: "!_ctx.selection.isEmpty"
			}
		],
		N: [
			// move right to find the next instead of current
			"cursorRight",
			"editor.action.previousMatchFindAction",
			{
				// move left because of inclusive range
				command: "cursorLeftSelect",
				when: "!_ctx.selection.isEmpty"
			}
		]
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
		h: repeatable([
			// Cancel selection first or it will move before the selection
			"cancelSelection",
			"cursorLeft"
		]),
		j: repeatable([
			"cancelSelection",
			"cursorDown"
		]),
		k: repeatable([
			"cancelSelection",
			"cursorUp"
		]),
		l: repeatable([
			"cancelSelection",
			"cursorRight"
		]),
		w: repeatable([
			"cancelSelection",
			{
				// move right when it's boundary of words, spaces, or newline (only zero or one char if it's newline)
				command: "cursorRight",
				when: "/(^.?$)|(\\s[^\\s])|([^\\s]\\s)|(.\\b.)/.test(_ctx.lineAt(_ctx.pos.line).text.substring(_ctx.pos.character, _ctx.pos.character+2))"
			},
			"cursorWordStartRightSelect",
			// move left because the range is inclusive
			"cursorLeftSelect"
		]),
		b: repeatable([
			"cancelSelection",
			"cursorWordStartLeftSelect"
		]),
		f: {
			"": repeatable([
				"cancelSelection",
				{
					command: "modalEditor.findText",
					computedArgs: true,
					args: `{
						text: _ctx.keys.charAt(_ctx.keys.length-1),
						select: true
					}`
				}
			])
		},
		F: {
			"": repeatable([
				"cancelSelection",
				{
					command: "modalEditor.findText",
					computedArgs: true,
					args: `{
						text: _ctx.keys.charAt(_ctx.keys.length-1),
						backward: true,
						select: true
					}`
				}
			])
		},
		t: {
			"": repeatable([
				"cancelSelection",
				{
					command: "modalEditor.findText",
					computedArgs: true,
					args: `{
						text: _ctx.keys.charAt(_ctx.keys.length-1),
						till: true,
						select: true
					}`
				}
			])
		},
		T: {
			"": repeatable([
				"cancelSelection",
				{
					command: "modalEditor.findText",
					computedArgs: true,
					args: `{
						text: _ctx.keys.charAt(_ctx.keys.length-1),
						till: true,
						backward: true,
						select: true
					}`
				}
			])
		},

		// goto mode
		g: {
			h: "cursorLineStart",
			l: [
				"cursorLineEnd",
				{
					// move left if it's not the start of line
					command: "cursorLeft",
					when: "_ctx.pos.character > 0"
				}
			],
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
		w: repeatable([
			{
				// move right when it's boundary of words, spaces, or newline (only zero or one char if it's newline)
				command: "cursorRightSelect",
				when: "/(^.?$)|(\\s[^\\s])|([^\\s]\\s)|(.\\b.)/.test(_ctx.lineAt(_ctx.pos.line).text.substring(_ctx.pos.character, _ctx.pos.character+2))"
			},
			"cursorWordStartRightSelect",
			// move left because the range is inclusive
			"cursorLeftSelect"
		]),
		b: repeatable("cursorWordStartLeftSelect"),
		f: {
			"": repeatable({
				command: "modalEditor.findText",
				computedArgs: true,
				args: `{
					text: _ctx.keys.charAt(_ctx.keys.length-1),
					select: true
				}`
			})
		},
		F: {
			"": repeatable({
				command: "modalEditor.findText",
				computedArgs: true,
				args: `{
					text: _ctx.keys.charAt(_ctx.keys.length-1),
					backward: true,
					select: true
				}`
			})
		},
		t: {
			"": repeatable({
				command: "modalEditor.findText",
				computedArgs: true,
				args: `{
					text: _ctx.keys.charAt(_ctx.keys.length-1),
					till: true,
					select: true
				}`
			})
		},
		T: {
			"": repeatable({
				command: "modalEditor.findText",
				computedArgs: true,
				args: `{
					text: _ctx.keys.charAt(_ctx.keys.length-1),
					till: true,
					backward: true,
					select: true
				}`
			})
		},

		// goto mode
		g: {
			h: "cursorLineStartSelect",
			l: [
				"cursorLineEndSelect",
				{
					// move left if it's not the start of line
					command: "cursorLeftSelect",
					when: "_ctx.pos.character > 0"
				}
			]
		},
	
		// set back to normal mode
		v: "modalEditor.setNormalMode"
	},

	// Command mode
	command: {
		// save file
		w: "workbench.action.files.save"
	}
};

