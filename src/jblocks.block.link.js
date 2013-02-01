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
 * <p>A Link block displays a clickable text.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Link
 * @class Define a Link block to be displayed into a JBlocks.
 * @augments Text
 */
$.jBlocks("defineBlockClass","Link","Text",{
	/**
	 * Initializes an Input block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Link#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Text#init}:
	 * @param {Function} [options.onClick] a function to be called when the block is clicked.
	 * @param {Object} [options.attributes] an object representing the attributes (keys and values) to be assigned to the clickable text element.
	 * @param {String} [options.iconUrl] the optional icon to be displayed in the link.
	 * @param {String} [options.iconPosition] the <i>left</i> or <i>right</i> position for the icon.
	 * @param {String} [options.noIconOverlay="true"] if set, the link text won't overlay the icon. 
	 * @param {String} [options.textAlign="center"] the text in the button is aligned to the given <i>center</i>, <i>left</i> or <i>right</i> value.
	 * @param {Integer} [options.minTextW=1] if the block virtual width is below this value, the text is not displayed.
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			onClick: function() {},
			attributes: {},
			iconUrl: null,
			iconPosition: "left",
			minTextW: 1,
			noIconOverlay: true,
			backgroundClass: "jblocks-block-green-link",
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		this._super();
		this.content.addClass("jblocks-block-link");
		this.content.addClass(this.options.backgroundClass);
		for(var attr in this.options.attributes)
			this.text.attr(attr,this.options.attributes[attr]);
		this.content.bind($.jBlocks("click"),function() {
			$this.options.onClick.call($this);
		});
		if(this.options.iconUrl) {
			this.iconImage=$("<div/>").css({
				"background-image":"url("+this.options.iconUrl+")",
				"background-position": "center center",
				"background-repeat": "no-repeat",
				"background-size": "contain",				
				position: "absolute",
				padding: 0,
				margin: 0,
				top: 0,
			}).appendTo(this.content);
			if(this.options.iconPosition=="left") {
				this.iconImage.css({
					left: 0,
				});
			} else {
				this.iconImage.css({
					right: 0,
				});
			}
			if(this.options.noIconOverlay) {
				if(this.options.iconPosition=="left") {
					this.options.epadding[3]=1;
				} else {
					this.options.epadding[1]=1;
				}
			}
			this.content.css("text-align",this.options.textAlign);
		}
		this.element.hide();
	},
	display: function() {
		if(this.actualLayout.w<this.options.minTextW)
			this.textVal("");
		else
			this.textVal(this.options.text);
		this.element.show();
		this._super.apply(this,arguments);
		if(this.iconImage) {
			this.iconImage.css({
				width: (this.content.width()/this.actualLayout.w)*this.actualLayout.h,
				height: this.content.height(),
			});
		}
	},
});

