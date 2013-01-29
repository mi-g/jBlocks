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
 * <p>A JBlock block holds a JBlocks viewport. It is used to create more complex blocks made of sub-blocks, for instance with a header, content and footer areas.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name JBlock
 * @class Define a JBlock block to be displayed into a JBlocks.
 * @borrows JBlocks#addNewBlock
 * @augments Block
 */
$.jBlocks("defineBlockClass","JBlock","Block",{
	/**
	 * Initializes a Foo block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name JBlock#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {String} [options.jBlocksBlockClass] the <i>blockClass</i> option for the inner jBlocks.
	 * @param {String} [options.jBlocksBlockContentClass] the <i>blockContentClass</i> option for the inner jBlocks.
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			jBlocksBlockClass: null,
			jBlocksBlockContentClass: null,
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		/**
		 * Access the inner JBlocks object.
		 * @name JBlock#selfJBlock
		 * @field
		 */
		this.selfJBlocks=this.content.jBlocks();
		this.selfJBlocks.updateOptions({
			onResize: function(geometry,viewport) {
				var h=$this.actualLayout.h || 1;
				if(geometry.height/h<$this.options.minPixels)
					h=Math.max(Math.floor(geometry.height/$this.options.minPixels),1);
				if($this.options.minh>0 && h<$this.options.minh)
					h=$this.options.minh;
				if($this.options.maxh>0 && h>$this.options.maxh)
					h=$this.options.maxh;
				var w=$this.actualLayout.w || 1;
				if(geometry.width/w<$this.options.minPixels)
					w=Math.max(Math.floor(geometry.width/$this.options.minPixels),1);
				if($this.options.minw>0 && w<$this.options.minw)
					w=$this.options.minw;
				if($this.options.maxw>0 && w>$this.options.maxw)
					w=$this.options.maxw;
				viewport.h=h;
				viewport.w=w;
			},
			blockClass: this.options.jBlocksBlockClass,
			blockContentClass: this.options.jBlocksBlockContentClass,
		});
		this.selfJBlocks.updateViewport({
			w: 1,
			h: 1,
			fixed: "both",			
		});
		this.selfJBlocks.updateOptions({
			resizeDelay: 5,
			layoutDelay: 5,
			resizeAnimateDelay: 100,
			debugBlockLayout: this.jBlocks.options.debugBlockLayout,
		});
	},
	onStartResize: function(contentGeo,blockGeo) {
		this.onResize(blockGeo);
		this.content.trigger("jBlocks.resize",null);
	},
	onRemove: function() {
		this._super();
		if(this.selfJBlocks)
			this.selfJBlocks.removeAllBlocks();
	},
	display: function(geometry) {
		//this.content.css("background-color","Red");
	},
	/**
	 * Adds a new block inside the inner JBlocks.
	 */
	addNewBlock: function(){
		this.selfJBlocks.addNewBlock.apply(this.selfJBlocks,arguments);
		return this;
	}
});
