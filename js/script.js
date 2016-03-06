var tr;
var selected;
var groupsSelection, tbody;
var groups;
var width = 800,
    height = 600;
var svg_map = d3.select("#map").append("svg").attr({width: width, height: height});
var projection = d3.geo.mercator().center([27.9, 53.7]).scale(4000)
                    .translate([330, 300]);
var path = d3.geo.path().projection(projection);
var color = d3.scale.quantize()
              .range(['rgb(255,255,178)','rgb(254,204,92)','rgb(253,141,60)','rgb(227,26,28)']);
var formatter = d3.format(",.1f"),
    formatter2 = d3.format(",.f");

var calenderScale = d3.scale.ordinal()
                      .domain(["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"])
                      .rangePoints([30, width - 30]);
            
var months = d3.scale.ordinal()
                      .domain(["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"])
                      .rangeRoundBands([11]);
function setTableMonth(d) {
    var tableMonths = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];
    d3.select("#tablemonth").text(tableMonths[d]);
}
                      
var month = calenderScale.domain().length - 1;

function appendMonth(d) {
  d3.select("#month").text(months(d));
}

appendMonth(month);

var sliderAxis = d3.svg.axis().scale(calenderScale).orient("bottom")
                    .ticks(calenderScale.domain().length);

d3.select("#scale").append("svg")
      .attr({width: width, height: height / 6})
      .append("g").attr("class", "x axis")
      .attr("transform", "translate(0, 3)")
      .call(sliderAxis);

var stepper = width / (calenderScale.domain().length - 1);


function selectData(datum) {
  if (datum.period == month) {
    return datum;
  }
}

function selectSvodka(datum) {
  if ((datum.rajon == "Всего") || (datum.rajon == "Минск")) {
    return datum;
  }
}

function convertTitleCase(title) {
    var firstChar = title
}

setTableMonth(month);

var xScale;

var slider = d3.slider().min(0).max(width).step(width / (calenderScale.domain().length - 1));
d3.select("#slider").call(slider.value(width));

