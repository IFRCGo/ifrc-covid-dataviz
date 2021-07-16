import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import Layout from './Layout';
import {drawTimechart, updateTimechart} from './Timechart';
import {drawRegionchart, updateRegionchart} from './Regionchart';
import {drawBubblechart, updateBubblechart} from './Bubblechart';
import options from './Options';
import ParseData from './ParseData';
import './App.css'
import $ from "jquery";
import select2 from 'select2';
import 'select2/dist/css/select2.min.css'
import {addCommas, nFormatter} from './HelperFunctions';
import { createMap, updateMap } from './Map';
import moment from 'moment';

  /* 
  add this attribute to package.json when deploying to github pages.
 "homepage": "https://ifrcgo.github.io/ifrc-covid-dataviz/build", 
  */

const equityDataUrl = './data/equity_data.csv';
const layoutUrl = "./images/layout.svg";
const whoDataUrl = "./data/who_global_cases.csv";
// const whoDataUrl = "http://covid19.who.int/WHO-COVID-19-global-data.csv";
const vaccinesDataUrl = "./data/owid_vaccinations.csv";
// const vaccinesDataUrl = "http://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv";
const vaccinesWhoDataUrl = "./data/who_vaccination_data.csv";
// const vaccinesWhoDataUrl = "http://covid19.who.int/who-data/vaccination-data.csv";
const timelineDataUrl = "./data/timeline.csv";
const selfAssessmentDataUrl = "./data/self_assessment.csv";
const vaccineAcceptanceDataUrl = "./data/vaccine_acceptance.csv";

const data = {};

const regionOptions = [
  { id: 'AM', text: 'Americas' },
  { id: 'EU', text: 'Europe' },
  { id: 'AP', text: 'Asia-Pacific' },
  { id: 'ME', text: 'Middle East and North Africa'},
  { id: 'AF', text: 'Africa' }
]

const countryOptions = [];

