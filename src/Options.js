// default options
const options = {
    region_chart_toggle: 'cases', // cases, deaths, vaccines
    region_switch: 'total', // total, per100
    region_filter: [],
    country_filter: [],
    hdi_filter: [], // very-high, high, medium, low
    inform_filter: [], // no-score, low, medium, high, very-high
    timeline_type: 'non-cumulative', // cumulative, non-cumulative, stacked 
    timeline_frequency: 'week', // day, week, month
    map_toggle: 'cases', // bi-weekly-change, cases, deaths, percent-fully-vaccinated, percent-vaccine-acceptance
    tab_toggle: 'vaccination-data', // vaccination-data, indicators, bubble-chart
    table_sort: 'col1_sort',
    table_sort_direction: 'desc',
    bubble_chart_color_by: 'hdi', // hdi, inform-severity, region
    bubble_chart_y_axis: 'percent-vaccinated-at-least-1-dose', // percent-vaccinated-at-least-1-dose, percent-fully-vaccinated, percent-vaccine-acceptance
    brushL: 0,
    brushR: 600,
    page: 1,
    numPages: 1
}

export default options;
