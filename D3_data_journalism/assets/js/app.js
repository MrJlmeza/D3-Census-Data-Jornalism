// SVG container dimensions
var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 4;

// wrapper margins
var margin = 20;
var labelArea = 110;
var tPadBot = 40;
var tPadLeft = 40;

// Scatter plot
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// circle radius for each data point
var circRadius;
function defineRadius() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
defineRadius();

//nest bottom axes labels using group element.
svg.append("g").attr("class", "xText");

// xText will allows us to select the group without excess code.
var xText = d3.select(".xText");

function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

// xText X axis
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

//Y Axis same process as with xText
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

//Import csv
d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

//Establish Scatter plot function
function visualize(theData) {
  //Default x and y axes 
  var curX = "poverty";
  var curY = "obesity";

  var xMin;
  var xMax;
  var yMin;
  var yMax;

  //Tooltip
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      var theX;      
      var theState = "<div>" + d.state + "</div>";      
      var theY = "<div>" + curY + ": " + d[curY] + "%</div>";     
      
      if (curX === "poverty") {        
        theX = "<div>" + curX + ": " + d[curX] + "%</div>";
      }
      else {        
        theX = "<div>" +
          curX +
          ": " +
          parseFloat(d[curX]).toLocaleString("en") +
          "</div>";
      }      
      return theState + theX + theY;
    });
  svg.call(toolTip);

  
  //min and max for x
  function xMinMax() {    
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });
    
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  //min and max for y
  function yMinMax() {
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    yMax = d3.max(theData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  //Labels
  function labeler(axis, clickedText) {
    //active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);
    //clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  //fill Scatter
  xMinMax();
  yMinMax();

  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);


  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  //x and y ticks
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  //Append x and y axis to SVG
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  //group circles
  var theCircles = svg.selectAll("g theCircles").data(theData).enter();

  theCircles
    .append("circle")
    //location, size, class.
    .attr("cx", function(d) {
      return xScale(d[curX]);
    })
    .attr("cy", function(d) {
      return yScale(d[curY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    //event
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });

  //Circle labels
  theCircles
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xScale(d[curX]);
    })
    .attr("dy", function(d) {
      return yScale(d[curY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  //--------Dynamic------- 
  
  d3.selectAll(".aText").on("click", function() {
    
    var self = d3.select(this);

    if (self.classed("inactive")) {
      
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      if (axis === "x") {
        curX = name;
        xMinMax();
        xScale.domain([xMin, xMax]);

        svg.select(".xAxis").transition().duration(350).call(xAxis);

        //update location of state circles
        d3.selectAll("circle").each(function() {
          
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[curX]);
            })
            .duration(350);
        });

        //change location of state text
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[curX]);
            })
            .duration(350);
        });

        //change classes of last active label clicked label.
        labelChange(axis, self);
      }
      else {
        curY = name;
        yMinMax();
       //update y domain.
        yScale.domain([yMin, yMax]);
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        //update circles location
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[curY]);
            })
            .duration(300);
        });

        //location change for state text
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[curY]) + circRadius / 3;
            })
            .duration(300);
        });

        //changes classes of last active and clicked
        labelChange(axis, self);
      }
    }
  });

  //MOBILE
  d3.select(window).on("resize", resize);

  function resize() {
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 4;
    leftTextY = (height + labelArea) / 2 - labelArea;
    svg.attr("width", width).attr("height", height);

    //adjust x/yscales
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    //Update ticks
    tickCount();

    //Update labels.
    xTextRefresh();
    yTextRefresh();

    //Update circle radius
    defineRadius;

    //update location and radius of the state circles
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[curY]);
      })
      .attr("cx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", function() {
        return circRadius;
      });

    //update location and size of state texts
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[curY]) + circRadius / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", circRadius / 3);
  }
}
