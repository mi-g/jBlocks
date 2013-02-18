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
 * <p>
 * A List block holds display a list of items, handling the search and scroll.
 * </p>
 * <p>
 * The constructor should not be invoked directly but {@link JBlocks#newBlock}
 * or {@link JBlocks#addNewBlock} should be used instead.
 * </p>
 * 
 * @name List
 * @class Define a List block to be displayed into a JBlocks.
 * @augments JBlock
 */
$.jBlocks("defineBlockClass", "List", "JBlock",
		{
			/**
			 * Initializes a List block. The method is invoked by the jBlocks
			 * core and must never be called directly.
			 * 
			 * @name List#init
			 * @function
			 * @param {Object}
			 *            [layout] see {@link Block#init}.
			 * @param {Object}
			 *            [options] in addition to base class options
			 *            {@link JBlock#init}:
			 * @param {Boolean} [options.haveSearch=false] the list has a Search feature to 
			 *            allow filtering the displayed elements.
			 * @param {Boolean} [options.showSearch=false] if the list has a Search feature, this parameter
			 *            defines whether the search input is initially displayed. 
			 * @param {Function}
			 *            [options.createItem] function(item,li) is called to
			 *            build the HTML content of the given &lt;li/&gt;
			 *            element and must return a unique ID based on <i>item</i>. If <i>null</i> is returned, the item
			 *            is not added to the list.
			 * @param {Array}
			 *            [options.items] an array of items to be displayed
			 *            initially in the list.
			 * @param {Function}
			 *            [options.sortFn=null] function(item1,items2) to sort
			 *            the list.
			 * @param {Function}
			 *            [options.onRefresh=null] function called after a refresh.
			 * @param {Function}
			 *            [options.onItemAdded=null] function(item) called after an item has been added.
			 * @param {Function}
			 *            [options.onItemRemoves=null] function(item) called after an item has been removed.
			 */
			init : function() {
				this._super.apply(this, arguments);
				this.options = $.extend({
					items : [],
					createItem: function(item, li) {
						return null;
					},
					searchItem: null,
					haveSearch: false,
					showSearch: false,
					itemHeightRatio: 0.66, 
				}, this.options);
				this.options.scrollAnimation=400;
				this.items = {};
				this.search = null;
				this.lastSearch=null;
			},
			onCreate : function() {
				var $this=this;
				this._super();
				if(this.options.haveSearch) {
					this.search = this.selfJBlocks.addNewBlock("Input",{
						h: 1,
						w: 1,
						pref: "top left",
						priority: 100,
						expandHeight: 0,
						expandWidth: 2,
						visible: this.options.showSearch,
					},{
						emargin: [0.1,0,0.1,0],
						epadding: [0.1,0,0.1,0],
						blockContentClass: "jblocks-list-search",
					});
					$.jBlocks("log","search onCreate");					
					this.search.element.bind("input", function(event) {
						var searchExpr=$this.search.element.val();
						if(searchExpr!=$this.lastSearch) {
							$this.lastSearch=searchExpr;
							$this.filter();
						}
						event.stopPropagation();
						$this.refresh();
					});
				}
				this.content.addClass("jblocks-block-list");
				this.ul = $("<ul/>");
				this.list=this.selfJBlocks.addNewBlock("ScrollableHtml",{
					h: 1,
					w: 1,
					pref: "left top",
				},{
					onCreate: function() {
						this.getHtmlContainer().append($this.ul);
					},
					contentBorderRadius: 0,
					margin: [0,0,0,0],
					scrollAnimation: 400,
					verticalAlign: false,
				});
				for ( var g in this.options.items) {
					var li = $("<li/>");
					var key = this.options.createItem.call(this,this.options.items[g], li);
					if(key) {
						li.appendTo(this.ul);
						this.items[key] = {
							li : li,
							data : this.options.items[g],
						};
					}
				}
			},
			filter: function(itemKey) {
				var items=this.items;
				if(arguments.length>0) {
					items={};
					items[itemKey]=this.items[itemKey];
				}
				for(var key in items) {
					var item=items[key];
					if(!this.lastSearch)
						item.li.show();
					else {
						var display=false;
						if(this.options.searchItem==null) {
							if(item.li.html().replace(/<.*?>/g," ").toLowerCase().indexOf(this.lastSearch.toLowerCase())>=0)
								display=true;
						} else if(this.options.searchItem(item.data,this.lastSearch))
							display=true;
						if(display)
							item.li.show();
						else
							item.li.hide();
					}
				}
			},
			updateLi: function(li) {
				var sizeRef=Math.min(this.jBlocks.geometry.uHeight,this.jBlocks.geometry.uWidth);
				var itemHeight=sizeRef*this.options.itemHeightRatio;
				var imgHeight=itemHeight*0.8;
				var imgMargin=itemHeight*0.1;
				var liPadding=0;//sizeRef*0+"px";
				li.css({
					height: itemHeight,
					//"padding-left": liPadding,
					//"padding-right": liPadding,
					"line-height": itemHeight+"px",
				}).find("img").css({
					height: imgHeight,
					width: "auto",
					margin: imgMargin,
				});				
			},
			display : function(geometry) {
				this.updateLi(this.ul.children("li"));
				this.refresh();
			},
			/** 
			 * Sort the item in the list according to the provided sort function.
			 * @name List#sort
			 * @function
			 */
			sort : function() {
				if (typeof this.options.sortFn =="function") {
					var items = [];
					for ( var key in this.items) {
						items.push(key);
					}
					var $this = this;
					items.sort(function(k1, k2) {
						return $this.options.sortFn($this.items[k1].data,
								$this.items[k2].data);
					});
					for ( var i in items) {
						var it = this.items[items[i]];
						it.li.detach().appendTo(this.ul);
					}
				}
			},
			/** 
			 * Add an item to the list.
			 * @name List#addItem
			 * @function
			 * @param {Object} the item data.
			 */
			addItem : function(myItem) {
				var li = $("<li/>");
				var key = this.options.createItem(myItem, li);
				if(key) {
					li.appendTo(this.ul);
					this.items[key] = {
						li : li,
						data : myItem,
					};
					if(this.anchor)
						this.updateLi(li);
				}
				if(this.options.onItemAdded)
					this.options.onItemAdded.call(this,myItem);
			},
			/** 
			 * Remove a list item.
			 * @name List#removeItem
			 * @function
			 * @param {String} the key for the item to be removed.
			 */
			removeItem : function(itemId) {
				if (typeof this.items[itemId] != "undefined") {
					var item = this.items[itemId];
					item.li.remove();
					delete this.items[itemId];
					if(this.options.onItemRemoved)
						this.options.onItemRemoved.call(this,item);
				}
			},
			/** 
			 * Remove all list items.
			 * @name List#clearAll
			 * @function
			 */
			clearAll : function() {
				this.ul.empty();
				this.items = {};
			},
			refresh : function() {
				this.sort();
				this.list.checkState();
				if(this.options.onRefresh)
					this.options.onRefresh.call(this);
			},
			/** 
			 * Display or hide the search field.
			 * @name List#toggleSearch
			 * @function
			 */
			toggleSearch: function() {
				this.search.layout.visible=!this.search.layout.visible;
				if(this.search.layout.visible)
					this.search.focus();
				this.selfJBlocks.checkLayout();
			},
			/** 
			 * Scroll to the bottom of the list.
			 * @name List#scrollBottom
			 * @function
			 */
			scrollBottom:function() {
				this.list.scrollBottom();
			},
			/** 
			 * Scroll to the top of the list.
			 * @name List#scrollTop
			 * @function
			 */
			scrollTop:function() {
				this.list.scrollTop();
			},
			/** 
			 * Shuffles the order of the lines in the list.
			 * @name List#shuffle
			 * @function
			 */
			shuffle: function() {
				var arr=[];
				for(var key in this.items)
					arr.push(this.items[key].li.detach());
				var i = arr.length;
				if (i<=0) return;
				while (--i) {
					var j;
					j=Math.floor(Math.random()*(i+1));
					var tmp = arr[i];
					arr[i] = arr[j];
					arr[j] = tmp;
				}
				for(var i in arr)
					this.ul.append(arr[i]);
			},
			/** 
			 * Ensures the item for the given key is visible in the list.
			 * @name List#ensureVisible
			 * @function
			 */
			ensureVisible: function(key) {
				var item=this.items[key];
				if(!item)
					return;
				var position=item.li.position();
				this.list.makeVisible(position.top,item.li.height());
			},
		});
