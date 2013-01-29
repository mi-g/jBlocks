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
 * <p>A Text block displays an uniformely formatted text. The text size tries to adjust to the block size.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Text
 * @class Define a Text block to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","Text","HtmlElement",{
	/**
	 * Initializes a Text block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Text#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {String} [options.text=""] the text to be displayed.
	 * @param {Boolean} [options.multiline=false] should this text be displayed on a single or several lines.
	 * @param {String} [options.containerTag="p"] the HTML tag enclosing the text.
	 * @param {Number} [options.emRatio=0.7] the ratio to be used to adjust the font size when in multiline mode.
	 */
	init: function(layout,options) {
		this._super.apply(this,arguments);
		this.options=$.extend({
			text: "",
			multiline: false,
			containerTag: "p",
			emRatio: 0.6,
			blockClass: "jblocks-simpletext",
		},this.options);
		this.options.tag=this.options.containerTag;
		this.options.epadding=[0,0.1,0,0.1];
	},
	onCreate: function() {
		this._super.apply(this);
		this.element.text(this.options.text);
	},
	display: function(geometry) {
		this._super.apply(this,arguments);
		this.adjustSize(geometry);
	},
	adjustSize: function(geometry) {
		if(!this.options.multiline) {
			this.element.addClass("jblocks-simpletext-single");
			var lineHeight=geometry.height;
			this.element.css({
				"line-height": lineHeight+"px",
			});
		}
	},
	/**
	 * Get or set the block text.
	 * @name Text#textVal
	 * @function
	 * @param {String} [text] if an argument is used, it replaces the text currently being displayed.
	 * @returns the text contained in the block.
	 */
	textVal: function() {
		var ret=this.element.text.apply(this.element,arguments);
		if(arguments.length>0) {
			this.options.text=arguments[0];
			this.adjustSize({
				width: this.content.width(),
				height: this.content.height(),
			});
		}
		return ret;
	},
});

