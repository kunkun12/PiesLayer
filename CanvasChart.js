require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "dojo/dom", "dojo/on", "dojo/dom-class", "esri/geometry/Point","esri/SpatialReference",
	"esri/graphic","esri/symbols/SimpleMarkerSymbol","esri/symbols/PictureMarkerSymbol","dojo/domReady!"],
	function(Map, ArcGISTiledMapServiceLayer, dom, on, domClass,Point,SpatialReference,Graphic,SimpleMarkerSymbol,PictureMarkerSymbol) {
		var map = new Map("map", {
			basemap: "topo",
			center: [100.69828872684525, 33.24237112174851], // long, lat
			zoom: 4,
			sliderStyle: "small"
		});
		var points = [{
			x: 11547228.141733509,
			y: 4641746.633916269,
			height:80,
			data: [{value: 30,color:"#F7464A"},{value : 50,color : "#E2EAE9"},{value : 100,color : "#D4CCC5"},{value : 40,color : "#949FB1"},{value : 120,color : "#4D5360"}]
		}, {
			height:100,
			x: 12408214.828337505,
			y: 4074278.1359272716,
			data: [{value: 30,color:"#F7464A"},{value : 10,color : "#E2EAE9"},{value : 180,color : "#D4CCC5"},{value : 20,color : "#949FB1"},{value : 120,color : "#4D5360"}]
		}, {height:120,
			x: 13083306.662152003,
			y: 3271995.087046275,
			data: [{value: 30,color:"#F7464A"},{value : 50,color : "#E2EAE9"},{value : 200,color : "#D4CCC5"},{value : 140,color : "#949FB1"},{value : 70,color : "#4D5360"}]
		}];

 on(map,'load',function(){
    var config = {
                        segmentShowStroke : true,
                        segmentStrokeColor : "#fff",
                        segmentStrokeWidth : 1      
                }; 	   
            points.forEach(function(pt,i){
            var pie= new Pie(pt.data,config,pt.height);            
			var pt=new Point(pt.x,pt.y,new SpatialReference({wkid:102100}));
			var sym1=new SimpleMarkerSymbol();           
            var imagedata=	pie.getImageData();
            var json={url:imagedata,"width":pie.height,"height":pie.height};        
		    var sym=new PictureMarkerSymbol(json)	        
			var graphic=new Graphic(pt,sym);
                graphic.haschart=true;
                graphic.pie=pie;
                graphic.selectedindex=-1;
				map.graphics.add(graphic); 		    		               
		})
            on(map.graphics,'mouse-move',function(e){
               if(e.graphic.haschart){
                var graphic=e.graphic;
                var mappt=e.mapPoint;                
                var y=mappt.y-graphic.geometry.y;
                var x=mappt.x-graphic.geometry.x;
                var pie=e.graphic.pie;
                if(e.graphic.selectedindex!=pie.getAreaIndex(y,x)){
                   e.graphic.selectedindex=pie.getAreaIndex(y,x);              
                   pie.drawpartial(pie.getAreaIndex(y,x));
                   var imagedata=pie.getImageData();
                   var json={url:imagedata,"width":pie.height,"height":pie.height};        
                   var sym=new PictureMarkerSymbol(json)     
                   graphic.setSymbol(sym)
                }              
               }
            })
})
		

	});
  function Pie(data,config,height){
    this.angles=[0];  
    this.base64data="";
    this.data=data;
    this.config=config;
    this.canvas=document.createElement('canvas');
    this.height=this.canvas.height=this.canvas.width=height;
    this.ctx=this.canvas.getContext('2d');
    this.pieRadius =Math.min(this.height/2,this.height/2)- 5; 
    this.segmentTotal=0;               
    for (var i=0; i<this.data.length; i++){
        this.segmentTotal += this.data[i].value;
    }; 
    for(var i=0; i<this.data.length; i++) {
     this.angles.push(this.angles[i]+(this.data[i].value/this.segmentTotal) * (Math.PI*2));
    }
    this.draw(-1);
}

Pie.prototype.getAreaIndex=function(y,x){
   var  angle=Math.atan2(y,x);
   console.log(angle);
       if(angle<0)angle=-angle;
       else{
        angle=Math.PI*2-angle;
       }
 if(angle>this.angles[this.angles.length-1]){
        return this.angles.length;
    }
    for(var i=1;i<this.angles.length;i++){
    if(angle<this.angles[i]){
      return i;
        }  
    }
}

Pie.prototype.getImageData=function(){
    return this.canvas.toDataURL("image/png");
}

Pie.prototype.updateImageData=function(data){

}
Pie.prototype.draw=function(exi){
                          var ctx=this.ctx;              
                           var cumulativeAngle = 0;                   
                        for (var i=0; i<this.data.length; i++){
                             // if(exi&&exi!=i+1
                             {
                                ctx.beginPath();
                                ctx.arc(this.height/2,this.height/2, this.pieRadius,this.angles[i],this.angles[i+1],false);//逆时针                               
                                ctx.lineTo(this.height/2,this.height/2);
                                ctx.closePath();
                                ctx.fillStyle = this.data[i].color;
                                ctx.fill();                              
                                if(this.config.segmentShowStroke){
                                        ctx.lineWidth = 2;
                                        ctx.stroke();
                                }          
                             }                                               
                        }   
                    }


Pie.prototype.drawpartial=function(i){
    var ctx=this.ctx;
      ctx.clearRect(0,0,this.height,this.height);
      this.draw();     
      ctx.beginPath()
      ctx.strokeStyle="#43ECE6";
      ctx.lineWidth = 2;
      ctx.arc(this.height/2,this.height/2, this.pieRadius,this.angles[i-1],this.angles[i],false);//逆时针
      ctx.lineTo(this.height/2,this.height/2);    
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle="#000000"
      // ctx.fillStyle ="#0000FF";
      // ctx.fill();      
}