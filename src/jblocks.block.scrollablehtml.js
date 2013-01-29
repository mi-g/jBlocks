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
		
		var container=this.content;
		// scrolling control 
		this.scrollCtrl=$("<div/>").addClass("jb-scroll-list").appendTo(this.content);
		var scrollbarDiv=$("<div/>").addClass("scrollbar").appendTo(this.scrollCtrl);
		var track=$("<div/>").addClass("track").appendTo(scrollbarDiv);
		var tracktop=$("<div/>").addClass("tracktop").appendTo(track);
		var th=$("<div/>").addClass("thumb").appendTo(track);
		var top=$("<div/>").addClass("top").appendTo(th);
		var bottom=$("<div/>").addClass("bottom").appendTo(th);
		var viewport=$("<div/>").addClass("viewport").appendTo(this.scrollCtrl);
		this.scrollViewport=$("<div/>").addClass("overview").appendTo(viewport);
		container=this.scrollViewport;
		this.content.bind("mousewheel DOMMouseScroll",function(event) {
			var listCtrl=$this.scrollCtrl;
			var desabled=scrollbarDiv.hasClass("disable");
			if(desabled)
				return;
			var delta = event.detail < 0 || event.wheelDelta > 0 ? 1 : -1;
			var thumb = th;
			var thumbPos=thumb.position();
			if(delta>0 && thumbPos.top==0)
				return;
			if(delta<0 && thumbPos.top+thumb.height()>=track.height())
				return;
			event.stopPropagation();
		});
		container.html(this.options.htmlContent);
		
		this.scrollCtrl.tinyscrollbar({
			animation: this.options.scrollAnimation,
		}).bind("updatelayout",function(e){$this.checkState();});
	},
	/**
	 * Update scroller state.
	 * @name ScrollableHtml#checkState
	 * @function
	 */
	checkState: function() {
		var height=this.content.height()-(this.scrollViewport.outerHeight(true)-this.scrollViewport.height());
		this.scrollViewport.css("min-height",0);
		this.viewportHeight=this.scrollViewport.height();
		this.scrollViewport.css("min-height",height);
		if (this.scrollCtrl.position()){
			var h=this.scrollCtrl.parent().outerHeight()-this.scrollCtrl.position().top;
			var viewport=this.scrollCtrl.children(".viewport");

			//var desabledBefore=this.scrollCtrl.children(".scrollbar").hasClass("disable");
			
			viewport.css({height:h});
			try {
				this.scrollCtrl.css({height:h});
				this.scrollCtrl.tinyscrollbar_update();
			} catch(e) {
				this.log("error updating tinyscrollbar "+this.jBlocks.jBlocksIndex);
			}
						
			var geomwidth=this.scrollCtrl.parent().outerWidth();
			var desabled=this.scrollCtrl.children(".scrollbar").hasClass("disable");
			var lvWidth=desabled?geomwidth:geomwidth-15;
			this.scrollCtrl.css({width:geomwidth});
			viewport.css({width:lvWidth});
			this.scrollViewport.css({width:lvWidth});
			
			this.scrollCtrl.tinyscrollbar_update();
		}
	},
	display: function(geometry) {
		this.scrollViewport.css("padding-top",0);
		this.checkState();
		var spareHeight=this.scrollCtrl.height()-this.viewportHeight;
		if(this.options.verticalAlign && spareHeight>0)
			this.scrollViewport.css("padding-top",spareHeight/2);
	},
	/**
	 * Returns the HTML container so content can be modified directly.
	 * @name ScrollableHtml#getHtmlContainer
	 * @function
	 * @type jQuerySet
	 * @returns the HTML container
	 */
	getHtmlContainer:function() {
		return this.scrollViewport;
	},
	/**
	 * Scroll to the bottom of the HTML content.
	 * @name ScrollableHtml#scrollBottom
	 * @function
	 */
	scrollBottom:function() {
		this.scrollCtrl.tinyscrollbar_update('bottom');
	},
	/**
	 * Scroll to the top of the HTML content.
	 * @name ScrollableHtml#scrollTop
	 * @function
	 */
	scrollTop:function() {
		this.scrollCtrl.tinyscrollbar_update(0);
	},
	/**
	 * Scroll to make specified height visible.
	 * @name ScrollableHtml#makeVisible
	 * @function
	 */
	makeVisible:function(top,height) {
		var viewport=this.scrollCtrl.children(".viewport");
		var overview=viewport.children(".overview");
		var overviewTop=-overview.position().top;
		if(top<overviewTop || top+height>overviewTop+viewport.height()) {
			var top0=top-(viewport.height()-height)/2;
			top0=Math.max(0,top0);
			top0=Math.min(overview.height()-viewport.height(),top0);
			this.scrollCtrl.tinyscrollbar_update(top0);
		}
	},
});