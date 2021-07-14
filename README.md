## IFRC COVID-19 Dashboard

This dashboard was developed using React, d3.js v6, Mapbox, and Sketch to design the SVG UI layout. The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

<img width="1021" alt="red color palette" src="https://user-images.githubusercontent.com/3186357/125206987-a407a880-e292-11eb-8f0b-188c4ca23269.png">


------------


### Embedding in an iFrame from GitHub Pages

Use the following sample code to embed the dashboard using an iFrame. 

```html
<iframe src="https://matthewsmawfield.github.io/ifrc-covid-dataviz/" title="ifrc-covid-dataviz" sandbox="allow-scripts allow-same-origin allow-downloads" style="width: 100%; width: 100%; flex-grow: 1; border: 0; height: 100%"></iframe>
```


------------


### Setting up a local development environment

1. Clone the repository to your computer. Using the command line: `git clone {repository url}`
2. Change into the newly cloned directory folder: `cd ifrc-covid-dataviz`
3. Install the NPM packages: `npm install`
4. Remove the remove the 'homepage' attribute in package.json (used for GitHub Pages deployment)
5. Set the data sources to use local versions pointing to public/data folder, or alternatively, use the Chrome browser - Allow CORS Extension, which enables the connection between the localhost development environment and the WHO/OWID API data sources. 
6. Start the local development server: `npm start`
7. A browser window should open automatically to http://localhost:3000/ifrc-covid-dataviz




------------



### Deploying to GitHub Pages or a server 

1. Run `npm build` to package and minify the project into the build folder.
2. Add the following 'homepage' attribute to package.json. "homepage": "http://ifrcgo.github.io/ifrc-covid-dataviz/build",
3. Push/commit to GitHub
4. Point GitHub Pages to branch main
5. Navigate to http://ifrcgo.github.io/ifrc-covid-dataviz/build

OR 

2. Copy or SCP the build folder to the server, or if running the build command on the server, ensure the server network settings point correctly to the build folder website via http (e.g apache sites enabled, nginx).



------------



### Deploying to GitHub Pages


2. Run npm `npm deploy`


------------


### Useful commands

`npm start`  - run the local web development server.

`npm build` - creates a build folder with the application packaged and minified ready for deployment.

`npm deploy` - deploys the app to GitHub pages (gh-pages - requires homepage attribute to be set in package.json to direct which GitHub account to deploy to). Includes the build command.

------------



### Changing the MapBox background layer 

The MapBox style layer IDs used and token are defined in the src/Map.js lines 9:10.

------------


### File structure & data files

- **node_modules /** - folder created and packages installed when running the ’npm install’ command when first setting up the development environment. 

- **build /** - folder created when using ‘npm build’ command, packaged and minified ready for deployment. 

- **public /** - folder containing local assets including images and csv/json data files
 - **images /** 
   - **layout.svg** - user-interface and layout design
   - **ifrc-covid-dashboard-layout.sketch** - original sketch file for user-interface and layout design.

 - **data** / -
   - **equity_data.csv** - IFRC data by country including INFORM severity index, Human Development Index, country codes, country population.
   - **owid_vaccinations.csv** - daily vaccination data from OWID. 
   - **self_assessment.csv** - IFRC self-assessment data with NS involvement by country
   - **timelime.csv** - calendar events for the timeline
   - **vaccine_acceptance.csv** - IFRC vaccine acceptance data
   - **who_global_cases.csv** - WHO daily cases/deaths data
   - **who_vaccination_data** - WHO data on vaccination types and which vaccines used in which country

- **src /** - this is where code should be edited
  - **App.css** - main CSS styles go here
  - **App.js** - main code, controller
  - **Bubblechart.js** - code for the bubble chart tab
  - **colors.js** - configuration file for color palettes used
  - **HelperFunctions.js** - some useful functions used throughout the application, including for rounding and formatting numbers
  - **index.js** - initial code entry point, loads App.
  - **Layout.js** - loads the SVG layout and creates the user-interface and toggle buttons. 
  - **Map.js** - code for the map component. Uses MapBoxGL.
  - **Options.js** - global configuration file used to handle filtering
  - **ParseData.js** - loads when the application first opens to clean and parse the data. 
  - **Regionchart.js** - code for the region bar chart with cases/deaths/vaccines
  - **Timechart.js** - code for the 3 main time charts and event timeline

- **get_data.sh** - simple script with wget commands to pull who/owid csv data to files in the public/data folder. 
- **package.json** - configuration file where npm scripts are defined for deploy and build

------------


### Update local data files

Edit or replace data files are located in public/data folder. Ensure CSV files are saved in UTF-8 format. Best recommendation would be to use a CRON script to automatically pull the live CSV data from OWID and WHO into a local folder. A simple script linux shell called get_data.sh includes some sample wget commands which can be used to pull the data into a local folder.

------------


### Data sources

**WHO Global Daily Cases CSV** Saved locally as `/public/data/who_global_cases.csv`
https://covid19.who.int/WHO-COVID-19-global-data.csv

**WHO Vaccination Data (types of vaccines) CSV** Saved locally as `/public/data/who_vaccination_data.csv`
https://covid19.who.int/who-data/vaccination-data.csv

**OWID Daily Vaccination Data CSV** Saved locally as `/public/data/owid_vaccinations.csv`
https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv


------------



### How to update data source locations

Data source locations are defined in App.js. To change the data sources to point to another source instead of to the public/data/* files, edit the data sources URLs at the top of App.js from lines 20:35. 


------------


### Update the layout design

The layout and basic components of the user interface, including the logo, buttons, titles, etc, were created using Sketch and then exported as SVG to `/public/images/layout.svg`. To edit the design open the Sketchfile in `/public/images/ifrc-covid-dashboard-layout.svg` and when finished export to `layout.svg`. Be careful to ensure the names of elements are not changed, as they are used to define the SVG ids. 


------------


### Bi-weekly percent change calculation logic

<img width="654" alt="Screenshot 2021-07-11 at 8 12 08 PM" src="https://user-images.githubusercontent.com/3186357/125204129-51bf8b00-e284-11eb-8c99-21d45304a5f4.png">

