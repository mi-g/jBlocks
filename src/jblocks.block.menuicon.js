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
 * <p>A MenuIcon block displays a small non-expandable 1x1 image that opens or closes a Menu block when clicked.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name MenuIcon
 * @class Define a MenuIcon block to be displayed into a JBlocks.
 * @augments Icon
 */
$.jBlocks("defineBlockClass","MenuIcon","Icon",{
	/**
	 * Initializes a MenuIcon block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name MenuIcon#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Icon#init}:
	 * @param {Array} [options.menuItems] menu items associated with the MenuIcon block, as specified in {@link Menu#init}.
	 */
	init: function() {
		var $this=this;
		this._super.apply(this,arguments);
		$.extend(this.options,{
			blockContentClass: "jblocks-icon-menu",			
			onClick: function() {
				$this.menuClick();
			},
		});
		this.options=$.extend({
			menuItems: [],
		},this.options);
		this.menu=null;
	},
	menuClick: function() {
		if(this.menu==null) {
			this.menu=this.jBlocks.addNewBlock("Menu",{
				priority:1001,
				w: 1,
				h: 1,
				pref:"left top",
				expandWidth: 0,
				expandHeight: 0,
			},{
				menuItems: this.options.menuItems,
			});
		} else if(this.menu.layout.visible) {
			this.menu.layout.visible=false;
			this.jBlocks.checkLayout();
		} else {
			this.menu.layout.visible=true;
			this.jBlocks.checkLayout();			
		}
	},
});
