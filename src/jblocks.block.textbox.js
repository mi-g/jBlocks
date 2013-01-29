/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @author mig <michel.gutierrez@gmail.com>
 * @version 0.1
 * @module jBlocks 
 * @overview Javascript library for automatic responsive design oriented layouts. 
 */

/**
 * <p>A TextBox block wraps a Text block into a box, so it can be maximized or closed.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name TextBox
 * @class Define a TextBox block to be displayed into a JBlocks.
 * @augments Box
 * @see Text
 */
$.jBlocks("defineBlockClass","TextBox","Box",{
	/**
	 * Initializes a TextBox block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name TextBox#init
	 * @function
	 * @param {Object} [layout] see {@link Box#init}
	 * @param {Object} [options] in addition to options defined in {@link Box#init}:
	 * @param {String} [text=""] the text to be displayed in the box.
	 * @param {Boolean} [options.multiline=true] should this text be displayed on a single or several lines.
	 * @param {String} [options.containerTag="p"] the HTML tag enclosing the text.
	 */
	init: function() {
		var $this=this;
		this._super.apply(this,arguments);
		this.options=$.extend({
			text: "",
			multiline: false,
			containerTag: "p",
		},this.options);
	},
	onCreate: function() {
		this._super();
        this.textPanel=this.setContent("Text",{
        	text: this.options.text,
        	containerTag: this.options.containerTag,
        	multiline: this.options.multiline,
        });
	},
});

