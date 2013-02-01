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
 * <p>An Select block allows the selection of a value amongst a finite set of options. The block has two states: it is initally closed, showing only
 * the selected value in a 1 unit high blocks. Once clicked, it displays a regular list.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Select
 * @class Define a Select block to be displayed into a JBlocks.
 * @augments List
 */
$.jBlocks("defineBlockClass","Select","List",{
	/**
	 * Initializes a Select block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Select#init
	 * @function
	 * @param {Object} [layout] see {@link List#init}.
	 * @param {Object} [options] in addition to base class options {@link List#init}:
	 * @param {Boolean} [options.opened=false] the initial state.
	 * @param {String} [options.selected=null] the initial selected value.
	 * @param {String} [options.selWidgetClass] the class to be used for the closed state widget.
	 * @param {Function} [options.onChange] a function(value) being called when the selected value changes.
	 */
	init: function() {
		var $this=this;
		this._super.apply(this,arguments);
		this.options=$.extend({
			opened: false,
			selected: null,
			selWidgetClass: "jblocks-block-grey",
			onChange: function() {},
		},this.options);
		this.superCreateItem=this.options.createItem;
		this.options.createItem=function(item,li) {
			var key=$this.superCreateItem.call(this,item,li);
			li.bind($.jBlocks("click"),function() {
				$this.val(key);
				$this.list.layout.visible=false;
				$this.selWidget.layout.visible=true;
				$this.selfJBlocks.checkLayout();
				$this.options.opened=false;
				$this.jBlocks.checkLayout();
			});
			return key;
		}
		this.superH=this.options.h;
		this.superLayoutH=this.layout.h;
		this.options.h=function(vp) {
			if(!$this.options.opened)
				return 1;
			else if($this.superH)
				return $this.superH.call($this,vp);
			else
				return this.superLayoutH;
		}
	},
	updateSelected: function() {
		var selText="";
		this.ul.find("li").removeClass("jblocks-selected");
		if(this.options.selected!=null && this.items[this.options.selected]) {
			selText=this.items[this.options.selected].li.text();
			this.items[this.options.selected].li.addClass("jblocks-selected");
		}
		this.selWidget.textVal(selText);
	},
	addItem: function(item) {
		this._super(item);
		if(item.value==this.options.selected)
			this.updateSelected();
	},
	onCreate: function() {
		var $this=this;
		this._super.apply(this,arguments);
		this.selWidget=this.selfJBlocks.addNewBlock("Link",{
			h: 1,
			w: $this.layout.w,
			expandHeight: 0,
		},{
			text: "",
			epadding: [0,1,0,0],
			onClick: function() {
				$this.list.layout.visible=true;
				$this.selWidget.layout.visible=false;
				$this.selfJBlocks.checkLayout();
				$this.options.opened=true;
				$this.jBlocks.checkLayout();
			},
		});
		this.selWidget.content.addClass("jblocks-select");
		this.selWidget.anchor.addClass(this.options.selWidgetClass);
		if(this.options.opened) {
			this.list.layout.visible=true;
			this.selWidget.layout.visible=false;
		} else {
			this.list.layout.visible=false;
			this.selWidget.layout.visible=true;			
		}
		this.updateSelected();
	},
	/**
	 * Get or set the selection.
	 * @name Select#val
	 * @function
	 * @param {String} [text] if an argument is used, the current selection is replaced.
	 * @returns the currently selected key.
	 */
	val: function() {
		if(arguments.length>0) {
			var selected=arguments[0];
			if(selected!=this.options.selected) {
				this.options.selected=selected;
				this.updateSelected();
				this.options.onChange.call(this,selected);
			}
		}
		return this.options.selected;
	},
});

