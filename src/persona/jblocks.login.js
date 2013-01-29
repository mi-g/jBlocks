$.jBlocks("defineBlockClass","Persona","IFrame",{
	init: function() {
		this._super.apply(this,arguments);
		$.extend(this.options,{
			src: "/jblocks/login/persona",
			onLogin: function() {},
			onLogout: function() {},
		});
	},
	onCreate: function() {
		this._super();
		var $this=this;
		/*
		$(document).bind("jblocks.logincreate",function() {
			$this.maximize({back:false});
		});
		$(document).bind("jblocks.logincancel",function() {
			$this.unMaximize();
		});
		*/

	},
});

$.jBlocks("defineBlockClass","PersonaBox","JBlock",{
	init: function() {
		this._super.apply(this,arguments);
		$.extend(this.layout,{
			expandHeight:0,
			expandWidth: 0.1,
		});
		this.highlight();
	},
	onCreate: function() {
		this._super();
		var $this=this;
		
		this.userBox=this.selfJBlocks.addNewBlock("Text",{
			w: 1,
			h: 1,
			expandHeight: 0,
			visible: false, 
		},{
			verticalAlign: true,
			blockContentClass: "jblocks-logged-as",
		});

		this.selfJBlocks.addNewBlock("Persona",{
			w: 1,
			h: 2,
			pref: "left bottom",
		},{});
		
		$(document).bind("jblocks.logincreate",function() {
			//alert("logincreate");
			$this.options.w=function(vp) { return vp.w; };
			$this.options.h=function(vp) { return vp.h; };
			$this.focus();
			$this.jBlocks.checkLayout();			
		});
		$(document).bind("jblocks.logincancel",function() {
			delete $this.options.w;
			delete $this.options.h;
			$this.jBlocks.checkLayout();			
		});

		$(document).bind("jblocks.login",function(event,user) {
			$this.unhighlight();
			$this.userBox.textVal($this.t("logged-as",{"@name":user.name}));
			$this.userBox.layout.visible=true;
			$this.options.onLogin.call($this,user);
			$this.selfJBlocks.checkLayout();
			$this.jBlocks.checkLayout();
		});
		$(document).bind("jblocks.logout",function(event) {
			$this.highlight();
			$this.userBox.layout.visible=false;
			$this.options.onLogout.call($this);
			$this.selfJBlocks.checkLayout();
			$this.jBlocks.checkLayout();
		});
	},
	highlight: function() {
		$.extend(this.layout,{
			priority: 1200,
			w: 4,
			h: 2,
			pref: "top right",
		});
	},
	unhighlight: function() {
		$.extend(this.layout,{
			priority: 0,
			w: 4,
			h: 3,
			pref: "bottom right",
		});
	},
});

