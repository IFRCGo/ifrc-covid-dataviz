import * as d3 from "d3";
import moment from 'moment';
import colors from './colors';
import {nFormatter} from './HelperFunctions';
import { selection, textwrap } from 'd3-textwrap';
import clone from 'just-clone';

let yScaleCases;
let yScaleDeaths;
let yScaleVaccines;
let yAxisCases;
let yAxisDeaths;
let yAxisVaccines;
let yScaleCasesAxis;
let yScaleDeathsAxis;
let yScaleVaccinesAxis;
let xScale;
let xAxis; 
let xScaleAxis;
let xScaleEvents;
let maxDate; 
let minDate;
let md; 
let vgroupedData;
let hoverBar; 
let timelineTooltip;
let eventTooltip;
let tData; 

const regions = ['AF', 'AP', 'ME', 'EU', 'AM', 'OTH'];

export function drawTimechart(data, options) {

    minDate = new Date(data.min_date);
    maxDate = new Date(data.max_date);

    const groupedData = [];

    data.who_data.forEach(function(d,i){
        if(!groupedData[d[options.timeline_frequency+'Total']])groupedData[d[options.timeline_frequency+'Total']] = {};
        if(options.timeline_frequency==='day') groupedData[d[options.timeline_frequency+'Total']].date = d.date;
        if(options.timeline_frequency==='week') groupedData[d[options.timeline_frequency+'Total']].date = d.week_start;
        if(options.timeline_frequency==='month') groupedData[d[options.timeline_frequency+'Total']].date = d.month_start;
        if(!groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region]) groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region] = {new_cases: 0, new_deaths: 0, cumulative_cases: 0, cumulative_deaths: 0};
        groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].new_cases += d.new_cases;
        groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].new_deaths += d.new_deaths;
        groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].cumulative_cases = 0;
    });

    // totals by date
    groupedData.forEach(function(d,i){
        regions.forEach(function(dd,ii){
            if(!d.hasOwnProperty(dd)){
               d[dd] = {new_cases: 0, new_deaths: 0, cumulative_cases: 0, cumulative_deaths: 0};
            }
            // if(dd!=='OTH') d.region.push({'region': dd, 'new_cases': d[dd].new_cases, 'new_deaths': d[dd].new_deaths, 'cumulative_cases': d[dd].cumulative_cases, 'cumulative_deaths': d[dd].cumulative_deaths});
            if(i>0){
                d[dd].cumulative_cases = groupedData[i][dd].new_cases + groupedData[i-1][dd].cumulative_cases;
                d[dd].cumulative_deaths = groupedData[i][dd].new_deaths + groupedData[i-1][dd].cumulative_deaths;
            } else {
                d[dd].cumulative_cases = groupedData[i][dd].new_cases;
                d[dd].cumulative_deaths = groupedData[i][dd].new_deaths;
            }
        })

        d.total_new_cases = d.AF.new_cases + d.AP.new_cases + d.AM.new_cases + d.EU.new_cases + d.ME.new_cases + d.OTH.new_cases; 
        d.total_cumulative_cases = d.AF.cumulative_cases + d.AP.cumulative_cases + d.AM.cumulative_cases + d.EU.cumulative_cases + d.ME.cumulative_cases + d.OTH.cumulative_cases; 
        d.total_new_deaths = d.AF.new_deaths + d.AP.new_deaths + d.AM.new_deaths + d.EU.new_deaths + d.ME.new_deaths + d.OTH.new_deaths; 
        d.total_cumulative_deaths = d.AF.cumulative_deaths + d.AP.cumulative_deaths + d.AM.cumulative_deaths + d.EU.cumulative_deaths + d.ME.cumulative_deaths + d.OTH.cumulative_deaths; 
        d.region = [];

        regions.forEach(function(dd,ii){
            d.region.push({'region': dd, 'new_cases': d[dd].new_cases, 'new_deaths': d[dd].new_deaths, 'cumulative_cases': d[dd].cumulative_cases, 'cumulative_deaths': d[dd].cumulative_deaths});
        })

    });

    vgroupedData = [];

    if(options.timeline_type!='cumulative'){ // cumulative and stacked
        // data.vaccines_data = data.vaccines_data_daily;
        // data.vaccines_data_daily = clone(data.vaccines_data);
        data.vaccines_data.forEach(function(d,i){
            if(!vgroupedData[d[options.timeline_frequency+'Total']])vgroupedData[d[options.timeline_frequency+'Total']] = {};
            if(options.timeline_frequency==='day') vgroupedData[d[options.timeline_frequency+'Total']].date = d.date;
            if(options.timeline_frequency==='week') vgroupedData[d[options.timeline_frequency+'Total']].date = d.week_start;
            if(options.timeline_frequency==='month') vgroupedData[d[options.timeline_frequency+'Total']].date = d.month_start;
            if(!vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region]) vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region] = {new_vaccines: 0};
            vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].new_vaccines += d.daily_vaccinations;
        });

        // totals by date
        vgroupedData.forEach(function(d,i){
            regions.forEach(function(dd,ii){
                if(!d[dd]){
                    d[dd] = {new_vaccines: 0, cumulative_vaccines: 0}
                }
            });
            d.total_new_vaccines = d.AF.new_vaccines + d.AP.new_vaccines + d.AM.new_vaccines + d.EU.new_vaccines + d.ME.new_vaccines + d.OTH.new_vaccines; 
            d.region = [];

            regions.forEach(function(dd,ii){
                var newVaccines = 0;
                if(d[dd].new_vaccines>0){
                    newVaccines += d[dd].new_vaccines
                }
                d.region.push({'region': dd, 'new_vaccines': newVaccines });
            })
        });

    } else{ // cumulative only
        var vData = [];
        if(options.timeline_frequency==='day') {
            vData = clone(data.vaccines_data);
        }
        if(options.timeline_frequency==='week') {
            data.vaccines_data.forEach(function(d,i){
                var endOfWeekDate = moment(d.date).endOf('isoWeek').startOf('day').unix();
                var date = moment(d.date).startOf('day').unix();
                if((date==endOfWeekDate)||(date==moment(data.max_date).startOf('day').unix())){
                    vData.push(d);
                }
            })
        }
        if(options.timeline_frequency==='month') {
            var maxDateUnix = moment(data.max_date).startOf('day').unix();
            data.vaccines_data.forEach(function(d,i){
                var endOfMonthDate = moment(d.date).endOf('month').startOf('day').unix();
                var date = moment(d.date).startOf('day').unix();
                if((date==endOfMonthDate)||((moment(data.max_date).startOf('day').unix()!=endOfMonthDate)&&(date==maxDateUnix))){
                    vData.push(d);
                }
            })
        }

        vData.forEach(function(d,i){
            if(!vgroupedData[d[options.timeline_frequency+'Total']])vgroupedData[d[options.timeline_frequency+'Total']] = {};
            if(options.timeline_frequency==='day') vgroupedData[d[options.timeline_frequency+'Total']].date = d.date;
            if(options.timeline_frequency==='week') vgroupedData[d[options.timeline_frequency+'Total']].date = d.week_start;
            if(options.timeline_frequency==='month') vgroupedData[d[options.timeline_frequency+'Total']].date = d.month_start;
            if(!vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region]) vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region] = {cumulative_vaccines: 0};
            vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].cumulative_vaccines += d.total_vaccinations;
        });
        // totals by date
        vgroupedData.forEach(function(d,i){
            regions.forEach(function(dd,ii){
                if(!d[dd]){
                    d[dd] = {cumulative_vaccines: 0}
                }
            });
            d.total_cumulative_vaccines = d.AF.cumulative_vaccines + d.AP.cumulative_vaccines + d.AM.cumulative_vaccines + d.EU.cumulative_vaccines + d.ME.cumulative_vaccines + d.OTH.cumulative_vaccines; 
            d.region = [];
            regions.forEach(function(dd,ii){
                d.region.push({'region': dd, 'cumulative_vaccines': d[dd].cumulative_vaccines});
            })
        });
    }

    vgroupedData = vgroupedData.filter(function(el) { return el; });

    const numIntervals = d3.max(data.who_data, function(d,i){
        return d[options.timeline_frequency+'Total'];
    });

    const maxCases = d3.max(groupedData, function(d,i){
        if(options.timeline_type==='non-cumulative') return d.total_new_cases;
        if(options.timeline_type==='cumulative') return d.total_cumulative_cases;
        if(options.timeline_type==='stacked') return 100;
    })

    const maxDeaths = d3.max(groupedData, function(d,i){
        if(options.timeline_type==='non-cumulative') return d.total_new_deaths;
        if(options.timeline_type==='cumulative') return d.total_cumulative_deaths;
        if(options.timeline_type==='stacked') return 100;
    })

    const maxVaccines = d3.max(vgroupedData, function(d,i){
        if(d){
            if(options.timeline_type==='non-cumulative') return d.total_new_vaccines;
            if(options.timeline_type==='cumulative') return d.total_cumulative_vaccines;
            if(options.timeline_type==='stacked') return 100;
        }
    })

    // define date range
    // const minDate = groupedData[0].date;
    // const maxDate = groupedData[numIntervals].date;
    // const minDate = groupedData[0].date;

    // if(options.timeline_frequency==='month') md = md.add(1, 'months');
    // if(options.timeline_frequency==='week') md = md.add(1, 'weeks');
    if(options.timeline_frequency==='month') minDate = moment(minDate).startOf('month').startOf('day').toDate();
    if(options.timeline_frequency==='month') maxDate = moment(maxDate).endOf('month').startOf('day').toDate();
    if(options.timeline_frequency==='week') maxDate = moment(maxDate).endOf('isoWeek').startOf('day').toDate();

    md = moment(maxDate);
    if(options.timeline_frequency==='day') md = new Date(moment(maxDate).add(1, 'days').toDate());

    const svg = d3.select('#timechart_svg');
    svg.selectAll('g').remove();
    d3.selectAll('#layout .yAxis').remove();
    d3.selectAll('#yAxis').remove();
    d3.selectAll('#layout .xAxis').remove();

    //bg
    svg.append('g').append('rect')
    .attr('width', 2000)
    .attr('height', '100%')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', '#FFF')
    .attr('opacity', 0);

    const width = 2000;
    const barWidth = width/numIntervals;

    let barSpacing = 0.04; 
    if(options.timeline_frequency==='month') barSpacing = 0.03;
    if(options.timeline_frequency==='day') barSpacing = 0.02;

    // define scales

    xScale = d3.scaleTime()
    .range([0,width])
    .domain([minDate,md]);

    xScaleAxis = d3.scaleTime()
    .range([0,596])
    .domain([minDate,md]);

    yScaleCases = d3.scaleLinear()
    .range([0,140])
    .domain([0,maxCases]);

    yScaleCasesAxis = d3.scaleLinear()
    .range([140,0])
    .domain([0,maxCases]);

    yScaleDeaths = d3.scaleLinear()
    .range([0,140])
    .domain([0,maxDeaths]);

    yScaleDeathsAxis = d3.scaleLinear()
    .range([140,0])
    .domain([0,maxDeaths]);

    yScaleVaccines = d3.scaleLinear()
    .range([0,140])
    .domain([0,maxVaccines]);

    yScaleVaccinesAxis = d3.scaleLinear()
    .range([140,0])
    .domain([0,maxVaccines]);

    // define axi
    
    xAxis = d3.axisBottom()
    .scale(xScaleAxis)
    .tickSize(2)
    .tickPadding(3);

    // if(options.timeline_frequency=='month')
    // xAxis.ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b %Y"));

    // if(options.timeline_frequency=='week')
    // xAxis.ticks(d3.timeWeek.every(10)).tickFormat(d3.timeFormat("%d %b %Y"));

    yAxisCases = d3.axisRight()
    .scale(yScaleCasesAxis)
    .ticks(3)
    .tickSize(3)
    .tickPadding(3)
    .tickFormat(function(d){
        if(options.timeline_type=='stacked') return nFormatter(d)+'%';
        return nFormatter(d);
    })

    yAxisDeaths = d3.axisRight()
    .scale(yScaleDeathsAxis)
    .ticks(3)
    .tickSize(3)
    .tickPadding(3)
    .tickFormat(function(d){
        if(options.timeline_type=='stacked') return nFormatter(d)+'%';
        return nFormatter(d);
    })

    yAxisVaccines = d3.axisRight()
    .scale(yScaleVaccinesAxis)
    .ticks(3)
    .tickSize(3)
    .tickPadding(3)
    .tickFormat(function(d){
        if(options.timeline_type=='stacked') return nFormatter(d)+'%';
        return nFormatter(d);
    })

    // y-axis cases
    var yAxisGroup = d3.select('#layout').append("g").attr('id', 'yAxis').attr('clip-path', 'url(#mask)');

    var yAxisCasesText = yAxisGroup.append("g")
    .attr("class", "yAxis axis")
    .attr("id", "casesAxis")
    .attr('transform', 'translate(620,363)')
    .call(yAxisCases);

    // y-axis deaths
    var yAxisDeathsText = yAxisGroup.append("g")
    .attr("class", "yAxis axis")
    .attr("id", "deathsAxis")
    .attr('transform', 'translate(620,534)')
    .call(yAxisDeaths);

    // y-axis vaccines
    var yAxisVaccinesText = yAxisGroup.append("g")
    .attr("class", "yAxis axis")
    .attr("id", "VaccinesAxis")
    .attr('transform', 'translate(620,707.5)')
    .call(yAxisVaccines);

    // x-axis cases
    var xAxisCases = yAxisGroup.append('g')
    .attr("id", "casesXAxis")
    .attr('class', 'xAxis')
    .attr('transform', 'translate(24,504)')
    .call(xAxis);

    var xAxisDeaths = yAxisGroup.append('g')
    .attr("id", "deathsXAxis")
    .attr('class', 'xAxis')
    .attr('transform', 'translate(24,674)')
    .call(xAxis);

    var xAxisVaccines = yAxisGroup.append('g')
    .attr("id", "vaccinesXAxis")
    .attr('class', 'xAxis')
    .attr('transform', 'translate(24,848)')
    .call(xAxis);

    var xAxisTimeline = yAxisGroup.append('g')
    .attr("id", "timelineXAxis")
    .attr('class', 'xAxis')
    .attr('transform', 'translate(24,908)')
    .call(xAxis);

    // CASES
    // loop through groupedData and draw bars
    const barGroups = svg.selectAll('.bar_group')
    .data(groupedData)
    .enter()
    .append('g')
    .attr('class', 'bar_group')
    .attr('transform', function(d,i){ 
        if (i < 10) console.log(d);
        return 'translate('+xScale(d.date)+')'
    })

    // CASES
    barGroups.selectAll('.cases_bar')
    .data(function(d,i){ return d.region.filter(function(dd,ii){
        return dd.region!=='OTH';
    })})
    .enter()
    .append('rect')
    .attr('class', function(d,i) { return 'timeBar cases_bar time_'+d.region })
    .attr('x', (barWidth*barSpacing))
    .attr('y', function(d,i){
        const totalNewCases = d3.select(this.parentNode).datum().total_new_cases - d3.select(this.parentNode).datum().OTH.new_cases;
        let dp = 0;
        if(i>0){
            for(let ii=1;ii<=i;ii++){
                if(options.timeline_type==='cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].cumulative_cases;
                if(options.timeline_type==='non-cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].new_cases;
                if(options.timeline_type==='stacked') dp += d3.select(this.parentNode).datum().region[ii-1].new_cases;
            }
        }
        let y = 0;
        if(options.timeline_type==='cumulative') y = (140-yScaleCases(d.cumulative_cases)-(yScaleCases(dp)))
        if(options.timeline_type==='non-cumulative') y = (140-yScaleCases(d.new_cases)-(yScaleCases(dp)))
        if(options.timeline_type==='stacked') y = (140-(140*(d.new_cases/totalNewCases))-((140*(dp/totalNewCases))))
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('width', barWidth-(barWidth*barSpacing*2))
    .attr('height', function(d,i){
        const totalNewCases = d3.select(this.parentNode).datum().total_new_cases - d3.select(this.parentNode).datum().OTH.new_cases;
        let y = 0;
        if(options.timeline_type==='cumulative') y = yScaleCases(d.cumulative_cases);
        if(options.timeline_type==='non-cumulative') y = yScaleCases(d.new_cases);
        if(options.timeline_type==='stacked') y = (140*(d.new_cases/totalNewCases));
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('fill', function(d,i){
        return colors.regions[d.region];
    })

    // DEATHS
    barGroups.selectAll('.deaths_bar')
    .data(function(d,i){ return d.region.filter(function(dd,ii){
        return dd.region!=='OTH';
    })})
    .enter()
    .append('rect')
    .attr('class', function(d,i) { return 'timeBar deaths_bar time_'+d.region })
    .attr('x', (barWidth*barSpacing))
    .attr('y', function(d,i){
        const totalNewDeaths = d3.select(this.parentNode).datum().total_new_deaths - d3.select(this.parentNode).datum().OTH.new_deaths;
        let dp = 0;
        if(i>0){
            for(let ii=1;ii<=i;ii++){
                if(options.timeline_type==='cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].cumulative_deaths;
                if(options.timeline_type==='non-cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].new_deaths;
                if(options.timeline_type==='stacked') dp += d3.select(this.parentNode).datum().region[ii-1].new_deaths;
            }
        }
        let y = 0;
        if(options.timeline_type==='cumulative') y = (140-yScaleDeaths(d.cumulative_deaths)-(yScaleDeaths(dp))+170)
        if(options.timeline_type==='non-cumulative') y = (140-yScaleDeaths(d.new_deaths)-(yScaleDeaths(dp))+170)
        if(options.timeline_type==='stacked') y = (140-(140*(d.new_deaths/totalNewDeaths))-((140*(dp/totalNewDeaths)))+170)
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('width', barWidth-(barWidth*barSpacing*2))
    .attr('height', function(d,i){
        const totalNewDeaths = d3.select(this.parentNode).datum().total_new_deaths - d3.select(this.parentNode).datum().OTH.new_deaths;
        let y = 0;
        if(options.timeline_type==='cumulative') y = yScaleDeaths(d.cumulative_deaths);
        if(options.timeline_type==='non-cumulative') y = yScaleDeaths(d.new_deaths);
        if(options.timeline_type==='stacked') y = (140*(d.new_deaths/totalNewDeaths));
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('fill', function(d,i){
        return colors.regions[d.region];
    });

    // bar size tweak for spacing
    if(options.timeline_frequency==='month'){
        barGroups.selectAll(".timeBar")
        .attr("width", function(d) {
            var date = d3.select(this.parentNode).datum().date;
            var next = d3.timeMonth.offset(date, 1);
            return (xScale(next)- xScale(date))*(1-barSpacing);
            })
        .attr("x", function(d) {
            var date = d3.select(this.parentNode).datum().date;
            var next = d3.timeMonth.offset(date, 1);
            return (xScale(next)- xScale(date))*(barSpacing/2);
            })
        }

    // VACCINES
    const vbarGroups = svg.selectAll('.vbar_group')
    .data(vgroupedData)
    .enter()
    .append('g')
    .attr('class', 'vbar_group')
    .attr('transform', function(d,i){ 
        return 'translate('+xScale(d.date)+', 344)'
    })
  
    vbarGroups.selectAll('.vaccines_bar')
    .data(function(d,i){ return d.region.filter(function(dd,ii){
        return dd.region!=='OTH';
    })})
    .enter()
    .append('rect')
    .attr('class', 'timeBar vaccines_bar')
    .attr('class', function(d,i) { return 'timeBar vaccines_bar time_'+d.region })
    .attr('x', (barWidth*barSpacing))
    .attr('y', function(d,i){
        const totalNewVaccines = d3.select(this.parentNode).datum().total_new_vaccines - d3.select(this.parentNode).datum().OTH.new_vaccines;
        let dp = 0;
        if(i>0){
            for(let ii=1;ii<=i;ii++){
                if(options.timeline_type==='cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].cumulative_vaccines;
                if(options.timeline_type==='non-cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].new_vaccines;
                if(options.timeline_type==='stacked') dp += d3.select(this.parentNode).datum().region[ii-1].new_vaccines;
            }
        }
        let y = 0;
        if(options.timeline_type==='cumulative') y = (140-yScaleVaccines(d.cumulative_vaccines)-(yScaleVaccines(dp)))
        if(options.timeline_type==='non-cumulative') y = (140-yScaleVaccines(d.new_vaccines)-(yScaleVaccines(dp)))
        if(options.timeline_type==='stacked') y = (140-(140*(d.new_vaccines/totalNewVaccines))-((140*(dp/totalNewVaccines))))
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('width', barWidth-(barWidth*barSpacing*2))
    .attr('height', function(d,i){
        const totalNewVaccines = d3.select(this.parentNode).datum().total_new_vaccines - d3.select(this.parentNode).datum().OTH.new_vaccines;
        let y = 0;
        if(options.timeline_type==='cumulative') y = yScaleVaccines(d.cumulative_vaccines);
        if(options.timeline_type==='non-cumulative') y = yScaleVaccines(d.new_vaccines);
        if(options.timeline_type==='stacked') y = (140*(d.new_vaccines/totalNewVaccines));
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('fill', function(d,i){
        return colors.regions[d.region];
        // return colors.regions_blue[d.region];
    });

    if(options.timeline_frequency==='month'){
    vbarGroups.selectAll(".timeBar")
    .attr("width", function(d) {
        var date = d3.select(this.parentNode).datum().date;
        var next = d3.timeMonth.offset(date, 1);
        return (xScale(next)- xScale(date))*(1-barSpacing);
        })
    .attr("x", function(d) {
        var date = d3.select(this.parentNode).datum().date;
        var next = d3.timeMonth.offset(date, 1);
        return (xScale(next)- xScale(date))*(barSpacing/2);
        })
    }

    // bar size tweak for spacing
    if(options.timeline_frequency==='month'){
        barGroups.selectAll(".timeBar")
        .attr("width", function(d) {
            var date = d3.select(this.parentNode).datum().date;
            var next = d3.timeMonth.offset(date, 1);
            return (xScale(next)- xScale(date))*(1-barSpacing);
          })
        .attr("x", function(d) {
            var date = d3.select(this.parentNode).datum().date;
            var next = d3.timeMonth.offset(date, 1);
            return (xScale(next)- xScale(date))*(barSpacing/2);
          })
        }

        // tooltips

        // events calendar timeline
        tData = data.timeline_data;

        xScaleEvents = d3.scaleTime()
        .range([25,619])
        .domain([minDate,md]);
        
        // bring to front
       document.getElementById("svg").appendChild(d3.select('#timeline_tooltip').node());
       document.getElementById("svg").appendChild(d3.select('#event_tooltip').node());
       timelineTooltip = d3.select('#timeline_tooltip').attr('opacity', 0);
       eventTooltip = d3.select('#event_tooltip').attr('opacity', 0);

        // hover bar
        hoverBar = svg.append('rect')
        .attr('id','timechart_hover')
        .attr('width', barWidth)
        .attr('x', 0)
        .attr('y', 0)
        .attr('opacity', 0)
        .attr('height', '100%')
        .attr('fill', 'rgb(221 221 221 / 40%)')

        d3.select('#timechart_svg').on('mouseover',  (event) => {

            var coords = d3.pointer( event );
            hoverBar.attr('opacity', 1)

            var xDate = xScale.invert(coords[0]);

            if(options.timeline_frequency=='week') {
                xDate = moment(xDate).startOf('isoWeek');
            }
            if(options.timeline_frequency=='day') {
                xDate = moment(xDate).startOf('day');
            }
            if(options.timeline_frequency=='month') {
                xDate = moment(xDate).startOf('month');
            }

            if(coords[1]<470){
                timelineTooltip.attr('opacity', 1).attr('display', 'inline');
                hoverBar.attr('height', '100%');
            } else if(coords[1]>510){
                eventTooltip.attr('opacity', 1);
                hoverBar.attr('height', '90%');
            } else {
                eventTooltip.attr('opacity', 0);
                timelineTooltip.attr('opacity', 0);
                hoverBar.attr('height', '100%');
            }

            if((xDate.toDate().getTime()<minDate.getTime())){
                hoverBar.attr('opacity', 0);
                timelineTooltip.attr('opacity', 0);
            }

            d3.select('#svg_container').style('z-index', 10);

        }).on('mouseout',  (event) => {
            hoverBar.attr('opacity', 0)
            timelineTooltip.attr('opacity', 0).attr('display', 'none');
            // timelineTooltip.attr('opacity', 0).attr('transform', 'translate(0,0)');
            d3.select('#svg_container').style('z-index', 1);
            eventTooltip.attr('opacity', 0).attr('transform', 'translate(0,0)');
            d3.selectAll('.event_marker circle').style('stroke', colors.black);
        })
        .on('mousemove', (event) => {
            var coords = d3.pointer( event );

            var xDate = xScale.invert(coords[0]);

            var tooltipStr = '';
            if(options.timeline_frequency=='week') {
                xDate = moment(xDate).startOf('isoWeek');
                tooltipStr = xDate.format('ll');
                d3.select('#timeline_tooltip_date tspan').text(tooltipStr);
            }
            if(options.timeline_frequency=='day') {
                xDate = moment(xDate).startOf('day');
                tooltipStr = xDate.format('ll');
                d3.select('#timeline_tooltip_date tspan').text(tooltipStr);
            }
            if(options.timeline_frequency=='month') {
                xDate = moment(xDate).startOf('month');
                tooltipStr = xDate.format('MMMM YYYY');
                d3.select('#timeline_tooltip_date tspan').text(tooltipStr);
            }
            hoverBar.attr('x', xScale(xDate.toDate()));

            var groupedDataFiltered = groupedData.filter(function(d,i){
                return moment(d.date).startOf('day').unix() == xDate.startOf('day').unix();
            });
            var vgroupedDataFiltered = vgroupedData.filter(function(d,i){
                return moment(d.date).startOf('day').unix() == xDate.startOf('day').unix();
            });

            var deaths = '-';
            var cases = '-';
            var vaccines = '-';
            if(options.timeline_type=='cumulative'){ 
                // cumulative
                if(groupedDataFiltered[0]) cases = nFormatter(groupedDataFiltered[0].total_cumulative_cases, 2);
                if(groupedDataFiltered[0]) deaths = nFormatter(groupedDataFiltered[0].total_cumulative_deaths, 2);
                if(vgroupedDataFiltered[0]) vaccines = nFormatter(vgroupedDataFiltered[0].total_cumulative_vaccines, 2);
            } else {
                // non-cumulative/stacked
                if(groupedDataFiltered[0]) cases = nFormatter(groupedDataFiltered[0].total_new_cases, 2);
                if(groupedDataFiltered[0]) deaths = nFormatter(groupedDataFiltered[0].total_new_deaths, 2);
                if(vgroupedDataFiltered[0]) vaccines = nFormatter(vgroupedDataFiltered[0].total_new_vaccines, 2);
            }

            if(deaths==0) deaths = '-';
            if(cases==0) cases = '-';
            if(vaccines==0) vaccines = '-';

            d3.select('#tooltip_cases tspan').text((cases)).attr("text-anchor", "end").attr('dx', 32)
            d3.select('#tooltip_deaths tspan').text((deaths)).attr("text-anchor", "end").attr('dx', 32)
            d3.select('#tooltip_vaccines tspan').text((vaccines)).attr("text-anchor", "end").attr('dx', 32)

            // if((xDate.toDate().getTime()>options.maxDate.getTime())){
            //     hoverBar.attr('opacity', 0);
            // // } else 
            if(((xDate.toDate().getTime()<minDate.getTime()))&&(options.timeline_frequency=='day')){
                hoverBar.attr('opacity', 0);
                timelineTooltip.attr('opacity', 0);
            }

            if(options.timeline_frequency=='month'){
                hoverBar.attr('width', function(){
                   return xScale(moment(xDate).endOf('month')) - xScale(moment(xDate).startOf('month'));
                })
            }
            timelineTooltip.attr('transform', function(){
                var bw = barWidth;
                var ratio = (options.brushR - options.brushL)/600;
                var offset = 0;
                if(ratio<0.5) offset = 3;
                if(ratio<0.3) offset = 12;
                if(ratio<0.2) offset = 20;
                if(ratio<0.15) offset = 21;
                if(options.timeline_frequency=='month') { 
                    if(ratio<0.6) offset = 20;
                    if(ratio<0.5) offset = 30;
                    if(ratio<0.3) offset = 50;
                    if(ratio<0.2) offset = 60;
                    if(ratio<0.1) offset = 70;
                    return 'translate('+(((xScaleEvents(xDate.toDate()))+(barWidth/3))+offset)+','+(coords[1]+353)+')';
                }
                return 'translate('+((xScaleEvents(xDate.toDate())+(18))+offset)+','+(coords[1]+353)+')';
            })

            if(coords[1]<470){
                timelineTooltip.attr('opacity', 1);
                hoverBar.attr('opacity', 1);
                hoverBar.attr('height', '100%');
            } else if(coords[1]>510){
                eventTooltip.attr('opacity', 1);
                hoverBar.attr('height', '90%');
                var x = moment(xScale.invert(coords[0])).startOf('day');
                var xx = (xScale.invert(coords[0]))
                eventTooltip.attr('transform', function(){
                    return 'translate('+(xScaleEvents(x.toDate())+(-3))+','+(817)+')';
                });

                var events = tData.filter(function(d,i){
                    return moment(d.date).startOf('day').unix() == x.unix()
                });

                // select nearest neighbor for ux purposes 
                if(events.length==0){
                    events = tData.filter(function(d,i){
                        return ((moment(d.date).startOf('day').unix() <= moment(x).add(1, 'days').unix())&&(moment(d.date).startOf('day').unix() >= moment(x).subtract(1, 'days').unix()))
                    });
                }
                
                if(events.length>0){

                    d3.select('#event-'+moment(events[0].date).startOf('day').unix()).select('path').style('stroke', '#000').attr('opacity', 1);
                    tooltipStr = moment(events[0].date).startOf('day').format('ll');
                    d3.select('#event_tooltip_date tspan').text(tooltipStr);

                    var wrap = textwrap().bounds({height: 200, width: 230}).method('tspans');
                    var event = d3.select('#event_tooltip_text').text(events[0].description)
                    .attr('y', 18)
                    .attr('x', 6)
                    d3.select('#event_tooltip_text').call(wrap);

                    d3.selectAll('#event_tooltip_text tspan').attr('dy', '1.3em');
                    var bbox = d3.select('#event_tooltip_text').node().getBBox();
                    d3.select('#event_tooltip_rect').attr('width', bbox.width+17)
                    .attr('height', bbox.height +26 );

                    var h = d3.select('#event_tooltip_rect').attr('height');
                    var ys = 0;

                    if(bbox.height<20){
                        ys = 19;
                    } else if(bbox.height<30){
                        ys = 9;
                    } else if(bbox.height<40){
                        ys = 0;
                    } else if(bbox.height<50){
                        ys = -20;
                    } else if(bbox.height<60){
                        ys = -20;
                    }

                    var y = d3.select('#event_tooltip_rect').attr('y');

                    d3.select('#event_tooltip_rect').attr('y', ys);
                    
                    d3.selectAll('#event_tooltip_text').attr('y', function(d,i){
                        return parseInt(d3.select(this).attr('y')) + ys;
                    });

                    d3.selectAll('#event_tooltip_date tspan').attr('dy', function(d,i){
                        return ys;
                    });

                    eventTooltip.attr('opacity', 1);

                } else {
                    d3.selectAll('.event_marker circle').style('stroke', colors.black)
                    eventTooltip.attr('opacity', 0);
                }
            } else {
                eventTooltip.attr('opacity', 0);
                timelineTooltip.attr('opacity', 0);
                hoverBar.attr('opacity', 0);
                hoverBar.attr('height', '100%');
            }

            if((options.timeline_frequency=='day')&&((xDate.toDate().getTime()<minDate.getTime()))){
                hoverBar.attr('opacity', 0);
                timelineTooltip.attr('opacity', 0);
                return false;
            }
        });

        tData = tData.filter(d => d.date.length > 0);

        // event lin

        yAxisGroup.append('line')
        .attr('id', 'event-line')
        .attr('x1', 0)
        .attr('x2', 620)
        .attr('y1', 893)
        .attr('y2', 893)
        .attr('stroke-width', 2.5)
        .attr('stroke', colors.black);

        var circles = yAxisGroup.append('g').selectAll('.event_marker')
        .data(tData)
        .enter()
        .append('g')
        .attr('class', 'event_marker')
        .attr('id', function(d,i){
            return 'event-'+moment(d.date).startOf('day').unix();
        })
        .attr('transform', function(d){
            var x = xScaleEvents(new Date(d.date));
            return 'translate('+(x)+', 893)';
        })
        .style('cursor', 'pointer');
        // .append('path')
        // .attr('d', "M0,-6L4,0 0,6 -4,0Z")
        
        circles.append("circle")
        .style('stroke', colors.black)
        .attr('opacity', 1)
        .attr('r', 6.5)
        .attr('cx', 0)
        .attr('cy', 0)
        .style('stroke-width',2.2)
        .style('fill', 'white');
        circles
        .append("circle")
        .attr('r', 2)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', colors.black)
        .style('stroke', colors.black);


        // create brush zoom
        // reset
        // options.brushL = 0;
        // options.brushR = 600;
        const brush = d3.brushX()
        .extent([[0,0],[600,20]])
        .on("start brush end", brushed);

        d3.select('.brush').remove();
;
        var gBrush = d3.select('#zoombar').append("g")
        .attr("class", "brush")
        .attr('opacity', 0.1)
        .call(brush);

		d3.selectAll('.handle rect').attr('fill-opacity', '1').style('visibility', 'visible').attr('width', 2).attr('fill', '#000').style('stroke-opacity', 0);

        var brushScale = d3.scaleLinear()
        .domain([-3, 597])
        .range([0,2000]);

        gBrush.call(brush.move, [options.brushL,options.brushR]);

        function brushed(){
            var x = parseFloat(d3.select('.handle--w').attr('x'));
            var x2 = parseFloat(d3.select('.handle--e').attr('x'));
            if((x2-x)<40) return false;
            var w = d3.select('.selection').attr('width');
            d3.select('#zoomL').attr('transform', 'translate('+x+',0)');
            d3.select('#zoomR').attr('transform', 'translate('+(x2)+',0)');
            d3.select('#zoomOverlay').attr('width', (x2-x));
            d3.select('#zoomOverlay').attr('x', (x));
            d3.select('#zoomOverlay').attr('transform', 'translate(3,0)');
            var viewBoxW = Math.round(brushScale(x2)-brushScale(x));
            var viewBoxX = Math.round(brushScale(x));
            options.brushL = x+3;
            options.brushR = x2+3;

            xScaleAxis = d3.scaleTime()
            .range([0,596])
            .domain([new Date(xScale.invert(brushScale(x))),new Date(xScale.invert(brushScale(x2)))]);

            xScaleEvents = d3.scaleTime()
            .range([25,619])
            // .domain([minDate,md]);
            .domain([new Date(xScale.invert(brushScale(x))),new Date(xScale.invert(brushScale(x2)))]);

            d3.selectAll('.event_marker')
            .attr('transform', function(d){
                var x = xScaleEvents(new Date(d.date));
                return 'translate('+(x)+', 893)';
            });

            xAxis = d3.axisBottom()
            .ticks(5)
            .scale(xScaleAxis);

            xAxisCases.call(xAxis);
            xAxisDeaths.call(xAxis);
            xAxisVaccines.call(xAxis);
            xAxisTimeline.call(xAxis);
            
            d3.select('#timechart_svg').attr('viewBox', viewBoxX + ' 0 '+ viewBoxW + ' 553')
        }

}

export function updateTimechart(data, options) {

    const groupedData = [];

    data.who_data.forEach(function(d,i){
        if(!groupedData[d[options.timeline_frequency+'Total']])groupedData[d[options.timeline_frequency+'Total']] = {};
        if(options.timeline_frequency==='day') groupedData[d[options.timeline_frequency+'Total']].date = d.date;
        if(options.timeline_frequency==='week') groupedData[d[options.timeline_frequency+'Total']].date = d.week_start;
        if(options.timeline_frequency==='month') groupedData[d[options.timeline_frequency+'Total']].date = d.month_start;
        if(!groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region]) groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region] = {new_cases: 0, new_deaths: 0, cumulative_cases: 0, cumulative_deaths: 0};
        groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].new_cases += d.new_cases;
        groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].new_deaths += d.new_deaths;
        groupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].cumulative_cases = 0;
    });

    // totals by date
    groupedData.forEach(function(d,i){
        regions.forEach(function(dd,ii){
            if(!d.hasOwnProperty(dd)){
               d[dd] = {new_cases: 0, new_deaths: 0, cumulative_cases: 0, cumulative_deaths: 0};
            }
            // if(dd!=='OTH') d.region.push({'region': dd, 'new_cases': d[dd].new_cases, 'new_deaths': d[dd].new_deaths, 'cumulative_cases': d[dd].cumulative_cases, 'cumulative_deaths': d[dd].cumulative_deaths});
            if(i>0){
                d[dd].cumulative_cases = groupedData[i][dd].new_cases + groupedData[i-1][dd].cumulative_cases;
                d[dd].cumulative_deaths = groupedData[i][dd].new_deaths + groupedData[i-1][dd].cumulative_deaths;
            } else {
                d[dd].cumulative_cases = groupedData[i][dd].new_cases;
                d[dd].cumulative_deaths = groupedData[i][dd].new_deaths;
            }
        })

        d.total_new_cases = d.AF.new_cases + d.AP.new_cases + d.AM.new_cases + d.EU.new_cases + d.ME.new_cases + d.OTH.new_cases; 
        d.total_cumulative_cases = d.AF.cumulative_cases + d.AP.cumulative_cases + d.AM.cumulative_cases + d.EU.cumulative_cases + d.ME.cumulative_cases + d.OTH.cumulative_cases; 
        d.total_new_deaths = d.AF.new_deaths + d.AP.new_deaths + d.AM.new_deaths + d.EU.new_deaths + d.ME.new_deaths + d.OTH.new_deaths; 
        d.total_cumulative_deaths = d.AF.cumulative_deaths + d.AP.cumulative_deaths + d.AM.cumulative_deaths + d.EU.cumulative_deaths + d.ME.cumulative_deaths + d.OTH.cumulative_deaths; 
        d.region = [];

        regions.forEach(function(dd,ii){
            d.region.push({'region': dd, 'new_cases': d[dd].new_cases, 'new_deaths': d[dd].new_deaths, 'cumulative_cases': d[dd].cumulative_cases, 'cumulative_deaths': d[dd].cumulative_deaths});
        })
    });

    vgroupedData = [];

    if(options.timeline_type!='cumulative'){ // non-cumulative and stacked
        // data.vaccines_data = data.vaccines_data_daily;
        data.vaccines_data.forEach(function(d,i){
            if(!vgroupedData[d[options.timeline_frequency+'Total']])vgroupedData[d[options.timeline_frequency+'Total']] = {};
            if(options.timeline_frequency==='day') vgroupedData[d[options.timeline_frequency+'Total']].date = d.date;
            if(options.timeline_frequency==='week') vgroupedData[d[options.timeline_frequency+'Total']].date = moment(d.date).startOf('isoWeek').toDate();
            if(options.timeline_frequency==='month') vgroupedData[d[options.timeline_frequency+'Total']].date = moment(d.date).startOf('month').toDate();
            if(!vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region]) vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region] = {new_vaccines: 0};
            vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].new_vaccines += d.daily_vaccinations;
        });
        // totals by date
        vgroupedData.forEach(function(d,i){
            regions.forEach(function(dd,ii){
                if(!d[dd]){
                    d[dd] = {new_vaccines: 0, cumulative_vaccines: 0}
                }
            });
            d.total_new_vaccines = d.AF.new_vaccines + d.AP.new_vaccines + d.AM.new_vaccines + d.EU.new_vaccines + d.ME.new_vaccines + d.OTH.new_vaccines; 
            d.region = [];
            regions.forEach(function(dd,ii){
                d.region.push({'region': dd, 'new_vaccines': d[dd].new_vaccines});
            })
        });

    } else{ // cumulative only
        var vData = [];
        if(options.timeline_frequency==='day') {
            vData = clone(data.vaccines_data);
        }
        if(options.timeline_frequency==='week') {
            data.vaccines_data.forEach(function(d,i){
                var endOfWeekDate = moment(d.date).endOf('isoWeek').startOf('day').unix();
                var date = moment(d.date).startOf('day').unix();
                if((date==endOfWeekDate)||(date==moment(data.max_date).startOf('day').unix())){
                    vData.push(d);
                }
            })
        }
        if(options.timeline_frequency==='month') {
            var maxDateUnix = moment(data.max_date).startOf('day').unix();
            data.vaccines_data.forEach(function(d,i){
                var endOfMonthDate = moment(d.date).endOf('month').startOf('day').unix();
                var date = moment(d.date).startOf('day').unix();
                if((date==endOfMonthDate)||((moment(data.max_date).startOf('day').unix()!=endOfMonthDate)&&(date==maxDateUnix))){
                    vData.push(d);
                }
            })
        }

        vData.forEach(function(d,i){
            if(!vgroupedData[d[options.timeline_frequency+'Total']])vgroupedData[d[options.timeline_frequency+'Total']] = {};
            if(options.timeline_frequency==='day') vgroupedData[d[options.timeline_frequency+'Total']].date = d.date;
            if(options.timeline_frequency==='week') vgroupedData[d[options.timeline_frequency+'Total']].date = moment(d.date).startOf('isoWeek').toDate();
            if(options.timeline_frequency==='month') vgroupedData[d[options.timeline_frequency+'Total']].date = moment(d.date).startOf('month').toDate();
            if(!vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region]) vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region] = {cumulative_vaccines: 0};
            vgroupedData[d[options.timeline_frequency+'Total']][d.ifrc_region].cumulative_vaccines += d.total_vaccinations;
        });
        // totals by date
        vgroupedData.forEach(function(d,i){
            regions.forEach(function(dd,ii){
                if(!d[dd]){
                    d[dd] = {cumulative_vaccines: 0}
                }
            });
            d.total_cumulative_vaccines = d.AF.cumulative_vaccines + d.AP.cumulative_vaccines + d.AM.cumulative_vaccines + d.EU.cumulative_vaccines + d.ME.cumulative_vaccines + d.OTH.cumulative_vaccines; 
            d.region = [];
            regions.forEach(function(dd,ii){
                d.region.push({'region': dd, 'cumulative_vaccines': d[dd].cumulative_vaccines});
            })
        });
    }

    vgroupedData = vgroupedData.filter(function(el) { return el; });

    const numIntervals = d3.max(data.who_data, function(d,i){
        return d[options.timeline_frequency+'Total'];
    });

    const maxCases = d3.max(groupedData, function(d,i){
        if(options.timeline_type==='non-cumulative') return d.total_new_cases;
        if(options.timeline_type==='cumulative') return d.total_cumulative_cases;
        if(options.timeline_type==='stacked') return 100;
    })

    const maxDeaths = d3.max(groupedData, function(d,i){
        if(options.timeline_type==='non-cumulative') return d.total_new_deaths;
        if(options.timeline_type==='cumulative') return d.total_cumulative_deaths;
        if(options.timeline_type==='stacked') return 100;
    })

    const maxVaccines = d3.max(vgroupedData, function(d,i){
        if(d){
            if(options.timeline_type==='non-cumulative') return d.total_new_vaccines;
            if(options.timeline_type==='cumulative') return d.total_cumulative_vaccines;
            if(options.timeline_type==='stacked') return 100;
        }
    })

    const svg = d3.select('#timechart_svg');

    const width = 2000;
    const barWidth = width/numIntervals;

    let barSpacing = 0.04; 
    if(options.timeline_frequency==='month') barSpacing = 0.03;
    if(options.timeline_frequency==='day') barSpacing = 0;

    // define scales

    // xScale = d3.scaleTime()
    // .range([0,width])
    // .domain([minDate,md]);

    // xScaleAxis = d3.scaleTime()
    // .range([23,596])
    // .domain([minDate,md]);

    yScaleCases = d3.scaleLinear()
    .range([0,140])
    .domain([0,maxCases]);

    yScaleCasesAxis = d3.scaleLinear()
    .range([140,0])
    .domain([0,maxCases]);

    yScaleDeaths = d3.scaleLinear()
    .range([0,140])
    .domain([0,maxDeaths]);

    yScaleDeathsAxis = d3.scaleLinear()
    .range([140,0])
    .domain([0,maxDeaths]);

    yScaleVaccines = d3.scaleLinear()
    .range([0,140])
    .domain([0,maxVaccines]);

    yScaleVaccinesAxis = d3.scaleLinear()
    .range([140,0])
    .domain([0,maxVaccines]);

    // define axi
    yAxisCases = d3.axisRight()
    .scale(yScaleCasesAxis)
    .ticks(3)
    .tickSize(3)
    .tickPadding(3)
    .tickFormat(function(d){
        if(options.timeline_type=='stacked') return nFormatter(d)+'%';
        return nFormatter(d);
    })

    yAxisDeaths = d3.axisRight()
    .scale(yScaleDeathsAxis)
    .ticks(3)
    .tickSize(3)
    .tickPadding(3)
    .tickFormat(function(d){
        if(options.timeline_type=='stacked') return nFormatter(d)+'%';
        return nFormatter(d);
    })

    yAxisVaccines = d3.axisRight()
    .scale(yScaleVaccinesAxis)
    .ticks(3)
    .tickSize(3)
    .tickPadding(3)
    .tickFormat(function(d){
        if(options.timeline_type=='stacked') return nFormatter(d)+'%';
        return nFormatter(d);
    })

    // y-axis cases
    var yAxisCasesText = d3.select('#casesAxis')
    .transition()
    .duration(500)
    .call(yAxisCases);

    // y-axis deaths
    var yAxisDeathsText = d3.select('#deathsAxis')
    .transition()
    .duration(500)
    .call(yAxisDeaths);

    // y-axis vaccines
    var yAxisVaccinesText = d3.select('#VaccinesAxis')
    .transition()
    .duration(500)
    .call(yAxisVaccines);

    // CASES
    // loop through groupedData and draw bars
    const barGroups = svg.selectAll('.bar_group')
    .data(groupedData)
    .attr('transform', function(d,i){ 
        return 'translate('+xScale(d.date)+')'
    })

    // CASES
    barGroups.selectAll('.cases_bar')
    .data(function(d,i){ return d.region.filter(function(dd,ii){
        return dd.region!=='OTH';
    })})
    .transition()
    .duration(500)
    .attr('y', function(d,i){
        const totalNewCases = d3.select(this.parentNode).datum().total_new_cases - d3.select(this.parentNode).datum().OTH.new_cases;
        let dp = 0;
        if(i>0){
            for(let ii=1;ii<=i;ii++){
                if(options.timeline_type==='cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].cumulative_cases;
                if(options.timeline_type==='non-cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].new_cases;
                if(options.timeline_type==='stacked') dp += d3.select(this.parentNode).datum().region[ii-1].new_cases;
            }
        }
        let y = 0;
        if(options.timeline_type==='cumulative') y = (140-yScaleCases(d.cumulative_cases)-(yScaleCases(dp)))
        if(options.timeline_type==='non-cumulative') y = (140-yScaleCases(d.new_cases)-(yScaleCases(dp)))
        if(options.timeline_type==='stacked') y = (140-(140*(d.new_cases/totalNewCases))-((140*(dp/totalNewCases))))
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('height', function(d,i){
        const totalNewCases = d3.select(this.parentNode).datum().total_new_cases - d3.select(this.parentNode).datum().OTH.new_cases;
        let y = 0;
        if(options.timeline_type==='cumulative') y = yScaleCases(d.cumulative_cases);
        if(options.timeline_type==='non-cumulative') y = yScaleCases(d.new_cases);
        if(options.timeline_type==='stacked') y = (140*(d.new_cases/totalNewCases));
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('fill', function(d,i){
        return colors.regions[d.region];
        return 'blue'
    })

    // // DEATHS
    barGroups.selectAll('.deaths_bar')
    .data(function(d,i){ return d.region.filter(function(dd,ii){
        return dd.region!=='OTH';
    })})
    .transition()
    .duration(500)
    .attr('y', function(d,i){
        const totalNewDeaths = d3.select(this.parentNode).datum().total_new_deaths - d3.select(this.parentNode).datum().OTH.new_deaths;
        let dp = 0;
        if(i>0){
            for(let ii=1;ii<=i;ii++){
                if(options.timeline_type==='cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].cumulative_deaths;
                if(options.timeline_type==='non-cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].new_deaths;
                if(options.timeline_type==='stacked') dp += d3.select(this.parentNode).datum().region[ii-1].new_deaths;
            }
        }
        let y = 0;
        if(options.timeline_type==='cumulative') y = (140-yScaleDeaths(d.cumulative_deaths)-(yScaleDeaths(dp))+170)
        if(options.timeline_type==='non-cumulative') y = (140-yScaleDeaths(d.new_deaths)-(yScaleDeaths(dp))+170)
        if(options.timeline_type==='stacked') y = (140-(140*(d.new_deaths/totalNewDeaths))-((140*(dp/totalNewDeaths)))+170)
        // if(options.timeline_type==='non-cumulative') if(y>310) return 0;
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('height', function(d,i){
        const totalNewDeaths = d3.select(this.parentNode).datum().total_new_deaths - d3.select(this.parentNode).datum().OTH.new_deaths;
        let y = 0;
        if(options.timeline_type==='cumulative') y = yScaleDeaths(d.cumulative_deaths);
        if(options.timeline_type==='non-cumulative') y = yScaleDeaths(d.new_deaths);
        if(options.timeline_type==='stacked') y = (140*(d.new_deaths/totalNewDeaths));
        if(options.timeline_type==='non-cumulative') if(y<0) return 0;

        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })

    if(groupedData.length==0){
        d3.selectAll('.cases_bar')
        .transition()
        .duration(500)
        .attr('y', 140)
        .attr('height', 0)

        d3.selectAll('.deaths_bar')
        .transition()
        .duration(500)
        .attr('y', 140+170)
        .attr('height', 0)
        
    }
    // // VACCINES

    const vbarGroups = svg.selectAll('.vbar_group')
    .data(vgroupedData)
    .attr('transform', function(d,i){ 
        return 'translate('+xScale(d.date)+', 344)'
    })

    vbarGroups.selectAll('.vaccines_bar')
    .data(function(d,i){ return d.region.filter(function(dd,ii){
        return dd.region!=='OTH';
    })})
    .transition()
    .duration(500)
    .attr('y', function(d,i){
        const totalNewVaccines = d3.select(this.parentNode).datum().total_new_vaccines - d3.select(this.parentNode).datum().OTH.new_vaccines;
        let dp = 0;
        if(i>0){
            for(let ii=1;ii<=i;ii++){
                if(options.timeline_type==='cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].cumulative_vaccines;
                if(options.timeline_type==='non-cumulative') dp += d3.select(this.parentNode).datum().region[ii-1].new_vaccines;
                if(options.timeline_type==='stacked') dp += d3.select(this.parentNode).datum().region[ii-1].new_vaccines;
            }
        }
        let y = 0;
        if(options.timeline_type==='cumulative') y = (140-yScaleVaccines(d.cumulative_vaccines)-(yScaleVaccines(dp)))
        if(options.timeline_type==='non-cumulative') y = (140-yScaleVaccines(d.new_vaccines)-(yScaleVaccines(dp)))
        if(options.timeline_type==='stacked') y = (140-(140*(d.new_vaccines/totalNewVaccines))-((140*(dp/totalNewVaccines))))
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    })
    .attr('height', function(d,i){
        const totalNewVaccines = d3.select(this.parentNode).datum().total_new_vaccines - d3.select(this.parentNode).datum().OTH.new_vaccines;
        let y = 0;
        if(options.timeline_type==='cumulative') y = yScaleVaccines(d.cumulative_vaccines);
        if(options.timeline_type==='non-cumulative') y = yScaleVaccines(d.new_vaccines);
        if(options.timeline_type==='stacked') y = (140*(d.new_vaccines/totalNewVaccines));
        if(y){ if(y>0) { return y} else { return 0}; } else { return 0};
    });

    if(vgroupedData.length==0){
        d3.selectAll('.vaccines_bar')
        .transition()
        .duration(500)
        .attr('y', 140)
        .attr('height', 0)
    }
   
    // // bar size tweak for spacing
    // if(options.timeline_frequency==='month'){
    //     barGroups.selectAll(".timeBar")
    //     .attr("width", function(d) {
    //         var date = d3.select(this.parentNode).datum().date;
    //         var next = d3.timeMonth.offset(date, 1);
    //         return (xScale(next)- xScale(date))*(1-barSpacing);
    //       })
    //     .attr("x", function(d) {
    //         var date = d3.select(this.parentNode).datum().date;
    //         var next = d3.timeMonth.offset(date, 1);
    //         return (xScale(next)- xScale(date))*(barSpacing/2);
    //       })
    //     }

    d3.select('#timechart_svg').on('mouseover',  (event) => {

        var coords = d3.pointer( event );
        hoverBar.attr('opacity', 1)

        var xDate = xScale.invert(coords[0]);

        if(options.timeline_frequency=='week') {
            xDate = moment(xDate).startOf('isoWeek');
        }
        if(options.timeline_frequency=='day') {
            xDate = moment(xDate).startOf('day');
        }
        if(options.timeline_frequency=='month') {
            xDate = moment(xDate).startOf('month');
        }

        if(coords[1]<470){
            timelineTooltip.attr('opacity', 1).attr('display', 'inline');
            hoverBar.attr('height', '100%');
        } else if(coords[1]>510){
            eventTooltip.attr('opacity', 1);
            hoverBar.attr('height', '90%');
        } else {
            eventTooltip.attr('opacity', 0);
            timelineTooltip.attr('opacity', 0);
            hoverBar.attr('height', '100%');
        }

        if((xDate.toDate().getTime()<minDate.getTime())){
            hoverBar.attr('opacity', 0);
            timelineTooltip.attr('opacity', 0);
        }

        d3.select('#svg_container').style('z-index', 10);

    }).on('mouseout',  (event) => {
        hoverBar.attr('opacity', 0)
        timelineTooltip.attr('opacity', 0).attr('display', 'none');
        // timelineTooltip.attr('opacity', 0).attr('transform', 'translate(0,0)');
        d3.select('#svg_container').style('z-index', 1);
        eventTooltip.attr('opacity', 0).attr('transform', 'translate(0,0)');
        d3.selectAll('.event_marker circle').style('stroke', colors.black);
    })
    .on('mousemove', (event) => {
        var coords = d3.pointer( event );

        var xDate = xScale.invert(coords[0]);

        var tooltipStr = '';
        if(options.timeline_frequency=='week') {
            xDate = moment(xDate).startOf('isoWeek');
            tooltipStr = xDate.format('ll');
            d3.select('#timeline_tooltip_date tspan').text(tooltipStr);
        }
        if(options.timeline_frequency=='day') {
            xDate = moment(xDate).startOf('day');
            tooltipStr = xDate.format('ll');
            d3.select('#timeline_tooltip_date tspan').text(tooltipStr);
        }
        if(options.timeline_frequency=='month') {
            xDate = moment(xDate).startOf('month');
            tooltipStr = xDate.format('MMMM YYYY');
            d3.select('#timeline_tooltip_date tspan').text(tooltipStr);
        }
        hoverBar.attr('x', xScale(xDate.toDate()));

        var groupedDataFiltered = groupedData.filter(function(d,i){
            return moment(d.date).startOf('day').unix() == xDate.startOf('day').unix();
        });
        var vgroupedDataFiltered = vgroupedData.filter(function(d,i){
            return moment(d.date).startOf('day').unix() == xDate.startOf('day').unix();
        });

        var deaths = '-';
        var cases = '-';
        var vaccines = '-';
        if(options.timeline_type=='cumulative'){ 
            // cumulative
            if(groupedDataFiltered[0]) cases = nFormatter(groupedDataFiltered[0].total_cumulative_cases, 2);
            if(groupedDataFiltered[0]) deaths = nFormatter(groupedDataFiltered[0].total_cumulative_deaths, 2);
            if(vgroupedDataFiltered[0]) vaccines = nFormatter(vgroupedDataFiltered[0].total_cumulative_vaccines, 2);
        } else {
            // non-cumulative/stacked
            if(groupedDataFiltered[0]) cases = nFormatter(groupedDataFiltered[0].total_new_cases, 2);
            if(groupedDataFiltered[0]) deaths = nFormatter(groupedDataFiltered[0].total_new_deaths, 2);
            if(vgroupedDataFiltered[0]) vaccines = nFormatter(vgroupedDataFiltered[0].total_new_vaccines, 2);
        }

        if(deaths==0) deaths = '-';
        if(cases==0) cases = '-';
        if(vaccines==0) vaccines = '-';

        d3.select('#tooltip_cases tspan').text((cases)).attr("text-anchor", "end").attr('dx', 32)
        d3.select('#tooltip_deaths tspan').text((deaths)).attr("text-anchor", "end").attr('dx', 32)
        d3.select('#tooltip_vaccines tspan').text((vaccines)).attr("text-anchor", "end").attr('dx', 32)

        // if((xDate.toDate().getTime()>options.maxDate.getTime())){
        //     hoverBar.attr('opacity', 0);
        // // } else 
        if(((xDate.toDate().getTime()<minDate.getTime()))&&(options.timeline_frequency=='day')){
            hoverBar.attr('opacity', 0);
            timelineTooltip.attr('opacity', 0);
        }

        if(options.timeline_frequency=='month'){
            hoverBar.attr('width', function(){
               return xScale(moment(xDate).endOf('month')) - xScale(moment(xDate).startOf('month'));
            })
        }
        timelineTooltip.attr('transform', function(){
            var bw = barWidth;
            var ratio = (options.brushR - options.brushL)/600;
            var offset = 0;
            if(ratio<0.5) offset = 3;
            if(ratio<0.3) offset = 12;
            if(ratio<0.2) offset = 20;
            if(ratio<0.15) offset = 21;
            if(options.timeline_frequency=='month') { 
                if(ratio<0.6) offset = 20;
                if(ratio<0.5) offset = 30;
                if(ratio<0.3) offset = 50;
                if(ratio<0.2) offset = 60;
                if(ratio<0.1) offset = 70;
                return 'translate('+(((xScaleEvents(xDate.toDate()))+(barWidth/3))+offset)+','+(coords[1]+353)+')';
            }
            return 'translate('+((xScaleEvents(xDate.toDate())+(18))+offset)+','+(coords[1]+353)+')';
        })

        if(coords[1]<470){
            timelineTooltip.attr('opacity', 1);
            hoverBar.attr('opacity', 1);
            hoverBar.attr('height', '100%');
        } else if(coords[1]>510){
            eventTooltip.attr('opacity', 1);
            hoverBar.attr('height', '90%');
            var x = moment(xScale.invert(coords[0])).startOf('day');
            var xx = (xScale.invert(coords[0]))
            eventTooltip.attr('transform', function(){
                return 'translate('+(xScaleEvents(x.toDate())+(-3))+','+(817)+')';
            });

            var events = tData.filter(function(d,i){
                return moment(d.date).startOf('day').unix() == x.unix()
            });

            // select nearest neighbor for ux purposes 
            if(events.length==0){
                events = tData.filter(function(d,i){
                    return ((moment(d.date).startOf('day').unix() <= moment(x).add(1, 'days').unix())&&(moment(d.date).startOf('day').unix() >= moment(x).subtract(1, 'days').unix()))
                });
            }
            
            if(events.length>0){

                d3.select('#event-'+moment(events[0].date).startOf('day').unix()).select('path').style('stroke', '#000').attr('opacity', 1);
                tooltipStr = moment(events[0].date).startOf('day').format('ll');
                d3.select('#event_tooltip_date tspan').text(tooltipStr);

                var wrap = textwrap().bounds({height: 200, width: 230}).method('tspans');
                var event = d3.select('#event_tooltip_text').text(events[0].description)
                .attr('y', 18)
                .attr('x', 6)
                d3.select('#event_tooltip_text').call(wrap);

                d3.selectAll('#event_tooltip_text tspan').attr('dy', '1.3em');
                var bbox = d3.select('#event_tooltip_text').node().getBBox();
                d3.select('#event_tooltip_rect').attr('width', bbox.width+17)
                .attr('height', bbox.height +26 );

                var h = d3.select('#event_tooltip_rect').attr('height');
                var ys = 0;

                if(bbox.height<20){
                    ys = 19;
                } else if(bbox.height<30){
                    ys = 9;
                } else if(bbox.height<40){
                    ys = 0;
                } else if(bbox.height<50){
                    ys = -20;
                } else if(bbox.height<60){
                    ys = -20;
                }

                var y = d3.select('#event_tooltip_rect').attr('y');

                d3.select('#event_tooltip_rect').attr('y', ys);
                
                d3.selectAll('#event_tooltip_text').attr('y', function(d,i){
                    return parseInt(d3.select(this).attr('y')) + ys;
                });

                d3.selectAll('#event_tooltip_date tspan').attr('dy', function(d,i){
                    return ys;
                });

                eventTooltip.attr('opacity', 1);

            } else {
                d3.selectAll('.event_marker circle').style('stroke', colors.black)
                eventTooltip.attr('opacity', 0);
            }
        } else {
            eventTooltip.attr('opacity', 0);
            timelineTooltip.attr('opacity', 0);
            hoverBar.attr('opacity', 0);
            hoverBar.attr('height', '100%');
        }

        if((options.timeline_frequency=='day')&&((xDate.toDate().getTime()<minDate.getTime()))){
            hoverBar.attr('opacity', 0);
            timelineTooltip.attr('opacity', 0);
            return false;
        }
    });

}

export default drawTimechart;
