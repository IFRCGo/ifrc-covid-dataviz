// default options
const colors = {
    hdi_category: {
        'very-high': '#D8EF8B', 
        'high': '#FDE08B', 
        'medium': '#FB8D59', 
        'low': '#D63127'
    },
    inform_severity: {
        'very-high': '#D63127', 
        'high': '#FB8D59', 
        'medium': '#FDE08B', 
        'low': '#D8EF8B', 
        'no-score': '#DAE0EA', 
    },
    blue: '#1F558C',
    lightblue: '#E8EEF3',
    lightnavy: '#799EAD',
    // red: '#E02225',
    red: '#EE3224',
    lightred: '#FDEAE9',
    green: '#D8EF8B',
    ifrcgreen: '#87C400',
    black: '#595454',
    lightgrey: '#e8e8e8',
    darkgrey: '#c1c1c1',
    white: '#fff',
    olive: '#87C400',
    purple: '#771966',
    orange: '#FF3500',
    pink: '#FB0080'
}

// option 1
var c = ['#00ADED','#003A5A','#62D7F7','#799EAD','#BCCED6']
// option 2
var c = ['#00ADED','#62D7F7','#003A5A','#799EAD','#FFDD00'];
// option 3
var reds = ['#771912','#be281d','#ee3224','#f79992','#fcd6d3'];
var blues = ['#09192a','#163b62','#1f558c','#7999ba','#d2dde8'];


colors.regions = {
        'AP': colors.orange, 
        'AM': colors.lightblue, 
        'EU': colors.ifrcgreen, 
        'ME': '#0A3248', 
        'AF': '#FCD204', 
    }

    colors.regions = {
        'AP': c[1], 
        'AM': c[0], 
        'EU': c[2], 
        'ME': c[3], 
        'AF': c[4], 
    }

    // colors.regions = {
    //     'AP': reds[3], 
    //     'AM': reds[0], 
    //     'EU': reds[1], 
    //     'ME': reds[2], 
    //     'AF': reds[4], 
    // }

    // colors.regions_blue = {
    //     'AP': blues[3], 
    //     'AM': blues[0], 
    //     'EU': blues[1], 
    //     'ME': blues[2], 
    //     'AF': blues[4], 
    // }



export default colors;
