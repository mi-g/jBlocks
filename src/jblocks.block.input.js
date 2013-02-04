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
 * <p>An Input block displays an HTML input field.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Input
 * @class Define a Input block to be displayed into a JBlocks.
 * @augments HtmlElement
 */
$.jBlocks("defineBlockClass","Input","HtmlElement",{
	/**
	 * Initializes an Input block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Input#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {Function} [options.onCR] a function to be called when carriage return is pressed inside the input field.
	 * @param {Function} [options.onKeyDown] a function(keyCode) to be called when a key is pressed.
	 * @param {Function} [options.text=""] the initial text value to display in the input field.
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			onCR: function() {},		
			onKeyDown: function() {},		
			text: "",
		},this.options);
		this.options.tag="input";
		this.options.blockClass="jblocks-block-input";
	},
	onCreate: function() {
		this._super.apply(this);
		var $this=this;
		this.element.val(this.options.text).bind("keydown",function(event) {
			setTimeout(function() {
				if(event.keyCode==13)
					$this.options.onCR.call($this);
				else
					$this.options.onKeyDown.call($this,event.keyCode);
			},0);
		});
	},
	display: function() {
		this._super.apply(this,arguments);
		this.element.css({
			"font-size": this.element.height()*0.6+"pt",
		});
	},
	/*
	display: function(geometry) {
		this.input.css({
			margin: 0,
			padding: geometry.height*0.05,
			"font-size": geometry.height*0.4+"pt",
		});
		var extraHeight=this.input.outerHeight(true)-this.input.height();
		var extraWidth=this.input.outerWidth(true)-this.input.width();
		this.input.height(geometry.height-extraHeight);
		this.input.width(geometry.width-extraWidth);
	},
	*/
	/**
	 * Get or set the input field value.
	 * @param {String} [text] if omitted, the function returns the current value of the field, otherwise, sets the input value.
	 * @returns the input text value.
	 */
	val: function() {
		return this.element.val.apply(this.element,arguments);
	},
});

