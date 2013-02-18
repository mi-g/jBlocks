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
 * <p>A Menu block holds a set of links.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Menu
 * @class Define a Menu block to be displayed into a JBlocks.
 * @augments JBlock
 */
$.jBlocks("defineBlockClass","Menu","JBlock",{
	/**
	 * Initializes a Menu block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Menu#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {Array} [options.menuItems] menu items associated with the Menu block. Each menu item contains the fields:<ul>
	 * <li><i>label</i>: the text to be displayed.</li>
	 * <li><i>onClick</i>: a function to be called when the menu item is clicked.</li>
	 * <li><i>shouldDisplay</i>: a function to be called when the menu item is about to be displayed. If it returns false, the entry is not shown.</li>
	 * </ul>
	 */
	init: function(block,data) {
		this._super.apply(this,arguments);
		$.extend(this.options,{
			blockContentClass: "jblocks-block-menu",
		});
		this.options=$.extend({
			w: 1,
			h: 1,
			menuItems: [],
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		this._super();
		this.selfJBlocks.viewport.fixed="width";
		this.selfJBlocks.options.scrollable=true;
		//this.selfJBlocks.anchor.addClass("jblocks-block-menu");
		this.layout.h=this.jBlocks.viewport.h-1;
		this.layout.w=this.jBlocks.viewport.w;
		this.menuItems=[];
		for(var i in this.options.menuItems) {
			var menuItem={
				label: "--",
				onClick: function() {},
				shouldDisplay: function() { return true; },
			}
			$.extend(menuItem,this.options.menuItems[i]);
			var blockItem=this.selfJBlocks.addNewBlock("Link",{
					w:1,
					h:1,
					pref:"left top",
					expandHeight:0,
					expandWidth:0,
				},{
					text:menuItem.label,
					containerTag: "a",
				});
			this.menuItems.push({
				data: menuItem,
				block: blockItem,
			});
			(function(menuItem) {
				blockItem.anchor.bind($.jBlocks("click"),function() {
					menuItem.onClick.call($this);
				});
			})(menuItem); 
		}
		this.selfJBlocks.updateOptions({
			onResize: function(geometry,viewport) {
				viewport.w=$this.options.w;
			},			
		});
	},
	display: function(geometry) {
		this._super();
		var itemsCount=0;
		for(var i in this.menuItems) {
			var menuItem=this.menuItems[i];
			if(menuItem.data.shouldDisplay()) {
				menuItem.block.layout.visible=true;
				itemsCount++;
			} else 
				menuItem.block.layout.visible=false;
		}
		var h=Math.min(itemsCount,this.jBlocks.viewport.h-1);
		this.layout.h=h;
		this.layout.w=4;
		this.jBlocks.checkLayout();
		/*
		this.selfJBlocks.updateOptions({
			scrollable: true,
		});
		*/
		this.selfJBlocks.updateViewport({
			h: h,
		});
		//alert(itemsCount+" "+JSON.stringify(this.selfJBlocks.viewport));
		/*
		if(itemsCount!=this.selfJBlocks.viewport) {
			this.selfJBlocks.updateViewport({
				h: itemsCount,
			});
		} else
			this.content.trigger("refresh");
		*/
		/*
		var lineHeight=Math.max(geometry.uHeight,20);
		var h=3*lineHeight;
		*/
		//$.jBlocks("log","display JBlock",this.selfJBlocks.viewport,this.selfJBlocks.geometry);
		//this.content.text();
	},
});
