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
 * <p>An HtmlElement block displays a single HTML element, controlling size, padding and margin.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name HtmlElement
 * @class Define an HtmlElementblock to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","HtmlElement","Block",{
	/**
	 * @name HtmlElement#element
	 * @field
	 */
	element: null,
	/**
	 * Initializes an HtmlElement block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name HtmlElement#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {String} [tag="p"] the tag for the HTML element.
	 * @param {Array} [options.emargin=[0,0,0,0]] To be documented.
	 * @param {Array} [options.epadding=[0,0,0,0]] To be documented.
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			emargin: [0,0,0,0],
			epadding: [0,0,0,0],
			tag: "p",
		},this.options);
	},
	onCreate: function() {
		this.element=$("<"+this.options.tag+"/>").appendTo(this.content);
	},
	display: function(geometry) {
		var sizeRef=Math.min(this.jBlocks.geometry.uWidth,this.jBlocks.geometry.uHeight);
		var marginTop=sizeRef*this.options.emargin[0];
		var marginRight=sizeRef*this.options.emargin[1];
		var marginBottom=sizeRef*this.options.emargin[2];
		var marginLeft=sizeRef*this.options.emargin[3];
		var paddingTop=sizeRef*this.options.epadding[0];
		var paddingRight=sizeRef*this.options.epadding[1];
		var paddingBottom=sizeRef*this.options.epadding[2];
		var paddingLeft=sizeRef*this.options.epadding[3];
		var borderHeight=parseInt(this.element.css("border-top-width"))+parseInt(this.element.css("border-bottom-width"));
		var borderWidth=parseInt(this.element.css("border-left-width"))+parseInt(this.element.css("border-right-width"));
		this.element.css({
			"margin-top": marginTop+"px",
			"margin-right": marginRight+"px",
			"margin-bottom": marginBottom+"px",
			"margin-left": marginLeft+"px",
			"padding-top": paddingTop+"px",
			"padding-right": paddingRight+"px",
			"padding-bottom": paddingBottom+"px",
			"padding-left": paddingLeft+"px",
			"height": this.content.height()-paddingTop-marginTop-paddingBottom-marginBottom-borderHeight,
			"width": this.content.width()-paddingLeft-marginLeft-paddingRight-marginRight-borderWidth,
		});
	},
});
