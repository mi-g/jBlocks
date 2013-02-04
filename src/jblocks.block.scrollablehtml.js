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
 * <p>A ScrollableHtml block displays arbitrary HTML and allow scrolling vertically in it.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name ScrollableHtml
 * @class Define a ScrollableHtml block to be displayed into a JBlocks.
 * @augments Icon
 */
$.jBlocks("defineBlockClass","ScrollableHtml","Block",{
	/**
	 * Initializes a ScrollableHtml block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name ScrollableHtml#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link Block#init}:
	 * @param {String} [options.htmlContent=""] the initial HTML code to be inserted.
	 * @param {Boolean} [options.verticalAlign=false] align content vertically if possible.
	 * @param {Integer} [options.scrollAnimation=0] the duration of the scroll animation in milliseconds.
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			htmlContent: "",
			scrollAnimation: 0,
			verticalAlign: false,
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		
		this.scrollView=$("<div/>").css({
		}).appendTo(this.content).html(this.options.htmlContent);
;
		this.content.css({
			"-webkit-overflow-scrolling": "touch",
			"overflow-y": "auto",
			"overflow-x": "hidden",
		});
		this.content.bind("mousewheel DOMMouseScroll",function(event) {
			if($this.content.height()<$this.scrollView.height())
				event.stopPropagation();
		});
	},
	/**
	 * Update scroller state.
	 * @name ScrollableHtml#checkState
	 * @function
	 */
	checkState: function() {
		this.display();
	},
	display: function(geometry) {
		this.scrollView.css("padding-top",0);
		if(this.options.verticalAlign && this.scrollView.height()<this.content.height())
			this.scrollView.css("padding-top",(this.content.height()-this.scrollView.height())/2);
	},
	/**
	 * Returns the HTML container so content can be modified directly.
	 * @name ScrollableHtml#getHtmlContainer
	 * @function
	 * @type jQuerySet
	 * @returns the HTML container
	 */
	getHtmlContainer:function() {
		return this.scrollView;
	},
	/**
	 * Scroll to the bottom of the HTML content.
	 * @name ScrollableHtml#scrollBottom
	 * @function
	 */
	scrollBottom:function() {
		this.content.scrollTop(this.scrollView.height()-this.content.height());
	},
	/**
	 * Scroll to the top of the HTML content.
	 * @name ScrollableHtml#scrollTop
	 * @function
	 */
	scrollTop:function() {
		this.content.scrollTop(0);
	},
	/**
	 * Scroll to make specified height visible.
	 * @name ScrollableHtml#makeVisible
	 * @function
	 */
	makeVisible:function(top,height) {
		if(this.content.scrollTop()>top || this.content.scrollTop()+this.content.height()>top+height) 
			this.content.scrollTop(Math.max(0,Math.min(top,this.scrollView.height()-height)));
	},
});