d3.json("data/rajony.geojson", function(karta) {
  d3.csv("data/regiony.csv", function(data) {
    d3.csv("data/goroda.csv", function(goroda) {
    
    
    d3.csv("data/vidy.csv", function(groups) {

    // Таблица
        groups = groups;
        
        tableSelection = groups.filter(function(d) { if ((d.period == month) && (d.subgroup != "Всего")) { return d; }; } );
        tableSelected = tableSelection.sort(function(a, b) { return d3.descending(parseInt(a['amount']), parseInt(b['amount'])); }).slice(0, 10);
        
        
        var table = d3.select("#table");
        var thead = table.append("thead")
			.style("background-color", 'rgb(254,204,92)')
			.style("color", "black");
        tbody = table.append("tbody");
        
        thead.append("tr").selectAll("th")
	    .data(["Вид", "Зарплата, руб."])
	    .enter().append("td")
	    .text(function(d) { return d; });
        
        tr = tbody.selectAll("tr")
		.data(tableSelected)
    
        tr.enter().append("tr").style('background-color', function (d, i) { return i%2 ? 'white' : 'rgb(255,255,178)'; });;

        
        var tds = tr.selectAll("td");
	tds.data(function(d) { var alist = []; alist.push(d.subgroup.toUpperCase(), formatter2(d.amount)); return alist }).enter().append("td").text(function(d) { return d; });


	var selection = data.filter(selectData).sort(function(a, b) {
	return d3.ascending(parseInt(a.amount), parseInt(b.amount))});
	selected = selection;
   
    var svodka = d3.select("#svodka").append("svg").attr({width: width, height: 340});
    var svodkaSelection = selection.filter(selectSvodka)
    
    
    var min = selection[0], max = selection[selection.length - 1];
    max.max = "max";
    min.min = "min";
    svodkaSelection.push(min, max);
    
    svodkaSelection.sort(function(a, b) {
    return d3.ascending(parseInt(a.amount), parseInt(b.amount))});;
    
    var yScale = d3.scale.ordinal()
    .domain(d3.range(svodkaSelection.length))
        .rangeRoundBands([height / 2, 0], .2);
        
	xScale = d3.scale.linear()
				.domain([0,
                      d3.max(svodkaSelection, function(d) { return d.amount; })])
                      .range([0, 400]);
    
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left")
            .tickFormat(function(d) {
            var values = svodkaSelection;
            return values[d].title;
              });
    var minMaxScale = d3.scale.ordinal()
                        .domain(d3.range(10))
                        .rangeRoundBands([height / 2, 0], .2);
    var minMaxAxis = d3.svg.axis()
                      .scale(minMaxScale).orient("right")
                      //.tickValues([0, 9])
                      .tickFormat(function(d) {
                        var values = {"0": "Минимум", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "Максимум"}
                        return values[d];
                          });

        
    svodka.selectAll("rect").data(svodkaSelection).enter().append("rect").attr({
    x: 180,
    y: function(d, i) {return yScale(i)},
    width: function(d) {return xScale(d.amount)},
    height: yScale.rangeBand(),
    fill: function(d) { if ((d.max) || (d.min)) { return 'rgb(227,26,28)'; } else { return "rgb(253,141,60)" } },
    title: function(d) { return d.amount; }
    })
    svodka.selectAll("text").data(svodkaSelection).enter().append("text")
    .text(function(d) {return d.amount})
    .attr({
        x: function(d) {return xScale(d.amount) + 110; },
        y: function(d, i) {return yScale(i) + yScale.rangeBand() / 2 + 5},
        fill: "white" 
        });

    svodka.append("g").attr("class", "y axis").attr("transform", "translate(180, 0)").call(yAxis);
    svodka.append("g").attr("class", "x axis").attr("transform", "translate(180, 300)").call(xAxis); 
    
    svodka.append("g").attr("class", "minMax axis").attr("transform", "translate(670, 0)").call(minMaxAxis); 

    color.domain([d3.min(selection, function(d) { return parseInt(d.amount) }),
                  d3.max(selection, function(d) { return parseInt(d.amount) })]);
    
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
                                    return color(parseInt(d.properties.amount));
                                  } else {
                                    return "black"
                                    }
                                  })
              .on("mouseover", function(d) {
                    var xPos = d3.event.pageX + "px";
                    var yPos = d3.event.pageY + "px";
                    d3.select("#tooltip")
                      .style("left", xPos)
                      .style("top", yPos)
                      .classed("hidden", false);
                    d3.select("#rajon")
                      .text(d.properties.rajon + " район" );
                    
                      d3.select("#amount")
                      .text("Зарплата: " + d.properties.amount + " тыс. руб.");
            })
                    .on("mouseout", function(d) {
                      d3.select("#tooltip")
                        .classed("hidden", true)
                      });
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
                selection = data.filter(selectData).sort(function(a, b) { 
        return d3.ascending(parseInt(a.amount), parseInt(b.amount))})

            svodkaSelection = selection.filter(selectSvodka)
            var min = selection[0], max = selection[selection.length - 1];
            max.max = "max";
            min.min = "min";
            svodkaSelection.push(min, max);
            svodkaSelection.sort(function(a, b) {
            return d3.ascending(parseInt(a.amount), parseInt(b.amount))});;
            
            yScale.domain(d3.range(svodkaSelection.length));
            
          xScale.domain([0, d3.max(svodkaSelection, function(d) { return d.amount; })]);

            svodka.selectAll("rect").data(svodkaSelection).transition().duration(500).attr({
            x: 180,
            y: function(d, i) {return yScale(i)},
            width: function(d) {return xScale(d.amount)},
            height: yScale.rangeBand(),
            fill: function(d) { if ((d.max) || (d.min)) { return 'rgb(227,26,28)'; } else { return 'rgb(253,141,60)' } },
            title: function(d) { return d.amount; }
            });
            svodka.selectAll("text").data(svodkaSelection).transition().duration(500)
            .text(function(d) {return d.amount})
            .attr({
                x: function(d) {return xScale(d.amount) + 110; },
                y: function(d, i) {return yScale(i) + yScale.rangeBand() / 2 + 5},
                fill: "white" 
                });

            svodka.select(".y.axis").transition().duration(500).call(yAxis);
            svodka.select(".x.axis").transition().duration(500).call(xAxis); 
              
            color.domain([d3.min(selection, function(d) { return parseInt(d.amount) }),
                          d3.max(selection, function(d) { return parseInt(d.amount) })]);
                
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
                                                return color(parseInt(d.properties.amount));
                                              } else {
                                                return "black"
                                                }
                                              });
            
            svg_map.selectAll("path")
                  .data(karta.features)
              .on("mouseover", function(d) {
                            var xPos = d3.event.pageX + "px";
                            var yPos = d3.event.pageY + "px";
                            d3.select("#tooltip")
                              .style("left", xPos)
                              .style("top", yPos)
                              .classed("hidden", false);
                            d3.select("#rajon")
                              .text(d.properties.rajon + " район" );
                            
                              d3.select("#amount")
                              .text("Зарплата: " + d.properties.amount + " тыс. руб.");
                    })
                            .on("mouseout", function(d) {
                              d3.select("#tooltip")
                                .classed("hidden", true)
                              });
                  
                  cities.transition()
                  .duration(500)
                  .attr("fill", function(d) { 
                              var colorCircle;
                                        for (var q = 0; q < selection.length; q++) {
                                          if (d.city == selection[q].rajon) {
                                              colorCircle = color(parseInt(selection[q].amount));
                                              d.amount = selection[q].amount;
                                            } else {
                                              continue;
                                          };
                                        };
                                        return colorCircle;
                                        });
                                               
                cities.on("mouseover", function(d) {
                            var xPos = d3.event.pageX + "px";
                            var yPos = d3.event.pageY + "px";
                            d3.select("#tooltip")
                              .style("left", xPos)
                              .style("top", yPos)
                              .classed("hidden", false);
                            d3.select("#rajon")
                              .text(d.city);
                            
                              d3.select("#amount") 
                              .text("Зарплата: " + d.amount + " тыс. руб.");
                    })
                            .on("mouseout", function(d) {
                              d3.select("#tooltip")
                                .classed("hidden", true)
                              });
                  
                  legend.selectAll("text")
                    .data(color.range())
                    .transition()
                    .duration(500)
                    .text(function(d) { return "<" + " " + formatter(d3.max(color.invertExtent(d), function(d) { return d; })); });
            
                   var tableSelection = groups.filter(function(d) { if ((d.period == month) && (d.subgroup != "Всего")) { return d; }; } );
            

            tableSelected = tableSelection.sort(function(a, b) { return d3.descending(parseInt(a['amount']), parseInt(b['amount'])); }).slice(0, 10);
	    
	    var newTableSelection = [];
	    for (var i = 0; i < tableSelected.length; i++) {
		newTableSelection.push([tableSelected[i].subgroup, tableSelected[i].amount]);
	    };
	    tr.data(tableSelected);
	    tr.selectAll("td").data(function(d) { var alist = []; alist.push(d.subgroup.toUpperCase(), formatter2(d.amount)); return alist })
		    .transition()
		    .duration(500)
		    .text(function(d) { return d; });

	    setTableMonth(month);
  
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
                                });
        cities.on("mouseover", function(d) {
                    var xPos = d3.event.pageX + "px";
                    var yPos = d3.event.pageY + "px";
                    d3.select("#tooltip")
                      .style("left", xPos)
                      .style("top", yPos)
                      .classed("hidden", false);
                    d3.select("#rajon")
                      .text(d.city );
                    
                      d3.select("#amount")
                      .text("Зарплата: " + d.amount + " тыс. руб.");
            })
                    .on("mouseout", function(d) {
                      d3.select("#tooltip")
                        .classed("hidden", true)
                      });
    });
});
  });
});
