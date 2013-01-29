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
 * <p>A Foo block just displays a letter. It is mainly used for testing.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Foo
 * @class Define a Foo block to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","Foo","Block",{
	/**
	 * Initializes a Foo block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Foo#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}
	 * @param {Object} [options] see {@link Block#init}
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.letter=String.fromCharCode(65+(this.constructor.fooIndex++));
	},
	onCreate: function() {
		this.content.css({
			"background-color": "rgba("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+",0.5)",
			"text-align": "center",
		}).text(this.letter);
		this._super.call(this);
	},
	display: function(geometry) {
		//JocLog("display",this.id,geometry);
		this.content.css({
			"line-height": geometry.height+"px",
			"font-size": Math.min(geometry.height/2,geometry.width*0.8)+"pt",			
		});
	},
}).fooIndex=0;


