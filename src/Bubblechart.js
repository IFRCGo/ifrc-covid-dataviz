import * as d3 from "d3";
import moment from 'moment';
import colors from './colors';
import {addCommas, nFormatter} from './HelperFunctions';
import {filter} from './App';

let maxX =1000;
let maxY = 100;
let maxZ = 1000000;
let xScale; 
let yScale; 
let zScale; 
let groupedData = [];
let width = 600;
let height = 233;
let x = 35;
let y = 58;
let bubbles;

export function drawBubblechart(data, options, filter) {

    maxX = d3.max(data.country, function(d,i){
        return parseFloat(d.gni_2017);
    })

    maxY = d3.max(data.country, function(d,i){
        // if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return parseFloat(d.people_vaccinated_per_hundred);
        if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return 100;
        // if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return parseFloat(d.people_fully_vaccinated_per_hundred);
        if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return 100;
        if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') return 100;
    });

    maxZ = d3.max(data.country, function(d,i){
        return parseFloat(d.population);
    });

    xScale = d3.scaleLinear()
	.range([0, width])
	.domain([0, maxX]).nice();

    yScale = d3.scaleLinear()
	.range([height, 0])
	.domain([0, maxY]);

    zScale = d3.scaleSqrt()
    .domain([0, maxZ])
    .range([1, 20]);

    const svg = d3.select('#bubblechart-tab').append('g').attr('transform', 'translate('+x+', '+y+')')
    .attr('id', 'bubblechart');

    // create y-axis
    svg.append("g")
    .attr('id', 'bubbley')
    .call(d3.axisLeft(yScale).ticks(3).tickSize(3));

    // create x-axis
    svg.append("g")
    .attr('id', 'bubblex')
    .attr('class', 'xAxis')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale).ticks(4).tickSize(3));

    // Add dots
    bubbles = d3.select('#bubblechart').selectAll(".bubble")
    .data(data.country)
    .join(function(enter){
        enter.append("circle")
        .attr("class", function(d) { return "bubble" })
        .attr("cx", function (d) { return xScale(parseFloat(d.gni_2017)); } )
        .attr("cy", function (d) { 
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') return yScale(parseFloat(d.vaccine_acceptance_percent));
        })
        .attr("r", function (d) { return zScale(parseFloat(d.population)); } )
        .style("fill", function (d) { 
            if(options.bubble_chart_color_by == 'region') {
               if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            } 
            if(options.bubble_chart_color_by == 'hdi') {
                if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
             }
             if(options.bubble_chart_color_by == 'inform-severity') {
                if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
             }
            return  'transparent';
        })
        .style("stroke", function (d) { 
            // if(options.bubble_chart_color_by == 'region') {
            //    if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            // } 
            // if(options.bubble_chart_color_by == 'hdi') {
            //     if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
            //  }
            //  if(options.bubble_chart_color_by == 'inform-severity') {
            //     if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
            //  }
            // return  'transparent';
            return '#FFF';
        })
        .style("stroke-width", 1)
        // .style("fill-opacity", 0.8)
        .attr('display', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 'none'
            return 'inline';
        })
        .attr('opacity', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 0;
            return 1;
        })
    }, function(update){
        update.transition().duration(800).attr("cx", function (d) { return xScale(parseFloat(d.gni_2017)); } )
        .attr("cy", function (d) { 
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') return yScale(parseFloat(d.vaccine_acceptance_percent));
        })
        .attr("r", function (d) { return zScale(parseFloat(d.population)); } )
        .style("fill", function (d) { 
            if(options.bubble_chart_color_by == 'region') {
               if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            } 
            if(options.bubble_chart_color_by == 'hdi') {
                if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
             }
             if(options.bubble_chart_color_by == 'inform-severity') {
                if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
             }
            return  'transparent';
        })
        .style("stroke", function (d) { 
            // if(options.bubble_chart_color_by == 'region') {
            //    if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            // } 
            // if(options.bubble_chart_color_by == 'hdi') {
            //     if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
            //  }
            //  if(options.bubble_chart_color_by == 'inform-severity') {
            //     if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
            //  }
            // return  'transparent';
            return '#FFF';
        }).attr('display', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 'none'
            return 'inline';
        })
        .attr('opacity', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 0;
            return 1;
        })
    },function(exit){
        exit.remove();
    });

    d3.select('#bubblechart').selectAll(".bubble").on('mousemove', function(event, d){
        d3.select('#bubbleSelectContainer').style('z-index', 1);
        d3.select('#bubblechart_tooltip_title tspan').text(d.country_name);
        if(options.bubble_chart_y_axis=='percent-vaccinated-at-least-1-dose'){
            d3.select('#bubblechart_tooltip_label tspan').text('% vaccinated at least 1 dose');
            d3.select('#bubblechart_tooltip_value tspan').text(parseFloat(d.people_vaccinated_per_hundred)+'%')
            .attr("text-anchor", "end").attr('dx', 37)
        }
        if(options.bubble_chart_y_axis=='percent-fully-vaccinated'){
            d3.select('#bubblechart_tooltip_label tspan').text('% fully vaccinated');
            d3.select('#bubblechart_tooltip_value tspan').text(parseFloat(d.people_fully_vaccinated_per_hundred)+'%')
            .attr("text-anchor", "end").attr('dx', 37)
        }
        if(options.bubble_chart_y_axis=='percent-vaccine-acceptance'){
            d3.select('#bubblechart_tooltip_label tspan').text('% vaccine acceptance');
            d3.select('#bubblechart_tooltip_value tspan').text(parseFloat((d.vaccine_acceptance_percent)).toFixed(2)+'%')
            .attr("text-anchor", "end").attr('dx', 37)
        }
        d3.select('#bubblechart_tooltip_gni tspan').text('$'+addCommas(Math.round(parseFloat(d.gni_2017)))).attr("text-anchor", "end").attr('dx', 37)
        d3.select('#bubblechart_tooltip_population tspan').text(nFormatter(Math.round(parseInt(d.population)))).attr("text-anchor", "end").attr('dx', 37)

        var coords = d3.pointer( event, (d3.select('#svg').node()));
        if(coords[0]<1110){
            d3.select('#bubblechart_tooltip').attr('transform', 'translate('+(coords[0]+20)+','+(coords[1]+y-90)+')').attr('display', 'inline');
            d3.select('#bubblechart_tooltip_arrow_left').attr('display', 'inline');
            d3.select('#bubblechart_tooltip_arrow_right').attr('display', 'none');
        } else {
            d3.select('#bubblechart_tooltip').attr('transform', 'translate('+(coords[0]-220)+','+(coords[1]+y-90)+')').attr('display', 'inline');
            d3.select('#bubblechart_tooltip_arrow_left').attr('display', 'none');
            d3.select('#bubblechart_tooltip_arrow_right').attr('display', 'inline');
        }
        d3.selectAll(".bubble").attr('opacity', 0.4);
        d3.select(this).attr('opacity', 1).style('stroke-width', 2);
    }).on('mouseout', function(event){
        if(event.toElement=='tspan') return false;
        d3.select('#bubbleSelectContainer').style('z-index', 2);

        // mapTooltip.attr('display', 'none');
        d3.select('#bubblechart_tooltip').attr('display', 'none');
        d3.selectAll(".bubble").attr('opacity', 1).style('stroke-width', 1);
    });

    d3.select('#bubblechart_tooltip').attr('display', 'none');

    d3.select('#bubble_y_axis_label').attr('text-anchor', 'middle').select('tspan').attr('dx', 50);
    if(options.bubble_chart_y_axis=='percent-vaccinated-at-least-1-dose'){
        d3.select('#bubble_y_axis_label tspan').text('% vaccinated at least 1 dose');
    }
    if(options.bubble_chart_y_axis=='percent-fully-vaccinated'){
        d3.select('#bubble_y_axis_label tspan').text('% fully vaccinated');
    }
    if(options.bubble_chart_y_axis=='percent-vaccine-acceptance'){
        d3.select('#bubble_y_axis_label tspan').text('% vaccine acceptance');
    }


}