function App() {

  const [progress, setProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('Loading SVG layout...');

  async function init(){

    // data source 1: layout.svg
    const layout = d3.xml(layoutUrl);
    layout.then(function(d){
      d3.select('#svg_container').node().append(d3.select(d.documentElement).attr('width', '100%').attr('height', '100%').node());
      const svg = d3.select('#svg_container svg');
      svg.select('title').remove();
      svg.attr('id', 'svg');
      Layout(svg, options, data, filter, updateTable, updateMap);
      setProgress(0.1);
      setLoaderText('Loading equity data CSV...');
      // data source 2: equity_data.csv
      const equityData = d3.csv(equityDataUrl);
      equityData.then(function(d){
        data.equity_data = d;
        d.forEach(function(d,i){
          countryOptions.push({'text': d.country_name, 'id': 'Country-'+d.country_iso2 })
        })
        createSelects();
        setProgress(0.1);
        setLoaderText('Loading WHO data CSV...');
        // data source 1: owid_vaccines.csv
        const vaccinesData = d3.csv(vaccinesDataUrl);
          vaccinesData.then(function(d){
            data.vaccines_data = d;
            setProgress(0.07);
            setLoaderText('Loading OWID vaccines data...');
             // data source 2: vaccinesWhoData.csv
             const vaccinesWhoData = d3.csv(vaccinesWhoDataUrl);
             vaccinesWhoData.then(function(d){
               data.vaccines_who_data = d;
               setProgress(0.15);
               setLoaderText('Loading OWID vaccines data...');
                // data source 3: self_assessment.csv
                const selfAssessmentData = d3.csv(selfAssessmentDataUrl);
                selfAssessmentData.then(function(d){
                  data.self_assessment = d;
                  setProgress(0.22);
                  setLoaderText('Loading self assessment...');
                  // data source 4: vaccine_acceptance.csv
                  const vaccineAcceptanceData = d3.csv(vaccineAcceptanceDataUrl);
                  vaccineAcceptanceData.then(function(d){
                    data.vaccine_acceptance = d;
                    setProgress(0.3);
                      setLoaderText('Loading vaccine acceptance data...');
                      // data source 3: timeline.csv
                      const timelineData = d3.csv(timelineDataUrl);
                      timelineData.then(function(d){
                        data.timeline_data = d;
                        setProgress(0.4);
                        setLoaderText('Loading WHO daily data...');
                          // data source 5: who_global_cases.csv
                          const whoData = d3.csv(whoDataUrl);
                          whoData.then(function(d){
                            data.who_data = d;
                            setProgress(0.8);
                              setLoaderText('Loading complete.');
                              setProgress(1);
                              ParseData(data, options);
                              createCharts();
                              d3.select('#loaderDiv').transition().duration(1000).style('opacity', 0).on("end", () => d3.select('#loaderDiv').remove());
                    });
                  });
                });
              });
            });
          });
      });
    })
  }
  
  function createCharts(){
    d3.select('#who_data_date tspan').text(moment(data.max_date).format('ll'));
    d3.select('#owid_data_date tspan').text(moment(data.max_vaccine_date).format('ll'));
    drawTimechart(data, options);
    drawRegionchart(data, options, filter);
    updateTable(data, options);
    updateTotals(data, options);
    createMap(data, options, filter);
    drawBubblechart(data, options, filter);
  }

  function filter(id,e){
    options.page = 1;
    if(id=='clear'){
      options.region_filter = [];
      options.country_filter = [];
      d3.select('#reset_locations').attr('display', 'none');
    } 
    if(id=='clear-region'){
      options.region_filter = [];
    } 

    if(id=='clear-hdi'){
      options.hdi_filter = [];
    } 

    if(id=='clear-inform'){
      options.inform_filter = [];
    } 

    if((id.length==1)&&(id[0].length==2)&&(id!='filter')){
      if(options.region_filter.includes(id[0])){
        options.region_filter = options.region_filter.filter(d=>d!==id[0])
      } else {
        options.region_filter.push(id[0]);
      }
    }

    if(options.region_filter.length==5) options.region_filter = [];

    if(options.region_filter.length>0){
      d3.select('#region_remove_filter').attr('opacity', 1);

      d3.selectAll('.bar-labels').attr('opacity', 0.5);
      options.region_filter.forEach(function(d,i){
        d3.select('.bar-label-'+d).attr('opacity', 1);
      })
    } else {
        d3.select('#region_remove_filter').attr('opacity', 0);
        d3.selectAll('.bar-labels').attr('opacity', 1);
    }

    data.country = data.original.country;

    var hdi_countries = [];
    if(options.hdi_filter.length>0){
      d3.select('#hdi_remove_filter').attr('opacity', 1);
      data.country.forEach(function(d,i){
        if(options.hdi_filter.includes(d.hdi_category)){
          hdi_countries.push(d.country_iso2);
        }
      })
    } else {
      d3.select('#hdi_remove_filter').attr('opacity', 0);
    }

    var inform_countries = [];
    if(options.inform_filter.length>0){
      d3.select('#inform_remove_filter').attr('opacity', 1);
      data.country.forEach(function(d,i){
        if(options.inform_filter.includes(d.inform_severity)){
          inform_countries.push(d.country_iso2);
        }
      })
    } else {
      d3.select('#inform_remove_filter').attr('opacity', 0);
    }

    if((id.length==1)&&(id[0].length>2)){
      var code = id[0].substring(8);
      if(options.country_filter.includes(code)){
        options.country_filter = options.country_filter.filter(d=>d!==code)
      } else {
        options.country_filter.push(code);
      }
    }

    if((options.region_filter.length==0)&&(options.country_filter.length==0)){
      d3.select('#reset_locations').attr('display', 'none');
    }

    var countryIds = [];
    options.country_filter.forEach(function(d,i){
      countryIds.push('Country-'+d);
    })

    if((options.region_filter.length>0)||(options.country_filter.length>0)) {
        d3.select('#reset_locations').attr('display', 'inline')
      } else {
        d3.select('#reset_locations').attr('display', 'none')
      }

    var mergeFilter = options.region_filter.concat(countryIds);
    $('#regionSelect').val(mergeFilter)
    $('#regionSelect').trigger('change');

    // update data
    data.who_data = data.original.who_data;

    if(inform_countries.length>0){
      data.who_data = data.who_data.filter(function(d,i){
        return inform_countries.includes(d.country_code)
      })
    }
    
    if((options.region_filter.length>0)||(options.country_filter.length>0)||(hdi_countries.length>0)){
      data.who_data = data.who_data.filter(function(d,i){
        if(hdi_countries.length>0){
          if((options.region_filter.length>0)||(options.country_filter.length>0)){
            return (options.region_filter.includes(d.ifrc_region)||(options.country_filter.includes(d.country_code)))&&(hdi_countries.includes(d.country_code))
          } else {
            return (hdi_countries.includes(d.country_code))
          }
        } else {
          return options.region_filter.includes(d.ifrc_region)||(options.country_filter.includes(d.country_code))
        }
      })
    }
    data.vaccines_data = data.original.vaccines_data;

    if(inform_countries.length>0){
      data.vaccines_data = data.vaccines_data.filter(function(d,i){
        return inform_countries.includes(d.country_code)
      })
    }
    if((options.region_filter.length>0)||(options.country_filter.length>0)||(hdi_countries.length>0)){
      data.vaccines_data = data.vaccines_data.filter(function(d,i){
        if(hdi_countries.length>0){
          if((options.region_filter.length>0)||(options.country_filter.length>0)){
            return (options.region_filter.includes(d.ifrc_region)||(options.country_filter.includes(d.country_code)))&&(hdi_countries.includes(d.country_code))
          } else {
            return (hdi_countries.includes(d.country_code))
          }
        } else {
          return options.region_filter.includes(d.ifrc_region)||(options.country_filter.includes(d.country_code))
        }
      })
    }

    if(inform_countries.length>0){
      data.country = data.country.filter(function(d,i){
        return inform_countries.includes(d.country_iso2)
      })
    } 
    if((options.region_filter.length>0)||(options.country_filter.length>0)||(hdi_countries.length>0)){
      data.country = data.country.filter(function(d,i){
        if(hdi_countries.length>0){
          if((options.region_filter.length>0)||(options.country_filter.length>0)){
            return (options.region_filter.includes(d.ifrc_region)||(options.country_filter.includes(d.country_iso2)))&&(hdi_countries.includes(d.country_iso2))
          } else {
            return (hdi_countries.includes(d.country_iso2))
          }
        } else {
          return options.region_filter.includes(d.ifrc_region)||(options.country_filter.includes(d.country_iso2))
        }
      })
    }

    handleSelectLength();
    updateCharts();

  }
  function updateCharts(){
    updateRegionchart(options,data);
    updateTable(data, options);
    updateTotals(data, options);
    updateTimechart(data, options);
    updateMap(data,options);
    updateBubblechart(data, options, filter);
  }

  function updateTotals(data,options){

    var numCountriesFiltered = data.country.length;

    // total cases
    var totalCases = d3.sum(data.country, d => d.cumulative_cases);
    d3.select('#total_cases tspan').transition().duration(500)
    .textTween(function() {
      return function(t) {
        return nFormatter(d3.interpolate(0, totalCases)(t))
      };
    });

    // hide bars when zero cases
    if(totalCases==0){
      d3.selectAll('.bar_group').attr('opacity',0);
    } else {
      d3.selectAll('.bar_group').attr('opacity',1);
    }

    // total new cases
    var totalNewCases = totalCases - d3.sum(data.country, d => d.cumulative_cases_7_days);
    d3.select('#total_new_cases tspan').text('-');
    d3.select('#total_new_cases tspan').transition().duration(500)
    .textTween(function() {
      return function(t) {
        return nFormatter(d3.interpolate(0, totalNewCases)(t))
      };
    })

    // total deaths
    var totalDeaths = d3.sum(data.country, d => d.cumulative_deaths);
    d3.select('#total_deaths tspan').transition().duration(500)
    .textTween(function() {
      return function(t) {
        return nFormatter(d3.interpolate(0, totalDeaths)(t))
      };
    })

    var totalVaccinations = d3.sum(data.country, d => d.total_vaccinations);
    d3.select('#total_vaccines tspan').transition().duration(500)
    .textTween(function() {
      return function(t) {
        return nFormatter(d3.interpolate(0, totalVaccinations)(t))
      };
    })

    //***************************
    // vaccies per 100 / acceptance / vaccine types / ns involvemnt
    //***************************
    var vaccinesPer100 = {population: 0, vaccine_population: 0};
    var vaccineAcceptance = {population: 0, vaccine_acceptance_population: 0};
    var numNsInvolvedCountres = 0;
    data.vaccine_types = [];
    data.country.forEach(function(dd,ii){
      // vaccine per 100 including country population weight
      if((dd.vaccines_per_100>0)&&(dd.population>0)) {
        vaccinesPer100.population += dd.population;
        vaccinesPer100.vaccine_population += dd.population*dd.vaccines_per_100;
      }
      // vaccine acceptance including country population weight
      if(dd.vaccine_acceptance_population>0) {
        vaccineAcceptance.population += dd.vaccine_acceptance_population;
        vaccineAcceptance.vaccine_acceptance_population += dd.vaccine_acceptance_population*dd.vaccine_acceptance_percent;
      }
      // vacine types data
      dd.vaccines_used.forEach(function(ddd){
        if((!data.vaccine_types.includes(ddd))&&(ddd.length>1)&&(!ddd.includes('nactiv'))) data.vaccine_types.push(ddd);
      })
      // ns involved countries
      numNsInvolvedCountres += dd.ns_involvement;
    });

    // update total doses per 100 total
    d3.select('#total_vac_100 tspan').text('-');
    var vaccinePer100ByPopulation = vaccinesPer100.vaccine_population / vaccinesPer100.population;
    if(vaccinePer100ByPopulation){
      d3.select('#total_vac_100 tspan').transition().duration(500)
      .textTween(function() {
        return function(t) {
          return (d3.interpolate(0, vaccinePer100ByPopulation)(t).toFixed(1))
        };
      })
    }

    // update vaccine acceptance percent total
    d3.select('#percent_acceptance tspan').text('-');
    var vaccineAcceptancePercent = vaccineAcceptance.vaccine_acceptance_population / vaccineAcceptance.population;
    if(vaccineAcceptancePercent){
      d3.select('#percent_acceptance tspan').transition().duration(500)
      .textTween(function() {
        return function(t) {
          return Math.round(d3.interpolate(0, Math.round(vaccineAcceptancePercent))(t))+'%';
        };
      })
    }

    // update ns involved total
    d3.select('#total_ns_countries tspan').transition().duration(500)
    .textTween(function() {
      return function(t) {
        return Math.round(d3.interpolate(0, numNsInvolvedCountres)(t))
      };
    })

    // update num types of vaccines total
    d3.select('#num_vaccines tspan').transition().duration(500)
    .textTween(function() {
      return function(t) {
        return Math.round(d3.interpolate(0, data.vaccine_types.length)(t))
      };
    })

    // vaccine type tooltip list
    d3.selectAll('.vaccine_type').remove();
    d3.select('#vaccine_tooltip_bg').attr('height', 1);
    data.vaccine_types.forEach(function(d,i){
      d3.select("#vaccine_tooltip").append('text')
      .attr('font-size', 9)
      .attr('fill', '#000')
      .attr('class', 'vaccine_type')
      .append('tspan').text(d)
      .attr('dx', 6)
      .attr('dy',((i*1.3)+1.8)+'em')
    });

    var vtooltipbbox = d3.select('#vaccine_tooltip').node().getBBox();
    d3.select('#vaccine_tooltip_bg').attr('height', vtooltipbbox.height+6);

    //***************************
    // update hdi / inform numbers
    //***************************

    // define empty objects
    var hdiData = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0};
    var hdiDataPopulation = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0};
    var hdiDataVaccines = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0};
    var hdiContactTracing = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0};
    var hdiTotalCasesData = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0};
    var hdiTestingData = {'very-high':[], 'high': [], 'medium': [], 'low': []};
    var informData = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0, 'no-score': 0};
    var informDataPopulation = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0, 'no-score': 0};
    var informDataVaccines = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0, 'no-score': 0};
    var informContactTracing = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0, 'no-score': 0};
    var informTotalCasesData = {'very-high':0, 'high': 0, 'medium': 0, 'low': 0, 'no-score': 0};
    var informTestingData = {'very-high':[], 'high': [], 'medium': [], 'low': [], 'no-score': []};
    var totalRecordedPopulation = 0;

    if(totalCases>0){
      data.country.forEach(function(dd,ii){
          
          hdiData[dd.hdi_category] += 1;
          hdiDataPopulation[dd.hdi_category] += parseInt(dd.population);
          hdiDataVaccines[dd.hdi_category] += parseInt(dd.total_vaccinations)||0;

          informData[dd.inform_severity] += 1;
          
          informContactTracing[dd.inform_severity] += dd.contract_tracing;
          hdiContactTracing[dd.hdi_category] += dd.contract_tracing;

          if((dd.hdi_category=='very-high')||(dd.hdi_category=='high')||(dd.hdi_category=='medium')||(dd.hdi_category=='low'))
          hdiTestingData[dd.hdi_category].push(dd.avg_tests_per_1000);
          if((dd.inform_severity=='very-high')||(dd.inform_severity=='high')||(dd.inform_severity=='medium')||(dd.inform_severity=='low')||(dd.inform_severity=='no-score'))
          informTestingData[dd.inform_severity].push(dd.avg_tests_per_1000);

          informDataPopulation[dd.inform_severity] += parseInt(dd.population);
          informDataVaccines[dd.inform_severity] += parseInt(dd.total_vaccinations)||0;
          // hdi index
          hdiTotalCasesData[dd.hdi_category] += dd.cumulative_cases || 0;
          informTotalCasesData[dd.inform_severity] += dd.cumulative_cases || 0;
      })
    }

    var totalHdiPop = hdiDataPopulation['very-high']+hdiDataPopulation['high']+hdiDataPopulation['medium']+hdiDataPopulation['low'];
    var totalInformPop = informDataPopulation['very-high']+informDataPopulation['high']+informDataPopulation['medium']+informDataPopulation['low']+informDataPopulation['no-score'];

    // update additional indicators
    // row 0 percent of vaccinations by hdi
    d3.select('#hdi-percent-val-very-high tspan').text(parse((hdiTotalCasesData['very-high']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#hdi-percent-bar-very-high').transition().duration(500).attr('width', (parse(hdiTotalCasesData['very-high']/totalCases)*70));
    d3.select('#hdi-percent-val-high tspan').text(parse((hdiTotalCasesData['high']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#hdi-percent-bar-high').transition().duration(500).attr('width', (parse(hdiTotalCasesData['high']/totalCases)*70));
    d3.select('#hdi-percent-val-medium tspan').text(parse((hdiTotalCasesData['medium']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#hdi-percent-bar-medium').transition().duration(500).attr('width', (parse(hdiTotalCasesData['medium']/totalCases)*70));
    d3.select('#hdi-percent-val-low tspan').text(parse((hdiTotalCasesData['low']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#hdi-percent-bar-low').transition().duration(500).attr('width', (parse(hdiTotalCasesData['low']/totalCases)*70));

    d3.select('#inform-percent-val-very-high tspan').text(parse((informTotalCasesData['very-high']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#inform-percent-bar-very-high').transition().duration(500).attr('width', (parse(informTotalCasesData['very-high']/totalCases)*64));
    d3.select('#inform-percent-val-high tspan').text(parse((informTotalCasesData['high']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#inform-percent-bar-high').transition().duration(500).attr('width', (parse(informTotalCasesData['high']/totalCases)*64));
    d3.select('#inform-percent-val-medium tspan').text(parse((informTotalCasesData['medium']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#inform-percent-bar-medium').transition().duration(500).attr('width', (parse(informTotalCasesData['medium']/totalCases)*64));
    d3.select('#inform-percent-val-low tspan').text(parse((informTotalCasesData['low']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#inform-percent-bar-low').transition().duration(500).attr('width', (parse(informTotalCasesData['low']/totalCases)*64));
    d3.select('#inform-percent-val-no-score tspan').text(parse((informTotalCasesData['no-score']/totalCases)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '16');
    d3.select('#inform-percent-bar-no-score').transition().duration(500).attr('width', (parse(informTotalCasesData['no-score']/totalCases)*64));

    d3.select('#hdi-toggle-very-high-val tspan').text(hdiData['very-high']).style('text-anchor', 'end').attr('dx', '10');
    d3.select('#hdi-toggle-high-val tspan').text(hdiData['high']).style('text-anchor', 'end').attr('dx', '10');
    d3.select('#hdi-toggle-medium-val tspan').text(hdiData['medium']).style('text-anchor', 'end').attr('dx', '10');
    d3.select('#hdi-toggle-low-val tspan').text(hdiData['low']).style('text-anchor', 'end').attr('dx', '10');

    d3.select('#inform-toggle-very-high-val tspan').text(informData['very-high']).style('text-anchor', 'end').attr('dx', '6');
    d3.select('#inform-toggle-high-val tspan').text(informData['high']).style('text-anchor', 'end').attr('dx', '10');
    d3.select('#inform-toggle-medium-val tspan').text(informData['medium']).style('text-anchor', 'end').attr('dx', '9');
    d3.select('#inform-toggle-low-val tspan').text(informData['low']).style('text-anchor', 'end').attr('dx', '7');
    d3.select('#inform-toggle-no-score-val tspan').text(informData['no-score']).style('text-anchor', 'end').attr('dx', '13');

    // row 1 percnet of vaccinations by hdi
    d3.select('#hdi1val-very-high tspan').text(parse((hdiDataPopulation['very-high']/totalHdiPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi1bar-very-high').transition().duration(500).attr('width', (parse(hdiDataPopulation['very-high']/totalHdiPop)*70));
    d3.select('#hdi1val-high tspan').text(parse((hdiDataPopulation['high']/totalHdiPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi1bar-high').transition().duration(500).attr('width', (parse(hdiDataPopulation['high']/totalHdiPop)*70));
    d3.select('#hdi1val-medium tspan').text(parse((hdiDataPopulation['medium']/totalHdiPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi1bar-medium').transition().duration(500).attr('width', (parse(hdiDataPopulation['medium']/totalHdiPop)*70));
    d3.select('#hdi1val-low tspan').text(parse((hdiDataPopulation['low']/totalHdiPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi1bar-low').transition().duration(500).attr('width', (parse(hdiDataPopulation['low']/totalHdiPop)*70));

    d3.select('#inform1val-very-high tspan').text(parse((informDataPopulation['very-high']/totalInformPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform1bar-very-high').transition().duration(500).attr('width', (parse(informDataPopulation['very-high']/totalInformPop)*64));
    d3.select('#inform1val-high tspan').text(parse((informDataPopulation['high']/totalInformPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform1bar-high').transition().duration(500).attr('width', (parse(informDataPopulation['high']/totalInformPop)*64));
    d3.select('#inform1val-medium tspan').text(parse((informDataPopulation['medium']/totalInformPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform1bar-medium').transition().duration(500).attr('width', (parse(informDataPopulation['medium']/totalInformPop)*64));
    d3.select('#inform1val-low tspan').text(parse((informDataPopulation['low']/totalInformPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform1bar-low').transition().duration(500).attr('width', (parse(informDataPopulation['low']/totalInformPop)*64));
    d3.select('#inform1val-no-score tspan').text(parse((informDataPopulation['no-score']/totalInformPop)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform1bar-no-score').transition().duration(500).attr('width', (parse(informDataPopulation['no-score']/totalInformPop)*64));

    // row 2 percent of total vaccinations
    d3.select('#hdi2val-very-high tspan').text(parse((hdiDataVaccines['very-high']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi2bar-very-high').transition().duration(500).attr('width', (parse(hdiDataVaccines['very-high']/totalVaccinations)*70));
    d3.select('#hdi2val-high tspan').text(parse((hdiDataVaccines['high']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi2bar-high').transition().duration(500).attr('width', (parse(hdiDataVaccines['high']/totalVaccinations)*70));
    d3.select('#hdi2val-medium tspan').text(parse((hdiDataVaccines['medium']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi2bar-medium').transition().duration(500).attr('width', (parse(hdiDataVaccines['medium']/totalVaccinations)*70));
    d3.select('#hdi2val-low tspan').text(parse((hdiDataVaccines['low']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi2bar-low').transition().duration(500).attr('width', (parse(hdiDataVaccines['low']/totalVaccinations)*70));

    d3.select('#inform2val-very-high tspan').text(parse((informDataVaccines['very-high']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform2bar-very-high').transition().duration(500).attr('width', (parse(informDataVaccines['very-high']/totalVaccinations)*64));
    d3.select('#inform2val-high tspan').text(parse((informDataVaccines['high']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform2bar-high').transition().duration(500).attr('width', (parse(informDataVaccines['high']/totalVaccinations)*64));
    d3.select('#inform2val-medium tspan').text(parse((informDataVaccines['medium']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform2bar-medium').transition().duration(500).attr('width', (parse(informDataVaccines['medium']/totalVaccinations)*64));
    d3.select('#inform2val-low tspan').text(parse((informDataVaccines['low']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform2bar-low').transition().duration(500).attr('width', (parse(informDataVaccines['low']/totalVaccinations)*64));
    d3.select('#inform2val-no-score tspan').text(parse((informDataVaccines['no-score']/totalVaccinations)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform2bar-no-score').transition().duration(500).attr('width', (parse(informDataVaccines['no-score']/totalVaccinations)*64));

    // row 3 total doses by hdi/inform
    var maxhdivac = d3.max([ hdiDataVaccines['low'],hdiDataVaccines['medium'],hdiDataVaccines['high'],hdiDataVaccines['very-high'] ]);
    var maxinformvac = d3.max([ informDataVaccines['low'],informDataVaccines['medium'],informDataVaccines['high'],informDataVaccines['very-high'],informDataVaccines['no-score'] ]);

    d3.select('#hdi3val-very-high tspan').text(nFormatter(hdiDataVaccines['very-high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi3bar-very-high').transition().duration(500).attr('width', (parse(hdiDataVaccines['very-high']/maxhdivac)*70));
    d3.select('#hdi3val-high tspan').text(nFormatter(hdiDataVaccines['high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi3bar-high').transition().duration(500).attr('width', (parse(hdiDataVaccines['high']/maxhdivac)*70));
    d3.select('#hdi3val-medium tspan').text(nFormatter(hdiDataVaccines['medium'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi3bar-medium').transition().duration(500).attr('width', (parse(hdiDataVaccines['medium']/maxhdivac)*70));
    d3.select('#hdi3val-low tspan').text(nFormatter(hdiDataVaccines['low'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi3bar-low').transition().duration(500).attr('width', (parse(hdiDataVaccines['low']/maxhdivac)*70));

    d3.select('#inform3val-very-high tspan').text(nFormatter(informDataVaccines['very-high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform3bar-very-high').transition().duration(500).attr('width', (parse(informDataVaccines['very-high']/maxinformvac)*64));
    d3.select('#inform3val-high tspan').text(nFormatter(informDataVaccines['high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform3bar-high').transition().duration(500).attr('width', (parse(informDataVaccines['high']/maxinformvac)*64));
    d3.select('#inform3val-medium tspan').text(nFormatter(informDataVaccines['medium'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform3bar-medium').transition().duration(500).attr('width', (parse(informDataVaccines['medium']/maxinformvac)*64));
    d3.select('#inform3val-low tspan').text(nFormatter(informDataVaccines['low'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform3bar-low').transition().duration(500).attr('width', (parse(informDataVaccines['low']/maxinformvac)*64));
    d3.select('#inform3val-no-score tspan').text(nFormatter(informDataVaccines['no-score'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform3bar-no-score').transition().duration(500).attr('width', (parse(informDataVaccines['no-score']/maxinformvac)*64));

    // row 4 total vaccinations
    d3.select('#hdi4val-very-high tspan').text(parse((hdiContactTracing['very-high']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi4bar-very-high').transition().duration(500).attr('width', (parse(hdiContactTracing['very-high']/numCountriesFiltered)*70));
    d3.select('#hdi4val-high tspan').text(parse((hdiContactTracing['high']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi4bar-high').transition().duration(500).attr('width', (parse(hdiContactTracing['high']/numCountriesFiltered)*70));
    d3.select('#hdi4val-medium tspan').text(parse((hdiContactTracing['medium']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi4bar-medium').transition().duration(500).attr('width', (parse(hdiContactTracing['medium']/numCountriesFiltered)*70));
    d3.select('#hdi4val-low tspan').text(parse((hdiContactTracing['low']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi4bar-low').transition().duration(500).attr('width', (parse(hdiContactTracing['low']/numCountriesFiltered)*70));

    d3.select('#inform4val-very-high tspan').text(parse((informContactTracing['very-high']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform4bar-very-high').transition().duration(500).attr('width', (parse(informContactTracing['very-high']/numCountriesFiltered)*64));
    d3.select('#inform4val-high tspan').text(parse((informContactTracing['high']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform4bar-high').transition().duration(500).attr('width', (parse(informContactTracing['high']/numCountriesFiltered)*64));
    d3.select('#inform4val-medium tspan').text(parse((informContactTracing['medium']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform4bar-medium').transition().duration(500).attr('width', (parse(informContactTracing['medium']/numCountriesFiltered)*64));
    d3.select('#inform4val-low tspan').text(parse((informContactTracing['low']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform4bar-low').transition().duration(500).attr('width', (parse(informContactTracing['low']/numCountriesFiltered)*64));
    d3.select('#inform4val-no-score tspan').text(parse((informContactTracing['no-score']/numCountriesFiltered)*100).toFixed(0)+'%').style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform4bar-no-score').transition().duration(500).attr('width', (parse(informContactTracing['no-score']/numCountriesFiltered)*64));

    // row 5 average testing
    hdiTestingData['low'] = Math.round(d3.mean(hdiTestingData['low']))||0;
    hdiTestingData['medium'] = Math.round(d3.mean(hdiTestingData['medium']))||0;
    hdiTestingData['high'] = Math.round(d3.mean(hdiTestingData['high']))||0;
    hdiTestingData['very-high'] = Math.round(d3.mean(hdiTestingData['very-high']))||0;
    informTestingData['no-score'] = Math.round(d3.mean(informTestingData['no-score']))||0;
    informTestingData['low'] = Math.round(d3.mean(informTestingData['low']))||0;
    informTestingData['medium'] = Math.round(d3.mean(informTestingData['medium']))||0;
    informTestingData['high'] = Math.round(d3.mean(informTestingData['high']))||0;
    informTestingData['very-high'] = Math.round(d3.mean(informTestingData['very-high']))||0;

    var maxhditest = d3.max([ hdiTestingData['low'],hdiTestingData['medium'],hdiTestingData['high'],hdiTestingData['very-high'] ]);
    var maxinformtest = d3.max([ informTestingData['low'],informTestingData['medium'],informTestingData['high'],informTestingData['very-high'],informTestingData['no-score'] ]);

    d3.select('#hdi5val-very-high tspan').text(addCommas(hdiTestingData['very-high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi5bar-very-high').transition().duration(500).attr('width', (parse(hdiTestingData['very-high']/maxhditest)*70));
    d3.select('#hdi5val-high tspan').text(addCommas(hdiTestingData['high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi5bar-high').transition().duration(500).attr('width', (parse(hdiTestingData['high']/maxhditest)*70));
    d3.select('#hdi5val-medium tspan').text(addCommas(hdiTestingData['medium'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi5bar-medium').transition().duration(500).attr('width', (parse(hdiTestingData['medium']/maxhditest)*70));
    d3.select('#hdi5val-low tspan').text(addCommas(hdiTestingData['low'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#hdi5bar-low').transition().duration(500).attr('width', (parse(hdiTestingData['low']/maxhditest)*70));

    d3.select('#inform5val-very-high tspan').text(addCommas(informTestingData['very-high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform5bar-very-high').transition().duration(500).attr('width', (parse(informTestingData['very-high']/maxinformtest)*64));
    d3.select('#inform5val-high tspan').text(addCommas(informTestingData['high'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform5bar-high').transition().duration(500).attr('width', (parse(informTestingData['high']/maxinformtest)*64));
    d3.select('#inform5val-medium tspan').text(addCommas(informTestingData['medium'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform5bar-medium').transition().duration(500).attr('width', (parse(informTestingData['medium']/maxinformtest)*64));
    d3.select('#inform5val-low tspan').text(addCommas(informTestingData['low'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform5bar-low').transition().duration(500).attr('width', (parse(informTestingData['low']/maxinformtest)*64));
    d3.select('#inform5val-no-score tspan').text(addCommas(informTestingData['no-score'])).style('text-anchor', 'end').attr('dx', '');
    d3.select('#inform5bar-no-score').transition().duration(500).attr('width', (parse(informTestingData['no-score']/maxinformtest)*64));

    // num countries filtered (table)
    d3.select('#countries_filtered tspan').text(numCountriesFiltered+' countries filtered').style('text-anchor', 'end').attr('dx', '105');

  }

  d3.select('#prev').style('cursor', 'pointer')
  .attr('opacity', 0.5)
  .on('click',function(){
    if(options.page==1) return false;
    options.page = options.page-1;
    updateTable(data, options);
  })


  d3.select('#next').style('cursor', 'pointer').on('click',function(){
    if(options.page==options.numPages) return false;
    options.page = options.page+1;
    updateTable(data, options);
  })

  async function updateTable(data, options){

    // var lastRecord = data.vaccines_data_cumulative.filter(d=>d.date.getTime()==data.max_date.getTime());
    // var vGroup = d3.flatGroup(lastRecord, d => d.iso_code);

    // data.country.forEach(function(d,i){
    //   var vaccine_acceptance_percent = (d.vaccine_acceptance_percent) || 0
    //   if(!vGroup.some(item => item[0] === d.country_iso3)){
    //     vGroup.push([d.country_iso3, [{
    //       country_name: d.country_name,
    //       country_code: d.country_iso2,
    //       vaccine_acceptance_percent: vaccine_acceptance_percent
    //     }]])
    //   }
    //   vGroup.forEach(function(dd,ii){
    //     if(dd[0]==d.country_iso3){
    //       dd[1][0].vaccine_acceptance_percent = vaccine_acceptance_percent;
    //       dd[1][0].country_name = d.country_name;
    //       dd[1][0].country_code = d.country_iso2;
    //     }
    //   })
    // })

    var sortKey;
    if(options.table_sort=='col0_sort') sortKey = 'country_name';
    if(options.table_sort=='col1_sort') sortKey = 'total_vaccinations_per_hundred';
    if(options.table_sort=='col2_sort') sortKey = 'people_vaccinated_per_hundred';
    if(options.table_sort=='col3_sort') sortKey = 'people_fully_vaccinated_per_hundred';
    if(options.table_sort=='col4_sort') sortKey = 'vaccine_acceptance_percent';
    if(options.table_sort=='col5_sort') sortKey = 'total_vaccinations';

    for(var x = 0; x<6; x++){
      d3.select('#col'+x+'_sort_desc').attr('opacity', 0);
      d3.select('#col'+x+'_sort_asc').attr('opacity', 0);
    }

    d3.select('#'+options.table_sort+'_'+options.table_sort_direction)
    .attr('opacity', 1);

    if(sortKey=='country_name'){
      if(options.table_sort_direction=='asc') {
        data.country.sort(function(b, a){
          return a.country_name.localeCompare(b.country_name);
        })
      } else {
        data.country.sort(function(a, b){
          return a.country_name.localeCompare(b.country_name);
        })    
      }

    } else {
      if(options.table_sort_direction=='desc') {
        data.country.sort(function(a,b){
            return b[sortKey] - a[sortKey];
        });
      } else {
        data.country.sort(function(b,a){
          return b[sortKey] - a[sortKey];
        });
      }
    }

  //   data.vGroup = vGroup;

  //   data.vGroup.forEach(function(d,i){
  //     data.equity_data.forEach(function(dd,ii){
  //         if(d[0] == dd.country_iso3){
  //             dd.people_fully_vaccinated_per_hundred = parseFloat(d[1][0].people_fully_vaccinated_per_hundred);
  //             dd.people_vaccinated_per_hundred = parseFloat(d[1][0].people_vaccinated_per_hundred);
  //             dd.total_vaccinations = parseFloat(d[1][0].total_vaccinations);
  //             dd.total_vaccinations_per_hundred = parseFloat(d[1][0].total_vaccinations_per_hundred);
  //         }
  //     })
  // })


    d3.selectAll('.tablerow').remove();
    d3.selectAll('.col1bar').attr('opacity', 0);
    d3.selectAll('.col2bar').attr('opacity', 0);
    d3.selectAll('.col3bar').attr('opacity', 0);
    d3.selectAll('.col4bar').attr('opacity', 0);
    d3.selectAll('.colbg').attr('opacity', 0);
    d3.selectAll('.table_country_name tspan').text('');

    options.numPages = Math.ceil(data.country.length/10);

    d3.select('#next').attr('opacity', function(){
      if(options.page==options.numPages) return 0.5;
      return 1;
    })

    d3.select('#prev')
    .attr('opacity', function(){
      if(options.page==1) return 0.5;
      return 1;
    })

    d3.select('#pagination_text').attr('text-anchor', 'end');
    d3.select('#pagination_text tspan').attr('x', 40);
    d3.select('#pagination_text tspan').text('Page '+options.page + ' of '+options.numPages)

    var i = 0;
    var delay = 10;
    const timer = ms => new Promise(res => setTimeout(res, ms));

    for(let k = ((options.page-1)*10); k < ((options.page)*10); k++){

      var d = data.country[k];
      if(!data.country[k]) {
        d3.select('#col1bar'+i)
        .attr('width', 0);
        d3.select('#col2bar'+i)
        .attr('width', 0)
        d3.select('#col3bar'+i)
        .attr('width', 0)
        d3.select('#col4bar'+i)
        .attr('width', 0)
        continue;
      }

      d3.select('#vac-tab').append('text')
      .attr('class','tablerow table_country_name')
      .text(function(){
        var name;
        if(d.country_name) { name = d.country_name; } else {
          name = d.country_code;
        }
        name = name.substring(0,17);
        if(name.length==17)name=name+'.';
        return name;
      })
      .attr('x', 0)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');

      // col 1 val
      d3.select('#vac-tab').append('text')
      .attr('class','tablerow table_country_name')
      .text(function(){
        var val = parseFloat(d.total_vaccinations_per_hundred).toFixed(1);
        if((isNaN(val))||(val==0)){ return ''} else { return val }
      })
      .style('text-anchor', 'end')
      .attr('x', 112)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');

      // col 1 bar
      d3.select('#col1bar'+i)
      .attr('opacity', 1)
      .transition()
      .duration(200)
      .attr('width', function(){
        var val = d.total_vaccinations_per_hundred;
        if(d.total_vaccinations_per_hundred>100){
          val = 100
        } 
        if(isNaN(val)){ return 0} else { return 68*(val/100) }
      });

      d3.select('#col1bg'+i)
      .attr('opacity', 1);

      // col 2 val
      d3.select('#vac-tab').append('text')
      .attr('class','tablerow')
      .text(function(){
        var val = parseFloat(d.people_vaccinated_per_hundred).toFixed(1);
        if((isNaN(val))||(val==0)){ return ''} else { return val+'%' }
      })
      .style('text-anchor', 'end')
      .attr('x', 223)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');

      // col 2 bar
      d3.select('#col2bar'+i)
      .attr('opacity', 1)
      .transition()
      .duration(200)
      .attr('width', function(){
        var val = d.people_vaccinated_per_hundred;
        if(d.people_vaccinated_per_hundred>100){
          val = 100
        } 
        if(isNaN(val)){ return 0} else { return 68*(val/100) }
      });

      d3.select('#col2bg'+i)
      .attr('opacity', 1);

      // col 3 val
      d3.select('#vac-tab').append('text')
      .attr('class','tablerow')
      .text(function(){
        var val = parseFloat(d.people_fully_vaccinated_per_hundred).toFixed(1);
        if((isNaN(val))||(val==0)){ return ''} else { return val+'%' }
      })
      .style('text-anchor', 'end')
      .attr('x', 335)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');

      // col 3 bar
      d3.select('#col3bar'+i)
      .attr('opacity', 1)
      .transition()
      .duration(200)
      .attr('width', function(){
        var val = d.people_fully_vaccinated_per_hundred;
        if(d.people_fully_vaccinated_per_hundred>100){
          val = 100
        } 
        if(isNaN(val)){ return 0} else { return 68*(val/100) }
      });
      
      d3.select('#col3bg'+i)
      .attr('opacity', 1);

      // col 4 val
      d3.select('#vac-tab').append('text')
      .attr('class','tablerow')
      .text(function(){
        var val = parseFloat(d.vaccine_acceptance_percent).toFixed(1);
        if((isNaN(val))||(val==0)){ return ''} else { return val+'%' }
      })
      .style('text-anchor', 'end')
      .attr('x', 450)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');

      // col 4 bar
      d3.select('#col4bar'+i)
      .attr('opacity', 1)
      .transition()
      .duration(200)
      .attr('width', function(){
        var val = d.vaccine_acceptance_percent;
        if(d.vaccine_acceptance_percent>100){
          val = 100
        } 
        if(isNaN(val)){ return 0} else { return 68*(val/100) }
      });
      
      d3.select('#col4bg'+i)
      .attr('opacity', 1);


      var dayFormat = d3.timeFormat("%b %d");
      // col 5 val
      d3.select('#vac-tab').append('text')
      .attr('class','tablerow')
      .text(function(){
        var val = (d.total_vaccinations);
        if((isNaN(val))||(val==0)){ return ''} else { return nFormatter(val) }
      })
      .style('text-anchor', 'end')
      .attr('x', 572)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');
      
      // col 6 val
      d3.select('#vac-tab').append('text')
      .attr('class','tablerow')
      .text(function(){
        var val = (d.data_updated);
        if((val)){ return dayFormat(val)} else { return '' }
      })
      .style('text-anchor', 'end')
      .attr('x', 620)
      .attr('y', function(){
        return 80+(i*24.8);
      })
      .style('fill', '#000')
      .style('font-size', '9px');
      
      i++;
      
      await timer(15);
    }

  }

  function createSelects(){
     // region select
      $('#regionSelect').select2({
        data: [{
          id: 'regions',
          text: 'IFRC Regions',
          children: regionOptions
        },{
          id: 'countries',
          text: 'Countries',
          children: countryOptions
        }],
        placeholder: '',
        scrollAfterSelect: true,
        renderTemplate: item => item.text || '\u200B',
        dropdownParent: $('#regionDrop'),
        shouldFocusInput: function() {
        return false;
      },
        templateResult: function(data) {
        var $state = $('<span>' + data.text + '<span>');
        return $state;
      }
      }).on('select2:unselecting', function() {
          $(this).data('unselecting', true);
      }).on('select2:opening', function(e) {
          if ($(this).data('unselecting')) {
              $(this).removeData('unselecting');
              e.preventDefault();
          }
      });

      $('#regionSelect').on('select2:select', function (e) {
          var data = e.params.data;
          filter([data.id]);
      });

      $('#regionSelect').on('select2:unselect', function (e) {
        var data = e.params.data;
        filter([data.id]);
    });

      // reset locations
      d3.select('#reset_locations').style('cursor', 'pointer')
      .on('click', function(){
        filter('clear');
      }); 

      // bubble map select color by
      $('#colorSelect').select2({
        scrollAfterSelect: true,
        minimumResultsForSearch: -1,
        renderTemplate: item => item.text || '\u200B',
        dropdownParent: $('#regionDrop'),
        shouldFocusInput: function() {
        return false;
      },
        templateResult: function(data) {
        var $state = $('<span>' + data.text + '<span>');
        return $state;
      }
      }).on('select2:select', function(e) {
        var d = e.params.data;
        options.bubble_chart_color_by = d.id;
        updateBubblechart(data, options, filter);
      });

      // bubble map select y-axis
      $('#ySelect').select2({
        scrollAfterSelect: true,
        minimumResultsForSearch: -1,
        renderTemplate: item => item.text || '\u200B',
        dropdownParent: $('#regionDrop'),
        shouldFocusInput: function() {
        return false;
      },
        templateResult: function(data) {
        var $state = $('<span>' + data.text + '<span>');
        return $state;
      }
      }).on('select2:select', function(e) {
        var d = e.params.data;
        options.bubble_chart_y_axis = d.id;
        updateBubblechart(data, options, filter);
      });

  }

  function handleSelectLength(){
    var values = $('#regionSelect').select2('data');
    // handle height for many selections
    var select2HeightRatio = $('#regionSelectContainer').width()/$('#regionSelectContainer').height();
    if(select2HeightRatio<10){
      $('.select2-selection__choice').hide();
      $('.select2-search__field').attr('placeholder', values.length+' LOCATIONS SELECTED' ).css('width', '100%')
    } else {
      $('.select2-search__field').attr('placeholder', '' );
      $('.select2-selection__choice').show();
    }
  }

  useEffect(() => {
    init();
  }, [])


  const selectStyle = {
    control: (base, state) => ({
      ...base,
      border: '1px solid #D8D8D8',
      boxShadow: 'none',
      '&:hover': {
          border: '1px solid #D8D8D8',
      }
  })
  };

  return (
    <div>
      <div id="loaderDiv">
        <div id="loaderText">{loaderText}</div>
        <div id="loaderBar">
          <div id="loaderProgress" style={{width: progress*100+'%'}}></div>
        </div>
      </div>

      <div id="regionSelectContainer">
        <select id="regionSelect" className="js-example-responsive" name="region[]" multiple="multiple"></select>
        <div id="regionDrop"></div>
      </div>

      <div id="bubbleSelectContainer">
        <div id="colorSelectContainer">Color by&nbsp;&nbsp;
        <select id="colorSelect" className="js-example-responsive" name="colorby[]" defaultValue="hdi">
          <option value="region">IFRC region</option>
          <option value="hdi">Human Development Index (HDI)</option>
          <option value="inform-severity">INFORM Severity Index</option>
        </select>
        <div id="colorDrop"></div>
        </div>
        <div id="ySelectContainer">
          y-Axis&nbsp;&nbsp;
        <select id="ySelect" className="js-example-responsive" name="yaxis[]">
          <option value="percent-vaccinated-at-least-1-dose">% vaccinated at least 1 dose</option>
          <option value="percent-fully-vaccinated">% fully vaccinated</option>
          <option value="percent-vaccine-acceptance">% vaccine acceptance</option>
        </select>
        <div id="yDrop"></div>
        </div>
      </div>


    <div id="svg_container" className="App">

    </div>
    <div id="map_div_outer">
      <div id="map_div">
      </div>
    </div>
    
    <div id="footer">Data Sources - <a href="https://covid19.who.int/info/" target="_blank">WHO Daily cases and deaths by date, vaccination data</a>, <a href="https://github.com/owid/covid-19-data/tree/master/public/data/vaccinations" target="_blank">OWID vaccinations csv</a></div>

    </div>
  );
}

function parse(p){
  if(isNaN(p)){
    return 0
  } else {
    return p;
  }
}

export default App;

