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
 * <p>An Image block displays an image.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Image
 * @class Define a Image block to be displayed into a JBlocks.
 * @augments Block
 */
$.jBlocks("defineBlockClass","Image","Block",{
	/**
	 * Initializes an Image block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Image#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {String} [options.src] the URL of the image to be displayed.
	 * @param {String} [options.stretch="keep-ratio"] describes the way the image is resized according to the block size:<ul>
	 * <li><i>full-extend</i>: the image size is set to match the block one, regardless of the ratio.</li>
	 * <li><i>keep-ratio</i>: the image is set to maximum size fitting inside the block, while keeping its ratio.</li>
	 * <li><i>no-oversampling</i>: like <i>keep-ratio</i> but the image is not stretched over its original size.</li></ul> 
	 * @param {String} [options.onClick] a function to be called when the image is clicked.
	 */
	init: function(block,data) {
		this._super.apply(this,arguments);
		this.options=$.extend({
			onClick: null,
			stretch: "keep-ratio",
		},this.options);
		this.imageLoaded=false;
		this.img=null;
		this.image=new Image();
	},
	onCreate: function() {
		var $this=this;
		this._super.apply(this,arguments);
		if(this.options.onClick) {
			this.content.addClass("jblocks-clickable");
			this.content.bind("click",function() {
				$this.options.onClick.call($this);
			});
		}
		this.img=$("<img/>").appendTo(this.content);
		this.image.onload=function() {
			$this.imageLoaded=true;
			$this.img.attr("src",$this.image.src);
			$this.updateImage();
		}
		this.image.src=this.options.src;
	},
	updateImage: function() {
		if(!this.imageLoaded || this.content.width()<=0 || this.content.height()<=0)
			return;
		var width, height, marginTop=0, marginLeft=0;
		if(this.options.stretch=="full-extend") {
			width=this.content.width();
			height=this.content.height();
		} else if(this.options.stretch=="no-oversampling" && this.image.width<this.content.width() && this.image.height<this.content.height()) {
			width=this.image.width;
			height=this.image.height;
			marginTop=(this.content.height()-this.image.height)/2;
			marginLeft=(this.content.width()-this.image.width)/2;
		} else {
			var ratio=this.image.width/this.image.height;
			var contentRatio=this.content.width()/this.content.height();
			if(ratio<contentRatio) {
				width=this.content.height()*ratio;
				height=this.content.height();
				marginTop=0;
				marginLeft=(this.content.width()-width)/2;
			} else {
				width=this.content.width();
				height=this.content.width()/ratio;
				marginLeft=0;
				marginTop=(this.content.height()-height)/2;
			}
		}
		this.img.css({
			width: width,
			height: height,
			"margin-left": marginLeft,
			"margin-top": marginTop,
		});
	},
	display: function(geometry) {
		this.updateImage();
	},
});