export function updateBubblechart(data,options,filter) {
    
    maxX = d3.max(data.country, function(d,i){
        return parseFloat(d.gni_2017);
    })

    maxY = d3.max(data.country, function(d,i){
        if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return parseFloat(d.people_vaccinated_per_hundred);
        if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return parseFloat(d.people_fully_vaccinated_per_hundred);
        if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') return parseFloat(d.vaccine_acceptance_percent);
    });

    maxZ = d3.max(data.country, function(d,i){
        return parseFloat(d.population);
    });

    xScale = d3.scaleLinear()
	.range([0, width])
	.domain([0, maxX]);

    yScale = d3.scaleLinear()
	.range([height, 0])
	.domain([0, maxY]);

    zScale = d3.scaleSqrt()
    .domain([0, maxZ])
    .range([1, 20]);

    const svg = d3.select('#bubblechart');

    // create y-axis
    svg.select('#bubbley')
    .transition().duration(800)
    .call(d3.axisLeft(yScale).ticks(3));

    // create x-axis
    svg.select('#bubblex')
    .transition().duration(800)
    .call(d3.axisBottom(xScale).ticks(3));

    bubbles = d3.select('#bubblechart').selectAll(".bubble")
    .data(data.country)
    .join(function(enter){
        enter.append("circle")
        .attr("cx", function (d) { return xScale(maxX)})
        .attr("cy", function (d) { return yScale(maxY)})
        .attr("class", function(d) { return "bubble" })
        .transition().duration(800)
        .attr("cx", function (d) { return xScale(parseFloat(d.gni_2017)); } )
        .attr("cy", function (d) { 
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') return yScale(parseFloat(d.vaccine_acceptance_percent));
        })
        .attr("r", function (d) { return zScale(parseFloat(d.population)); } )
        .style("fill", function (d) { 
            if(options.bubble_chart_color_by == 'region') {
               if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            } 
            if(options.bubble_chart_color_by == 'hdi') {
                if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
             }
             if(options.bubble_chart_color_by == 'inform-severity') {
                if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
             }
            return  'transparent';
        })
        .style("stroke", function (d) { 
            // if(options.bubble_chart_color_by == 'region') {
            //    if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            // } 
            // if(options.bubble_chart_color_by == 'hdi') {
            //     if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
            //  }
            //  if(options.bubble_chart_color_by == 'inform-severity') {
            //     if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
            //  }
            // return  'transparent';
            return '#FFF';
        })
        .style("stroke-width", 1)
        // .style("fill-opacity", 0.8)
        .attr('display', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 'none'
            return 'inline';
        })
        .attr('opacity', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 0;
            return 1;
        })
    }, function(update){
        update
        .attr('display', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 'none'
            if(yScale.invert(val)==0) return 'none';
            return 'inline';
        }).attr('opacity', function(d,i){
            var val = 0;
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') val = yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') val = yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') val = yScale(parseFloat(d.vaccine_acceptance_percent));
            if(isNaN(val))return 0;
            return 1;
        })
        .style("fill", function (d) { 
            if(options.bubble_chart_color_by == 'region') {
               if(colors.regions[d.ifrc_region]) return colors.regions[d.ifrc_region];
            } 
            if(options.bubble_chart_color_by == 'hdi') {
                if(colors.hdi_category[d.hdi_category]) return colors.hdi_category[d.hdi_category];
             }
             if(options.bubble_chart_color_by == 'inform-severity') {
                if(colors.inform_severity[d.inform_severity]) return colors.inform_severity[d.inform_severity];
             }
            return  'transparent';
        })
        .transition().duration(800).attr("cx", function (d) { return xScale(parseFloat(d.gni_2017)); } )
        .attr("cy", function (d) { 
            if(options.bubble_chart_y_axis == 'percent-vaccinated-at-least-1-dose') return yScale(parseFloat(d.people_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-fully-vaccinated') return yScale(parseFloat(d.people_fully_vaccinated_per_hundred));
            if(options.bubble_chart_y_axis == 'percent-vaccine-acceptance') return yScale(parseFloat(d.vaccine_acceptance_percent));
        })
        .attr("r", function (d) { return zScale(parseFloat(d.population)); } )
        
        
    },function(exit){
        exit.remove();
    });

    d3.select('#bubblechart').selectAll(".bubble").on('mousemove', function(event, d){
        d3.select('#bubbleSelectContainer').style('z-index', 1);
        d3.select('#bubblechart_tooltip_title tspan').text(d.country_name);
        if(options.bubble_chart_y_axis=='percent-vaccinated-at-least-1-dose'){
            d3.select('#bubblechart_tooltip_label tspan').text('% vaccinated at least 1 dose');
            d3.select('#bubblechart_tooltip_value tspan').text(parseFloat(d.people_vaccinated_per_hundred)+'%')
            .attr("text-anchor", "end").attr('dx', 37)
        }
        if(options.bubble_chart_y_axis=='percent-fully-vaccinated'){
            d3.select('#bubblechart_tooltip_label tspan').text('% fully vaccinated');
            d3.select('#bubblechart_tooltip_value tspan').text(parseFloat(d.people_fully_vaccinated_per_hundred)+'%')
            .attr("text-anchor", "end").attr('dx', 37)
        }
        if(options.bubble_chart_y_axis=='percent-vaccine-acceptance'){
            d3.select('#bubblechart_tooltip_label tspan').text('% vaccine acceptance');
            d3.select('#bubblechart_tooltip_value tspan').text(parseFloat((d.vaccine_acceptance_percent)).toFixed(2)+'%')
            .attr("text-anchor", "end").attr('dx', 37)
        }
        d3.select('#bubblechart_tooltip_gni tspan').text('$'+addCommas(Math.round(parseFloat(d.gni_2017)))).attr("text-anchor", "end").attr('dx', 37)
        d3.select('#bubblechart_tooltip_population tspan').text(nFormatter(Math.round(parseInt(d.population)))).attr("text-anchor", "end").attr('dx', 37)
        var coords = d3.pointer( event, (d3.select('#svg').node()));
        if(coords[0]<1110){
            d3.select('#bubblechart_tooltip').attr('transform', 'translate('+(coords[0]+20)+','+(coords[1]+y-90)+')').attr('display', 'inline');
            d3.select('#bubblechart_tooltip_arrow_left').attr('display', 'inline');
            d3.select('#bubblechart_tooltip_arrow_right').attr('display', 'none');
        } else {
            d3.select('#bubblechart_tooltip').attr('transform', 'translate('+(coords[0]-220)+','+(coords[1]+y-90)+')').attr('display', 'inline');
            d3.select('#bubblechart_tooltip_arrow_left').attr('display', 'none');
            d3.select('#bubblechart_tooltip_arrow_right').attr('display', 'inline');
        }
        d3.selectAll(".bubble").attr('opacity', 0.4);
        d3.select(this).attr('opacity', 1).style('stroke-width', 2);
    }).on('mouseout', function(event){
        if(event.toElement=='tspan') return false;
        d3.select('#bubbleSelectContainer').style('z-index', 2);

        // mapTooltip.attr('display', 'none');
        d3.select('#bubblechart_tooltip').attr('display', 'none');
        d3.selectAll(".bubble").attr('opacity', 1).style('stroke-width', 1);
    });

    if(options.bubble_chart_y_axis=='percent-vaccinated-at-least-1-dose'){
        d3.select('#bubble_y_axis_label tspan').text('% vaccinated at least 1 dose');
    }
    if(options.bubble_chart_y_axis=='percent-fully-vaccinated'){
        d3.select('#bubble_y_axis_label tspan').text('% fully vaccinated');
    }
    if(options.bubble_chart_y_axis=='percent-vaccine-acceptance'){
        d3.select('#bubble_y_axis_label tspan').text('% vaccine acceptance');
    }
    
    


}

export default drawBubblechart;
