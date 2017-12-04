define(["jquery",'qlik', "text!./style.css", "./d3.v3.min","/extensions/stackedGrouped/d3Utils.js"], 
	function($,qlik, cssContent) {
    $("<style>").html(cssContent).appendTo("head");
    return {
        initialProperties: {
            version: 1.1,
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 15,
                    qHeight: 200
                }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 1,
                    max: 2
                },
                measures: {
                    uses: "measures",
                    min: 1,
                    max: 5
				},
                sorting: {
                    uses: "sorting"
                },
                settings: {
                    uses: "settings"
                }
            }
        },
        snapshot: {
            canTakeSnapshot: true
        },
		
		
paint: function($element, layout) {

// Get the data from the hypercube
var qData = layout.qHyperCube.qDataPages[0];
var qMatrix = qData.qMatrix;
var numDims = layout.qHyperCube.qDimensionInfo.length;
var numMsrs = layout.qHyperCube.qMeasureInfo.length;
var measures = layout.qHyperCube.qMeasureInfo;
var app = qlik.currApp();
var d3Obj = d3;

window.measures = measures;

var JsonData = utilsData.createData(qMatrix,numDims,measures);
data = JsonData;
			
			
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = $element.width() - margin.left - margin.right,
    height = $element.height() - margin.top - margin.bottom;
 
var x0 = d3Obj.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);
 
var x1 = d3Obj.scale.ordinal();
 
var y = d3Obj.scale.linear()
    .range([height, 0]);
 
var xAxis = d3Obj.svg.axis()
    .scale(x0)
    .orient("bottom");
 
var yAxis = d3Obj.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3Obj.format(".2s"));
 
var color = d3Obj.scale.ordinal()
    .range(["#C31411","#E49C2E","#E3560E", "#7D0302", "#7b6888", "#a05d56", "#ff8c00"]);
	
var legColor =  d3Obj.scale.ordinal()
    .range(["#E49C2E","#C31411","#E3560E"]);
	
	var id = "container_" + layout.qInfo.qId;
	// Check to see if the chart element has already been created
   	if (document.getElementById(id)) {
    // if it has been created, empty it's contents so we can redraw it
		  $("#" + id).empty();
		  } else {
		  // if it hasn't been created, create it with the appropiate id and size
		  $element.append($('<div />').attr("id", id).attr("class","divbullet").width(width).height(height));
        }
var div = d3Obj.select("body").append("div")	
  .attr("class", "tooltipDendo")				
  .style("opacity", 0);
 
var svg = d3Obj.select("#" + id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (margin.left + 30) + "," + margin.top + ")");
 
var yBegin;
var columnHeaders = d3Obj.keys(data[0]).filter(function(key) { return key !== "dimVal"; });

var innerColumns = {};
var colArrCtr = 0;
for(var i =1; i <= 2; i++){
	var j = 0;
	var arrCtr = 0;

	var colArray = [];
	for(; j < numMsrs; j++){
		colArray[arrCtr++] = columnHeaders[colArrCtr++];
	}
	innerColumns["column" + i] = colArray;
}

  
  color.domain(d3Obj.keys(data[0]).filter(function(key) { return key !== "dimVal"; }));
  data.forEach(function(d) {
    var yColumn = new Array();
    d.columnDetails = columnHeaders.map(function(name) {
      for (ic in innerColumns) {
        if($.inArray(name, innerColumns[ic]) >= 0){
          if (!yColumn[ic]){
            yColumn[ic] = 0;
          }
          yBegin = yColumn[ic];
          yColumn[ic] += +d[name];
          return {name: name, column: ic, yBegin: yBegin, yEnd: +d[name] + yBegin,};
        }
      }
    });
    d.total = d3Obj.max(d.columnDetails, function(d) { 
      return d.yEnd; 
    });
  });
 
  x0.domain(data.map(function(d) { return d.dimVal; }));
  x1.domain(d3Obj.keys(innerColumns)).rangeRoundBands([0, x0.rangeBand()]);
 
  y.domain([0, d3Obj.max(data, function(d) { 
    return d.total; 
  })]);
 
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
	  
 
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".7em")
      .style("text-anchor", "end")
      .text("");
 
  var project_stackedbar = svg.selectAll(".project_stackedbar")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.dimVal) + ",0)"; });
 
  project_stackedbar.selectAll("rect")
      .data(function(d) { return d.columnDetails; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { 
        return x1(d.column);
         })
      .attr("y", function(d) { 
        return y(d.yEnd); 
      })
	   .attr("height", function(d) { 
        return y(d.yBegin) - y(d.yEnd); 
      })
      .style("fill", function(d) { return color(d.name.split("-")[1])})
	  .style("stroke", "black")
	  .style("opacity", 0.7)
	  .on("mouseover", function(d) {
	  		var msrVal = d.yEnd - d.yBegin;
			if((msrVal / 1000000) > 1)
				msrVal = (msrVal / 1000000).toFixed(1) + "M";
			div.transition()        
			.duration(200)      
			.style("opacity", .9)
			div.html("<br/> " + d.name + " : " + msrVal)
			//div.html("<br/>  Digi Spend: " + spend + "<br>" + "  Trad Spend: " + maco)
			.style("left", (d3Obj.event.pageX) + "px")    //Set X  
			.style("top", (d3Obj.event.pageY) + "px"); 
		})
	 .on("mouseout", function(d) {		
		div.transition()		
		.duration(500)		
		.style("opacity", 0)
	});
     
	  
	  svg.selectAll("text.rect")
     .data(data,function(d) { return d.columnDetails; })
    	.enter().append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .attr("x", function(d) { 
        return x1(d.column);
         })
      .attr("y", function(d) { 
        return y(d.yEnd); 
      })
      .text(function(d) { return ""; });
	 
	  
 
 var measureLegends = [];
 for(var i = 0; i < numMsrs; i++){
	measureLegends.push(measures[i].qFallbackTitle);
 }
  var legend = svg.selectAll(".legend")
      .data(measureLegends.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
 
  legend.append("rect")
      .attr("x", width - 70)
      .attr("width", 10)
      .attr("height", 15)
      .style("fill",legColor);
 
  legend.append("text")
      .attr("x", width - 15)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
	  

        }, //paint function end
		
		resize:function($el,layout){
          //do nothing when user resizes the chart
		   this.paint($el,layout);
        }
		
    };
}
);
