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
 * <p>A ScrollableHtmlBox block wraps a ScrollableHtml block into a box, so it can be maximized or closed.</p>
 * <p>The constructor should not be invoked directly but {@link Box#newBlock} or {@link Box#addNewBlock} should be used instead.</p>
 * @name ScrollableHtmlBox
 * @class Define a ScrollableHtmlBox block to be displayed into a JBlocks.
 * @augments Box
 * @see ScrollableHtml
 */
$.jBlocks("defineBlockClass","ScrollableHtmlBox","Box",{
	/**
	 * Initializes a ScrollableHtml block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name ScrollableHtmlBox#init
	 * @function
	 * @param {Object} [layout] see {@link Box#init}
	 * @param {Object} [options] in addition to options defined in {@link Box#init}:
	 * @param {String} [options.htmlContent=""] the initial HTML code to be inserted.
	 */
	init: function() {
		var $this=this;
		this._super.apply(this,arguments);
		this.options=$.extend({
			htmlContent: "",
		},this.options);
	},
	onCreate: function() {
		this._super();
        this.textPanel=this.setContent("ScrollableHtml",{
        	htmlContent: this.options.htmlContent,
        });
	},
});

