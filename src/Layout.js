import * as d3 from "d3";
import {drawTimechart, updateTimechart} from './Timechart';
import {updateRegionchart} from './Regionchart';
import colors from './colors';
import tippy from 'tippy.js';
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/themes/light.css';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const selectedToggle = '#595454';
const unselectedToggle = '#EAEAEA';
const unselectedToggleText = '#000';
const selectedToggleText = '#FFF';

function Layout(svg, options, data, filter, updateTable, updateMap) {

  // vaccine info
  d3.select('#vaccine_tooltip').attr('opacity', 0).style('display', 'none');
  d3.select('#vaccine_info path').attr('fill', colors.black);

  svg.select('#vaccine_info').style('cursor', 'pointer')
  .on('mouseover', function(event, bd){
    d3.select('#svg_container').style('z-index', 10);
    d3.select('#vaccine_tooltip').style('display', 'inline').transition().duration(500).attr('opacity', 1);
    d3.select('#vaccine_info path').transition().duration(200).attr('fill', colors.blue);
  }).on('mouseout', function(event, d){
    d3.select('#svg_container').style('z-index', 1);
    d3.select('#vaccine_tooltip').style('display', 'none').attr('opacity', 0);
    d3.select('#vaccine_info path').transition().duration(500).attr('fill', colors.black);
  })

  // region chart toggle
  svg.select('#region_remove_filter').attr('opacity', 0).style('cursor', 'pointer').on('click', function(d,i){
    options.region_filter = []; 
    filter('clear-region');
  });

  svg.select('#region_switch').style('cursor', 'pointer').on('click', function(d,i){
    if(options.region_switch=='total'){
      options.region_switch = 'per100';
      d3.select('#region_switch_toggle').transition().duration(200).attr('x', 15.1);
    } else {
      options.region_switch = 'total';
      d3.select('#region_switch_toggle').transition().duration(200).attr('x', 3.1);
    }
    updateRegionchart(options,data);
  })

  svg.select('#region-chart-toggle #region-chart-toggle-cases').style('cursor', 'pointer').on('click', function(d){
    if(options.region_chart_toggle === 'cases') return false;
    options.region_chart_toggle = 'cases';
    svg.selectAll('#region-chart-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#region-chart-toggle text').attr('fill', unselectedToggleText);
    svg.select('#region-chart-toggle-cases rect').attr('fill', selectedToggle);
    svg.select('#region-chart-toggle-cases text').attr('fill', selectedToggleText);
    updateRegionchart(options,data);
  });

  svg.select('#region-chart-toggle #region-chart-toggle-deaths').style('cursor', 'pointer').on('click', function(d){
    if(options.region_chart_toggle === 'deaths') return false;
    options.region_chart_toggle = 'deaths';
    svg.selectAll('#region-chart-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#region-chart-toggle text').attr('fill', unselectedToggleText);
    svg.select('#region-chart-toggle-deaths rect').attr('fill', selectedToggle);
    svg.select('#region-chart-toggle-deaths text').attr('fill', selectedToggleText);
    updateRegionchart(options,data);
  });

  svg.select('#region-chart-toggle #region-chart-toggle-vaccines').style('cursor', 'pointer').on('click', function(d){
    if(options.region_chart_toggle === 'vaccines') return false;
    options.region_chart_toggle = 'vaccines';
    svg.selectAll('#region-chart-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#region-chart-toggle text').attr('fill', unselectedToggleText);
    svg.select('#region-chart-toggle-vaccines rect').attr('fill', selectedToggle);
    svg.select('#region-chart-toggle-vaccines text').attr('fill', selectedToggleText);
    updateRegionchart(options,data);
  });

  // map toggle
  svg.select('#map-toggle #map-toggle-bi-weekly-change').style('cursor', 'pointer').on('click', function(d){
    if(options.map_toggle === 'bi-weekly-change') return false;
    options.map_toggle = 'bi-weekly-change';
    svg.selectAll('#map-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#map-toggle text').attr('fill', unselectedToggleText);
    svg.select('#map-toggle-bi-weekly-change rect').attr('fill', selectedToggle);
    svg.select('#map-toggle-bi-weekly-change text').attr('fill', selectedToggleText);
    // update map legend

    updateMap(data, options, 700);
  });

  svg.select('#map-toggle #map-toggle-cases').style('cursor', 'pointer').on('click', function(d){
    if(options.map_toggle === 'cases') return false;
    options.map_toggle = 'cases';
    svg.selectAll('#map-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#map-toggle text').attr('fill', unselectedToggleText);
    svg.select('#map-toggle-cases rect').attr('fill', selectedToggle);
    svg.select('#map-toggle-cases text').attr('fill', selectedToggleText);
    // update map legend

    updateMap(data, options, 700);
  });

  svg.select('#map-toggle #map-toggle-deaths').style('cursor', 'pointer').on('click', function(d){
    if(options.map_toggle === 'deaths') return false;
    options.map_toggle = 'deaths';
    svg.selectAll('#map-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#map-toggle text').attr('fill', unselectedToggleText);
    svg.select('#map-toggle-deaths rect').attr('fill', selectedToggle);
    svg.select('#map-toggle-deaths text').attr('fill', selectedToggleText);
    // update map legend

    updateMap(data, options, 700);
  });

  svg.select('#map-toggle #map-toggle-percent-fully-vaccinated').style('cursor', 'pointer').on('click', function(d){
    if(options.map_toggle === 'percent-fully-vaccinated') return false;
    options.map_toggle = 'percent-fully-vaccinated';
    svg.selectAll('#map-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#map-toggle text').attr('fill', unselectedToggleText);
    svg.select('#map-toggle-percent-fully-vaccinated rect').attr('fill', selectedToggle);
    svg.select('#map-toggle-percent-fully-vaccinated text').attr('fill', selectedToggleText);
    // update map legend
    updateMap(data, options, 700);
  });

  svg.select('#map-toggle #map-toggle-percent-vaccine-acceptance').style('cursor', 'pointer').on('click', function(d){
    if(options.map_toggle === 'percent-vaccine-acceptance') return false;
    options.map_toggle = 'percent-vaccine-acceptance';
    svg.selectAll('#map-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#map-toggle text').attr('fill', unselectedToggleText);
    svg.select('#map-toggle-percent-vaccine-acceptance rect').attr('fill', selectedToggle);
    svg.select('#map-toggle-percent-vaccine-acceptance text').attr('fill', selectedToggleText);
    // update map legend
    updateMap(data, options, 700);
  });

    // time chart type 
    svg.select('#timechart-type-toggle #timechart-type-toggle-cumulative').style('cursor', 'pointer').on('click', function(d){
      if(options.timeline_type === 'cumulative') return false;
      options.timeline_type = 'cumulative';
      svg.selectAll('#timechart-type-toggle rect').attr('fill', unselectedToggle);
      svg.selectAll('#timechart-type-toggle polyline').attr('stroke', unselectedToggleText);
      svg.select('#timechart-type-toggle-cumulative rect').attr('fill', selectedToggle);
      svg.select('#timechart-type-toggle-cumulative polyline').attr('stroke', selectedToggleText);
      svg.selectAll('#timechart-type-toggle-stacked polygon').attr('fill', selectedToggle);
      updateTimechart(data, options);
    });
  
    tippy('#timechart-type-toggle-cumulative', {
      content: 'Cumulative',
      duration: 0,
      placement: 'bottom',
      theme: 'light',
      arrow: true,
      delay: [500, 200],
    });

    svg.select('#timechart-type-toggle #timechart-type-toggle-non-cumulative').style('cursor', 'pointer').on('click', function(d){
      if(options.timeline_type === 'non-cumulative') return false;
      options.timeline_type = 'non-cumulative';
      svg.selectAll('#timechart-type-toggle rect').attr('fill', unselectedToggle);
      svg.selectAll('#timechart-type-toggle polyline').attr('stroke', unselectedToggleText);
      svg.select('#timechart-type-toggle-non-cumulative rect').attr('fill', selectedToggle);
      svg.select('#timechart-type-toggle-non-cumulative polyline').attr('stroke', selectedToggleText);
      svg.selectAll('#timechart-type-toggle-stacked polygon').attr('fill', selectedToggle);
      updateTimechart(data, options);
    });

    tippy('#timechart-type-toggle-non-cumulative', {
      content: 'Non-cumulative',
      duration: 0,
      placement: 'bottom',
      theme: 'light',
      arrow: true,
      delay: [500, 200],
    });

    svg.select('#timechart-type-toggle #timechart-type-toggle-stacked').style('cursor', 'pointer').on('click', function(d){
      if(options.timeline_type === 'stacked') return false;
      options.timeline_type = 'stacked';
      svg.selectAll('#timechart-type-toggle rect').attr('fill', unselectedToggle);
      svg.selectAll('#timechart-type-toggle polyline').attr('stroke', unselectedToggleText);
      svg.select('#timechart-type-toggle-stacked rect').attr('fill', selectedToggle);
      svg.select('#timechart-type-toggle-stacked polyline').attr('stroke', selectedToggleText);
      svg.selectAll('#timechart-type-toggle-stacked polygon').attr('fill', selectedToggleText);
      updateTimechart(data, options);
    });

    tippy('#timechart-type-toggle-stacked', {
      content: 'Stacked 100%',
      duration: 0,
      placement: 'bottom',
      theme: 'light',
      arrow: true,
      delay: [500, 200],
    });

  // time chart frequency toggle
  svg.select('#timechart-frequency-toggle #timechart-frequency-toggle-day').style('cursor', 'pointer').on('click', function(d){
    if(options.timeline_frequency === 'day') return false;
    options.timeline_frequency = 'day';
    svg.selectAll('#timechart-frequency-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#timechart-frequency-toggle text').attr('fill', unselectedToggleText);
    svg.select('#timechart-frequency-toggle-day rect').attr('fill', selectedToggle);
    svg.select('#timechart-frequency-toggle-day text').attr('fill', selectedToggleText);
    svg.select('#tooltip_frequency tspan').attr('text-anchor', 'end').attr('dx', 20).text('DAY');
    drawTimechart(data, options);
  });

  svg.select('#timechart-frequency-toggle #timechart-frequency-toggle-week').style('cursor', 'pointer').on('click', function(d){
    if(options.timeline_frequency === 'week') return false;
    options.timeline_frequency = 'week';
    svg.selectAll('#timechart-frequency-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#timechart-frequency-toggle text').attr('fill', unselectedToggleText);
    svg.select('#timechart-frequency-toggle-week rect').attr('fill', selectedToggle);
    svg.select('#tooltip_frequency tspan').attr('text-anchor', 'end').attr('dx', 20).text('WEEK');
    svg.select('#timechart-frequency-toggle-week text').attr('fill', selectedToggleText);
    drawTimechart(data, options);
  });

  svg.select('#timechart-frequency-toggle #timechart-frequency-toggle-month').style('cursor', 'pointer').on('click', function(d){
    if(options.timeline_frequency === 'month') return false;
    options.timeline_frequency = 'month';
    svg.selectAll('#timechart-frequency-toggle rect').attr('fill', unselectedToggle);
    svg.selectAll('#timechart-frequency-toggle text').attr('fill', unselectedToggleText);
    svg.select('#timechart-frequency-toggle-month rect').attr('fill', selectedToggle);
    svg.select('#tooltip_frequency tspan').attr('text-anchor', 'end').attr('dx', 20).text('MONTH');
    svg.select('#timechart-frequency-toggle-month text').attr('fill', selectedToggleText);
    drawTimechart(data, options);
  });

    // HDI toggle

    svg.select('#hdi_remove_filter').attr('opacity', 0).style('cursor', 'pointer').on('click', function(d,i){
      d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1);
      filter('clear-hdi');
    });

    svg.select('#hdi-toggle #hdi-toggle-very-high').style('cursor', 'pointer').on('click', function(d){
      toggle(options.hdi_filter, 'very-high');
      if(options.hdi_filter.length === 4) { options.hdi_filter = []; d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1); }
      else if(options.hdi_filter.length === 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1);}
      else if(options.hdi_filter.length > 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 0.3);}
      if(options.hdi_filter.length > 0){
        options.hdi_filter.forEach(function(d,i){
          d3.select('#hdi-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('hdi');
    });

    svg.select('#hdi-toggle #hdi-toggle-high').style('cursor', 'pointer').on('click', function(d){
      toggle(options.hdi_filter, 'high');
      if(options.hdi_filter.length === 4) { options.hdi_filter = []; d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1); }
      else if(options.hdi_filter.length === 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1);}
      else if(options.hdi_filter.length > 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 0.3);}
      if(options.hdi_filter.length > 0){
        options.hdi_filter.forEach(function(d,i){
          d3.select('#hdi-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('hdi');
    });
    svg.select('#hdi-toggle #hdi-toggle-medium').style('cursor', 'pointer').on('click', function(d){
      toggle(options.hdi_filter, 'medium');
      if(options.hdi_filter.length === 4) { options.hdi_filter = []; d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1); }
      else if(options.hdi_filter.length === 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1);}
      else if(options.hdi_filter.length > 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 0.3);}
      if(options.hdi_filter.length > 0){
        options.hdi_filter.forEach(function(d,i){
          d3.select('#hdi-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('hdi');
    });
    svg.select('#hdi-toggle #hdi-toggle-low').style('cursor', 'pointer').on('click', function(d){
      toggle(options.hdi_filter, 'low');
      if(options.hdi_filter.length === 4) { options.hdi_filter = []; d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1);}
      else if(options.hdi_filter.length === 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 1);}
      else if(options.hdi_filter.length > 0) { d3.selectAll('#hdi-toggle-very-high, #hdi-toggle-high, #hdi-toggle-medium, #hdi-toggle-low').attr('opacity', 0.3);}
      if(options.hdi_filter.length > 0){
        options.hdi_filter.forEach(function(d,i){
          d3.select('#hdi-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('hdi');
    });

    // inform severity toggle

    svg.select('#inform_remove_filter').attr('opacity', 0).style('cursor', 'pointer').on('click', function(d,i){
      d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);
      filter('clear-inform');
    });

    svg.select('#inform-toggle #inform-toggle-no-score').style('cursor', 'pointer').on('click', function(d){
      toggle(options.inform_filter, 'no-score');
      if(options.inform_filter.length === 5) { options.inform_filter = []; d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length === 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length > 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 0.3);}
      if(options.inform_filter.length > 0){
        options.inform_filter.forEach(function(d,i){
          d3.select('#inform-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('inform');
    });

    svg.select('#inform-toggle #inform-toggle-low').style('cursor', 'pointer').on('click', function(d){
      toggle(options.inform_filter, 'low');
      if(options.inform_filter.length === 5) { options.inform_filter = []; d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length === 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length > 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 0.3);}
      if(options.inform_filter.length > 0){
        options.inform_filter.forEach(function(d,i){
          d3.select('#inform-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('inform');
    });

    svg.select('#inform-toggle #inform-toggle-medium').style('cursor', 'pointer').on('click', function(d){
      toggle(options.inform_filter, 'medium');
      if(options.inform_filter.length === 5) { options.inform_filter = []; d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length === 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length > 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 0.3);}
      if(options.inform_filter.length > 0){
        options.inform_filter.forEach(function(d,i){
          d3.select('#inform-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('inform');
    });

    svg.select('#inform-toggle #inform-toggle-high').style('cursor', 'pointer').on('click', function(d){
      toggle(options.inform_filter, 'high');
      if(options.inform_filter.length === 5) { options.inform_filter = []; d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length === 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length > 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 0.3);}
      if(options.inform_filter.length > 0){
        options.inform_filter.forEach(function(d,i){
          d3.select('#inform-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('inform');
    });

    svg.select('#inform-toggle #inform-toggle-very-high').style('cursor', 'pointer').on('click', function(d){
      toggle(options.inform_filter, 'very-high');
      if(options.inform_filter.length === 5) { options.inform_filter = []; d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length === 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 1);}
      else if(options.inform_filter.length > 0) { d3.selectAll('#inform-toggle-very-high, #inform-toggle-high, #inform-toggle-medium, #inform-toggle-low, #inform-toggle-no-score').attr('opacity', 0.3);}
      if(options.inform_filter.length > 0){
        options.inform_filter.forEach(function(d,i){
          d3.select('#inform-toggle-'+d).attr('opacity', 1);
        })
      }
      filter('inform');
    });
  
  // tabs

  d3.select('#additional-indicators-tab').attr('opacity', 0).select('#additional-indicators-tab-content').attr('display', 'none');
  d3.select('#vac-tab').attr('opacity', 1).select('#vac-tab-content').attr('display', 'inline');
  d3.select('#bubblechart-tab').attr('opacity', 0).selectAll('#bubblechart, #bubblechart-tab-content').attr('display', 'none');
  d3.select('#bubbleSelectContainer').style('display', 'none');

  svg.select('#tabs #vaccination-tab').style('cursor', 'pointer').on('click', function(d){
    if(options.tab_toggle === 'vaccination-data') return false;
    options.tab_toggle = 'vaccination-data';
    d3.select('#additional-indicators-tab').attr('opacity', 0).select('#additional-indicators-tab-content').attr('display', 'none');
    d3.select('#vac-tab').attr('opacity', 1).select('#vac-tab-content').attr('display', 'inline');
    d3.select('#bubblechart-tab').attr('opacity', 0).selectAll('#bubblechart, #bubblechart-tab-content').attr('display', 'none');
    svg.selectAll('#tabs rect').attr('fill', unselectedToggle);
    svg.selectAll('#tabs text').attr('fill', unselectedToggleText);
    svg.select('#vaccination-tab rect').attr('fill', selectedToggle);
    svg.select('#vaccination-tab text').attr('fill', selectedToggleText);
    d3.select('#bubbleSelectContainer').style('display', 'none');

  });

  svg.select('#tabs #indicators-tab').style('cursor', 'pointer').on('click', function(d){
    if(options.tab_toggle === 'indicators') return false;
    options.tab_toggle = 'indicators';
    d3.select('#additional-indicators-tab').attr('opacity', 1).select('#additional-indicators-tab-content').attr('display', 'inline');
    d3.select('#vac-tab').attr('opacity', 0).select('#vac-tab-content').attr('display', 'none');
    d3.select('#bubblechart-tab').attr('opacity', 0).selectAll('#bubblechart, #bubblechart-tab-content').attr('display', 'none');
    svg.selectAll('#tabs rect').attr('fill', unselectedToggle);
    svg.selectAll('#tabs text').attr('fill', unselectedToggleText);
    svg.select('#indicators-tab rect').attr('fill', selectedToggle);
    svg.select('#indicators-tab text').attr('fill', selectedToggleText);
    d3.select('#bubbleSelectContainer').style('display', 'none');

  });

  svg.select('#tabs #bubble-chart-tab').style('cursor', 'pointer').on('click', function(d){
    if(options.tab_toggle === 'bubble-chartt') return false;
    options.tab_toggle = 'bubble-chart';
    d3.select('#additional-indicators-tab').attr('opacity', 0).select('#additional-indicators-tab-content').attr('display', 'none');
    d3.select('#vac-tab').attr('opacity', 0).select('#vac-tab-content').attr('display', 'none');
    d3.select('#bubblechart-tab').attr('opacity', 1).selectAll('#bubblechart, #bubblechart-tab-content').attr('display', 'inline');
    svg.selectAll('#tabs rect').attr('fill', unselectedToggle);
    svg.selectAll('#tabs text').attr('fill', unselectedToggleText);
    svg.select('#bubble-chart-tab rect').attr('fill', selectedToggle);
    svg.select('#bubble-chart-tab text').attr('fill', selectedToggleText);
    d3.select('#bubbleSelectContainer').style('display', 'inline-block');

  });

  // time chart mask
    d3.select('#svg defs').append('clipPath').attr('id', 'mask')
    .append('rect')
    .attr('y', 340)
    .attr('height', 590)
    .attr('width', 660)
    .attr('x', 22);

  
  // append timechart svg
  const timechartContainer = svg.select('#timechart_container').attr('opacity', 0);
  const tcSize = {
    x: timechartContainer.attr('x'), y: timechartContainer.attr('y'), width: timechartContainer.attr('width'), height: timechartContainer.attr('height')
  }

  const timechartSvg = svg.append('svg').attr('id', 'timechart_svg').attr('viewBox', '0 0 '+2000 +' '+ tcSize.height)
  .attr('preserveAspectRatio', "none")
  .attr('x', tcSize.x)
  .attr('y', tcSize.y)
  .attr('width', tcSize.width)
  .attr('height', tcSize.height)

  const layer1 = timechartSvg
  .append('g')
  .attr('id', 'layer1')

  const timechartBg = timechartSvg.append('g').attr('id', 'layer0');

  layer1.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', '100%')
  .attr('height', '100%')
  .attr('opacity', 0)
  .style('fill', 'transparent');
  
  // table bars

  var tableRowHeight = 18;
  var tableBarYOffset = 68;

  for(let i = 0; i < 10; i++){

    // row bg
    var row = d3.select('#vac-tab').append('g').attr('class', 'row').attr('id', 'row'+i);

    row.on('mouseover', function(d,i){
      d3.selectAll('.rowbg').attr('fill', '#fff');
      var textNodes = d3.select(this).selectAll('text').nodes();
      if(textNodes.length>0) d3.select(this).select('.rowbg').attr('fill', '#FAFAFA');
    }).on('mouseout', function(d,i){
      d3.selectAll('.rowbg').attr('fill', '#fff');
    });

    row.append('rect')
    .attr('class','rowbg')
    .attr('x', 0)
    .attr('y', function(){
      return tableBarYOffset-2+(i*24.8);
    })
    .attr('height', tableRowHeight+4)
    .attr('width', 622)
    .attr('fill', colors.white)

    // col 1 bg
    row.append('rect')
    .attr('class','col1bg colbg')
    .attr('id','col1bg'+i)
    .attr('x', 120)
    .attr('y', function(){
      return tableBarYOffset+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 68)
    .attr('fill', colors.lightgrey)

    // col 1 bar
    row.append('rect')
    .attr('class','col1bar')
    .attr('id','col1bar'+i)
    .attr('x', 120)
    .attr('y', function(){
      return tableBarYOffset+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 0)
    .attr('fill', colors.blue);

    // col 2 bg
    row.append('rect')
    .attr('class','col2bg colbg')
    .attr('id','col2bg'+i)
    .attr('x', 230)
    .attr('y', function(){
      return tableBarYOffset+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 68)
    .attr('fill', colors.lightgrey)

    // col 2 bar
    row.append('rect')
    .attr('class','col2bar')
    .attr('id','col2bar'+i)
    .attr('x', 230)
    .attr('y', function(){
      return tableBarYOffset+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 0)
    .attr('fill', colors.blue);

    // col 3 bg
    row.append('rect')
    .attr('class','col3bg colbg')
    .attr('id','col3bg'+i)
    .attr('x', 340)
    .attr('y', function(){
      return tableBarYOffset+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 68)
    .attr('fill', colors.lightgrey)

    // col 3 bar
    row.append('rect')
    .attr('class','col3bar')
    .attr('id','col3bar'+i)
    .attr('x', 340)
    .attr('y', function(){
      return tableBarYOffset+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 0)
    .attr('fill', colors.blue);

    // col 4 bg
    row.append('rect')
    .attr('class','col4bg colbg')
    .attr('id','col4bg'+i)
    .attr('x', 454)
    .attr('y', function(){
      return 67+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 68)
    .attr('fill', colors.lightgrey)

    // col 3 bar
    row.append('rect')
    .attr('class','col4bar')
    .attr('id','col4bar'+i)
    .attr('x', 454)
    .attr('y', function(){
      return 67+(i*24.8);
    })
    .attr('height', tableRowHeight)
    .attr('width', 0)
    .attr('fill', colors.blue);

    for(var x = 0; x<6; x++){
      d3.select('#col'+x+'_sort_desc').attr('opacity', 0);
      d3.select('#col'+x+'_sort_asc').attr('opacity', 0);
      d3.select('#col'+x+'_sort').style('cursor', 'pointer')
      .on('click', function(){
        var thisId = d3.select(this).attr('id');
        if(options.table_sort==thisId){
          if(options.table_sort_direction=='desc'){
            options.table_sort_direction = 'asc';
          } else {
            options.table_sort_direction = 'desc';
          }
        } else {
          options.table_sort = thisId;
          options.table_sort_direction = 'desc';
        }
        options.page = 1;
        updateTable(data, options);
    })
    // d3.select('#col1_sort_desc').attr('opacity', 1);
    }
  }

  d3.select('#reset_locations').attr('display', 'none');

  printCopySave();

}

// print copy save

var printing;

function printCopySave(){

  tippy('#button-png', {
    content: 'Save as PNG',
    duration: 0,
    placement: 'bottom',
    theme: 'light',
    arrow: true,
    delay: [500, 200],
  });

  tippy('#button-copy', {
    content: 'Copy to clipboard',
    duration: 0,
    placement: 'bottom',
    theme: 'light',
    arrow: true,
    delay: [500, 200],
  });

  tippy('#button-print', {
    content: 'Print to PDF',
    duration: 0,
    placement: 'bottom',
    theme: 'light',
    arrow: true,
    delay: [500, 200],
  });

  tippy('#button-expand', {
    content: 'Open in new window',
    duration: 0,
    placement: 'bottom',
    theme: 'light',
    arrow: true,
    delay: [500, 200],
  });

  d3.select('#button-print').on('click', function(){

    if(printing) return false;
    printing = true;

    setTimeout(function(){
      html2canvas(document.querySelector("#root"),{
            allowTaint: true,
            onclone: function(doc){

            },
            useCORS: false,
            foreignObjectRendering: true,
            ignoreElements: function(element){
              // if(element.id=='adm-toggle') return true;
              // if($(element).hasClass('select2')) return true;
            return false;
            },
            scale: 2,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            logging: false
        }).then(canvas => {
          var img = canvas.toDataURL("image/png");
          var pdf = new jsPDF("l", "mm", "a4");
          var imgProps= pdf.getImageProperties(img);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(img, 'JPEG', 10, 10, pdfWidth-20, pdfHeight-30);
          pdf.save('deep-pdf-export.pdf');
          printing = false;
      },200);
    });
  });

  d3.select('#button-png').on('click',function(){

    if(printing) return false;
    printing = true;

    setTimeout(function(){
      html2canvas(document.querySelector("#root"),{
            allowTaint: true,
            onclone: function(doc){

            },
            useCORS: false,
            foreignObjectRendering: true,
            ignoreElements: function(element){
              // if(element.id=='adm-toggle') return true;
              // if($(element).hasClass('select2')) return true;
            return false;
            },
            scale: 2,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            logging: false
        }).then(canvas => {

      var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      var link = document.createElement('a');
      link.download = 'dashboard-export.png';
      link.href = img;
      link.click();
      link.remove();

      printing = false;
      },200);
    });
  });

  d3.select('#button-expand').on('click', function(){
    window.open(window.location.href, "_blank");
  });

//   d3.select('#button-copy').on('click',function(){

//     if(printing) return false;
//     printing = true;

//     setTimeout(function(){
//       html2canvas(document.querySelector("#root"),{
//             allowTaint: true,
//             onclone: function(doc){

//             },
//             useCORS: false,
//             foreignObjectRendering: true,
//             ignoreElements: function(element){
//               // if(element.id=='adm-toggle') return true;
//               // if($(element).hasClass('select2')) return true;
//             return false;
//             },
//             scale: 1.8,
//             windowWidth: 2800,
//             windowHeight: 2000,
//             logging: false
//         }).then(canvas => {
//           canvas.toBlob(blob, function(){
//             navigator.clipboard.write([
//               new ClipboardItem({
//                 [blob.type]: blob
//               })
//             ]).then(() => {

//             })
//           })
//         // copied to clipboard
//         printing = false;
//       });
//       },200);
//     });
}


export default Layout;

function toggle(collection, item) {
  var idx = collection.indexOf(item);
  if (idx !== -1) {
    collection.splice(idx, 1);
  } else {
    collection.push(item);
  }
}

/*

#timechart-type-toggle #timechart-type-toggle-stacked
#timechart-type-toggle #timechart-type-toggle-non-cumulative
#timechart-type-toggle #timechart-type-toggle-cumulative

#timechart-frequency-toggle #timechart-frequency-toggle-day
#timechart-frequency-toggle #timechart-frequency-toggle-week
#timechart-frequency-toggle #timechart-frequency-toggle-month

#map-toggle #map-toggle-bi-weekly-change
#map-toggle #map-toggle-deaths
#map-toggle #map-toggle-percent-fully-vaccinated
#map-toggle #map-toggle-percent-vaccine-acceptance
#map-toggle #map-toggle-cases

#tabs #bubble-chart-tab
#tabs #indicators-tab
#tabs #vaccination-tab

#hdi-toggle #hdi-toggle-very-high
#hdi-toggle #hdi-toggle-high
#hdi-toggle #hdi-toggle-medium
#hdi-toggle #hdi-toggle-low


#inform-toggle #inform-toggle-no-score
#inform-toggle #inform-toggle-low
#inform-toggle #inform-toggle-medium
#inform-toggle #inform-toggle-high
#inform-toggle #inform-toggle-very-high

*/