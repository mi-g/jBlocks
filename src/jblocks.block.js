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
 * <p>A Block represents a rectangular area inside a JBlocks viewport. The exact position of the Block depends on the result of the layout calculation
 * performed by the library based on the created Block objects inside the JBlocks.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name Block
 * @class Define a block to be displayed into a JBlocks.
 */
$.jBlocks("defineBlockClass","Block","Class",{
	/**
	 * Initializes a block.
	 * The method is invoked by the jBlocks core and must never be called directly. 
	 *
	 * @name Block#init
	 * @function
	 * @param {Object} [layout] Object defining the layout preferences for the Block.
	 * @param {Number} [layout.priority=0] When performing a layout, the actual Block objects positions are calculated starting with highest priority. 
	 * @param {Number} [layout.importance=0] If the JBlocks has option <i>fixed</i> set to <i>both</i> and there is no space enough to display all the Blocks,
	 * the <i>importance</i> parameter is used to determine which blocks will be hidden. 
	 * @param {Integer} [layout.w=1] the minimum virtual width required for this block.
	 * @param {Integer} [layout.h=1] the minimum virtual height required for this block.
	 * @param {String} [layout.pref="default"] the preference for positioning the block:<ul>
	 * <li><i>default</i>: if JBlocks <i>fixed</i> option is set to <i>height</i>, the <i>pref</i> field behaves as if it was "left top" otherwise as "top left".</li>
	 * <li><i>top left</i>: displays the block as top as possible then as left as possible.</li>
	 * <li><i>left top</i>: displays the block as left as possible then as top as possible.</li>
	 * <li><i>top right</i>: displays the block as top as possible then as right as possible in the viewable viewport area.</li>
	 * <li><i>right top</i>: displays the block as right as possible in the viewable area then as top as possible.</li>
	 * <li><i>bottom left</i>: displays the block as bottom as possible in the viewable area then as left as possible.</li>
	 * <li><i>left bottom</i>: displays the block as left as possible then as bottom as possible in the viewable area.</li>
	 * <li><i>bottom right</i>: displays the block as bottom as possible then as right as possible, in the viewable viewport area.</li>
	 * <li><i>right bottom</i>: displays the block as right as possible then as bottom as possible, in the viewable area.</li>
	 * </ul>
	 * @param {Boolean} [layout.visible=true] should this block be visible.
	 * @param {Number} [layout.expandWidth=1] if set to 0, the block will never expand and will keep the width given by the <i>w</i> parameter. Otherwise,
	 * if JBlock option <i>fillHoles</i> is set to true, the layout algorithm tries to expand the neighbor blocks to fill the holes. Blocks with highest 
	 * <i>expandWidth</i> are expanded in priority.
	 * @param {Number} [layout.expandHeight=1] if set to 0, the block will never expand and will keep the height given by the <i>h</i> parameter. Otherwise,
	 * if JBlock option <i>fillHoles</i> is set to true, the layout algorithm tries to expand the neighbor blocks to fill the holes. Blocks with highest 
	 * <i>expandHeight</i> are expanded in priority.
	 * 
	 * @param {Object} [options] Object defining the options for the Block.
	 * @param {String} [options.id] a string to be used as block id. Only letters, digits and dash characters are to be used. If not set, a safe value is automatically used. 
	 * @param {String} [options.blockClass=null] an additional class to be added to the block. For instance, the block may define a border.
	 * @param {String} [options.blockContentClass=null] an additional class to be added to the block content area. For instance, the block may define a background-color.
	 * @param {NumberArray} [options.margin] the margins [top,right,bottom,left] expressed relatively to the block size. If not set, the containing JBlocks margin applies.
	 * @param {NumberArray} [options.padding] the paddings [top,right,bottom,left] expressed relatively to the block size. If not set, the containing JBlocks margin applies.
	 * @param {Number} [options.borderRadius=0.1] the block border radius expressed relatively to the block size.
	 * @param {Number} [options.contentBorderRadius=0.1] the block content border radius expressed relatively to the block content size.
	 * @param {Boolean} [options.requireAuth=false] if set to true, the becomes visible only when the user is logged in.
	 * @param {Boolean} [options.requireAnon=false] if set to true, the becomes visible only when the user is logged out.
	 * @param {Number} [options.resizeAnimateDelay=400] the number of milliseconds to animate the block resizing.
	 * @param {Function} [options.onCreate] function called when the block is created.
	 * @param {Function} [options.onRemove] function called when the block is removed.
	 * @param {Function} [options.onResize] function(geometry) called when the block has resized.
	 * @param {Function} [options.onStartResize] function(geometry) called when the block starts resizing. Parameter <i>geometry</i> represents the final size.
	 * @param {Function} [options.w] function(viewport) called before a relayout so the block can returns its virtual width overloading the provided <i>layout.w</i>.
	 * @param {Function} [options.h] function(viewport) called before a relayout so the block can returns its virtual height overloading the provided <i>layout.h</i>.
	 * @param {Array} [options.layouts] an array containing the various layouts a block can have. The Block API provides methods to navigate amongst the 
	 * defined layouts, allowing blocks to grow or shrink. 
	 * Each layout entry contains:<ul>
	 * <li><i>w</i>: an integer or a function(viewport) returning the block width.</li>
	 * <li><i>h</i>: an integer or a function(viewport) returning the block height.</li>
	 * </ul>
	 * @param {Integer} [options.layoutIndex] the initial index within the <i>layouts</i> array.
	 * @param {String} [options.tooltip] if set, the given string appears as a tooltip when the mouse is over the block.
	 * @param {Boolean} [options.earlyLayout=true] during a single layout process, a block may be asked to resize several times. If resizing is expensive,
	 * the <i>earlyLayout</i> option can be set to <i>false</i> so the block is resized only once at the end of the layout operation.
	 * @param {Float} [options.shadow] defines a shadow for the block (i.e. 0.15). If unset, the JBlocks <i>blockShadow</i> option applies. 
	 * 
	 */
	init: function(layout,options) {
		var $this=this;
		if(arguments.length<2)
			options={};
		if(arguments.length<1)
			layout={};
		if(!options.id)
			this.id="anon-"+$.jBlocks("getBlockAnonIndex");
		else
			this.id=options.id;
		this.layout={
			priority: 0,
			importance: 0,
			w: 1,
			h: 1,
			pref: "default",
			visible: true,
			expandWidth: 1,
			expandHeight: 1,
		}
		this.actualLayout={ w:1, h: 1 };
		$.extend(this.layout,layout);
		this.maximized=false;
		/**
		 * The JBlocks object managing the block.
		 * @name Block#jBlocks
		 * @field
		 */
		this.jBlocks=null;
		/**
		 * The name of the class for this block object.
		 * @name Block#className
		 * @field
		 */
		this.className="Block";
		this.options={
			blockClass: null,
			blockContentClass: null,
			margin: null,
			padding: null,
			borderRadius: 0.07,
			contentBorderRadius: 0.0,
			capture: false,
			maximizable: true,
			requireAuth: false,
			requireAnon: false,
			autoFit: false,
			resizeAnimateDelay: 400,
			debugBlockLayout: false,
			onCreate: function(){},
			onRemove: function(){},
			onResize: function(){},
			onStartResize: function(){},
			tooltip: null,
			earlyLayout: true,
		}
		this.tags={};
		$.extend(this.options,options);
		if(this.options.requireAuth && $.jBlocks.loggedIn==null)
			this.layout.visible=false;
		if(this.options.requireAnon && $.jBlocks.loggedIn!=null)
			this.layout.visible=false;
	},
	create: function(anchor) {
		//JocLog("create",this);

		if(this.options.layouts) {
			if(typeof this.options.layoutIndex=="undefined")
				this.options.layoutIndex=Math.floor((this.options.layouts.length-1)/2);
			this.options.w=function(viewport) {
				var layout=$this.options.layouts[$this.options.layoutIndex];
				switch(typeof layout.w) {
				case 'number':
					return layout.w;
				case 'function':
					return layout.w.call($this,viewport);
				default: 
					return $this.layout.w;
				}
			}
			this.options.h=function(viewport) {
				var layout=$this.options.layouts[$this.options.layoutIndex];
				switch(typeof layout.h) {
				case 'number':
					return layout.h;
				case 'function':
					return layout.h.call($this,viewport);
				default: 
					return $this.layout.h;
				}
			}
		}

		var $this=this;
		var blockClass=this.options.blockClass || this.jBlocks.options.blockClass;
		this.anchor=$("<div/>").appendTo(anchor.children(".jblocks-frame").children(".jblocks-frame-content"));
		this.anchor.addClass("jblocks-block")
			.addClass("jblocks-"+this.jBlocks.jBlocksIndex)
			.attr("id","jblocks-block-"+this.jBlocks.jBlocksIndex+"-"+this.id)
			.css({
				top: $("body").height()/2,
				left: $("body").width()/2,
				width: 1,
				height: 1,
			});
		if(blockClass)
			this.anchor.addClass(blockClass);
		if(this.options.debugBlockLayout || this.jBlocks.options.debugBlockLayout)
			this.anchor.bind("mouseover",function(event) {
				$("head title").text($this.className+" "+JSON.stringify($this.layout));
				event.stopPropagation();
			});

		this.captMask=$("<div/>").addClass("jblocks-block-mask").appendTo(this.anchor);
		var blockContentClass=this.options.blockContentClass || this.jBlocks.options.blockContentClass;
		this.content=$("<div/>").addClass("jblocks-block-content").appendTo(this.anchor);
		if(blockContentClass)
			this.content.addClass(blockContentClass);
		if(this.options.tooltip)
			this.content.attr("title",this.options.tooltip);
		this.onCreate();
		this.options.onCreate.call(this);
	},
	/**
	 * Called when the block is about to be removed.
	 * @name Block#onRemove
	 * @function
	 */
	onRemove: function() {
		if(this.anchor)
			this.anchor.remove();
		this.options.onRemove();
	},
	/**
	 * Remove the block from its JBlocks context.
	 * @name Block#remove
	 * @function
	 */
	remove: function() {
		this.jBlocks.removeBlock(this.id);
	},
	/**
	 * Returns whether the block uses a set of layouts from <i>options.layouts</i> and can step up to a bigger size.
	 * @name Block#canGrow
	 * @function
	 * @returns whether calling the {@link Block#grow} method will have an effect on the block size. 
	 */
	canGrow: function() {
		return this.options.layouts && this.options.layoutIndex<this.options.layouts.length-1;
	},
	/**
	 * Step up to the higher layout size if a set of layouts from <i>options.layouts</i> has been defined.
	 * @name Block#grow
	 * @function
	 * @see Block#canGrow
	 */
	grow: function() {
		if(this.canGrow()) {
			this.options.layoutIndex++;
			//this.log("layoutIndex",this.options.layoutIndex);
			this.jBlocks.checkLayout();
			this.focus();
		}
	},
	/**
	 * Returns whether the block uses a set of layouts from <i>options.layouts</i> and can step down to a smaller size.
	 * @name Block#canShrink
	 * @function
	 * @returns whether calling the {@link Block#shrink} method will have an effect on the block size. 
	 */
	canShrink: function() {
		return this.options.layouts && this.options.layoutIndex>0; 
	},
	/**
	 * Step down to the smaller layout size if a set of layouts from <i>options.layouts</i> has been defined.
	 * @name Block#shrink
	 * @function
	 * @see Block#canShrink
	 */
	shrink: function() {
		if(this.canShrink()) {
			this.options.layoutIndex--;
			//this.log("layoutIndex",this.options.layoutIndex);
			this.jBlocks.checkLayout();
			this.focus();
		}
	},
	/**
	 * Ensure the specified Block object will be visible after the next layout.
	 * @name Block#focus
	 * @function
	 * @see JBlocks#focusBlockId
	 */
	focus: function() {
		this.jBlocks.focusBlockId(this.id);
	},
	/**
	 * Add tag to the block. Tags are used to find blocks more easily. A block can have several tags.
	 * @name Block#addTag
	 * @function
	 * @param {String} tag the tag to add to the block.
	 */
	addTag: function(tag) {
		this.tags[tag]=true;
	},
	/**
	 * Maximizes the block in the JBlocks viewport.
	 * @name Block#maximize
	 * @function
	 * @param {Boolean} [options.back=true] when set to <i>true</i> a Back block button is created and displayed in order to leave the maximized mode. 
	 */
	maximize: function() {
		var $this=this;
		if(this.maximized || !this.options.maximizable)
			return;
		$.extend(options,options0);
		this.jBlocks.pushLayout();
		this.jBlocks.hideAllBlocks();
		this.layout.visible=true;
		this.layout.w=this.jBlocks.viewport.w;
		this.layout.h=this.jBlocks.viewport.h;
		this.jBlocks.checkLayout();	
		this.maximized=true;
	},
	/**
	 * Unmaximizes the block in the JBlocks viewport.
	 * @name Block#unMaximize
	 * @function
	 */
	unMaximize: function() {
		if(!this.maximized)
			return;
		this.jBlocks.popLayout();
		this.maximized=false;
		this.jBlocks.checkLayout();			
	},
	/**
	 * Called to build the block content. This function is only called once per block. 
	 * The method is invoked by the jBlocks core and must never be called directly. 
	 * @name Block#onCreate
	 * @function
	 */
	onCreate: function() {
	},
	/**
	 * Called just before the block is about to be resized. 
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Block#onStartResize
	 * @function
	 * @param {Object} geometry the new block content geometry.
	 * @param {Number} geometry.width the width of the block content in pixels
	 * @param {Number} geometry.height the height of the block content in pixels
	 */
	onStartResize: function(geometry) {
		this.options.onStartResize.call(this,geometry);
	},
	getContentGeometry: function(geometry,uWidth,uHeight) {
		var sizeRef=Math.min(uWidth,uHeight);
		var margin=this.jBlocks.options.margin;
		if(this.options.margin)
			margin=this.options.margin;
		var padding=this.jBlocks.options.padding;
		if(this.options.padding)
			padding=this.options.padding;
		var spacing={
				"margin-top": sizeRef*margin[0],
				"margin-bottom": sizeRef*margin[2],
				"margin-left": sizeRef*margin[3],
				"margin-right": sizeRef*margin[1],
				"padding-top": sizeRef*padding[0],
				"padding-bottom": sizeRef*padding[2],
				"padding-left": sizeRef*padding[3],
				"padding-right": sizeRef*padding[1],
				"border-left": parseInt(this.anchor.css("border-left-width")),
				"border-right": parseInt(this.anchor.css("border-right-width")),
				"border-top": parseInt(this.anchor.css("border-top-width")),
				"border-bottom": parseInt(this.anchor.css("border-bottom-width")), 
		}
		var contentGeo={
			spacing: spacing,
			sizeRef: sizeRef,
			width: geometry.width
				-(margin[1]+margin[3])*sizeRef
				-(padding[1]+padding[3])*sizeRef
				-spacing["border-left"]
				-spacing["border-right"],
			height: geometry.height
				-(margin[0]+margin[2])*sizeRef
				-(padding[0]+padding[2])*sizeRef
				-spacing["border-right"]
				-spacing["border-bottom"],
		};
		return contentGeo;
	},
	/**
	 * Called just after the block has been resized. 
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Block#onResize
	 * @function
	 * @param {Object} geometry the new block content geometry.
	 * @param {Number} geometry.width the width of the block content in pixels
	 * @param {Number} geometry.height the height of the block content in pixels
	 */
	onResize: function(geometry) {
		var contentGeo=this.getContentGeometry(geometry,this.jBlocks.geometry.uWidth,this.jBlocks.geometry.uHeight);

		//$.jBlocks("log","contentGeo",geometry);
		this.content.width(contentGeo.width);
		this.content.height(contentGeo.height);
		this.content.css("border-radius",
				contentGeo.sizeRef*this.options.contentBorderRadius+"px");
		this.anchor.css({
			"margin-top": contentGeo.spacing["margin-top"]+"px",
			"margin-bottom": contentGeo.spacing["margin-bottom"]+"px",
			"margin-left": contentGeo.spacing["margin-left"]+"px",
			"margin-right": contentGeo.spacing["margin-right"]+"px",
			"padding-top": contentGeo.spacing["padding-top"]+"px",
			"padding-bottom": contentGeo.spacing["padding-bottom"]+"px",
			"padding-left": contentGeo.spacing["padding-left"]+"px",
			"padding-right": contentGeo.spacing["padding-right"]+"px",
		});
		this.anchor.width(contentGeo.width);
		this.anchor.height(contentGeo.height);
		this.anchor.css("border-radius",
				contentGeo.sizeRef*this.options.borderRadius+"px");
		this.captMask.width(this.anchor.outerWidth(false)
				-contentGeo.spacing["border-left"]-contentGeo.spacing["border-right"]);
		this.captMask.height(this.anchor.outerHeight(false)
				-contentGeo.spacing["border-top"]-contentGeo.spacing["border-bottom"]);
		if(this.options.capture)
			this.captMask.show();
		else
			this.captMask.hide();
		this.options.onResize.call(this,contentGeo);
		var blockShadow=this.jBlocks.options.blockShadow;
		if(typeof this.options.shadow!="undefined")
			blockShadow=this.options.shadow;
		if(blockShadow!=0) {
			var shadowW=this.jBlocks.geometry.uWidth*blockShadow;
			var shadowH=this.jBlocks.geometry.uHeight*blockShadow;
			var blur=contentGeo.sizeRef*blockShadow;
			this.anchor.css({
				"-webkit-box-shadow": "-"+shadowW+"px "+shadowH+"px "+(blur*2.5)+"px rgba(43, 45, 50, 0.55)",
				"box-shadow": "-"+shadowW+"px "+shadowH+"px "+(blur*2.5)+"px rgba(43, 45, 50, 0.55)",
			});
		}
		this.display(contentGeo);
		/*
		if(this.options.autoFit)
			this.fit();
		*/
	},
	/**
	 * Called to display the block. 
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Block#display
	 * @function
	 * @param {Object} geometry the block content geometry.
	 * @param {Number} geometry.width the width of the block content in pixels
	 * @param {Number} geometry.height the height of the block content in pixels
	 */
	display: function(geometry) {
	},
	/**
	 * Called when the user logs in. 
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Block#onLoggedIn
	 * @function
	 * @param {Object} user the user description.
	 * @param {String} user.id the user ID.
	 * @param {String} user.name the user name.
	 * @param {String} user.picture the URL to the user avatar.
	 * @param {String} user.mail the user email address.
	 * @param {String} user.country the user country.
	 * @see Block#onLoggedOut
	 */
	onLoggedIn: function(user) {
		if(this.options.requireAuth && this.layout.visible==false) {
			this.layout.visible=true;
			this.jBlocks.checkLayout();
		}
		if(this.options.requireAnon && this.layout.visible==true) {
			this.layout.visible=false;
			this.jBlocks.checkLayout();
		}
		if(this.onLoggedInCallback)
			this.onLoggedInCallback(user);
	},
	/**
	 * Called when the user logs out. 
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name Block#onLoggedOut
	 * @function
	 * @see Block#onLoggedIn
	 */
	onLoggedOut: function(user) {
		if(this.options.requireAuth && this.layout.visible==true) {
			this.layout.visible=false;
			this.jBlocks.checkLayout();
		}
		if(this.options.requireAnon && this.layout.visible==false) {
			this.layout.visible=true;
			this.jBlocks.checkLayout();
		}
		if(this.onLoggedOutCallback)
			this.onLoggedOutCallback();
	},
	/**
	 * Check fullscreen availability. 
	 * @name Block#canFullScreen
	 * @function
	 * @type Boolean
	 * @returns Whether the browser supports fullscreen
	 */
	canFullscreen: function() {
		return this.jBlocks.fullscreenMethods!=null;
	},
	/**
	 * Make fullscreen the block content or part of it. 
	 * @name Block#fullscreen
	 * @function
	 * @param {jQuerySet} [widget] the element to make fullscreen. If omitted, <i>this.content</i> is used.
	 * @param {Function} function(entering) to be called when fullscreen is entered or exited.
	 */
	fullscreen: function(widget,updateFnt) {
		if(arguments.length<1 || !widget)
			widget=this.content;
		if(arguments.length<2 || !updateFnt)
			udateFnt=function(){};
		this.jBlocks.fullscreen(widget,updateFnt);
	},
	/**
	 * Log data.
	 * @name Block#log
	 * @function
	 * @see JBlocks.log
	 * @param {Stringifiable object|String} ... 
	 */
	log: function() {
		$.jBlocks.apply(null,["log"].concat([].splice.call(arguments,0)));
	},
	/**
	 * Generates a translated string based on the given string tag and optional placeholders.
	 * @function
	 * @name Block#t
	 * @param {String} tag the string tag identifying the text to be be returned.
	 * @param {Object} [placeHolders] an object containing the placeholders and corresponding values to be replaced in the returned text.
	 * @returns the full text to be used in the interface or the string tag itself if no translation has been found for this tag.  
	 * @see JBlocks.addTranslation
	 */
	t: function() {
		return $.jBlocks.apply(null,["translate"].concat([].splice.call(arguments,0)));
	},

})//.blockIndex=0;
