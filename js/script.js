var width = 800,
    height = 600;
var svg_map = d3.select("#map").append("svg").attr({width: width, height: height});
var projection = d3.geo.mercator().center([27.9, 53.7]).scale(4000)
                    .translate([330, 300]);
var path = d3.geo.path().projection(projection);
var color = d3.scale.quantize()
              .range(['rgb(255,255,178)','rgb(254,204,92)','rgb(253,141,60)','rgb(227,26,28)']);
var formatter = d3.format(",.1f")

// Минимум - d3.max(color.invertExtent("rgb(254,204,92)"), function(d) { return Math.round(d); });

//var calenderScale = d3.time.scale().domain([new Date("2015-01-01"), new Date("2015-04-30")])
                      //.rangeRound([20, width - 20])
                      //.nice(d3.time.month,)
                      //.clamp(true);

var calenderScale = d3.scale.ordinal()
                      .domain(["Январь", "Февраль", "Март", "Апрель"])
                      .rangePoints([30, width - 30]);
                      
var month = calenderScale.domain().length - 1;

var sliderAxis = d3.svg.axis().scale(calenderScale).orient("bottom")
                    //.tickValues(calenderScale.domain())
                    .ticks(3);

d3.select("#scale").append("svg")
      .attr({width: width, height: height / 6})
      .append("g").attr("class", "x axis")
      .attr("transform", "translate(0, 3)")
      .call(sliderAxis);
// 'Январь', 'Февраль', 'Март', 'Апрель'



var stepper = width / (calenderScale.domain().length - 1);


function selectData(datum) {
  if (datum.period == month) {
    return datum;
  }
}

var slider = d3.slider().min(0).max(width).step(width / 3);
d3.select("#slider").call(slider.value(width));

d3.json("data/rajony.geojson", function(karta) {
  d3.json("data/data.json", function(data) {
    d3.csv("data/goroda.csv", function(goroda) {
    var selection = data.filter(selectData);
    color.domain([d3.min(selection, function(d) { return d.amount }),
                  d3.max(selection, function(d) { return d.amount })]);
    
    for (var i = 0; i < selection.length; i++ ) {
      for (var j = 0; j < karta.features.length; j++) {
        if (selection[i].rajon == karta.features[j].properties.rajon) {
          karta.features[j].properties.amount = selection[i].amount;
          break;
        }
      }
    };
    
    
    svg_map.selectAll("path")
      .data(karta.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(d) { if (d.properties.amount) {
                                    return color(d.properties.amount);
                                  } else {
                                    return "black"
                                    }
                                  })
      .attr("title", function(d) { return d.properties.rajon + " район, " + formatter(d.properties.amount) });
      
      // Легенда
      var legend = svg_map.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(20, 20)");
      legend.selectAll("rect")
            .data(color.range())
            .enter()
            .append("rect")
            .attr({ x: 10,
                    y: function(d, i) { return i * 20; },
                    width: 15,
                    height: 15,
                    fill: function(d) { return d; },
                    stroke: "black"
                  });
      legend.selectAll("text")
            .data(color.range())
            .enter()
            .append("text")
            .text(function(d) { return "<" + " " + formatter(d3.max(color.invertExtent(d), function(d) { return d; })); })
            .attr({
                x: 30,
                y: function(d, i) { return (i * 20) + 12; }
            });
      
        slider.on("slide", function(evt, value) {
        month = Math.round(value / stepper);
        selection = data.filter(selectData)
        
        color.domain([d3.min(selection, function(d) { return d.amount }),
                  d3.max(selection, function(d) { return d.amount })]);
        
        for (var i = 0; i < selection.length; i++ ) {
          for (var j = 0; j < karta.features.length; j++) {
            if (selection[i].rajon == karta.features[j].properties.rajon) {
              karta.features[j].properties.amount = selection[i].amount;
              break;
            }
          }
        };
    
    
        svg_map.selectAll("path")
          .data(karta.features)
          .transition()
          .duration(500)
          .attr("fill", function(d) { if (d.properties.amount) {
                                        return color(d.properties.amount);
                                      } else {
                                        return "black"
                                        }
                                      })
          .attr("title", function(d) { return d.properties.rajon + " район, " + formatter(d.properties.amount) });
          
          cities.transition()
          .duration(500)
          .attr("fill", function(d) { 
                      var colorCircle;
                                for (var q = 0; q < selection.length; q++) {
                                  if (d.city == selection[q].rajon) {
                                      colorCircle = color(selection[q].amount);
                                      d.amount = selection[q].amount;
                                    } else {
                                      continue;
                                  };
                                };
                                return colorCircle;
                                })               
                       .attr("title", function(d) { return d.city + ", " + formatter(d.amount) });
          
          legend.selectAll("text")
            .data(color.range())
            .transition()
            .duration(500)
            .text(function(d) { return "<" + " " + formatter(d3.max(color.invertExtent(d), function(d) { return d; })); });
  
  });
  
  var cities = svg_map.selectAll("circle")
                          .data(goroda);
                    
                    
                    cities.enter()
                       .append("circle")
                       .attr("class", "city")
                       .attr("cx", function(d) {
                         return projection([d.lon, d.lat])[0];
                       })
                       .attr("cy", function(d) {
                         return projection([d.lon, d.lat])[1];
                       })
                       .attr("r", function(d) {
                         if (d.city == "Минск") {
                           return 10;
                         } else {
                           return 8;
                         };})
                       .attr("fill", function(d) { 
                                var colorCircle;
                                for (var q = 0; q < selection.length; q++) {
                                  if (d.city == selection[q].rajon) {
                                      colorCircle = color(selection[q].amount);
                                      d.amount = selection[q].amount;
                                    } else {
                                      continue;
                                  };
                                };
                                return colorCircle;
                                })               
                       .attr("title", function(d) { return d.city + ", " + formatter(d.amount) });
});
  });
});
