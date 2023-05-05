
var algs = ['prb', 'nerad', 'ref']
console.log(algs.length)

// set the dimensions and margins of the graph
var margin = { w: 30, h: 60 },
    width = 360,
    n = algs.length,
    height = 360;


var folder = 'data/csv/'
var prbs = ['direct', 'prb-2', 'prb-4', 'prb-10', 'prb-15', 'prb-30']

var nerads = ['nerad', 'nerad-2', 'nerad-4']
var nerads_path = ['1', '2', '4']


var names = {
    "#prb": prbs,
    "#nerad": nerads,
};

var labels = {
    "#prb": ['Direct Illumination', 'PRB-2 bounces', 'PRB-4 bounces', 'PRB-10 bounces', 'PRB-15 bounces', 'PRB-30 bounces'],
    "#nerad": ['Ours-1 bounce', 'Ours-2 bounces', 'Ours-4 bounces'],
    "#ref": ['Reference'],
};


var svgs = d3.select('#Bias').selectAll('svg')
    .data(algs)
    .enter()
    .append("svg")
    .attr("width", width + 2 * margin.w)
    .attr("height", height + 2 * margin.h)
    .attr("transform",
        "translate(" + margin.w + "," + 0 + ")");


svgs.append('g')
    .attr("id", function (d) { return d })
    .attr("transform",
        "translate(" + margin.w*1.4 + "," +  margin.h + ")");

svgs.append('svg')
    .attr('width', width*1.5)
    .attr('height', 100)
    .append('g')
    .attr("id", function (d) { return d + "slide" })
    .attr("transform",
        "translate(" + margin.w*4.5 + "," +  margin.h / 3 + ")");




myfunc('#prb', folder + prbs[0] + '.csv', labels['#prb'][0])
myfunc('#nerad', folder + nerads[0] + '.csv', labels['#nerad'][0])
myfunc('#ref', folder + 'reference.csv', labels['#ref'][0])


function myfunc(name, path, label, update = false) {
    //Read the data

    d3.csv(path, function (data) {
        this_svg = d3.select(name)


        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        var myGroups = d3.map(data, function (d) { return d.target; }).keys()
        var myVars = myGroups
        ticks = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
          
        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([0, width])
            .domain(myGroups)
            .padding(0.00);

        x_axis = d3.axisBottom(x)
        x_axis.tickValues(ticks)
        this_svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis)

        // Build X scales and axis:
        var y = d3.scaleBand()
            .range([height, 0])
            .domain(myVars)
            .padding(0.00);
        y_axis = d3.axisLeft(y)
        y_axis.tickValues(ticks)
        this_svg.append("g")
            .call(y_axis);
        // Build color scale
        var myColor = d3.scaleLinear()
            .domain([-0.004, 0.0, 0.004])
            .range(["#b40326", "rgba(0,0,0,0)", "#3a4cc0"])


        // create a tooltip
        var tooltip = d3.select('body')
            .append("div")
            .attr('style', 'position: absolute; opacity: 0;')
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 0.8)
        }
        var mousemove = function (d) {
            tooltip
                .style('left', (d3.event.pageX + 20) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px')
                .html("Current roughness: " + d.current + "<br> Target roughness: " + d.target + "<br> Gradient: " + d.value)
        }
        var mouseleave = function (d) {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 1)
        }

        if (update) {
            this_svg.selectAll('rect')
                .data(data, function (d) { return d.target + ':' + d.current; })
                .style("fill", function (d) { return myColor(d.value) });

            this_svg.select(name + 'text')
                    .text(label);

        } else {
            // add the squares
            this_svg.selectAll()
                .data(data, function (d) { return d.target + ':' + d.current; })
                .enter()
                .append("rect")
                .attr("x", function (d) { return x(d.target) })
                .attr("y", function (d) { return y(d.current) })
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) { return myColor(d.value) })
                .style("opacity", 1)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);

            this_svg.append("text")
                .attr('id', name.substring(1) + 'text')
                .attr("x", '42%')
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .style("font-size", "22px")
                .text(label);

            this_svg.append("text")
                .attr("x", '43%')
                .attr("y", height+ margin.h/3*2)
                .style("font-size", "16px")
                .text('Target Roguhness')
                .attr("text-anchor", "middle");


            this_svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", -margin.h/3*2+10)
                .style("font-size", "16px")
                .text('Current Roguhness');

            if (name != '#ref') {
                var slider = d3
                    .sliderHorizontal()
                    .min(0)
                    .max(names[name].length - 1)
                    .step(1)
                    .width(width/2)
                    .displayValue(false)
                    .tickValues([])
                    .on('onchange', (val) => {
                        myfunc(name, folder + names[name][val] + '.csv', labels[name][val], true)
                    });

                d3.select(name + 'slide').call(slider);
            }



        }
    })

}
