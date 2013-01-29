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
 * <p>An IFrame block displays an HTML iframe as part of the block content.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name IFrame
 * @class Define an IFrame block to be displayed into a JBlocks.
 * @augments Icon
 */
$.jBlocks("defineBlockClass","IFrame","Block",{
	/**
	 * Initializes an IFrame block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name IFrame#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {Array} [options.src] the source URL for the iframe.
	 * @param {Object} [options.data] optional data that can be passed to opened page if it is supporting jBlocks. See {@link JBlocks.getFrameData}
	 * for how to get the passed data.
	 * @param {Boolean} [options.syncViewportSize=false] if set to true and the opened URL is a jBlocks-managed page, this jBlocks viewport size will
	 * match the block size.
	 * 
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			src: "about:blank",
			data: null,
			syncViewportSize: false,
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		this.frame=$("<iframe/>")
			.attr("frameborder","0")
			.attr("scrolling","no")
			.attr("marginwidth","0")
			.attr("marginheight","0")
			.attr("allowTransparency",true)
			.attr("webkitallowfullscreen",true)
			.attr("mozallowfullscreen",true)
			.attr("allowfullscreen",true)
			.css({
				"background-color": "transparent",
			});
		if(this.options.syncViewportSize) {
			if(!this.options.data)
				this.options.data={}
			$.extend(this.options.data,{
				onResize: function(geometry,viewport) {
					if(!$this.jBlocks.canFullscreen() || !document[$this.jBlocks.fullscreenMethods.element]) {
						viewport.w=$this.actualLayout.w;
						viewport.h=$this.actualLayout.h;
					} else
						this.options.defaultOnResize.call(this,geometry,viewport);
				}				
			});
		}
		if(this.options.data) {
			if(typeof $.jBlocks.frameData=="undefined")
				$.jBlocks.frameData={
					index: 0,
					data: this.options.data,
				}
			var frameData=$.jBlocks.frameData;
			var index=frameData.index++;
			frameData.data[index]=this.options.data;	
			this.frame.attr("name","jblocks-data-"+index);
		}
		this.frame.appendTo(this.content);
	},
	display: function(geometry) {
		this.frame.attr("width",geometry.width).attr("height",geometry.height);
		if(geometry.width>0 && geometry.height>0 && this.frame.attr("src")===undefined)
			this.frame.attr("src",this.options.src);
	}
});

