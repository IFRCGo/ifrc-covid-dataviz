import * as d3 from "d3";
import moment from 'moment';
import colors from './colors';
import {addCommas} from './HelperFunctions';
import {filter} from './App';

let maxCases;
let maxDeaths;
let maxVaccinations;
let xScaleCases; 
let xScaleDeaths;
let xScaleVaccines;
let labelWidth; 
const margin = { left: 20, top: 0, right: 58 };
let rcSize; 
let groupedData = [];

export function drawRegionchart(data, options, filter) {

    const barSpacing = 0.1;

    // reset region values to zero
    data.regions.forEach(function(d,i){
        d.population = 0;
        d.cumulative_deaths = 0;
        d.cumulative_cases = 0;
        d.cumulative_vaccines = 0;
    })

    // loop through countries and calculate region totals
    data.country.forEach(function(d,i){
        data.regions.forEach(function(dd,ii){
            if((dd.code==d.ifrc_region)){ 
                if((d.population>0)&&(d.who_daily_latest)){
                    if(d.who_daily_latest.cumulative_cases>0)
                    dd.cumulative_cases += d.who_daily_latest.cumulative_cases;
                    if(d.who_daily_latest.cumulative_deaths>0)
                    dd.cumulative_deaths += d.who_daily_latest.cumulative_deaths||0;
                    dd.population += d.population;
                }
                if((d.population>0)&&(d.vaccine_daily_latest)){
                    dd.cumulative_vaccines += (d.vaccine_daily_latest.total_vaccinations)||0;
                }
            }
        });
    });

    // calculate regions per 100k values using total population for each region
    data.regions.forEach(function(d,i){
        d.cumulative_cases_per_100k = d.cumulative_cases/(d.population/100000)
        d.cumulative_deaths_per_100k = d.cumulative_deaths/(d.population/100000);
        d.cumulative_vaccines_per_100k = d.cumulative_vaccines/(d.population/100000);
        if(!isFinite(d.cumulative_cases_per_100k)) d.cumulative_cases_per_100k = 0;
        if(!isFinite(d.cumulative_deaths_per_100k)) d.cumulative_deaths_per_100k = 0;
        if(!isFinite(d.cumulative_vaccines_per_100k)) d.cumulative_vaccines_per_100k = 0;
    })

    // get maximum values for each series
    if(options.region_switch=='per100'){
        // get maximum values for each series
        maxVaccinations = d3.max(data.regions, function(d,i){
            return d.cumulative_vaccines_per_100k;
        })

        maxCases = d3.max(data.regions, function(d,i){
            return d.cumulative_cases_per_100k;
        })

        maxDeaths = d3.max(data.regions, function(d,i){
            return d.cumulative_deaths_per_100k;
        });
    } else {
         // get maximum values for each series
         maxVaccinations = d3.max(data.regions, function(d,i){
            return d.cumulative_vaccines;
        })

        maxCases = d3.max(data.regions, function(d,i){
            return d.cumulative_cases;
        })

        maxDeaths = d3.max(data.regions, function(d,i){
            return d.cumulative_deaths;
        });
    }

    // append region chart container
    const regionChartContainer = d3.select('#layout #region_chart_container').attr('opacity', 0);

    // get dimensions
    rcSize = {
        x: regionChartContainer.attr('x'), y: regionChartContainer.attr('y'), width: regionChartContainer.attr('width'), height: regionChartContainer.attr('height')
    }

    // create svg container
    const svg = d3.select('#layout').append('g').attr('transform', 'translate('+rcSize.x+', '+rcSize.y+')')
    .attr('id', 'region_chart');

    // calculate chart row height
	var rowHeight = rcSize.height/(data.regions.length-1); // remove OTH

    // create rows
    var rows = svg.selectAll('.bar-row')
	.data(data.regions.filter(d=>d.code!=='OTH'))
	.enter()
	.append('g')
	.attr('class', 'bar-row')
	.attr('transform', function(d,i){
		return 'translate(0,' + ((i*rowHeight) + margin.top) + ')';
	});

    // create region labels
    var label = rows.append('text')
	.attr('y', rowHeight/2 )
    .attr('x', margin.left-5)
	.attr('class', function(d,i){ return 'bar-labels bar-label-'+d.code })
	.style('alignment-baseline', 'middle')
	.style('font-size', '11px')
    .attr('opacity', 1)
	.attr('fill', '#000')
	.text(function(d,i){
		if(d.code==='AM') return 'Americas';
		if(d.code==='EU') return 'Europe';
		if(d.code==='AF') return 'Africa';
		if(d.code==='ME') return 'Middle East and North Africa';
		if(d.code==='AP') return 'Asia-Pacific';
	}).style('text-anchor', 'end');

    // get label node width for use in scale
    labelWidth = rows.node().getBBox().width + margin.left;
	label.attr('x', labelWidth+89);
	labelWidth = labelWidth + 94;
    d3.selectAll('.timeBar').attr('opacity',1);
    
    // create fading background click area
    var rowBg = rows.append('rect')
	.attr('y', 0)
	.attr('x', 0)
	.attr('width', labelWidth)
	.attr('height', rowHeight-2)
	.style('opacity', 0)
    .attr('fill', 'grey')
	.style('cursor', 'pointer')
	.attr('class', function(d,i){ return 'bar-bg-'+d.code })
	.attr('data-id', function(d,i){ return d.code })
	.on('mouseover', function(d){
		d3.select(this).style('opacity', 0.1);
	})
	.on('mouseout', function(){
		d3.select(this).style('opacity', 0);
	})
	.on('click', function(d,i){
        var t = d3.select(this).attr('data-id');
        filter([t],'regionchart');
    });

    // define scales
    xScaleCases = d3.scaleLinear()
	.range([0, rcSize.width - margin.right - labelWidth])
	.domain([0, maxCases]);

    xScaleDeaths = d3.scaleLinear()
	.range([0, rcSize.width - margin.right - labelWidth])
	.domain([0, maxDeaths]);

    xScaleVaccines = d3.scaleLinear()
	.range([labelWidth, rcSize.width - margin.right - labelWidth])
	.domain([0, maxVaccinations]);

    var bars = rows.append('rect')
    .attr('id', function(d,i){
        return 'bar-'+d.code;
    })
	.attr('data-id', function(d,i){ return d.code })
    .attr('class', 'region-bar')
    .attr('width', function(d,i){
        var val = 0;
        if(options.region_switch=='per100'){
            if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases_per_100k);
            if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths_per_100k);
            if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines_per_100k);
        } else {
            if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases);
            if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths);
            if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines);                
        }
        if(!isNaN(val)) { return parseFloat(val) } else { return 0}
    })
    .attr('x', labelWidth)
    .style('outline', 'none')
    .style('cursor', 'pointer')
    .attr('y', rowHeight*barSpacing - 1)
    .attr('height', rowHeight-((rowHeight*barSpacing)*2))
    .style('fill', function(d){
        return colors.regions[d.code]
    })
    .attr('opacity',1)
    .on('click', function(d,i){
        var t = d3.select(this).attr('data-id');
        filter([t],'regionchart');
    })
    .on('mouseover', function(d){
        var dat = d3.select(this.parentNode).datum();
        // d3.selectAll('.timeBar:not(.time_'+dat.region).transition().duration(500).attr('opacity', 0.3);
        // d3.selectAll('.time_'+dat.region).attr('opacity', 1);
	})
	.on('mouseout', function(){
        // d3.selectAll('.timeBar').transition().duration(500).attr('opacity', 1);
	})

    // create data value labels
    var dataLabel = rows.append('text')
	.text(function(d){
        var val = 0;
        if(options.region_switch=='per100'){
            if(options.region_chart_toggle == 'cases') val = (Math.round(d.cumulative_cases_per_100k));
            if(options.region_chart_toggle == 'deaths') val = (Math.round(d.cumulative_deaths_per_100k));
            if(options.region_chart_toggle == 'vaccines') val = (Math.round(d.cumulative_vaccines_per_100k));
        } else {
            if(options.region_chart_toggle == 'cases') val = (Math.round(d.cumulative_cases));
            if(options.region_chart_toggle == 'deaths') val = (Math.round(d.cumulative_deaths));
            if(options.region_chart_toggle == 'vaccines') val = (Math.round(d.cumulative_vaccines));             
        }
        return addCommas(val);
    })
	.attr('id', function(d,i){
		return 'data-label'+d.code;
	})
    .attr('data-id', function(d,i){ return d.code })
	.attr('class', 'data-label')
	.attr('y', rowHeight/2)
	.style('alignment-baseline', 'middle')
	.style('text-anchor', 'start')
	.attr('x', function(d,i){
        var val = 0;
        if(options.region_switch=='per100'){
            if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases_per_100k)+labelWidth+5;
            if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths_per_100k)+labelWidth+5;
            if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines_per_100k)+labelWidth+5;
        } else {
            if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases)+labelWidth+5;
            if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths)+labelWidth+5;
            if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines)+labelWidth+5;               
        }
        return val;
    })
    .attr('opacity', function(d,i){
        var val = 0;
        if(options.region_switch=='per100'){
            if(options.region_chart_toggle == 'cases') val = (d.cumulative_cases_per_100k);
            if(options.region_chart_toggle == 'deaths') val = (d.cumulative_deaths_per_100k);
            if(options.region_chart_toggle == 'vaccines') val = (d.cumulative_vaccines_per_100k);
        } else {
            if(options.region_chart_toggle == 'cases') val = (d.cumulative_cases);
            if(options.region_chart_toggle == 'deaths') val = (d.cumulative_deaths);
            if(options.region_chart_toggle == 'vaccines') val = (d.cumulative_vaccines);
        }
        if(val>0){ return 1 } else { return 0}
    })
	.style('fill', '#696969')
	.style('font-weight', 'normal')
	.style('font-size', '10px');

}

