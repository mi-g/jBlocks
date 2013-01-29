
if(typeof $ == "undefined")
	$={};
if(typeof $.jBlocks == "undefined")
	$.jBlocks={}

$.jBlocks.worker = {
	supported: false,
	log: function() {
		if($.jBlocks.worker.supported) {
			var strs=[];
			for(var i=0;i<arguments.length;i++) {
				var str=arguments[i];
				if(typeof(str)!="string")
					str=JSON.stringify(str);		
				strs.push(""+str);
			}
			self.postMessage({
				cmd: "log",
				args: {
					str: strs.join(" "),
				}
			});
		} else 
			$.jBlocks.apply(["log"].concat(arguments));
	},
	extend: function(dest) {
		for(var i=1;i<arguments.length;i++) {
			var map=arguments[i];
			for(var j in map) {
				dest[j]=map[j];
			}
		}
	},
	layout: function(blocks,viewport,layoutData,jBlocksIndex) {
			
		function BlocksSort() {
			blocks.sort(function(b1,b2) {
				return b2.priority-b1.priority;
			});
		}
		BlocksSort();
		
		//$jBlocks("log","blocks",blocks.length,blocks);
		
		layoutData.rmk.rows={ 0: 0	};
		layoutData.rmk.rows[viewport.h]=viewport.h;
		layoutData.rmk.cols={ 0: 0	};
		layoutData.rmk.cols[viewport.w]=viewport.w;
		
		layoutData.misfits={}
		
		var layouts=[];
		var invisibleLayouts=[];
	
		var frameSize={
			w: -1,
			h: -1,
		}
		
		function BuildZones(block) {
			var points=[];
			for(var ri in layoutData.rmk.rows)
				for(var ci in layoutData.rmk.cols) {
					points.push({
						r: layoutData.rmk.rows[ri],
						c: layoutData.rmk.cols[ci],
					});
					if(block) {
						if(viewport.fixed=="width") {
							points.push({
								r: layoutData.rmk.rows[ri]+block.h,
								c: layoutData.rmk.cols[ci],
							});					
						}
						if(viewport.fixed=="height") {
							points.push({
								r: layoutData.rmk.rows[ri],
								c: layoutData.rmk.cols[ci]+block.w,
							});					
						}
					}
				}
			
			//$jBlocks("log","points",points);
			var zones=[];
			var zonesMap={};
			for(var pi1=0;pi1<points.length-1;pi1++)
				for(var pi2=pi1+1;pi2<points.length;pi2++) {
					var point1=points[pi1];
					var point2=points[pi2];
					if(point1.r!=point2.r && point1.c!=point2.c) {
						var zone={
								r: Math.min(point1.r,point2.r),
								c: Math.min(point1.c,point2.c),
								h: Math.abs(point2.r-point1.r),
								w: Math.abs(point2.c-point1.c),
						};
						var zoneKey=zone.c+","+zone.r+"-"+zone.w+"x"+zone.h;
						if(!zonesMap[zoneKey]) {
							zonesMap[zoneKey]=true;
							zones.push(zone);
						}
					}
				}
			//$jBlocks("log","zones",zones);
			return zones;
		}
		
		//$jBlocks("log","blocks",blocks);
		
		while(blocks.length>0) {
			var block=blocks.shift();
			//$jBlocks("log","--------------------");
			//$jBlocks("log","block",block);
			if(!block.visible) {
				//$.jBlocks.worker.log("block",block.id,"not visible");
				var layout={
					block: block,
					visible: false,
				};
				invisibleLayouts.push(layout);
				if($.jBlocks.worker.supported)
					self.postMessage({
						cmd: "layout",
						args: {
							layout: layout,
							misfit: false,
						},
						jBlocksIndex: jBlocksIndex,
					});
				continue;
			}
			//$jBlocks("log","layoutData.rmk.rows",layoutData.rmk.rows,"layoutData.rmk.cols",layoutData.rmk.cols);
	
			var zones=BuildZones(block);
			
			//$jBlocks("log","zones",zones);
			var suitables=[];
			for(var zi=0; zi<zones.length; zi++) {
				var zone=zones[zi];
				if(block.w<=zone.w && block.h<=zone.h) {
					//$jBlocks("log","zone",zone);
					var suitable=true;
					for(var li=0;li<layouts.length && suitable;li++) {
						var layout=layouts[li];
		
						//$jBlocks("log","layout",layout,layout.r+layout.block.h<=zone.r,layout.r>=zone.r+zone.h,layout.c+layout.block.w<=zone.c,layout.c>=zone.c+zone.w);
						if(!(layout.r+layout.block.h<=zone.r || 
								layout.r>=zone.r+zone.h ||
								layout.c+layout.block.w<=zone.c || 
								layout.c>=zone.c+zone.w)) {
							//$jBlocks("log","Not suitable");
							suitable=false;
							break;
						}
					}
					if(suitable) {
						//$jBlocks("log","suitable",zone);
						suitables.push(zone);
					}
				}
			}
			
			//$jBlocks("log","suitablesMap",suitablesMap);
			
			//$jBlocks("log","suitables",suitables);

			var blockPref=block.pref;
			if(!block.pref || block.pref=="default")
				if(viewport.fixed=="height")
					blockPref="left top";
				else
					blockPref="top left";
			var suitableSortFn=null;
			function PrefTop(z1,z2) {
				return z1.r-z2.r;
			}
			function PrefLeft(z1,z2) {
				return z1.c-z2.c;
			}
			function PrefBottom(z1,z2) {
				if(z1.r<viewport.h && z2.r>=viewport.h)
					return -1;
				if(z2.r<viewport.h && z1.r>=viewport.h)
					return 1;
				return Math.abs(z1.r+z1.h-viewport.h)-Math.abs(z2.r+z2.h-viewport.h);
			}
			function PrefRight(z1,z2) {
				return Math.abs(z1.c+z1.w-viewport.w)-Math.abs(z2.c+z2.w-viewport.w);
			}
			function PrefArea(z1,z2) {
				return z1.w*z1.h-z2.w*z2.h;				
			}
			switch(blockPref) {
				case 'top right': suitableSortFn=function(z1,z2) {
					return PrefTop(z1,z2) || PrefRight(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'right top': suitableSortFn=function(z1,z2) {
					return PrefRight(z1,z2) || PrefTop(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'bottom left': suitableSortFn=function(z1,z2) {
					return PrefBottom(z1,z2) || PrefLeft(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'left bottom': suitableSortFn=function(z1,z2) {
					return PrefLeft(z1,z2) || PrefBottom(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'bottom right': suitableSortFn=function(z1,z2) {
					return PrefBottom(z1,z2) || PrefRight(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'right bottom': suitableSortFn=function(z1,z2) {
					return PrefRight(z1,z2) || PrefBottom(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'left top': suitableSortFn=function(z1,z2) {
					return PrefLeft(z1,z2) || PrefTop(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'top left': suitableSortFn=function(z1,z2) {
					return PrefTop(z1,z2) || PrefLeft(z1,z2) || PrefArea(z1,z2);
				};
				break;
				case 'center': suitableSortFn=function(z1,z2) {
					var z1w=Math.min(z1.c+z1.w,viewport.w)-z1.c;
					var z1h=Math.min(z1.r+z1.h,viewport.h)-z1.r;
					var z2w=Math.min(z2.c+z2.w,viewport.w)-z2.c;
					var z2h=Math.min(z2.r+z2.h,viewport.h)-z2.r;
					return z2w*z2h-z1w*z1h;				
				};
				break;
				default:
					$jBlocks("log","Unknown block.pref",block.pref);
			}
			suitables.sort(suitableSortFn);
			//$jBlocks("log","sorted suitables",block.id,suitables);
	
			if(suitables.length==0) {
				//$.jBlocks.worker.log("Cannot layout block",block.id,block,viewport);
				
				var relayoutCount=0;
				for(var i=layouts.length-1;i>=0;i--) {
					var layout=layouts[i];
					if(layout.block.importance<block.importance) {
						if($.jBlocks.worker.supported)
							self.postMessage({
								cmd: "layout",
								args: {
									layout: {
										block: layout.block,
									},
									misfit: true,
								},
								jBlocksIndex: jBlocksIndex,
							});
						layoutData.misfits[layout.block.id]=true;
						blocks.unshift(layout.block);
						layouts.splice(i,1);
						relayoutCount++;
					}
				}
				if(relayoutCount==0) {
					layoutData.misfits[block.id]=true;
					if($.jBlocks.worker.supported)
						self.postMessage({
							cmd: "layout",
							args: {
								layout: {
									block: block,
								},
								misfit: true,
							},
							jBlocksIndex: jBlocksIndex,
						});
				} else
					blocks.unshift(block);
			} else {
				var alignHoriz="left";
				var alignVert="top";
				if(block.pref) {
					if(block.pref.indexOf("right")>=0)
						alignHoriz="right";
					if(block.pref.indexOf("bottom")>=0)
						alignVert="bottom";
					if(block.pref.indexOf("center")>=0) {
						alignVert="center";
						alignHoriz="center";
					}
				}
				var zone=suitables[0];
				//$jBlocks("log","block",block,"alignHoriz",alignHoriz,"alignVert",alignVert,zone);
				var layout={
					r: alignVert=="top"?zone.r:zone.r+zone.h-block.h,
					c: alignHoriz=="left"?zone.c:zone.c+zone.w-block.w,
					h: block.h,
					w: block.w,
					block: block,
				};
				switch(alignVert) {
				case "top": layout.r=zone.r; break;
				case "bottom": layout.r=zone.r+zone.h-block.h; break;
				case "center": layout.r=zone.r+Math.floor((zone.h-block.h)/2); break;
				}
				switch(alignHoriz) {
				case "left": layout.c=zone.c; break;
				case "right": layout.c=zone.c+zone.w-block.w; break;
				case "center": layout.c=zone.c+Math.floor((zone.w-block.w)/2); break;
				}
				//$jBlocks("log","layout",layout);
				
				//if(!layoutData.rmk.rows[layout.r])
				//	$jBlocks("log","A adding row",layout.r);
				layoutData.rmk.rows[layout.r]=layout.r;
				//if(!layoutData.rmk.rows[layout.r+layout.block.h])
				//	$jBlocks("log","B adding row",layout.r+layout.block.h,layout);
				layoutData.rmk.rows[layout.r+layout.block.h]=layout.r+layout.block.h;
				layoutData.rmk.cols[layout.c]=layout.c;
				layoutData.rmk.cols[layout.c+layout.block.w]=layout.c+layout.block.w;
				delete layoutData.misfits[layout.block.id];
				if($.jBlocks.worker.supported)
					self.postMessage({
						cmd: "layout",
						args: {
							layout: layout,
							misfit: false,
						},
						jBlocksIndex: jBlocksIndex,
					});
				//$.jBlocks.worker.log("Available layout",layout);
				layouts.push(layout);
				
				if(frameSize.w<0 || layout.c+layout.block.w>frameSize.w)
					frameSize.w=layout.c+layout.block.w;
				if(frameSize.h<0 || layout.r+layout.block.h>frameSize.h)
					frameSize.h=layout.r+layout.block.h;
				
				//$jBlocks("log","layout",layout);
			}
		}
		viewport.frameSize=frameSize;
		
		//$jBlocks("log","frameSize",frameSize);
		//$jBlocks("log","layouts",layouts);
		
		layoutData.maxSize={
				w: 0,
				h: 0,
		};
		for(var li=0;li<layouts.length;li++) {
			var layout=layouts[li];
			if(layoutData.maxSize.h<layout.r+layout.h)
				layoutData.maxSize.h=layout.r+layout.h;
			if(layoutData.maxSize.w<layout.c+layout.w)
				layoutData.maxSize.w=layout.c+layout.w;
		}
	
		layoutData.rmk.rows={"0":0};
		layoutData.rmk.rows[viewport.h]=viewport.h;
		layoutData.rmk.cols={"0":0};
		layoutData.rmk.cols[viewport.w]=viewport.w;
		for(var li=0;li<layouts.length;li++) {
			var layout=layouts[li];
			layoutData.rmk.rows[layout.r]=layout.r;
			layoutData.rmk.rows[layout.r+layout.h]=layout.r+layout.h;
			layoutData.rmk.cols[layout.c]=layout.c;
			layoutData.rmk.cols[layout.c+layout.w]=layout.c+layout.w;
		}
		if(layoutData.maxSize.h>viewport.h)
			layoutData.rmk.rows[layoutData.maxSize.h-viewport.h]=layoutData.maxSize.h-viewport.h;
		if(layoutData.maxSize.w>viewport.w)
			layoutData.rmk.cols[layoutData.maxSize.w-viewport.w]=layoutData.maxSize.w-viewport.w;
	
		if(viewport.fillHoles) {
			var zones=BuildZones(null);
			zones.sort(function(z1,z2) {
				return z2.w*z2.h-z1.w*z1.h;
			});
			//$.jBlocks.worker.log("zones",zones);
			
			var modified=true;
			while(modified) {
				modified=false;
				for(var zi=0;zi<zones.length && !modified;zi++) {
					var zone=zones[zi];
					var empty=true;
					for(var li=0;li<layouts.length && empty;li++) {
						var layout=layouts[li];
						if(!(layout.r+layout.h<=zone.r || 
								layout.r>=zone.r+zone.h ||
								layout.c+layout.w<=zone.c || 
								layout.c>=zone.c+zone.w)) {
							//$jBlocks("log","Not suitable");
							empty=false;
							break;
						}
					}
//					if(zone.r+zone.h==viewport.h)
//						$.jBlocks.worker.log("empty zone",zone);

					if(empty && (zone.c+zone.w<=layoutData.maxSize.w || zone.c+zone.w<=viewport.w) && (zone.r+zone.h<=layoutData.maxSize.h || zone.r+zone.h<=viewport.h)) {
						//$.jBlocks.worker.log("empty zone",zone,"blocks",layouts.length);
						var candidates=[];
						for(var li=0;li<layouts.length;li++) {
							var layout=layouts[li];
							if(layoutData.misfits[layout.block.id])
								continue;
							if(layout.block.expandWidth>0 && layout.r>=zone.r && layout.r+layout.h<=zone.r+zone.h) {
								if(layout.c+layout.w==zone.c) {
									candidates.push({
										li: li,
										change: {
											w: layout.w+zone.w,
										},
										weight: "expandWidth",
									});
								}
								if(zone.c+zone.w==layout.c) {
									candidates.push({
										li: li,
										change: {
											c: layout.c-zone.w,
											w: layout.w+zone.w,
										},
										weight: "expandWidth",
									});
								}
							}
							if(layout.block.expandHeight>0 && layout.c>=zone.c && layout.c+layout.w<=zone.c+zone.w) {
								if(layout.r+layout.h==zone.r) {
									candidates.push({
										li: li,
										change: {
											h: layout.h+zone.h,
										},
										weight: "expandHeight",									
									});
								}
								if(zone.r+zone.h==layout.r) {
									candidates.push({
										li: li,
										change: {
											r: layout.r-zone.h,
											h: layout.h+zone.h,
										},
										weight: "expandHeight",									
									});
								}
							}
						}
						if(candidates.length>0) {
							//$.jBlocks.worker.log("candidates",candidates);
							modified=true;
							candidates.sort(function(l1,l2) {
								var v1=layouts[l1.li].block[l1.weight];
								var v2=layouts[l2.li].block[l2.weight];
								return v2-v1;
							});
							var candidate=candidates[0];
							var layout=layouts[candidate.li];
							$.jBlocks.worker.extend(layout,candidate.change);
							if($.jBlocks.worker.supported)
								self.postMessage({
									cmd: "layout",
									args: {
										layout: layout,
										misfit: false,
									},
									jBlocksIndex: jBlocksIndex,
								});
						}
					}
				}
			}
		}
		
		return layouts.concat(invisibleLayouts);
	},
}

if(self && typeof self.addEventListener=="function" /*&& typeof Worker!="undefined"*/) {
	self.addEventListener('message', function(e) {
		if(!e.data || !e.data.cmd)
			return; // iOS 4 has no worker available but trigger the message
		try {
			var data = e.data;
			switch (data.cmd) {
			case 'layout':
				//$.jBlocks.worker.log("Worker starting",data.args.blocks.length,"blocks");
				$.jBlocks.worker.supported=true;
				var layoutData={
					rmk: {
						rows: {},
						cols: {},
					},
					maxSize: {
						w: 1,
						h: 1,
					},
				}
				var layouts=$.jBlocks.worker.layout(data.args.blocks,data.args.viewport,layoutData,data.jBlocksIndex);
				//$.jBlocks.worker.log("Worker done",data.args.blocks.length,"blocks");
				self.postMessage({
					cmd: "layouts",
					args: {
						layouts: layouts,
						layoutData: layoutData,
						signature: data.args.signature,
					},
					jBlocksIndex: data.jBlocksIndex,
				});
				break;
			default:
				/*
				if(typeof data!="string") {
					if(typeof data.cmd=="undefined")
						$.jBlocks.worker.log("Unknown command: " + data.cmd);
				}
				*/
				// otherwise, don't do anything: strangely Persona sends messages to the worker. 
			};
		} catch(e) {
			$.jBlocks.worker.log("Error " + data.cmd + ": " + e);			
		}
	}, false);
}

