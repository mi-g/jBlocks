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
 * <p>A Spacer block just occupy space without displaying any content.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Spacer
 * @class Define a Foo block to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","Spacer","Block",{
	/**
	 * Initializes a Spacer block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Spacer#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}
	 * @param {Object} [options] see {@link Block#init}
	 */
	init: function() {
		this._super.apply(this,arguments);
	},
});


