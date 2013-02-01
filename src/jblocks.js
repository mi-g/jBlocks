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
 * <p>jBlocks is a javascript library that can be used as a jQuery plugin and/or a framework taking care of the layout in a HTML5 application. 
 * It allows designing applications that will run on desktops as well as on mobile devices without having to worry much about the details 
 * of screen resolution, pixel density and so on.</p>
 * 
 * <p>The basic idea is to rely on a javascript-run algorithm to perform the layout rather than regular CSS like float or table layouts. 
 * jBlocks arranges rectangular blocks into a viewport according to a set of loose preferences given by the developer. The library tries to 
 * minimize the spare areas without content in real time. This means the application may add, remove or modify blocks geometry and jBlocks 
 * will recalculate and adjust the layout accordingly.</p>
 * <p>The resulting layout method is not really deterministic so it may not be suitable to all applications: please do not use jBlocks to run a 
 * nuclear plant !</p>
 */

(function($) {
	
/**************************************************/
/* Class management                               */
/**************************************************/

	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed (MPL compatible).
	 */
	// Inspired by base2 and Prototype
	var Class=function(){};
	(function(){
	  var initializing = false, fnTest = /xyz/.test(function(){/*xyz;*/}) ? /\b_super\b/ : /.*/;
	
	  // Create a new Class that inherits from this class
	  Class.extend = function(prop) {
	    var _super = this.prototype;
	   
	    // Instantiate a base class (but only create the instance,
	    // don't run the init constructor)
	    initializing = true;
	    var prototype = new this();
	    initializing = false;
	   
	    // Copy the properties over onto the new prototype
	    for (var name in prop) {
	      // Check if we're overwriting an existing function
	      prototype[name] = typeof prop[name] == "function" &&
	        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
	        (function(name, fn){
	          return function() {
	            var tmp = this._super;
	           
	            // Add a new ._super() method that is the same method
	            // but on the super-class
	            this._super = _super[name];
	           
	            // The method only need to be bound temporarily, so we
	            // remove it when we're done executing
	            var ret = fn.apply(this, arguments);       
	            this._super = tmp;
	           
	            return ret;
	          };
	        })(name, prop[name]) :
	        prop[name];
	    }
	       
	    // The dummy class constructor
	    function Class(args) {
	      // All construction is actually done in the init method
	      if ( !initializing && this.init)
	    	if(arguments.length>0 && args.jBlocksArgsList)
	    		this.init.apply(this, args);
	    	else
	    		this.init.apply(this, arguments);
	    }
	   
	    // Populate our constructed prototype object
	    Class.prototype = prototype;
	   
	    // Enforce the constructor to be what we expect
	    Class.prototype.constructor = Class;
	
	    // And make this class extendable
	    Class.extend = arguments.callee;
	    
	    return Class;
	  };
	})();
	
	/**************************************************/
	/* jBlocks objects handle a layout context        */
	/**************************************************/

	var jBlocksClasses={ "Class": Class }
	var jBlocksIndex=0;
	var backlog=[];
	var blockAnonIndex=0;
	var jBlocksT0=new Date().getTime();
	var jBlocksUser=null;
	var currentScriptURL=(function() {
	    var scripts = document.getElementsByTagName('script');
	    return scripts[scripts.length-1].src;
	})();
	
	function now() {
		return new Date().getTime()-jBlocksT0;
	}

	function CreateWorker(workerURL) {
		if(workerURL==null) {
		    workerURL=/^(.*?)[^\/]*$/.exec(currentScriptURL)[1]+"jblocks.worker.js";
		}
		var worker = new Worker(workerURL);
		worker.addEventListener('message', function(event) {
			var data=event.data;
			if(data.cmd=="log")
				$.jBlocks("log","[Worker]",data.args.str);
			else
				$(document).trigger("jblocks.worker",data);
		});
		return worker;
	}
	
	var globalWorker=null;
	
	/**
	 * <p>A jBlocks context defines a rectangular viewport in which smaller sized blocks are layouted. Depending on the the setup, vertical or 
	 * horizontal scrolling is managed. If no scrolling is defined, some blocks may not be shown if they can’t fit into the space.</p>
	 * 
	 * <p>jBlocks can be used recursively by defining blocks that are themselves jBlocks contexts handling their own layout. This is convenient 
	 * to define structured blocks containing several zones, like for instance a header, content area and footer.</p>
	 * 
	 * <p>A viewport has a virtual size, for instance 18x12. jBlocks adapts the real pixel size to the device physical geometry. This virtual 
	 * size can be controlled by the application but jBlocks provides a default behavior to adjust to the actual device. For instance, on a 
	 * full size big desktop screen, the size might be 30x24, causing many blocks to be seen, while when run on a mobile phone, it can 
	 * become 12x15 and scrolling must be performed to see some blocks. jBlocks handles device rotation so the 12x15 size might 
	 * become 15x12 causing the library to calculate a new layout dynamically.</p>
	 * 
	 *  @name JBlocks
	 *	@class Represents a jBlocks layout context
	 *	@constructs
	 *	@param {jQuerySet} [anchor] the DOM element jQuery representation where to attach the JBlocks object. If omitted, the JBlock will attach to the page body when available.
	 */
	function JBlocks(anchor) {
		/** @lends JBlocks */
		var $this=this;
		this.anchor=arguments.length>0?arguments[0]:null;
		this.blocks={};
		this.layoutsStack=[];
		this.layoutCache={};
		this.layoutCount=0;
		this.layouts=null;
		this.layoutSign=null;
		this.geometrySizeSign=null;
		this.worker=null;
		this.scrollable=false;
		this.jBlocksResizeTimer=null;
		this.jBlocksLayoutTimer=null;
		this.layoutInProgress=0;
		this.loggedIn=null;
		this.focusedBlockId=null;
		
		this.layoutData={
			rmk: {
				rows: {},
				cols: {},
			},
			maxSize: {
				w: 1,
				h: 1,
			},
			misfits: {},
		};
		//log("Created jBlocks",jBlocksIndex);
		this.jBlocksIndex=jBlocksIndex++;
		this.viewport={
			r: 0,
			c: 0,
			w: 0,
			h: 0,
			minw: 3,
			minh: 3,
			zoomSeed: 1000,
			fillHoles: true,
			fixed: "width",
		};
		this.options={
			resizeDelay: 50,
			layoutDelay: 50,
			resizeAnimateDelay: 400,
			scrollAnimateDelay: 400,
			resizeCallback: function() {},
			scrollable: false,
			debug: false,
			debugBlockLayout: false,
			blockClass: null,
			blockContentClass: null,
			defaultOnResize: function(geometry,viewport) {
				this.updateViewportFromGeometry(geometry,viewport,{
					pixels: 75,
					minw: 12,
					maxw: 30,
					minh: 12,
					maxh: 24,
				});
			},
			onResize: function(geometry,viewport) {
				var frameData=$.jBlocks("getFrameData");
				if(frameData && typeof frameData.onResize=="function")
					frameData.onResize.call(this,geometry,viewport);
				else
					this.options.defaultOnResize.call(this,geometry,viewport);
			},
			onLayoutDone: function() {},
			fontSizeRatio: 0.25, 
			lineHeightRatio: 1,
			updateFontSize: true,
			margin: [.05,.05,.05,.05],
			padding: [.05,.05,.05,.05],
			blockShadow: 0,
			ownWorker: false,
			workerURL: null,
			preInit: function() {},
			postInit: function() {},
		};
		this.geometry={
			top: 0,
			left: 0,
			width: 1,
			height: 1,
			uWidth: 1,
			uHeight: 1,
		};
		if(pageInited)
			this.init();
		else
			pendingInits.push(this);
	}
	
	JBlocks.prototype={}
	
	JBlocks.prototype.getWorker=function() {
		var $this=this;
		if(typeof Worker=="undefined") {
			return null;
		}
		if(this.worker)
			return this.worker;
		if(this.options.ownWorker)
			this.worker = CreateWorker(this.options.workerURL);
		else {
			if(!globalWorker)
				globalWorker = CreateWorker(this.options.workerURL);
			this.worker = globalWorker;
		}
		$(document).bind("jblocks.worker", function(event,data) {
			if(data.jBlocksIndex!=$this.jBlocksIndex)
				return;
			switch(data.cmd) {
			case "layouts":
				//debugger;
				$this.layoutInProgress--;
				$this.layoutCache[data.args.signature]={ 
					layouts: JSON.parse(JSON.stringify(data.args.layouts)), 
					layoutData: JSON.parse(JSON.stringify(data.args.layoutData)),
					lastUsed: new Date().getTime(),
				};
				$this.checkSanity(data.args.layouts,data.args.layoutData);
				$this.layouts=data.args.layouts;
				$this.layoutData=data.args.layoutData;
				for(var i in data.args.layouts) {
					var layout=data.args.layouts[i];
					var block=$this.blocks[layout.block.id];
					if(block && block.options.earlyLayout==false)
						$this.applyBlockLayout(layout);
				}
				if(data.args.signature==$this.layoutSign) {
					$this.layoutDone();
				}
				break;
			case "layout":
				var blockId=data.args.layout.block.id;
				if(data.args.misfit)
					$this.layoutData.misfits[blockId]=true;
				else
					delete $this.layoutData.misfits[blockId];
				var block=$this.blocks[blockId];
				if(block) {
					if(block.options.earlyLayout)
						$this.applyBlockLayout(data.args.layout);
				}
				break;
			}
		});
		return this.worker;
	}	
	
	/**
	 * jBlocks init function.
	 * @memberOf JBlocks.prototype
	 */
	JBlocks.prototype.init=function() {
		var $this=this;
		if(this.anchor==null)
			this.anchor=$("body").first();
		this.options.preInit.call(this);
		this.anchor.data("jBlocks",this);
		this.anchor.empty();
		this.fullscreenMethods=this.getFullscreenMethods();
		this.frame=$("<div/>").addClass("jblocks-frame").css({
		}).appendTo(this.anchor);
		this.frameContent=$("<div/>").addClass("jblocks-frame-content").css({
		}).appendTo(this.frame);
		for(var bi in this.blocks) {
			this.blocks[bi].create(this.anchor);
		}
		this.anchor.bind("jBlocks.resize",function(event,geometry) {
			if(!geometry) 
				geometry={
					width: $this.anchor.width(),
					height: $this.anchor.height(),
				}
			if($this.jBlocksResizeTimer)
				clearTimeout($this.jBlocksResizeTimer);
			$this.jBlocksResizeTimer=setTimeout(function() {
				$this.jBlocksResizeTimer=null;
				var frame=$this.anchor.children(".jblocks-frame").children(".jblocks-frame-content");
				//frame.width($this.anchor.width());
				//frame.height($this.anchor.height());
				frame.width(geometry.width);
				frame.height(geometry.height);
				$this.geometry.width=geometry.width;
				$this.geometry.height=geometry.height;
				$this.geometry.uWidth=$this.geometry.width/$this.viewport.w;
				$this.geometry.uHeight=$this.geometry.height/$this.viewport.h;
				$this.options.onResize.call($this,$this.geometry,$this.viewport);
				$this.geometry.uWidth=$this.geometry.width/$this.viewport.w;
				$this.geometry.uHeight=$this.geometry.height/$this.viewport.h;
				
				if($this.options.updateFontSize) {
					var sizeRef=Math.min($this.geometry.uHeight,$this.geometry.uWidth);
					$this.frameContent.css({
						"font-size": sizeRef*$this.options.fontSizeRatio+"pt",
					});
				}
				$this.checkLayout();
		    },$this.options.resizeDelay);
			event.stopPropagation();
		});
		$(document).bind("jblocks.login",function(event,user) {
			$this.loggedIn=user;
			for(var bi in $this.blocks)
				$this.blocks[bi].onLoggedIn(user);
		});
		$(document).bind("jblocks.logout",function(event) {
			$this.loggedIn=null;
			for(var bi in $this.blocks)
				$this.blocks[bi].onLoggedOut();
		});
		this.updateOptions({});
		this.checkLayout();
		this.options.postInit.call(this);
	}
	
	/**
	 * Returns the JBlocks object itself so its methods can be invoked directly.
	 * @example
	 * var jb=$.jBlocks("getSelf");
	 * jb.addNewBlock(...);
	 * @returns the JBlocks object.  
	 */
	JBlocks.prototype.getSelf=function() {
		return this;
	}

	/**
	 * Creates a new block.
	 * 
	 * A block is generally created with {@link JBlocks#newBlock} then immediately added with {@link JBlocks#addBlock} so
	 * it might be more convenient to use directly {@link JBlocks#addNewBlock}. 
	 * @param {String} blockClass the class the new block is an instance of.
	 * @param {Object} layout the layout for the new block.
	 * @param {Object} options for the new block. The options fields depends on the block class being instantiated.
	 * @returns the newly created Block object.  
	 */
	JBlocks.prototype.newBlock=function() {
		if(!jBlocksClasses[arguments[0]])
			throw("Unknown class "+arguments[0]);
		var jBlocksClass=jBlocksClasses[arguments[0]];
		var args=Array.prototype.slice.call(arguments,1);
		args.jBlocksArgsList=true;
		var block=new jBlocksClass(args);
		block.className=arguments[0];
		return block;
	}

	/**
	 * Adds a new block to the JBlocks and schedules a layout.
	 * @param {Object} block a block object previously created using {@link JBlocks#newBlock}
	 */
	JBlocks.prototype.addBlock=function(block) {
		this.blocks[block.id]=block;
		block.jBlocks=this;
		if(pageInited)
			block.create(this.anchor);
		this.checkLayout();
	}

	/**
	 * Executes in sequence {@link JBlocks#newBlock} then {@link JBlocks#addBlock}.
	 * 
	 * @param {String} blockClass the class the new block is an instance of.
	 * @param {Object} layout the layout for the new block.
	 * @param {Object} options for the new block. The options fields depends on the block class being instantiated.
	 * @returns the newly created Block object.  
	 */
	JBlocks.prototype.addNewBlock=function() {
		var block=JBlocks.prototype.newBlock.apply(this,arguments);
		this.addBlock(block);
		return block;
	}

	/**
	 * Removes a block from a JBlocks and schedules a layout.
	 * 
	 * @param {String} blockId the id of the block to be removed. The id can be obtained from a Block object using block.id.
	 */
	JBlocks.prototype.removeBlock=function(blockId) {
		var block=this.blocks[blockId];
		if(block) {
			block.onRemove();
			delete this.blocks[blockId];
		}
		this.checkLayout();
	}
	
	/**
	 * Returns all the block instances marked with the given tag.
	 * 
	 * @param {String} tag the tag to search for.
	 * @returns an array containing all the matching blocks.
	 */
	JBlocks.prototype.blocksByTag=function(tag) {
		var blocks=[];
		for(var bi in this.blocks) {
			var block=this.blocks[bi];
			if(block.tags[tag])
				blocks.push(block);
		}
		return blocks;
	}
	
	/**
	 * Remove all the blocks matching the given tag.
	 * 
	 * @param {String} tag the tag to search for.
	 */
	JBlocks.prototype.removeBlocksByTag=function(tag) {
		var blocks=this.blocksByTag(tag);
		for(var bi in blocks)
			this.removeBlock(blocks[bi].id);
	}
	
	/**
	 * Remove all the blocks in the JBlocks.
	 * 
	 */
	JBlocks.prototype.removeAllBlocks=function() {
		for(var bi in this.blocks)
			this.removeBlock(this.blocks[bi].id);
	}
	
	/**
	 * Modifies some viewport parameters like the virtual width or height. If the changes affect the JBlocks geometry, a layout 
	 * will be performed.
	 * 
	 * @param {Object} viewport an object containing the viewport properties to be modified. Other viewport properties are left unchanged.
	 * @param {Integer} [viewport.r] the top-most visible row.
	 * @param {Integer} [viewport.c] the left-most visible column.
	 * @param {Integer} [viewport.w] the visible virtual width of the viewport.
	 * @param {Integer} [viewport.h] the visible virtual height of the viewport.
	 * @param {Boolean} [viewport.fillHoles=true] should holes be filled by expanding neighbor blocks 
	 * @param {String}  [viewport.fixed="width"] which dimension(s) are fixed: <i>width</i>, <i>height</i> or <i>both</i> for a non-scrollable JBlocks.
	 */
	JBlocks.prototype.updateViewport=function(viewport) {
		$.extend(this.viewport,viewport);
		this.checkLayout();
	}

	/**
	 * Modifies some options parameters.
	 * 
	 * @param {Object} options an object containing the options properties to be modified. Other options properties are left unchanged.
	 * @param {Number} [options.resizeDelay=50] the number of milliseconds to wait before requesting a layout when the container is resized.
	 * @param {Number} [options.layoutDelay=50] the number of milliseconds to wait before doing an actual layout after it has been requested.
	 * @param {Number} [options.resizeAnimateDelay=400] the number of millisecond for the blocks move animation.
	 * @param {Number} [options.scrollAnimateDelay=400] the number of millisecond to animate a scroll of the viewport.
	 * @param {Boolean} [options.scrollable=false] is the JBlocks scrollable.
	 * @param {String} [options.blockClass] class for the block HTML element.
	 * @param {String} [options.blockContentClass] class for the block content HTML element. 
	 * @param {Function} [options.onResize] function(geometry,viewport) to be called when the viewport has been resized.
	 * @param {NumberArray} [options.margin=[.05,.05,.05,.05]] the margins [top,right,bottom,left] for each inner block expressed relatively to the block size.
	 * @param {NumberArray} [options.padding=[.05,.05,.05,.05]] the paddings [top,right,bottom,left] for each inner block expressed relatively to the block size.
	 * This is an opportunity to recalculate the viewport virtual size. 
	 * @param {Boolean} [options.updateFontSize=true] if set, the default font size is set for the JBlocks container relatively to the size of a unit.
	 * @param {Float} [options.blockShadow=0] defines a shadow for each block (i.e. 0.15). 
	 * @param {Boolean} [options.ownWorker=false] if set to <i>true</i>, the JBlocks object has its own worker for solving layouts, otherwise, layout operations are
	 * performed sequencially by a global worker.
	 * @param {String} [options.workerURL=null] the URL of the worker script file. If set to <i>null</i> the worker script URL is built using the directory path
	 * of the current script and adding <i>jblocks.worker.js</i>. 
	 * @param {Function} [options.preInit] if set, this function is called just prior to attaching the jBlocks to its anchor.
	 * @param {Function} [options.postInit] if set, this function is called just after attaching the jBlocks to its anchor.
	 */
	JBlocks.prototype.updateOptions=function(options) {
		$.extend(this.options,options);
		if(this.options.scrollable && !this.scrollable)
			this.makeScrollable();
		if(!this.options.scrollable && this.scrollable)
			this.unmakeScrollable();
	}

	JBlocks.prototype.getLayoutSign=function() {
		var blocksLayouts={}
		for(var bi in this.blocks) {
			var block=this.blocks[bi];
			blocksLayouts[block.id]=block.layout;
		}
		return $.jBlocks.util.md5(JSON.stringify({
			_1: blocksLayouts,
			_2: this.viewport,
		}));
	}

	JBlocks.prototype.applyBlockLayout=function(layout) {
		var $this=this;
		var block=this.blocks[layout.block.id];
		if(typeof block=="undefined") {
			$.jBlocks("log","Unknown block id",layout.block.id);
			this.anchor.find("#jblocks-block-"+this.jBlocksIndex+"-"+layout.block.id).hide();
		} else {
			block.actualLayout=layout;
			if(block.layout.visible==false || this.layoutData.misfits[block.id]) {
				block.anchor.hide();
			} else {
				block.anchor.show();
				var position=block.anchor.position();
				var oldGeometry={
					width: block.anchor.width(),
					height: block.anchor.height(),
					top: position.top,
					left: position.left,
				}
				var newGeometry={
					width: Math.round(layout.w*this.geometry.uWidth),
					height: Math.round(layout.h*this.geometry.uHeight),
					left: Math.round(layout.c*this.geometry.uWidth),
					top: Math.round(layout.r*this.geometry.uHeight),
				}
				var modifiedSize=oldGeometry.width!=newGeometry.width || oldGeometry.height!=newGeometry.height;
				if(modifiedSize) {
					var contentGeo=block.getContentGeometry(newGeometry,$this.geometry.uWidth,$this.geometry.uHeight);
					block.onStartResize(contentGeo,newGeometry);
					(function(block,newGeometry) {
						contentGeo.top=newGeometry.top;
						contentGeo.left=newGeometry.left;
						var randColor="rgba(230,230,230,0.5)";
						block.anchor.stop().animate(contentGeo,$this.options.resizeAnimateDelay,function() {
							block.content.show();
							block.onResize(newGeometry);					
						});
					})(block,newGeometry);
				} else if(oldGeometry.left!=newGeometry.left || oldGeometry.top!=newGeometry.top) {
					block.anchor.stop().animate({
						left: Math.round(layout.c*this.geometry.uWidth),
						top: Math.round(layout.r*this.geometry.uHeight),
					},$this.options.resizeAnimateDelay,function() {
					});
				}
			}
		}
	}
	
	JBlocks.prototype.applyLayout=function() {
		for(var bi in this.layoutData.misfits) {
			if(this.layoutData.misfits[bi]) {
				var block=this.blocks[bi];
				if(block)
					block.anchor.hide();
			}
		}
		for(var li in this.layouts) {
			this.applyBlockLayout(this.layouts[li]);
		}
	}
	
	JBlocks.prototype.layoutDone=function() {
		var statsStr=
			this.jBlocksIndex+": "+
			(this.layoutInProgress+1)+" "+
			(++this.layoutCount)+" "+
			this.viewport.w+"x"+this.viewport.h+
			" ("+this.layoutData.maxSize.w+"x"+this.layoutData.maxSize.h+") "+
			(new Date().getTime()-this.layoutStatsT0)+"ms";
		if(this.options.debug) {
			$("head title").text(statsStr);
			log(statsStr);
		}

		var oldVP={
			c: this.viewport.c,
			r: this.viewport.r,
		}
		
		if(this.viewport.fixed=="height" || this.viewport.fixed=="both") { 
			this.viewport.r=0;
		} else if(this.viewport.h+this.viewport.r>this.layoutData.maxSize.h && 
				this.layoutData.maxSize.h-this.viewport.h) {
			this.viewport.r=Math.max(0,this.layoutData.maxSize.h-this.viewport.h);
		}
		if(this.viewport.fixed=="width" || this.viewport.fixed=="both") { 
			this.viewport.c=0;
		} else if(this.viewport.w+this.viewport.c>this.layoutData.maxSize.w && 
				this.layoutData.maxSize.w-this.viewport.w) {
			this.viewport.c=Math.max(0,this.layoutData.maxSize.w-this.viewport.w);
		}
		
		if(this.focusedBlockId) {
			var block=this.blocks[this.focusedBlockId];
			if(block) {
				var layout=block.actualLayout;
				var orgViewport={
					r: this.viewport.r,
					c: this.viewport.c,
				}
				if(layout.r+layout.h>this.viewport.r+this.viewport.h)
					this.viewport.r=Math.max(layout.r+layout.h-this.viewport.h,0);
				else if(layout.r<this.viewport.r)
					this.viewport.r=layout.r;
				if(layout.c+layout.w>this.viewport.c+this.viewport.w)
					this.viewport.c=Math.max(layout.c+layout.w-this.viewport.w,0);
				else if(layout.c<this.viewport.c)
					this.viewport.c=layout.c;
				if(this.viewport.r!=orgViewport.r || this.viewport.c!=orgViewport.c) {
					var css={
						top: -this.viewport.r*this.geometry.uHeight,
						left: -this.viewport.c*this.geometry.uWidth,
					};
					this.frameContent.stop().animate(css,this.options.scrollAnimateDelay);					
				}
			}
		}
		
		this.frameContent.stop().animate({
			top: -this.viewport.r*this.geometry.uHeight,
			left: -this.viewport.c*this.geometry.uWidth,
		},this.options.scrollAnimateDelay);

		this.focusedBlockId=null;

		this.options.onLayoutDone.call(this);
	}
	
	/**
	 * Ensure the specified Block object will be visible after the next layout.
	 * 
	 * @param {String} blockId the id of the block to be focused. The id can be obtained from the Block object using block.id.
	 * @see Block#focus
	 */
	JBlocks.prototype.focusBlockId=function(blockId) {
		this.focusedBlockId=blockId;
	}
	
	JBlocks.prototype.checkSanity=function(layouts,layoutData) {
		var layouts1=[];
		var blocks={}
		for(var i in layouts) {
			var layout1=layouts[i];
			blocks[layout1.block.id]=true;
			if(layoutData.misfits[layout1.block.id])
				alert("in both layouts and misfit "+layout1.block.id);
			if(layout1.block.visible && !layoutData.misfits[layout1.block.id])
				layouts1.push(layout1);
		}
		for(var i in layouts1) {
			var la=layouts1[i];
			for(var j in layouts1) {
				var lb=layouts1[j];
				if(i!=j &&
						lb.r<la.r+la.h &&
						lb.r+lb.h>la.r &&
						lb.c<la.c+la.w &&
						lb.c+lb.w>la.c
				)
					alert("mismatch "+la.block.id+" "+lb.block.id+" "+JSON.stringify(la)+" "+JSON.stringify(lb));
			}
		}
		for(var bi in this.blocks) {
			var block=this.blocks[bi];
			if(!blocks[block.id] && !layoutData.misfits[block.id])
				log("missing block "+block.id);
		}
	}
	
	JBlocks.prototype.rebuild=function() {
		if(this.viewport.h==0 || this.viewport.w==0)
			return;
		this.layoutStatsT0=new Date().getTime();
		if(this.layoutInProgress==0) {
			var cached=this.layoutCache[this.layoutSign];
			if(cached) {
				this.checkSanity(cached.layouts,cached.layoutData);
				cached.lastUsed=new Date().getTime();
				this.layoutData=JSON.parse(JSON.stringify(cached.layoutData));
				this.layouts=JSON.parse(JSON.stringify(cached.layouts));
				this.applyLayout();
				this.layoutDone();
				return;
			}
		}

		var blocks=[];
		for(var bi in this.blocks) {
			var blockData={
				id: bi,
			}
			var block=this.blocks[bi];
			$.extend(blockData,block.layout);
			blocks.push(blockData);
		}

		var worker=this.getWorker();
		if(worker) {
			this.layoutInProgress++;
			worker.postMessage({
				cmd: "layout",
				args: {
					blocks: blocks,
					viewport: this.viewport,
					signature: this.layoutSign,
				},
				jBlocksIndex: this.jBlocksIndex,
			});
			return;
		} else {
			try {
				$.jBlocks("log","workerless layout");
				// Error on iOS: SYNTAX_ERR 12
				var layouts = $.jBlocks.worker.layout(blocks,this.viewport,this.layoutData);
				$.jBlocks("log","workerless layout done");
				this.layouts=layouts;
				this.applyLayout();
				this.layoutDone();
			} catch(e) {
				alert("Workerless exception: "+e+" "+e.sourceURL+":"+e.line);
			}
		}
	}
	
	JBlocks.prototype.doCheckLayout=function() {
		for(var bi in this.blocks) {
			var block=this.blocks[bi];
			if(typeof block.options.w=="function")
				block.layout.w=Math.max(1,block.options.w.call(block,this.viewport));
			if(typeof block.options.h=="function")
				block.layout.h=Math.max(1,block.options.h.call(block,this.viewport));			
		}		
		var layoutSign=this.getLayoutSign();
		if(layoutSign==this.layoutSign) {
			if(this.layouts!=null) {
				var geometrySizeSign=$.jBlocks.util.md5(JSON.stringify({
					_1: this.geometry.uWidth,
					_2: this.geometry.uHeight,
				}));
				if(this.layoutInProgress==0 && geometrySizeSign!=this.geometrySizeSign) {
					this.geometrySizeSign=geometrySizeSign;
					this.applyLayout();
				}
			}
			return;
		}
		this.layoutSign=layoutSign;
		this.rebuild();
	}

	/**
	 * Check whether the JBlocks object needs a layout and schedules this layout if necessary.  
	 * The layout does not happen immediately but after a delay to prevent multiple layouts
	 * to be calculated in a very short time.
	 */
	JBlocks.prototype.checkLayout=function() {
		if(!pageInited)
			return;
		var $this=this;
		if(this.jBlocksLayoutTimer)
			clearTimeout(this.jBlocksLayoutTimer);
		this.jBlocksLayoutTimer=setTimeout(function() {
			this.jBlocksLayoutTimer=null;
			$this.doCheckLayout();
	    },this.options.layoutDelay);
	}

	JBlocks.prototype.makeScrollable=function() {
		if(!pageInited)
			return;
		var $this=this;
		function Scroll(type,distance) {
			if(arguments.length<2)
				distance=1;
			var dir;
			switch(type) {
			case "down": dir={ l: "r", d: "h", css: "top", u: "uHeight", line: "rows", i: 1 }; break;
			case "up": dir={ l: "r", d: "h", css: "top", u: "uHeight", line: "rows", i: -1 }; break;
			case "right": dir={ l: "c", d: "w", css: "left", u: "uWidth", line: "cols", i: 1 }; break;
			case "left": dir={ l: "c", d: "w", css: "left", u: "uWidth", line: "cols", i: -1 }; break;
			}
			//$.jBlocks("log","dir",dir,"viewport",$this.viewport,"maxSize",$this.layoutData.maxSize);
			var minScroll=Math.ceil(distance/$this.geometry[dir.u]);
			var lineOld=$this.viewport[dir.l];
			while(Math.abs(lineOld-$this.viewport[dir.l])<minScroll) {
				var next=-1;
				for(var i in $this.layoutData.rmk[dir.line]) {
					var line=$this.layoutData.rmk[dir.line][i];
					//$.jBlocks("log","line",line,line>$this.viewport[dir.l],line+$this.viewport[dir.d]<=$this.layoutData.maxSize[dir.d],$this.viewport[dir.d],$this.layoutData.maxSize[dir.d]);
					if(
							((dir.i>0 && line>$this.viewport[dir.l]) || (dir.i<0 && line<$this.viewport[dir.l])) && 
							(dir.i<0 || line+$this.viewport[dir.d]<=$this.layoutData.maxSize[dir.d]) && 
							(next<0 || (dir.i>0 && line<next) || (dir.i<0 && line>next))
						) {
						next=line;
					}
				}
				if(next>=0) {
					$this.viewport[dir.l]=next;
					var css={};
					css[dir.css]=-next*$this.geometry[dir.u];
					$this.frameContent.stop().animate(css,$this.options.scrollAnimateDelay);
					//$this.UpdateNavigation($this.viewport);
				} else
					break;
			}
		}
		
		this.anchor.bind("mousewheel DOMMouseScroll",function(event) {
			var delta;
			if(event.detail)
				delta = event.detail < 0 ? 1 : -1;
			else if(event.wheelDelta)
				delta = event.wheelDelta > 0 ? 1 : -1;
			else if(event.originalEvent) {
				if(event.originalEvent.wheelDelta)
					delta = event.originalEvent.wheelDelta > 0 ? 1 : -1;
				else if(event.originalEvent.detail)
					delta = event.originalEvent.detail < 0 ? 1 : -1;
				else
					return;
			} else
				return;
		    if(event.ctrlKey) {
		    	/*
		    	if(delta<0)
		    		Zoom(false);
		    	else
		    		Zoom(true);
		    	*/
		    } else {
				if($this.viewport.fixed=="width")
					if(delta<0)
						Scroll("down");
					else
						Scroll("up");
				else if($this.viewport.fixed=="height")
					if(delta<0)
						Scroll("right");
					else
						Scroll("left");
		    }
			event.stopPropagation();
		});
		
		this.anchor.swipe({
			swipeLeft: function(event,direction,distance) {
				Scroll("right",distance);
				event.stopPropagation();
			},
			swipeRight: function(event,direction,distance) {
				Scroll("left",distance);
				event.stopPropagation();
			},
			swipeUp: function(event,direction,distance) {
				Scroll("down",distance);
				event.stopPropagation();
			},
			swipeDown: function(event,direction,distance) {
				Scroll("up",distance);
				event.stopPropagation();
			},
		});
		
		this.scrollable=true;
	}
	
	JBlocks.prototype.unmakeScrollable=function() {
		this.anchor.swipe("destroy");
		this.anchor.unbind("mousewheel DOMMouseScroll");
	}
		
	JBlocks.prototype.updateViewportFromGeometry=function(geometry,viewport,options) {
		var opts={
			pixels: 150,
			minw: 6,
			maxw: 15,
			minh: 7,
			maxh: 12,
		};
		if(arguments.length>2)
			$.extend(opts,options);
		viewport.w=Math.round(geometry.width/opts.pixels);
		if(viewport.w<opts.minw)
			viewport.w=opts.minw;
		if(viewport.w>opts.maxw)
			viewport.w=opts.maxw;
		viewport.h=Math.round(geometry.height/opts.pixels);
		if(viewport.h<opts.minh)
			viewport.h=opts.minh;
		if(viewport.h>opts.maxh)
			viewport.h=opts.maxh;
	}
	
	JBlocks.prototype.getFullscreenMethods=function() {
		var fullscreenPrefix=null;
		var fullscreenPrefixes=["","moz","webkit","o","ms"];
		var fullScreenMethods=null;
		function Uncapitalize(m) {
			return m.substr(0,1).toLowerCase() + m.substr(1);  
		}
		for(var i in fullscreenPrefixes) {
			var prefix=fullscreenPrefixes[i];
			var rfsFnt=Uncapitalize(prefix+"RequestFullScreen");
			if(typeof this.anchor[0][rfsFnt] == "function") {
				fullScreenMethods={
					request: rfsFnt,
					event: prefix+"fullscreenchange",
					element: Uncapitalize(prefix+"FullScreenElement"),
				};
				switch(prefix) {
				case "webkit": 
					fullScreenMethods.element="webkitCurrentFullScreenElement";
					break;
				}
				break;
			}
		}
		return fullScreenMethods;
	}

	/**
	 * Saves the current JBlocks layout into the layouts stack so that it can be later retrieved using {@link JBlocks#popLayout}.  
	 */
	JBlocks.prototype.pushLayout=function() {
		var layouts={};
		for(var bi in this.blocks)
			layouts[this.blocks[bi].id]=JSON.parse(JSON.stringify(this.blocks[bi].layout));
		this.layoutsStack.push(layouts);
	}
	
	/**
	 * Restore a previously saved layout from the layouts stack.
	 */
	JBlocks.prototype.popLayout=function() {
		var layouts=this.layoutsStack.pop();
		for(var bi in layouts) {
			var layout=layouts[bi];
			var block=this.blocks[bi];
			if(block)
				block.layout=layout;
		}
	}

	/**
	 * Makes all blocks invisible.
	 */
	JBlocks.prototype.hideAllBlocks=function() {
		for(var bi in this.blocks)
			this.blocks[bi].layout.visible=false;
	}
	
	/**
	 * Adjust the size of the jBlocks to the current size of its anchor.
	 */
	JBlocks.prototype.updateSize=function() {
		this.anchor.trigger("jBlocks.resize",{
			width: this.anchor.width(),
			height: this.anchor.height(),
		});
	}
	
	/**
	 * Check fullscreen availability. 
	 * @name JBlocks#canFullScreen
	 * @function
	 * @type Boolean
	 * @returns Whether the browser supports fullscreen
	 */
	JBlocks.prototype.canFullscreen=function() {
		return this.fullscreenMethods!=null;
	}
	/**
	 * Make fullscreen the block content or part of it. 
	 * @name JBlocks#fullscreen
	 * @function
	 * @param {jQuerySet} [widget] the element to make fullscreen. If omitted, <i>this.content</i> is used.
	 * @param {Function} function(entering) to be called when fullscreen is entered or exited.
	 */
	JBlocks.prototype.fullscreen=function(widget,updateFnt) {
		if(arguments.length==0 || !widget)
			widget=this.anchor;
		if(arguments.length<2)
			updateFnt=function(){};
		var $this=this;
		var fullscreenMethods=this.fullscreenMethods;
		if(fullscreenMethods) {
			var fullScreenElement=document[fullscreenMethods.element];
			var originalSize={ width: widget.width(), height: widget.height() };
			$(document).bind(fullscreenMethods.event,function() {
				setTimeout(function() {
					var width, height, entering;
					if(document[fullscreenMethods.element]) {
						entering=true;
						widget.addClass("jblocks-full-size");
						width=document[fullscreenMethods.element].offsetWidth;
						height=document[fullscreenMethods.element].offsetHeight;
						$.jBlocks("log","entered fullScreen",width,"x",height);
					} else {
						entering=false;
						widget.removeClass("jblocks-full-size");
						width=originalSize.width,
						height=originalSize.height,
						$(document).unbind(fullscreenMethods.event);
						$.jBlocks("log","exited fullScreen",width,"x",height);
					}
					if(fullScreenElement) {
						fullScreenElement.width(width);
						fullScreenElement.height(height);
					}
					updateFnt(entering);
				},0);
			});
			widget[0][fullscreenMethods.request]();
		}
	}

	var pendingInits=[];
	var pendingFunctions=[];
	
	var pageInited=false;
	$(document).ready(function() {
		if(pageInited)
			return;
		pageInited=true;
		for(var i in backlog)
			$.jBlocks("log",backlog[i]);
		backlog=[];
		
		for(var i in pendingInits)
			pendingInits[i].init();
		pendingInits=null;
		
		for(var i in pendingFunctions) {
			var fn=pendingFunctions[i];
			fn[0].apply(fn[1],fn[2]);
		}
		pendingFunctions=null;
	});
	
	var soundsDiv=null;
	/**
	 * Associates a tag to a sound so that it can be played later using the {@link JBlocks.playSound} method.
	 * Two sound files must be created per sound (mp3 and ogg). 
	 * @function
	 * @name JBlocks.addSound
	 * @param {String} tag the logical name for the sound
	 * @param {String} name the main part of the files name (without the extension). If <i>name</i> is null, the sound
	 * is removed.
	 * @param {String} path the optional URL directory path where to get the sound files from. If not specified, <i>res/sounds</i> is
	 * added to the current script location directory path.
	 */
	function AddSound(tag,name,path) {
		if(arguments.length<3)
			path=/^(.*?)[^\/]*$/.exec(currentScriptURL)[1]+"res/sounds/";
		if(path[path.length-1]!="/")
			path=path+"/";
		if(!soundsDiv)
			soundsDiv=$("<div/>").hide().appendTo($("body"));
		var audio=soundsDiv.find("[jblocks-sound="+tag+"]");
		if(name) {
			if(audio.length==0)
				audio=$("<audio/>").attr("jblocks-sound",tag).appendTo(soundsDiv);
			audio.empty();
			$("<source/>").attr("src",path+name+".ogg").attr("type","audio/ogg").appendTo("audio");
			$("<source/>").attr("src",path+name+".mp3").attr("type","audio/mp3").appendTo("audio");
		} else {
			audio.remove();
		}
	}
	var needPhonegapMedia,phonegapMediaLib;
	/**
	 * Play a sound that has already been added by {@link JBlocks.addSoundSound}.
	 * If the sound is not available, the function silently returns. 
	 * @function
	 * @name JBlocks.playSound
	 * @param {String} tag the logical name for the sound
	 */
	function PlaySound(tag) {
		if(soundsDiv) {
			var audio=soundsDiv.find("[jblocks-sound="+tag+"]");
			if(audio.length>0) {
				audio=audio[0];
				var platform=null;
				if(typeof device !="undefined" && /iphone|ipad|ipod|ios/i.test(device.platform))
					platform="ios";
				if(typeof needPhonegapMedia=="undefined") {
					needPhonegapMedia=false;
					if(typeof device !="undefined" && device.platform=="Android" && device.version.charAt(0)=="2")
						needPhonegapMedia=true;
					if(typeof device !="undefined" && /iphone|ipad|ipod|ios/i.test(device.platform))
						needPhonegapMedia=true;
				}
				if(needPhonegapMedia) {
					if(typeof phonegapMediaLib=="undefined")
						phonegapMediaLib={};
					if(typeof phonegapMediaLib[tag]=="undefined") {
						var node=audio.firstChild;
						while(node) {
							if(/source/i.test(node.nodeName) && node.getAttribute("type")=="audio/mp3")
								break;
							node=node.nextSibling;
						}
						if(node) {
							var src=node.getAttribute("src");
							if(/^file:\/\//.test(src))
								src=/^file:\/\/(.*)$/.exec(src)[1];
							if(platform=="ios")
								src=src.replace(/^(\.\.\/)*/,"");
							phonegapMediaLib[tag]=new Media(src, function() {
							},function(error) {
							},function() {
							});
						} else
							phonegapMediaLib[tag]=null;
					}
					if(phonegapMediaLib[tag]) {
						phonegapMediaLib[tag].play();
					}
				} else
					audio.cloneNode(true).play();
			}
		}
	}

	var clickEvent=null;
	/**
	 * The function returns <i>click</i> or <i>touchstart</i> if that event is available on the platform.
	 * Using a call to <i>$.jBlocks("click")</i> should be preferred to using the string "click" when binding
	 * a jQuery object to the click event as "touchstart" reacts much better on a mobile or tablet.
	 * @function
	 * @name JBlocks.click
	 */
	function GetClick() {
		if(!clickEvent) {
			clickEvent="click";
			if('ontouchstart' in document.documentElement)
			    clickEvent = "touchstart";
		}
		return clickEvent; 
	}
	
	/**************************************************/
	/* jQuery plugin machinery                        */
	/**************************************************/

	var defaultJBlocks=null;
	function getDefaultJBLocks() {
		if(!defaultJBlocks)
			defaultJBlocks=new JBlocks(null);
		defaultJBlocks.options.ownWorker=true;
		//defaultJBlocks.options.debug=true;
		return defaultJBlocks;
	}
	
	/**
	 * Setup handlers so that the jBlocks context will match automatically the page and respond to page resizing and rotation. This currently works 
	 * only in jQuery Mobile pages.
	 * @function
	 * @name JBlocks.autoSyncContentSize
	 */
	function autoSyncContentSize() {
		function ResizeContent() {
			$("body").trigger("jBlocks.resize",{
				width: $("body").width(),
				height: $("body").height(),
			});
		}
		$(window).bind('orientationchange resize',function(event){
			ResizeContent();
		});
		$(document).ready(function() {
			ResizeContent();			
		});
	}
	
	/**
	 * Log whatever strings or objects. The method takes any number of arguments and log each argument separated by a space. 
	 * If the argument is a string it displays the string without any modification, otherwise a JSON representation of the argument is displayed.
	 * The method can be invoked as soon as the jBlocks script  is loaded even if the DOM is not loaded yet.
	 * @function
	 * @name JBlocks.log
	 * @param {Stringifiable object|String} ... 
	 */
	function log() {
		var strs=[];
		for(var i=0;i<arguments.length;i++) {
			var str=arguments[i];
			if(typeof(str)!="string")
				try {
					str=JSON.stringify(str);
				} catch(e) {
					str="<???>";
				}
			strs.push(""+str);
		}
		var log=strs.join(" ");
		if(!pageInited)
			backlog.push(log);
		else
			$(".jblocks-log").append($("<p/>").text(log));
	}
	
	var translations={};

	/**
	 * Adds the given tag/text pairs to the current translation set.
	 * @function
	 * @name JBlocks.addTranslation
	 * @param {Object} translation an object where keys represent the text string tag and the corresponding value the text to be used in the user interface.
	 * @see JBlocks.translate
	 */
	function addTranslation(translation) {
		for(var tag in translation)
			translations[tag]=translation[tag];
	}

	/**
	 * Generates a translated string based on the given string tag and optional placeholders.
	 * @function
	 * @name JBlocks.translate
	 * @param {String} tag the string tag identifying the text to be be returned.
	 * @param {Object} [placeHolders] an object containing the placeholders and corresponding values to be replaced in the returned text.
	 * @returns the full text to be used in the interface or the string tag itself if no translation has been found for this tag.  
	 * @see JBlocks.addTranslation
	 */
	function translate(tag,placeHolders) {
		if(arguments.length<2)
			placeHolders={};
		var str=translations[tag];
		if(typeof str=="undefined")
			str=tag;
		else {
			for(var ph in placeHolders) {
				var phval=placeHolders[ph];
				str=str.replace(new RegExp(ph,"g"),phval);
			}
		}
		return str;
	}
	
	/**
	 * If the current page has been opened from an IFrame block, getFrameData allows accessing some parameters from the opener. Using this method is preferred
	 * over the classical method of using URL parameters that does not support the file:// protocol.
	 * @function
	 * @name JBlocks.getFrameData
	 * @returns the data object from the IFrame opener block.
	 * @see IFrame#init 
	 */
	function getFrameData() {
		if(!window.name)
			return null;
		var m=/^jblocks-data-([0-9]+)$/.exec(window.name);
		if(!m)
			return null;
		var dataIndex=m[1];
		if(!window.parent || !window.parent.$ || !window.parent.$.jBlocks || !window.parent.$.jBlocks.frameData || !window.parent.$.jBlocks.frameData.data[dataIndex] )
			return null;
		return window.parent.$.jBlocks.frameData.data[dataIndex];
	}
	
	/**
	 * Defines a block class so blocks of that class can then be instantiated.
	 * @function
	 * @name JBlocks.defineBlockClass
	 * @param {String} className the name of the new block class
	 * @param {String} baseClassName the name of the block class the new class extends. To extend the top level block class, use “Block”
	 * @param {Object} classDefinition an object defining the new methods for that class or the methods to overload	 * Defines a new 
	 */
	function defineBlockClass() {
		try {
		var jBlocksClass=jBlocksClasses[arguments[2]].extend(arguments[3]);
		jBlocksClasses[arguments[1]]=jBlocksClass;
		return jBlocksClass;
		} catch(e) {
			alert("!!! "+e+"\n"+JSON.stringify(arguments));
		}
	}
	
	$.jBlocks=function(method) {
		switch(method) {
		case "defineBlockClass":
			return defineBlockClass.apply(null,arguments);
		case "autoSyncContentSize":
			autoSyncContentSize();
			break;
		case "log":
			var args=Array.prototype.slice.call(arguments,1);
			log.apply(getDefaultJBLocks(),[now()].concat(args));
			break;
		case "addTranslation":
			var args=Array.prototype.slice.call(arguments,1);
			return addTranslation.apply(null,args);
		case "translate":
			var args=Array.prototype.slice.call(arguments,1);
			return translate.apply(null,args);
		case "getFrameData":
			var args=Array.prototype.slice.call(arguments,1);
			return getFrameData.call(null);
		case "addSound":
			var args=Array.prototype.slice.call(arguments,1);
			if(!pageInited)
				pendingFunctions.push([AddSound,null,args]);
			else
				AddSound.apply(null,args);
			return;
		case "playSound":
			var args=Array.prototype.slice.call(arguments,1);
			if(!pageInited)
				pendingFunctions.push([PlaySound,null,args]);
			else
				PlaySound.apply(null,args);
			return;
		case "click":
			return GetClick();
		case "getBlockAnonIndex":
			return blockAnonIndex++;
		default:
			if(typeof JBlocks.prototype[method]!="function")
				throw "jBlocks: no such method "+method;
			var jb=getDefaultJBLocks();
			var args=Array.prototype.slice.call(arguments,1);
			return JBlocks.prototype[method].apply(jb,args);
		}
	}
	
	$.fn.jBlocks=function() {
		var anchor=this.first();
		var jb=new JBlocks(anchor);
		jb.anchor=anchor;
		jb.init();
		jb.updateSize();
		return jb;
	}
	
})(jQuery);
