define(["dojo/_base/declare", "esri/layers/GraphicsLayer", "esri/geometry/Point", "esri/SpatialReference",
  "esri/graphic", "esri/symbols/PictureMarkerSymbol","esri/geometry/webMercatorUtils","dojo/_base/lang"
], function(declare, GraphicsLayer, Point, SpatialReference,Graphic, PictureMarkerSymbol,webMercatorUtils,lang) {
  

  var Pie = function Pie(data, colorset, height,linecolor,selectedlinecolor) {
    this.angles = [];
    this.base64data = "";
    //  data:{'name1':30,'name2':40,'name3':50,'name4':60,'name5':70}
    this.data = data;
    this.linecolor=linecolor||"rgba(229, 205, 205, 0.78)";   
    this.selectedlinecolor=selectedlinecolor||"#0F66E9"; // format suchas  #FFFFFF rgba(229, 205, 205, 0.78) or color name
    this.config = colorset; //{'name1':"#F7464A",'name2':'#E2EAE9','name3':'#02EAF9','name4':'#D4CCC5','name5':'#D4CC00'}
    this.canvas = document.createElement('canvas');
    this.height= height;
    this.canvas.height= height;
    this.canvas.width = height;
    this.ctx = this.canvas.getContext('2d');
    this.pieRadius = height / 2 - 5;
    this.segmentTotal = 0;
    for (var i in data) {
      if(this.config.hasOwnProperty(i))
      this.segmentTotal += this.data[i];
    }
    console.log("segmentTotal"+this.segmentTotal);
    var startangle = 0
    for (var d in data) {
   if(this.config.hasOwnProperty(d)){
       this.angles.push({
        name: d,
        angle: startangle + (this.data[d] / this.segmentTotal) * (Math.PI * 2)
      });
      startangle = startangle + (this.data[d] / this.segmentTotal) * (Math.PI * 2);
   }
}
    this.draw(-1);
  }
   Pie.prototype.setPieRadius=function(r){
      this.height= r;
      this.canvas.height= r;
      this.canvas.width = r;
      this.pieRadius = r/2 - 5;
   }
  Pie.prototype.getAreaIndex = function(y, x) {
    var angle = Math.atan2(y, x);
    if (angle < 0) angle = -angle;
    else {
      angle = Math.PI * 2 - angle;
    }
    if (angle > this.angles[this.angles.length - 1]) {
      return this.angles.length - 1;
    }
    for (var i = 0; i < this.angles.length; i++) {
      if (angle < this.angles[i].angle) {
        return i;
      }
    }
  }
  Pie.prototype.getImageData = function() {
    return this.canvas.toDataURL("image/png");
  }
  Pie.prototype.updateImageData = function(data) {

  }
  Pie.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.height, this.height);
    var startAngle = 0;
    for (var i = 0; i < this.angles.length; i++) {
      {
        ctx.strokeStyle =this.linecolor; 
        ctx.beginPath();
        ctx.arc(this.height / 2, this.height / 2, this.pieRadius, startAngle, this.angles[i].angle, false);                                
        ctx.lineTo(this.height / 2, this.height / 2);
        ctx.closePath();
        ctx.fillStyle = this.config[this.angles[i].name];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        startAngle = this.angles[i].angle;
      }
    }
  }
  Pie.prototype.drawselected = function(i) {
    var ctx = this.ctx;    
    this.draw();
    ctx.beginPath()
    ctx.strokeStyle = this.selectedlinecolor;
    ctx.lineWidth = 2;
    if (i == 0) {
      ctx.arc(this.height / 2, this.height / 2, this.pieRadius, 0, this.angles[0].angle, false); 
    } else {
      ctx.arc(this.height / 2, this.height / 2, this.pieRadius, this.angles[i - 1].angle, this.angles[i].angle, false); //逆时针
    }
    ctx.lineTo(this.height / 2, this.height / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle =this.linecolor; 
  }


  return declare([GraphicsLayer], {
   
    constructor: function(options) {
     // r  Number?  
     //   Optional .the radius of the pie
     //colors  Object 
     //Required:the color set of the pie such as {'name1':"#F7464A",'name2':'#E2EAE9','name3':'#02EAF9','name4':'#D4CCC5','name5':'#D4CC00'}
     //linecolor String?
     //   Optional.: the borderline color of  the pie. Hex string or array of rgba values used as the color for cluster labels. Default value is 'rgba(229, 205, 205, 0.78)'.
     //selectedlinecolor String?
     //   Optional. the borderline color of  when the pie is selected .Hex string or array of rgba values used as the color for cluster labels. Default value is '"#0F66E9"'.
     //   data Object[]
     //    Array of objects. Required. Object are required to have properties named x, y and attributes. The x and y coordinates have to be numbers that represent a points coordinates
     //   spatialReference the spatialReference of the pielayer;  default value is Web Mercator coordinates
      this.colorConfig = options.colors;
      this.pieRadius = options.r;
      this.linecolor=options.linecolor||"rgba(229, 205, 205, 0.78)";   
      this.selectedlinecolor=options.selectedlinecolor||"#0F66E9"; 
      this.spatialReference=options.spatialReference|| new SpatialReference({wkid:102100});
      this.data=options.data||[];
    },
   _setMap: function(map, surface){
    
       if(this.data){
        this.data.forEach(lang.hitch(this,function(d){
                this.add(d);
        }));       
       }
       var div = this.inherited(arguments);
    return div;
    },
    //{x: 11547228.141733509,y:4641746.633916269,spatialReference:new SpatialReference({wkid:102100}),data:{'name1':30,'name2':40,'name3':50,'name4':60,'name5':70}};
    addpie: function(e) {
      //this.data.push(e);
      if (e.x && e.y && e.attributes) {
          var x,y,pt;

 if(e.x>-180&&e.x<180&&e.y>-90&&e.y<90){
         var normalizedVal = webMercatorUtils.lngLatToXY(e.x, e.y, true);
         x=normalizedVal[0];
         y=normalizedVal[1]
        }
        else
        {
          x=e.x;y=e.y;
        }
   
        pt = new Point(e.x,e.y, this.spatialReference);         
        var pie = new Pie(e.attributes, this.colorConfig, this.pieRadius + 5);
        var imagedata = pie.getImageData();
        var json = {
          url: imagedata,
          "width": pie.height,
          "height": pie.height
        };
        var sym = new PictureMarkerSymbol(json)
        var graphic = new Graphic(pt, sym,e.attributes);
        graphic.haschart = true;
        graphic.pie = pie;
        graphic.selectedindex = -1;
        //  this.inherited(graphic);
        this.add(graphic);
      }
    },
    add: function(p) {
      if (p.haschart) {
        this.inherited(arguments);
        this.onGraphicAdd(arguments);
        return;
      }
      this.addpie(p);
    },
    onGraphicAdd: function() {},
     _updatesymbol:function(e,unselected) {
      if (e.graphic.haschart) {
        var graphic = e.graphic;
        var mappt = e.mapPoint;
        var y = mappt.y - graphic.geometry.y;
        var x = mappt.x - graphic.geometry.x;
        var pie = e.graphic.pie;
        if (e.graphic.selectedindex != pie.getAreaIndex(y, x)) {
            e.graphic.selectedindex = pie.getAreaIndex(y, x);
            var sname=pie.angles[e.graphic.selectedindex].name;          
              e.slecetedata={};
              e.slecetedata[sname]=pie.data[sname];
              e.piedata=pie.data;               
              pie.drawselected(pie.getAreaIndex(y, x));      
          var imagedata = pie.getImageData();
          var json = {
            url: imagedata,
            "width": pie.height,
            "height": pie.height
          };
          var sym = new PictureMarkerSymbol(json)
          graphic.setSymbol(sym)
        }
      }
    },
   onClick: function(e) {
     this._updatesymbol(e);
      this._extenteventarg(e);
    },
    onMouseMove: function(e) {
       this._updatesymbol(e);
       this._extenteventarg(e);
    },
    onMouseOver: function(e) {
      this._updatesymbol(e);
      this._extenteventarg(e);
    },
    onMouseDown: function(e) {
        this._extenteventarg(e);
    },
    onMouseUp: function(e) {
         this._extenteventarg(e);
    },
    _extenteventarg:function(e){
     var pie = e.graphic.pie;
     if(e.graphic.selectedindex>=0){
       var sname=pie.angles[e.graphic.selectedindex].name;  
       e.slecetedata={};
       e.slecetedata[sname]=pie.data[sname];
       e.piedata=pie.data;  
     }      
    },
    setPieRadius:function(r){
            this.graphics.forEach(function(graphic,i){
              if(graphic.haschart)graphic.pie.setPieRadius(r)
      });
      this.graphics.forEach(function(graphic,i){
        if(graphic.haschart)graphic.pie.draw();
      });
    },
    onMouseOut: function(e) {
    if (e.graphic.haschart) {
        var graphic = e.graphic;       
        var pie = e.graphic.pie;  
              pie.draw();     
          var imagedata = pie.getImageData();
          var json = {
            url: imagedata,
            "width": pie.height,
            "height": pie.height
          };
          var sym = new PictureMarkerSymbol(json)
          graphic.setSymbol(sym)
          e.graphic.selectedindex=-1;
      }
      this._extenteventarg(e);
    }
  
  })
});
