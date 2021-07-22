import * as d3 from "d3";
import moment from 'moment';
import colors from './colors';
import {filter} from './App';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';
import {addCommas} from './HelperFunctions';

mapboxgl.accessToken = 'pk.eyJ1IjoiZ28taWZyYyIsImEiOiJjams3b2ZhZWswMGFvM3hxeHp2ZHFhOTRrIn0._pqO9OQ2iNeDGrpopJNjpg';
var mapboxStyle = 'mapbox://styles/go-ifrc/ckqrsg27f1cwu17pex8w2de2e';

let map;
let dots; 
let maxSize = 15; 
let mapTooltip;

export function createMap(data, options, filter) {

    d3.select('#map-refresh').attr('display', 'none').style('cursor', 'pointer')
    .on('click', function(d,i){
        map.setCenter([8, 22]);
        map.setZoom(0);
        d3.select('#map-refresh').attr('display', 'none');
    })
    
    map = new mapboxgl.Map({
        container: 'map_div', // container ID
        style: mapboxStyle, // style URL
        center: [8, 22], // starting position [lng, lat]
        preserveDrawingBuffer: true,
        zoom: 0 // starting zoom
    });

    map.setRenderWorldCopies(false);
    map.addControl(new mapboxgl.NavigationControl());
    
    // disable map zoom when using scroll
    map.scrollZoom.disable();

    map.on('zoom', function() {
        d3.select('#map_tooltip').attr('display', 'none');
        d3.select('#map-refresh').attr('display', 'inline');
    });

    map.on('touchmove', function() {
        d3.select('#map_tooltip').attr('display', 'none');
        d3.select('#map-refresh').attr('display', 'inline');
    });

    map.on('wheel', function() {
        d3.select('#map_tooltip').attr('display', 'none');
        d3.select('#map-refresh').attr('display', 'inline');
    });

    map.on('drag', function() {
        d3.select('#map_tooltip').attr('display', 'none');
        d3.select('#map-refresh').attr('display', 'inline');
    });

    var container = map.getCanvasContainer();

    var svg = d3
    .select(container)
    .append("svg")
    .attr('id', 'mapoverlay')
    .attr("width", "100%")
    .attr("height", "24vw")
    .style("position", "absolute")
    .style("z-index", 2);

    mapTooltip = d3.select('#map_tooltip').attr('opacity', 1).attr('transform', 'translate(0,0)').attr('display', 'inline');

    // dots = svg
    // .selectAll(".country-map")
    // .data(data.world)
    // .enter()
    // .append("circle")
    // .attr('class', 'country-map')
    // .attr('id', function(d,i){ return 'country-map-'+d.iso2 })
    // .attr("r", 0)
    

    // var maxValue = d3.max(data.country, function(d,i){
    //     return d[1].cumulative_cases;
    // })

    // var rScale = d3.scalePow().exponent(0.5)
    //   .domain([0, maxValue])
    //   .range([0, 15]);

    // data.country.forEach(function(d,i){
    //     d3.select('#country-'+d[0]).attr('r', rScale(d[1].cumulative_cases))
    //     .attr('data-name', d[1].country)
    // })
    
    d3.select("#map_div").append('svg')
    .attr('width', '18vw')
    .attr('height', '1.5vw')
    .attr('id', 'maplegend')
    .attr('viewBox', '-3 0 227 18')
    .style('background-color', 'rgba(255,255,255,0.8)')

    document.getElementById("maplegend").appendChild(d3.select('#red_legend').node());
    document.getElementById("maplegend").appendChild(d3.select('#blue_legend').node());
    document.getElementById("maplegend").appendChild(d3.select('#bi_legend').node());

    d3.select('#red_legend').attr('transform', 'translate(20,0)');
    d3.select('#blue_legend').attr('transform', 'translate(20,0)');
    d3.select('#bi_legend').attr('transform', 'translate(0,0)');

    d3.select('#bi_legend').attr('display', 'none');
    d3.select('#blue_legend').attr('display', 'none');

    document.getElementById("mapoverlay").appendChild(d3.select('#map_tooltip').node());
    mapTooltip.attr('display', 'none')  

    map.on('load', function (e) {

        map.setPaintProperty('countries', 'fill-opacity-transition', {duration: 0, delay: 0});

        updateMap(data, options) ;

    });

}