export function updateRegionchart(options,data) {
    
    // reset region values to zero
    data.regions.forEach(function(d,i){
        d.population = 0;
        d.cumulative_deaths = 0;
        d.cumulative_cases = 0;
        d.cumulative_vaccines = 0;
    })

    // loop through countries and calculate region totals
    data.country.forEach(function(d,i){
        data.regions.forEach(function(dd,ii){
            if((dd.code==d.ifrc_region)){ 
                if((d.population>0)&&(d.who_daily_latest)){
                    if(d.who_daily_latest.cumulative_cases>0)
                    dd.cumulative_cases += d.who_daily_latest.cumulative_cases;
                    if(d.who_daily_latest.cumulative_deaths>0)
                    dd.cumulative_deaths += d.who_daily_latest.cumulative_deaths||0;
                    dd.population += d.population;
                }
                if((d.population>0)&&(d.vaccine_daily_latest)){
                    dd.cumulative_vaccines += (d.vaccine_daily_latest.total_vaccinations)||0;
                }
            }
        });
    });

    // calculate regions per 100k values using total population for each region
    data.regions.forEach(function(d,i){
        d.cumulative_cases_per_100k = d.cumulative_cases/(d.population/100000)
        d.cumulative_deaths_per_100k = d.cumulative_deaths/(d.population/100000);
        d.cumulative_vaccines_per_100k = d.cumulative_vaccines/(d.population/100000);
        if(!isFinite(d.cumulative_cases_per_100k)) d.cumulative_cases_per_100k = 0;
        if(!isFinite(d.cumulative_deaths_per_100k)) d.cumulative_deaths_per_100k = 0;
        if(!isFinite(d.cumulative_vaccines_per_100k)) d.cumulative_vaccines_per_100k = 0;
    })

    if(options.region_switch=='per100'){
        // get maximum values for each series
        maxVaccinations = d3.max(data.regions, function(d,i){
            return d.cumulative_vaccines_per_100k;
        })

        maxCases = d3.max(data.regions, function(d,i){
            return d.cumulative_cases_per_100k;
        })

        maxDeaths = d3.max(data.regions, function(d,i){
            return d.cumulative_deaths_per_100k;
        });
    } else {
         // get maximum values for each series
         maxVaccinations = d3.max(data.regions, function(d,i){
            return d.cumulative_vaccines;
        })

        maxCases = d3.max(data.regions, function(d,i){
            return d.cumulative_cases;
        })

        maxDeaths = d3.max(data.regions, function(d,i){
            return d.cumulative_deaths;
        });
    }

    // redefine scales using new extent
    xScaleCases = d3.scaleLinear()
	.range([0, rcSize.width - margin.right - labelWidth])
	.domain([0, maxCases]);

    xScaleDeaths = d3.scaleLinear()
	.range([0, rcSize.width - margin.right - labelWidth])
	.domain([0, maxDeaths]);

    xScaleVaccines = d3.scaleLinear()
	.range([0, rcSize.width - margin.right - labelWidth])
	.domain([0, maxVaccinations]);

    // update bars
    if((maxVaccinations==0)&&(maxCases==0)&&(maxDeaths==0)){
        d3.selectAll('.region-bar')
        .transition().duration(500)
        .attr('width', 0);

        d3.selectAll('.data-label')
        .transition()
          .duration(500) 
          .attr('x', labelWidth)
          .attr('opacity', 0);
    } else {
        d3.selectAll('.region-bar')
        .transition().duration(500)
        .style('fill', function(d){
            return colors.regions[d.code];
            if(options.region_chart_toggle=='vaccines'){
                return colors.regions_blue[d.code]
            } else {
                return colors.regions[d.code]
            }
        })
        .attr('width', function(d,i){
            var id = d3.select(this).attr('data-id');
            var d;
            groupedData.forEach(function(dd,ii){
                if(dd.code == id){
                    d = dd;
                }
            })
            var val = 0;
            if(options.region_switch=='per100'){
                if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases_per_100k);
                if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths_per_100k);
                if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines_per_100k);
            } else {
                if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases);
                if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths);
                if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines);                
            }
            if(!isNaN(val)) { return parseFloat(val) } else { return 0}
        })   
        d3.selectAll('.data-label')
        .transition()
          .duration(500)
          .tween("text", function(d,i) {
            var val = 0;
            var id = d3.select(this).attr('data-id');
            var d;
            groupedData.forEach(function(dd,ii){
                if(dd.code == id){
                    d = dd;
                }
            })
            if(options.region_switch=='per100'){
                if(options.region_chart_toggle == 'cases') val = (Math.round(d.cumulative_cases_per_100k));
                if(options.region_chart_toggle == 'deaths') val = (Math.round(d.cumulative_deaths_per_100k));
                if(options.region_chart_toggle == 'vaccines') val = (Math.round(d.cumulative_vaccines_per_100k));
            } else {
                if(options.region_chart_toggle == 'cases') val = (Math.round(d.cumulative_cases));
                if(options.region_chart_toggle == 'deaths') val = (Math.round(d.cumulative_deaths));
                if(options.region_chart_toggle == 'vaccines') val = (Math.round(d.cumulative_vaccines));             
            }
            var i = d3.interpolate(Math.floor((Math.random() * 2346) + 9345), val);
            return function(t) {
              d3.select(this).text(addCommas(Math.round(i(t))));
            };
          })
        .attr('x', function(d,i){
            var id = d3.select(this).attr('data-id');
            var d;
            groupedData.forEach(function(dd,ii){
                if(dd.code == id){
                    d = dd;
                }
            })
            var val = 0;
            if(options.region_switch=='per100'){
                if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases_per_100k)+labelWidth+5;
                if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths_per_100k)+labelWidth+5;
                if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines_per_100k)+labelWidth+5;
            } else {
                if(options.region_chart_toggle == 'cases') val = xScaleCases(d.cumulative_cases)+labelWidth+5;
                if(options.region_chart_toggle == 'deaths') val = xScaleDeaths(d.cumulative_deaths)+labelWidth+5;
                if(options.region_chart_toggle == 'vaccines') val = xScaleVaccines(d.cumulative_vaccines)+labelWidth+5;               
            }
            return val;
        })
        .attr('opacity', function(d,i){
            var d;
            var id = d3.select(this).attr('data-id');
            groupedData.forEach(function(dd,ii){
                if(dd.code == id){
                    d = dd;
                }
            })
            var val = 0;
            if(options.region_switch=='per100'){
                if(options.region_chart_toggle == 'cases') val = (d.cumulative_cases_per_100k);
                if(options.region_chart_toggle == 'deaths') val = (d.cumulative_deaths_per_100k);
                if(options.region_chart_toggle == 'vaccines') val = (d.cumulative_vaccines_per_100k);
            } else {
                if(options.region_chart_toggle == 'cases') val = (d.cumulative_cases);
                if(options.region_chart_toggle == 'deaths') val = (d.cumulative_deaths);
                if(options.region_chart_toggle == 'vaccines') val = (d.cumulative_vaccines);
            }
            if(val>0){ return 1 } else { return 0}
        })

    }

}

export default drawRegionchart;
