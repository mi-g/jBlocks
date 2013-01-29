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
 * <p>A Log block displays the jBlocks block. It is mainly used for debugging.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Log
 * @class Define a Log block to be displayed into a JBlocks.
 * @augments ScrollableHtml
 */
$.jBlocks("defineBlockClass","Log","ScrollableHtml",{
	/**
	 * Initializes a Log block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Log#init
	 * @function
	 * @param {Object} [layout] see {@link ScrollableHtml#init}
	 * @param {Object} [options] in addition to base class options {@link ScrollableHtml#init}:
	 * @param {Number} [options.refreshPeriod=500] the number of millisecond to check and refresh the scrollbar. 
	 * @param {Number} [options.maxEntries=100] the maximum number of lines in the log. 
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options.padding=[0.15,0.15,0.15,0.15];
		this.nbEntries=0;
		this.options=$.extend({
			refreshPeriod: 500,
			maxEntries: 100,
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		this._super.call(this);
		this.getHtmlContainer().addClass("jblocks-log").css({
			"background-color": "White",
			"border": "2px inset #808080",
			"padding": 5,
		});
		this.updateTimer=setInterval(function() {
			$this.updateLog();
		},this.options.refreshPeriod);
	},
	onRemove: function() {
		if(this.updateTimer)
			clearInterval(this.updateTimer);
	},
	updateLog: function() {
		var nbEntries=this.getHtmlContainer().children().length;
		if(nbEntries!=this.nbEntries) {
			var excess=nbEntries-this.options.maxEntries;
			if(excess>0)
				this.getHtmlContainer().children().slice(0,excess).remove();
			this.checkState();
			this.scrollBottom();
			this.nbEntries=this.getHtmlContainer().children().length;
		}
	},
	display: function() {
		this._super();
		this.scrollBottom();
	},
	/**
	 * Clears the log.
	 * @name Log#clearLog
	 * @function
	 */
	clearLog: function() {
		this.getHtmlContainer().empty();
		this.checkState();
	},
});

/**
 * <p>A LogBox block wraps a Log block into a box, so it can be maximized or closed. It is mainly used for debugging.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name LogBox
 * @class Define a LogBox block to be displayed into a JBlocks.
 * @augments Box
 * @see Log
 */
$.jBlocks("defineBlockClass","LogBox","Box",{
	/**
	 * Initializes a LogBox block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name LogBox#init
	 * @function
	 * @param {Object} [layout] see {@link Box#init}
	 * @param {Object} [options] see {@link Box#init}
	 */
	init: function() {
		var $this=this;
		this._super.apply(this,arguments);
		this.options.title=this.t("Log");
		this.options.jBlocksBlockClass="jblocks-block-brown";
		this.options.haveClose=true;
		this.options.menuItems.push({
			label: "Clear",
			onClick: function() {
				this.layout.visible=false;
				$this.clearLog();
			},
		});
	},
	onCreate: function() {
		this._super();
        this.logPanel=this.setContent("Log");
	},
	/**
	 * Clears the log.
	 * @name LogBox#clearLog
	 * @function
	 */
	clearLog: function() {
		this.logPanel.clearLog();
	},
});