export function updateMap(data, options) {
   
    var duration = 800;
    var delay = 10;

    map.setLayoutProperty(
        'countries',
        'visibility',
        'none'
    );

    if(options.map_toggle == 'bi-weekly-change'){
        
        var maxIncrease = d3.max(data.country, function(d,i){
            return d.percent_change;
        })

        var maxDecrease = d3.min(data.country, function(d,i){
            return d.percent_change;
        })

        d3.select('#bi_legend').attr('display', 'inline');
        d3.select('#blue_legend').attr('display', 'none');
        d3.select('#red_legend').attr('display', 'none');

        maxIncrease = (Math.ceil(maxIncrease/0.1))*0.1;
        maxDecrease = (Math.floor(maxDecrease/0.1))*0.1;

        if(maxIncrease>1) maxIncrease = 1;
        if(maxDecrease<-1) maxDecrease = -1;

        d3.select('#bi_legend_dec_val').attr('text-anchor', 'end');
        if(maxIncrease<1){
            d3.select('#bi_legend_inc_val tspan').text(Math.round(maxIncrease*100)+'%');
        } else {
            d3.select('#bi_legend_inc_val tspan').text(Math.round(maxIncrease*100)+'% +');
        }
        if(maxDecrease>-1){
            d3.select('#bi_legend_dec_val tspan').text(Math.round(Math.abs(maxDecrease)*100)+'%').attr('dx', 14);
        } else {
            d3.select('#bi_legend_dec_val tspan').text(Math.round(Math.abs(maxDecrease)*100)+'% +').attr('dx', 14);
        }

        // var rScale = d3.scalePow().exponent(0.5)
        // .domain([-1, 0, 1])
        // .range([maxSize, 0, maxSize])
        // .clamp(true);

        // d3.selectAll('.country-map').transition('c').duration(duration/1.7).attr('r',0);

        // data.country.forEach(function(d,i){
        //     d3.select('#country-map-'+d[0])
        //     .transition('c').duration(duration).delay(delay)
        //     .attr('r', rScale(d[1].percent_change))
        //     .style('stroke', function(){
        //         // if(d[1].percent_change>1){ return '#E02225'} else { return '#1F558C'}
        //         return '#FFF'
        //     }).style('fill', function(){
        //         if(d[1].percent_change>0){ return colors.red } else { return colors.blue}
        //     })
        // })

        var colorScale = d3.scaleLinear()
        .domain([-1, 0, 1])
        // .domain([maxDecrease, 0, maxIncrease])
        .range([colors.blue, colors.lightgrey, colors.red])
        .clamp(true);

        var fillColorArray = ['case']
        data.country.forEach(function(d,i){
            if(isFinite(d.percent_change)){
                fillColorArray.push(['==', ['get', "iso"], d.country_code]);
                fillColorArray.push(colorScale(d.percent_change));
            }
        });

        if(fillColorArray.length>1){
            fillColorArray.push(colors.darkgrey)
            map.setPaintProperty(
                'countries', 
                'fill-color', fillColorArray
            );
        }
        
    }

    if(options.map_toggle == 'cases'){

        var maxValue = d3.max(data.country, function(d,i){
            return d.cumulative_cases_per_100k;
        });

        d3.select('#bi_legend').attr('display', 'none');
        d3.select('#blue_legend').attr('display', 'none');
        d3.select('#red_legend').attr('display', 'inline');

        d3.select('#red_legend_title tspan').text('Cases per 100k');

        if(maxValue>1000){
            maxValue = (Math.ceil(maxValue/100))*100;
        } else {
            maxValue = (Math.ceil(maxValue/10))*10;
        }

        d3.select('#red_legend_val tspan').text(addCommas(maxValue));

        // var rScale = d3.scalePow().exponent(0.5)
        // .domain([0, maxValue])
        // .range([0, maxSize]);

        // d3.selectAll('.country-map').transition('c').duration(duration/1.7).attr('r',0);

        // data.country.forEach(function(d,i){
        //     d3.select('#country-map-'+d[0])
        //     .transition('c').duration(duration).delay(delay)
        //     .attr('r', rScale(d[1].cumulative_cases))
        //     .style('fill', colors.red)
        //     .style('stroke', '#FFF');
        // })

        var colorScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([colors.lightred, colors.red]);

        var fillColorArray = ['case']
        data.country.forEach(function(d,i){
            fillColorArray.push(['==', ['get', "iso"], d.country_code]);
            fillColorArray.push(colorScale(d.cumulative_cases_per_100k));
        });

        if(fillColorArray.length>1){
            fillColorArray.push(colors.darkgrey)
            map.setPaintProperty(
                'countries', 
                'fill-color', fillColorArray
            );
        }

    }
    
    if(options.map_toggle == 'deaths'){

        var maxValue = d3.max(data.country, function(d,i){
            return d.cumulative_deaths_per_100k;
        })

        d3.select('#bi_legend').attr('display', 'none');
        d3.select('#blue_legend').attr('display', 'none');
        d3.select('#red_legend').attr('display', 'inline');

        d3.select('#red_legend_title tspan').text('Deaths per 100k');

        if(maxValue>1000){
            maxValue = (Math.ceil(maxValue/100))*100;
        } else {
            maxValue = (Math.ceil(maxValue/10))*10;
        }

        d3.select('#red_legend_val tspan').text(addCommas(maxValue));

        // var rScale = d3.scalePow().exponent(0.5)
        // .domain([0, maxValue])
        // .range([0, maxSize]);

        // d3.selectAll('.country-map').transition('c').duration(duration/1.7).attr('r',0);

        // data.country.forEach(function(d,i){
        //     d3.select('#country-map-'+d[0])
        //     .transition('c').duration(duration).delay(delay)
        //     .attr('r', rScale(d[1].cumulative_deaths))
        //     .style('fill', colors.red)
        //     .style('stroke', '#FFF');
        // })

        var colorScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([colors.lightred, colors.red]);

        var fillColorArray = ['case']

        data.country.forEach(function(d,i){
            fillColorArray.push(['==', ['get', "iso"], d.country_code]);
            fillColorArray.push(colorScale(d.cumulative_deaths_per_100k));
        });

        if(fillColorArray.length>1){
            fillColorArray.push(colors.darkgrey)
            map.setPaintProperty(
                'countries', 
                'fill-color', fillColorArray
            );
        }
    }

    if(options.map_toggle == 'percent-fully-vaccinated'){

        d3.select('#bi_legend').attr('display', 'none');
        d3.select('#blue_legend').attr('display', 'inline');
        d3.select('#red_legend').attr('display', 'none');
        d3.select('#blue_legend_title tspan').text('Percent fully vaccinated');
        d3.select('#blue_legend_val tspan').text('100%');

        // var rScale = d3.scalePow().exponent(0.55)
        // .domain([0, 1])
        // .range([1, maxSize])
        // .clamp(true);

        // d3.selectAll('.country-map').transition('c').duration(duration/1.7).attr('r',0);

        // data.vGroup.forEach(function(d,i){
        //     var peoplevaccinated = parseFloat(d[1][0].people_fully_vaccinated_per_hundred)/100;
        //     if(isNaN(peoplevaccinated)) peoplevaccinated = 0;
        //     d3.select('#country-map-'+d[1][0].country_code)
        //     .transition('c').duration(duration).delay(delay)
        //     .attr('r', rScale(peoplevaccinated))
        //     .style('stroke', '#FFF')
        //     .style('fill', function(){
        //         return colors.blue;
        //     })
        // })

        var colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([colors.lightblue, colors.blue])
        .clamp(true);

        var fillColorArray = ['case']
        data.country.forEach(function(d,i){
            var peoplevaccinated = parseFloat(d.people_fully_vaccinated_per_hundred)/100;
            if(isNaN(peoplevaccinated)) peoplevaccinated = 0;
            if(peoplevaccinated>0){
                if(d.country_code) fillColorArray.push(['==', ['get', "iso"], d.country_code]);
                if(d.country_code) fillColorArray.push(colorScale(peoplevaccinated));
            }
        });

        if(fillColorArray.length>1){
            fillColorArray.push(colors.darkgrey)
            map.setPaintProperty(
                'countries', 
                'fill-color', fillColorArray
            );
        } else {
            map.setPaintProperty(
                'countries', 
                'fill-color',
                colors.darkgrey
            );
        }
        
    }

    if(options.map_toggle == 'percent-vaccine-acceptance'){

        d3.select('#bi_legend').attr('display', 'none');
        d3.select('#blue_legend').attr('display', 'inline');
        d3.select('#red_legend').attr('display', 'none');
        d3.select('#blue_legend_title tspan').text('% vaccine acceptance');
        d3.select('#blue_legend_val tspan').text('100%');
        
        // var rScale = d3.scalePow().exponent(1)
        // .domain([0, 1])
        // .range([1, maxSize*.7])
        // // .clamp(true);

        // d3.selectAll('.country-map').transition('c').duration(duration/1.7).attr('r',0);

        // data.vGroup.forEach(function(d,i){
        //     var vaccine_acceptance_percent = parseFloat(d[1][0].vaccine_acceptance_percent/100);
            
        //     if(isNaN(vaccine_acceptance_percent)) vaccine_acceptance_percent = 0;

        //     d3.select('#country-map-'+d[1][0].country_code)
        //     .transition('c').duration(duration).delay(delay)
        //     .attr('r', rScale(vaccine_acceptance_percent))
        //     .style('stroke', '#FFF')
        //     .style('fill', function(){
        //         return colors.blue;
        //     })
        // })

        var colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([colors.lightblue, colors.blue])
        .clamp(true);

        var fillColorArray = ['case']
        data.country.forEach(function(d,i){
            var vaccine_acceptance_percent = parseFloat(d.vaccine_acceptance_percent)/100;
            if(isNaN(vaccine_acceptance_percent)) vaccine_acceptance_percent = 0;
            if(vaccine_acceptance_percent>0){
                if(d.country_code) fillColorArray.push(['==', ['get', "iso"], d.country_code]);
                if(d.country_code) fillColorArray.push(colorScale(vaccine_acceptance_percent));
            }
        });

        if(fillColorArray.length>1){
            fillColorArray.push(colors.darkgrey)
            map.setPaintProperty(
                'countries', 
                'fill-color', fillColorArray
            );
        } else {
            map.setPaintProperty(
                'countries', 
                'fill-color',
                colors.darkgrey
            );
        }

    }

    mapTooltip.attr('display', 'none')  

    map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point);
         
        var displayProperties = [
        'type',
        'properties',
        'id',
        'layer',
        'source',
        'sourceLayer',
        'state'
        ];
         
        if((features.length==1)&&(features[0].layer.id=='countries')){

            var id = features[0].properties.iso;
            var countryfiltered = data.equity_data.filter(d=>d.country_iso2 == id);
            var countryName;
            if(countryfiltered[0]) countryName = countryfiltered[0].country_name;
    
            mapTooltip.select('#map_tooltip_name tspan').text(countryName);
  
            if(mapTooltip.select('#map_tooltip_name tspan').text().length==0){
                mapTooltip
                .attr('display', 'none');
            };
            
            if(options.map_toggle=='cases'){
                var country = data.country.filter(d=>d.country_code == id)[0];
                if((!country)||(country.length==0)) return false;
                mapTooltip.select('#map_tooltip_val tspan').text(addCommas(Math.round(country.cumulative_cases_per_100k))+' cases per 100k');
            }
    
            if(options.map_toggle=='deaths'){
                var country = data.country.filter(d=>d.country_code == id)[0];
                if((!country)||(country.length==0)) return false;
                mapTooltip.select('#map_tooltip_val tspan').text(addCommas(Math.round(country.cumulative_deaths_per_100k))+' deaths per 100k');
            }
    
            if(options.map_toggle=='bi-weekly-change'){
                var country = data.country.filter(d=>d.country_code == id);
                if((!country)||(country.length==0)) return false;
                var val = ((country[0].percent_change)*100).toFixed(1);
                var str = '';
                if(val>=0){
                    str = '% increase';
                } else {
                    str = '% decrease';
                }
                mapTooltip.select('#map_tooltip_val tspan').text(Math.abs(val)+str);
            }
    
            if(options.map_toggle=='percent-fully-vaccinated'){
                var country = data.country.filter(d=>d.country_code == id);
                if((!country)||(country.length==0)) return false;
                var val = parseFloat(country[0].people_fully_vaccinated_per_hundred).toFixed(2)
                if(isNaN(val)||(val==0)){ val = '-' } else { val = val + '% fully vaccinated'}
                mapTooltip.select('#map_tooltip_val tspan').text(val);
            }
    
            if(options.map_toggle=='percent-vaccine-acceptance'){
                var country = data.country.filter(d=>d.country_code == id);
                if((!country)||(country.length==0)) return false;
                var val = parseFloat(country[0].vaccine_acceptance_percent).toFixed(2)
                if(isNaN(val)||(val==0)){ val = '-' } else { val = val + '% vaccine acceptance'}
                mapTooltip.select('#map_tooltip_val tspan').text(val);
            }
    
            var str = mapTooltip.select('#map_tooltip_val tspan').text();
            if(str.includes('NaN')) mapTooltip.attr('display', 'none')

            d3.select('#map_tooltip_bg').attr('width', 20)

            var scale = window.innerWidth/1329;
            mapTooltip
            .attr('display', 'inline')
            .attr('transform', 'translate('+(e.point.x+20)+','+e.point.y+')scale('+scale+')');
            var heightOffset = mapTooltip.node().getBBox();

            var bbox = d3.select('#map_tooltip').node().getBBox();
            d3.select('#map_tooltip_bg').attr('width', (parseFloat(bbox.width)+2))

            if(mapTooltip.select('#map_tooltip_name tspan').text().length==0){
                mapTooltip
                .attr('display', 'none');
            };

            // mapTooltip.attr('transform', 'translate('+(project(([d.lng, d.lat])).x+3)+','+(project(([d.lng, d.lat])).y+2-heightOffset.height/2)+')scale('+scale+')');
        } else {
            mapTooltip.attr('display', 'none')
        }
    }).on('mouseout', function(event){
        if(event.toElement=='tspan') return false;
        mapTooltip.attr('display', 'none');
    })


    // function render() {
    //     dots
    //       .attr("cx", function(d) {
    //         return project(([d.lng, d.lat])).x;
    //       })
    //       .attr("cy", function(d) {
    //         return project(([d.lng, d.lat])).y;
    //       });
    //   }

    // map.on("viewreset", render);
    // map.on("move", render);
    // map.on("moveend", render);
    // render(); // Call once to render

    // tooltips

    // var mapTooltip = d3.select('#map_tooltip').attr('opacity', 1).attr('transform', 'translate(0,0)').attr('display', 'none');

    // d3.selectAll('.country-map').on('mousemove', function(event, d){

    //     var id = d3.select(this).attr('id').substr(12,2);
    //     var countryfiltered = data.equity_data.filter(d=>d.country_iso2 == id);
    //     var countryName;
    //     if(countryfiltered[0]) countryName = countryfiltered[0].country_name;

    //     mapTooltip.select('#map_tooltip_name tspan').text(countryName);

    //     if(options.map_toggle=='cases'){
    //         var country = data.country.filter(d=>d.country_code == id)[0];
    //         if((!country)||(country.length==0)) return false;
    //         mapTooltip.select('#map_tooltip_val tspan').text(addCommas(country[1].cumulative_cases)+' cases');
    //     }

    //     if(options.map_toggle=='deaths'){
    //         var country = data.country.filter(d=>d.country_code == id)[0];
    //         if((!country)||(country.length==0)) return false;
    //         mapTooltip.select('#map_tooltip_val tspan').text(addCommas(country[1].cumulative_deaths)+' deaths');
    //     }

    //     if(options.map_toggle=='bi-weekly-change'){
    //         var country = data.country.filter(d=>d.country_code == id)[0];
    //         if((!country)||(country.length==0)) return false;
    //         var val = ((country[1].percent_change)*100).toFixed(1);
    //         var str = '';
    //         if(val>=0){
    //             str = '% increase';
    //         } else {
    //             str = '% decrease';
    //         }
    //         mapTooltip.select('#map_tooltip_val tspan').text(Math.abs(val)+str);
    //     }

    //     if(options.map_toggle=='percent-fully-vaccinated'){
    //         var country = data.vGroup.filter(d=>d[1][0].country_code == id)[0][1];
    //         if((!country)||(country.length==0)) return false;
    //         mapTooltip.select('#map_tooltip_val tspan').text(parseFloat(country[0].people_fully_vaccinated_per_hundred).toFixed(1)+'% fully vaccinated');
    //     }

    //     if(options.map_toggle=='percent-vaccine-acceptance'){
    //         var country = data.vGroup.filter(d=>d[1][0].country_code == id)[0][1];
    //         if((!country)||(country.length==0)) return false;
    //         mapTooltip.select('#map_tooltip_val tspan').text(parseFloat(country[0].vaccine_acceptance_percent).toFixed(1)+'% vaccine acceptance');
    //     }


    //     d3.select('#map_tooltip_bg').attr('width', 0)

    //     var bbox = mapTooltip.node().getBBox();
    //     d3.select('#map_tooltip_bg').attr('width', (parseFloat(bbox.width)+2))
    //     var scale = window.innerWidth/1329;
    //     mapTooltip
    //     .attr('display', 'inline')
    //     .attr('transform', 'translate('+project(([d.lng, d.lat])).x+','+project(([d.lng, d.lat])).y+')scale('+scale+')');

    //     var heightOffset = mapTooltip.node().getBBox();
    //     mapTooltip.attr('transform', 'translate('+(project(([d.lng, d.lat])).x+3)+','+(project(([d.lng, d.lat])).y+2-heightOffset.height/2)+')scale('+scale+')');

   

    map.setLayoutProperty(
        'countries',
        'visibility',
        'visible'
    );

}

// function project(d) {
//     return map.project(new mapboxgl.LngLat(d[0], d[1]));
// }

export default createMap;
