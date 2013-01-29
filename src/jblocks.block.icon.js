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
 * <p>An Icon block displays a small non-expandable 1x1 image .</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Icon
 * @class Define an Icon block to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","Icon","Block",{
	/**
	 * Initializes an Icon block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Icon#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {String} [options.onClick] a function to be called when the block is clicked.
	 * @param {String} [options.iconClass] css class used for icon.
	 */
	init: function() {
		this._super.apply(this,arguments);
		$.extend(this.layout,{
			w: 1,
			h: 1,
			expandWidth: 0,
			expandHeight: 0,
		});
		this.options=$.extend({
			iconClass:"jblocks-block-icon",
			onClick: function() {},
		},this.options);
	},
	onCreate: function(){
		var $this=this;
		this.content.addClass(this.options.iconClass);
		this.content.bind($.jBlocks("click"),function(event) {
			$this.options.onClick.call($this);
		});
	},
});

