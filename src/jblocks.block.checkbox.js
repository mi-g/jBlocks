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
 * <p>A Checkbox block displays an boolean input field.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Checkbox
 * @class Define a Checkbox block to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","Checkbox","Block",{
	/**
	 * Initializes a Checkbox block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Checkbox#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {Function} [options.onChange] a function to be called after the field value has changed.
	 * @param {Function} [options.text=""] the label to be displayed for the input.
	 * @param {Function} [options.checked=false] the initial input value.
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			checked: false,
			onChange: function() {},
			text: "",
		},this.options);
		this.layout.expandHeight=0;
		this.options.blockContentClass="jblocks-clickable";
	},
	onCreate: function() {
		var $this=this;
		this._super.apply(this);
		var $this=this;
		this.input=$("<div/>").addClass("jblocks-checkbox-ticker").css({
			float: "left",
		}).appendTo(this.content);
		this.text=$("<p/>").text(this.options.text).css({
			float: "left",
			margin: 0,
		}).appendTo(this.content);
		this.content.bind("click",function() {
			$this.options.checked=!$this.options.checked;
			$this.updateState();
			$this.options.onChange.call($this,$this.options.checked);
		});
		this.updateState();
	},
	updateState: function() {
		if(this.options.checked)
			this.input.addClass("jblocks-checkbox-checked");
		else
			this.input.removeClass("jblocks-checkbox-checked");
	},
	display: function() {
		this._super.apply(this,arguments);
		var height=this.content.height();
		this.input.css({
			height: height,
			width: height,
		});
		this.text.css({
			//"font-size": height*0.6+"pt",
			"padding-left": height/4+"px",
			"line-height": height+"px",
		});
	},
	/**
	 * Get or set the input field value.
	 * @param {Boolean} [checked] if omitted, the function returns the current value of the field, otherwise, sets the input value.
	 * @returns the input boolean value.
	 */
	val: function() {
		if(arguments.length>0) {
			var prev=this.options.checked;
			this.options.checked=(!arguments[0])?false:true;
			if(prev!=this.options.checked) {
				this.updateState();
				this.options.onChange.call(this,this.options.checked);				
			}
		}
		return this.options.checked;
	},
});

