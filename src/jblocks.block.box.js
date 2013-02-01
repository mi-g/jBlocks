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
 * <p>A Box block holds a header with title and menu. The class must be overloaded to add content.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Box
 * @class Define a Box block to be displayed into a JBlocks.
 * @augments JBlock
 */
$.jBlocks("defineBlockClass","Box","JBlock",{
	/**
	 * Initializes a Box block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Box#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link JBlock#init}:
	 * @param {Array} [options.title] the title to appear in the Box header.
	 * @param {Boolean} [options.haveClose=false] have an icon to close the block.
	 * @param {Boolean} [options.haveFullscreen=false] have a Fullscreen entry in the menu.
	 * @param {Boolean} [options.haveSearch=false] have a icon to search.
	 * @param {Boolean} [options.haveLogo=false] have an illustration icon
	 * @param {Array} [options.menuItems] additional menu items.
	 * @param {Function} [options.onSearchClick] additional function to be called when the search icon is clicked.
	 * @param {String} [options.closeIconClass="jblocks-icon-close"] class to be used for Close icon.
	 * @param {String} [options.shrinkIconClass="jblocks-icon-shrink"] class to be used for Shrink icon.
	 * @param {String} [options.growIconClass="jblocks-icon-grow"] class to be used for Grow icon.
	 * @param {String} [options.searchIconClass="jblocks-icon-search"] class to be used for Search icon.
	 * @param {String} [options.iconsBaseClass="jblocks-block-icon"] base class to be used for icons.
	 * @param {String} [options.logoIconClass="jblocks-block-icon-logo"] base class to be used for icons.
	 * @param {String} [options.focusOnTitleClick=true] focus block if title is clicked
	 */
	init: function() {
		this._super.apply(this,arguments);
		this.options=$.extend({
			title: "",
			focusOnTitleClick: true,
			haveClose: false,
			haveSearch: false,
			haveMaximize: true,
			haveFullscreen: false,
			haveLogo: false,
			logoIconClass: "jblocks-block-icon-logo",
			closeIconClass:"jblocks-icon-close",
			shrinkIconClass:"jblocks-icon-shrink",
			growIconClass:"jblocks-icon-grow",
			searchIconClass:"jblocks-icon-search",
			iconsBaseClass:"jblocks-block-icon",
			menuItems: [],
			onSearchClick: function() {},
		},this.options);
	},
	onCreate: function() {
		var $this=this;
		this._super();
		var _onResize=this.selfJBlocks.options.onResize;
		this.selfJBlocks.options.onResize=function() {
			_onResize.apply(this,arguments);
			if($this.options.layouts) {
				if($this.canGrow())
					$this.growIcon.layout.visible=true;
				else
					$this.growIcon.layout.visible=false;
				if($this.canShrink())
					$this.shrinkIcon.layout.visible=true;
				else
					$this.shrinkIcon.layout.visible=false;
			}
		}
		var menuItems=[];
		if(this.options.haveFullscreen)
			menuItems.push({
            	label: this.t("fullscreen"),
            	onClick: function() {
            		this.layout.visible=false;
            		$this.fullscreen($this.selfJBlocks.anchor,function(entering) {
            			if(entering)
            				$this.maximize();
            			else
            				$this.unMaximize();
        				$(window).trigger('resize');
            		});
            	},
            	shouldDisplay: function() {
            		return $this.canFullscreen();
            	},
			});
		for(var i in this.options.menuItems)
			menuItems.push(this.options.menuItems[i]);
		
		if(this.options.haveLogo){
			this.selfJBlocks.addNewBlock("Icon",{
					priority:1100,
					pref:"top left",
				},{
					iconClass: this.options.iconsBaseClass,
					blockContentClass: this.options.logoIconClass,
				});
		}
		if(menuItems.length>0) 
			this.selfJBlocks.addNewBlock("MenuIcon",{
					priority:1003,
					pref:"top left",
					h: 1,
					w: 1,
					expandHeight: 0,
				},{
					onClick: function(){alert("Open menu");},
					menuItems: menuItems,
				});
		if(this.options.haveClose){
			this.selfJBlocks.addNewBlock("Icon",{
					priority:1002,
					pref:"top left",
				},{
					iconClass: this.options.iconsBaseClass,
					blockContentClass: this.options.closeIconClass,
					onClick: function() {
						$this.unMaximize();
						$this.jBlocks.removeBlock($this.id);
					},
					tooltip: this.t('close'),
				});
		}
		if(this.options.haveSearch)
			this.selfJBlocks.addNewBlock("Icon",{
					priority:1001,
					pref:"top right",
				},{
					iconClass: this.options.iconsBaseClass,
					blockContentClass: this.options.searchIconClass,
					onClick: function() {
						$this.options.onSearchClick.apply($this);
					},
					tooltip: this.t('search'),
				});
		if(this.options.layouts) {
			this.growIcon=this.selfJBlocks.addNewBlock("Icon",{
				priority:1001,
				pref:"top right",
			},{
				iconClass: this.options.iconsBaseClass,
				blockContentClass: this.options.growIconClass,
				onClick: function() {
					$this.grow();
				},
				tooltip: this.t('grow'),
			});
			this.shrinkIcon=this.selfJBlocks.addNewBlock("Icon",{
				priority:1001,
				pref:"top right",
			},{
				iconClass: this.options.iconsBaseClass,
				blockContentClass: this.options.shrinkIconClass,
				onClick: function() {
					$this.shrink();
				},
				tooltip: this.t('shrink'),
			});
		}
        var txt=this.selfJBlocks.addNewBlock("Text",{
    			h: 1,
    			w: 2,
    			priority: 1000,
    			expandWidth: 10,
    			expandHeight: 0,
        	},{
        		containerTag: "h1",
        		text: this.options.title,
        	});
        if (this.options.focusOnTitleClick){
        	txt.content.bind($.jBlocks("click"),function(){
        		$this.focus();
        		$this.jBlocks.checkLayout();
        	});
        	txt.content.css({"cursor":"pointer"});
        }else{
           	txt.content.css({"cursor":"default"});
        }
	},
	/**
	 * This method is to be used when the Box block is intended to have a single block as content. A new block is created, eventually replacing a former content block.
	 * @name Box#setContent
	 * @function
	 * @param {String} className the name of the class for the content block.
	 * @param {Object} [options] options for the new block. The options parameters depends on the actual block class.
	 * @returns the newly created block.
	 */
	setContent: function(className,options) {
		if(arguments.length<2)
			options={};
		for(var bi in this.selfJBlocks.blocks) {
			var block=this.selfJBlocks.blocks[bi];
			if(block._isBoxContent)
				this.selfJBlocks.removeBlock(block.id);
		}
        var newBlock=this.selfJBlocks.addNewBlock(className,{
    		w: 1,
    		h: 2,
    		pref: "right bottom",
    		priority: 999,
    		expandWidth: 2,
    		expandHeight: 2,
        },$.extend(options,{
        	boxBlock: this,
        }));
        newBlock._isBoxContent=true;
        return newBlock;
	},
});

