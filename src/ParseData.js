import {min,max,group,flatGroup} from "d3";
import moment from 'moment';
import clone from 'just-clone';
import { data } from "jquery";

export function ParseData(data, options) {

    //*********************
    // create regions
    //*********************
    data.regions = [
        {sort: 5, 'code': 'AF', cumulative_cases: 0, cumulative_deaths: 0, cumulative_vaccines: 0, population: 0},
        {sort: 3, 'code': 'ME', cumulative_cases: 0, cumulative_deaths: 0, cumulative_vaccines: 0, population: 0},
        {sort: 4, 'code': 'AP', cumulative_cases: 0, cumulative_deaths: 0, cumulative_vaccines: 0, population: 0},
        {sort: 2, 'code': 'EU', cumulative_cases: 0, cumulative_deaths: 0, cumulative_vaccines: 0, population: 0},
        {sort: 1, 'code': 'AM', cumulative_cases: 0, cumulative_deaths: 0, cumulative_vaccines: 0, population: 0},
        {sort: 6, 'code': 'OTH', cumulative_cases: 0, cumulative_deaths: 0, cumulative_vaccines: 0, population: 0}
    ]

    data.regions.sort(function(a,b){
        return (a.sort) - (b.sort);
    });

    //*********************
    // clean up country data
    //*********************
    var count = 0;

    data.country = data.equity_data;
    data.country.forEach(function(d,i){

        // if not an IFRC region then set to OTH
        if((d.ifrc_region!='AF')&&(d.ifrc_region!='ME')&&(d.ifrc_region!='AP')&&(d.ifrc_region!='EU')&&(d.ifrc_region!='AM')){
            d.ifrc_region = 'OTH';
        }
        
        // parse country population
        d.population = parseInt(d.population)||0;
        var pop = 0;
        if(d.population>0) pop = d.population;

        // sum up ifrc region population 
        data.regions.forEach(function(dd,ii){
            if(dd.code==d.ifrc_region){
                dd.population += pop
            }
        });

        // get WHO vaccine data (vaccine types used, vaccines_per_100
        d.vaccines_used = [];
        d.avg_tests_per_1000 = parseFloat(d.avg_tests_per_1000)||0;
        d.number_vaccine_types_used = 0;
        d.vaccines_per_100 = 0;
        d.number_vaccine_types_used = parseInt(d.avg_tests_per_1000);
        data.vaccines_who_data.forEach(function(dd,ii){
            if(d.country_iso3==dd.ISO3){
                // d.data_updated = moment(dd.DATE_UPDATED).startOf('day').toDate();
                d.number_vaccine_types_used = parseInt(dd.NUMBER_VACCINES_TYPES_USED);
                d.vaccines_per_100 = parseFloat(dd.TOTAL_VACCINATIONS_PER100);
                if(isNaN(d.vaccines_per_100))d.vaccines_per_100 = 0;
                d.vaccines_used = dd.VACCINES_USED.split(',').map(function(item) {
                    return item.trim();
                  });
            }
        })

        // get ns involvement in activities
        d.ns_involvement = 0;
        data.self_assessment.forEach(function(dd,ii){
            if((d.country_iso3==dd.ISO3)&&(d.country_iso3!='')){
                if(dd['Final involvement']=='Yes') {
                    d.ns_involvement = 1;
                    count++;
                }
            }
        });

        d.vaccine_acceptance_percent = 0;
        // get vaccine acceptance
        data.vaccine_acceptance.forEach(function(dd,ii){
            if(d.country_iso3==dd.iso3){
                // if(dd['Final involvement']=='Yes') d.ns_involvement = 1;
                d.vaccine_acceptance_percent = parseFloat(dd.indicator_value)*100;
                d.vaccine_acceptance_population = parseInt(dd.population_size);
            }
        })

        // get contrat tracing
        if((d.contract_tracing.toLowerCase()=='all')||(d.contract_tracing.toLowerCase()=='some')){
            d.contract_tracing = 1;
        } else {
            d.contract_tracing = 0
        }

        // parse equity data inform/hdi indexes
        if(d.hdi_category.match(/very high/i)){
            d.hdi_category = 'very-high'
        }
        else if(d.hdi_category.match(/high/i)){
            d.hdi_category = 'high'
        }
        else if(d.hdi_category.match(/medium/i)){
            d.hdi_category = 'medium'
        }
        else if(d.hdi_category.match(/low/i)){
            d.hdi_category = 'low'
        }
        if(d.inform_severity.match(/very high/i)){
            d.inform_severity = 'very-high'
        }
        else if(d.inform_severity.match(/high/i)){
            d.inform_severity = 'high'
        }
        else if(d.inform_severity.match(/medium/i)){
            d.inform_severity = 'medium'
        }
        else if(d.inform_severity.match(/low/i)){
            d.inform_severity = 'low'
        }
        else if(d.inform_severity.match(/no/i)){
            d.inform_severity = 'no-score'
        }

    });

    //*********************
    // get min/max dates
    //*********************

    // get min and max dates from daily who data
    let maxDate = moment(new Date(max(data.who_data, function(d){
        return d.Date_reported;
    }))).startOf('day');

    // override min date to week start
    data.min_date = moment('2019-12-31').startOf('day').toDate();

    let maxDateVaccines = moment(new Date(max(data.vaccines_data, function(d){
        return d.date;
    }))).startOf('day');

    data.min_vaccine_date = moment(new Date(min(data.vaccines_data, function(d){
        return d.date;
    }))).startOf('day').toDate();

    data.max_vaccine_date = maxDateVaccines.toDate();

    if(maxDateVaccines.unix()>maxDate.unix()) {
        maxDate = maxDateVaccines;
    }

    data.max_date = maxDate.toDate();

    //*********************
    // parse who data
    //*********************

    data.who_data.forEach(function(d,i){
        // parse dates
        d.date = moment(d.Date_reported).startOf('day').toDate();
        // override country name and code
        d.country_code = d.Country_code;
        d.country_name = null;
        data.country.forEach(function(dd,ii){
            if(dd.country_iso2===d.country_code){
                d.ifrc_region = dd.ifrc_region;
                d.country_name = dd.country_name;
            }
        })

        // parse cases and deaths
        d.cumulative_deaths = parseInt(d.Cumulative_deaths);
        d.cumulative_cases = parseInt(d.Cumulative_cases);
        d.new_cases = parseInt(d.New_cases);
        d.new_deaths = parseInt(d.New_deaths);
        
    });

    // sort by date
    data.who_data.sort(function(a,b){
        return new Date(a.date) - new Date(b.Date_reported);
    });
    
    //*************************
    // check for missing who dates and fill in the max date
    //*************************

    // group by country
    var whoDataGrouped = flatGroup(data.who_data, d => d.country_code);

    var datesToAdd = [];

    whoDataGrouped.forEach(function(d,i){
        
        var maxDate = moment(max(d[1], d=>d.date)).startOf('day');
        
        var lastRecord = clone(d[1][d[1].length-1]);

        if(maxDate.unix()!=data.max_date.getTime()){
            lastRecord.date = new Date(data.max_date);
            lastRecord.new_cases = 0;
            lastRecord.new_deaths = 0;
            datesToAdd.push(lastRecord);
        }

    })

    data.who_data.push(...datesToAdd);

    data.who_data.sort(function(a,b){
        return new Date(a.date) - new Date(b.date);
    });

    // set count for incremental day/week/month numbers
    let dayTotal = -1;
    let dayCheck = 0;
    let weekTotal = -1;
    let weekCheck = -1;
    let monthTotal = 0;
    let monthCheck = 0;

    // parse and clean up WHO data
    let whoCountryCodes = [];
    data.who_data.forEach(function(d,i){
        // parse dates
        // d.date = moment(d.Date_reported).startOf('day').toDate();
        d.dayOfYear =  moment(d.date).dayOfYear();
        if(d.dayOfYear!==dayCheck) dayTotal++;
        d.dayTotal = dayTotal;
        d.week = moment(d.date).isoWeek();
        if(d.week!==weekCheck) weekTotal++;
        d.weekTotal = weekTotal;
        d.month = d.date.getMonth();
        if(d.month!==monthCheck) monthTotal++;
        d.monthTotal = monthTotal;
        d.year = d.date.getFullYear();
        d.week_start = new Date(moment(d.date).startOf('isoWeek').startOf('day').toDate());
        d.month_start = new Date(moment(d.date).startOf('month').startOf('day').toDate());

        // set negative values to zero for new cases/deaths
        if(d.new_deaths<0)d.new_deaths = 0;
        if(d.new_cases<0)d.new_cases = 0;

        if(d.ifrc_region==undefined) d.ifrc_region = 'OTH';

        // add country code to array so we know it is used
        if((!whoCountryCodes.includes(d.country_code))&&(d.country_code.length>1)) {
            whoCountryCodes.push(d.country_code);
        }

        // delete old unused keys
        delete d.Date_reported;
        delete d.Country;
        delete d.New_cases;
        delete d.New_deaths;
        delete d.Country_code;
        delete d.Cumulative_deaths;
        delete d.Cumulative_cases;
        delete d.Country_code;
        delete d.WHO_region;
        delete d.Country;
        
        // set incremental count
        dayCheck = d.dayOfYear;
        weekCheck = d.week;
        monthCheck = d.month;
    })
   
    //*********************
    // parse vaccine cumulative data
    //*********************

    // clean up values
    data.vaccines_data.forEach(function(d,i){
        d.date = moment(d.date).startOf('day').toDate();
    });
    
    data.vaccines_data.sort(function(a,b){
        return new Date(a.date) - new Date(b.date);
    });

    // filter out vaccine data to only include records with ISO3 country codes
    data.vaccines_data = data.vaccines_data.filter(function(d,i){
        return d.iso_code.length===3 && d.total_vaccinations > 0;
    })

    var vaccineDataByCountry = flatGroup(data.vaccines_data, d => d.iso_code);

    // fill out missing vaccinations date records (extend cumulative from last data date)
    var newDays = [];
    var hasDays = [];
    var lastRecord = {};
    var vDataFlat = [];

    vaccineDataByCountry.forEach(function(d,i){

        var minDt = new Date(data.min_date);
        var maxDt = new Date(data.max_date);

        hasDays = [];
        newDays = [];

        // set the last recorded date fo this country
        d.lastDate = moment(max(d[1], function(d,i){ return d.date })).startOf('day').toDate();
        
        // reset country name and code using country table
        data.country.forEach(function(dd,ii){
            if(dd.country_iso3===d[0]){
                d.ifrc_region = dd.ifrc_region;
                d.country_name = dd.country_name;
                d.country_code = dd.country_iso2;
                dd.data_updated = d.lastDate;

            }
        })

        // loop through all date records for this country and add to hasDays array
        d[1].forEach(function(dd,ii){
            dd.total_vaccinations = parseInt(dd.total_vaccinations);
            dd.daily_vaccinations = parseInt(dd.daily_vaccinations);
            hasDays.push(new Date(dd.date).getTime());
        })

        // fill in missing dates
        // d[1].forEach(function(dd,ii){
            for (var day = new Date(data.min_vaccine_date);day <= data.max_date; day.setDate(day.getDate() + 1)) {
                var newDay = new Date(day).getTime();
                if(!hasDays.includes(newDay)){
                    newDays.push({date: new Date(day), total_vaccinations: null, daily_vaccinations: 0})
                }
            }
        // });

        d[1].push(...newDays);
        d[1].sort(function(a,b){
            return new Date(a.date) - new Date(b.date);
        });

        // loop through dates and fill in missing cumulative values
        var totalVac = 0;
        var totalVac100 = 0;
        var people_vaccinated_per_hundred = 0;
        var people_fully_vaccinated_per_hundred = 0;
        d[1].forEach(function(dd,ii){
            if(dd.total_vaccinations){
                totalVac = dd.total_vaccinations;
            } else {
                dd.total_vaccinations = totalVac;
            }
            if(dd.total_vaccinations_per_hundred){
                totalVac100 = dd.total_vaccinations_per_hundred
            } else {
                dd.total_vaccinations_per_hundred = totalVac100;
            }
            if(dd.people_vaccinated_per_hundred){
                people_vaccinated_per_hundred = dd.people_vaccinated_per_hundred;
            } else {
                dd.people_vaccinated_per_hundred = people_vaccinated_per_hundred;
            }
            if(dd.people_fully_vaccinated_per_hundred){
                people_fully_vaccinated_per_hundred = dd.people_fully_vaccinated_per_hundred;
            } else {
                dd.people_fully_vaccinated_per_hundred = people_fully_vaccinated_per_hundred;
            }

            var countryName;
            if(d.country_name==null) { countryName = d[0];
            } else {
                countryName = d.country_name
            }
            var dailyVac = 0;
            if((dd.daily_vaccinations)&&(dd.daily_vaccinations>0)) dailyVac = dd.daily_vaccinations;

            vDataFlat.push({
                date: new Date(dd.date),
                lastDate: d.lastDate,
                total_vaccinations_per_hundred: parseFloat(totalVac100),
                people_vaccinated_per_hundred: parseFloat(people_vaccinated_per_hundred),
                people_fully_vaccinated_per_hundred: parseFloat(people_fully_vaccinated_per_hundred),
                iso_code: d[0], 
                ifrc_region: d.ifrc_region,
                country_name: countryName,
                country_code: d.country_code, 
                total_vaccinations: totalVac,
                daily_vaccinations: dailyVac
            })
        })
    });

    data.vaccines_data = vDataFlat;

    data.vaccines_data.sort(function(a,b){
        return new Date(a.date) - new Date(b.date);
    });

    // reset count for incremental day/week/month numbers
    dayTotal = -1;
    dayCheck = 0;
    weekTotal = -1;
    weekCheck = -1;
    monthTotal = 0;
    monthCheck = 0;
    
    data.vaccines_data.forEach(function(d,i){
        if(d.ifrc_region==undefined) d.ifrc_region = 'OTH';
        d.dayOfYear =  moment(d.date).dayOfYear();
        if(d.dayOfYear!==dayCheck) dayTotal++;
        d.dayTotal = dayTotal;
        d.week = moment(d.date).isoWeek();
        if(d.week!==weekCheck) weekTotal++;
        d.weekTotal = weekTotal;
        d.month = d.date.getMonth();
        if(d.month!==monthCheck) monthTotal++;
        d.monthTotal = monthTotal;
        d.year = d.date.getFullYear();
        dayCheck = d.dayOfYear;
        weekCheck = d.week;
        monthCheck = d.month;
        d.week_start = new Date(moment(d.date).startOf('isoWeek').toDate());
        d.month_start = new Date(moment(d.date).startOf('month').toDate());
    })

    //*********************
    // add most recent owid vaccine data record to data.country
    //*********************

    // group who data by country
    var vaccineDataByCountry = flatGroup(data.vaccines_data, d => d.country_code);

    //*********************
    // add most recent records from both datasets to data.country
    //*********************

    // first group who data by country
    var whoDataByCountry = flatGroup(data.who_data, d => d.country_code);

    data.country.forEach(function(d,i){
        d.cumulative_cases_per_100k = 0;
        d.cumulative_deaths_per_100k = 0;
        d.cumulative_vaccines_per_100k = 0;
        d.people_fully_vaccinated_per_hundred = 0;
        d.people_vaccinated_per_hundred = 0;
        d.total_vaccinations_per_hundred = 0;
        var countryCode = d.country_iso2;

        // calculate latest date and at weekly intervals (for bi-weekly percent change calculation)
        whoDataByCountry.forEach(function(dd,ii){
            if(dd[0]==countryCode){
                d.who_daily_latest = dd[1][dd[1].length-1];
                d.who_daily_7_days = dd[1][dd[1].length-8];
                d.who_daily_14_days = dd[1][dd[1].length-15];
                d.who_daily_21_days = dd[1][dd[1].length-22];
                d.who_daily_28_days = dd[1][dd[1].length-29];
                d.cumulative_cases_per_100k = (d.who_daily_latest.cumulative_cases/(d.population/100000));
                d.cumulative_deaths_per_100k = (d.who_daily_latest.cumulative_deaths/(d.population/100000));
                d.cumulative_cases = d.who_daily_latest.cumulative_cases;
                d.cumulative_deaths = d.who_daily_latest.cumulative_deaths;
                d.cumulative_deaths_7_days = d.who_daily_7_days.cumulative_deaths;
                d.cumulative_deaths_14_days = d.who_daily_14_days.cumulative_deaths;
                d.cumulative_deaths_21_days = d.who_daily_21_days.cumulative_deaths;
                d.cumulative_deaths_28_days = d.who_daily_28_days.cumulative_deaths;
                d.cumulative_cases_7_days = d.who_daily_7_days.cumulative_cases;
                d.cumulative_cases_14_days = d.who_daily_14_days.cumulative_cases;
                d.cumulative_cases_21_days = d.who_daily_21_days.cumulative_cases;
                d.cumulative_cases_28_days = d.who_daily_28_days.cumulative_cases;
                var percentChange = parseFloat(((d.cumulative_cases - d.cumulative_cases_14_days)-(d.cumulative_cases_14_days-d.cumulative_cases_28_days))/(d.cumulative_cases_14_days-d.cumulative_cases_28_days));
                if(isFinite(percentChange)) { d.percent_change = percentChange; } else { d.percent_change = 0 }
            }
        })

        vaccineDataByCountry.forEach(function(dd,ii){
            if(dd[0]==countryCode){
                if(typeof(dd[0]!='undefined')){
                    d.vaccine_daily_latest = dd[1][dd[1].length-1];
                    d.cumulative_vaccines_per_100k = (d.vaccine_daily_latest.total_vaccinations/(d.population/100000));
                    d.people_fully_vaccinated_per_hundred = d.vaccine_daily_latest.people_fully_vaccinated_per_hundred;
                    d.people_vaccinated_per_hundred = d.vaccine_daily_latest.people_vaccinated_per_hundred;
                    d.total_vaccinations_per_hundred = d.vaccine_daily_latest.total_vaccinations_per_hundred;
                    d.total_vaccinations = d.vaccine_daily_latest.total_vaccinations;
                }
            }
        })

        if(!isFinite(d.cumulative_cases_per_100k))d.cumulative_cases_per_100k = 0;
        if(!isFinite(d.cumulative_deaths_per_100k))d.cumulative_deaths_per_100k = 0;
        if(!isFinite(d.cumulative_vaccines_per_100k))d.cumulative_vaccines_per_100k = 0;
        d.country_code = d.country_iso2;

    })

    data.original = clone(data);

}

export default ParseData;
