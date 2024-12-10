import { ctx } from './parameters.js';  // Import ctx parameters
// import functions from other files
import { drawMap, countCountries } from './maps.js';
import { Histogram_updates, populateCountryDropdown, drawHistogram, populateGroupDropdown } from './histograms.js';

/* Main Information on the Dataset ------------------------------------------------------------------------------------------------------------------------------

    TimeSpace:
        0 country
        1 year
        2 month
        3 idnumber
        4 region
        5 Level (Urban or Rural)

    Questions:
    0 - 178 Questions
        0 - 5 A Economic Evaluations  
        6 - 18 B Trust in Institutions  
        19 - 31 C Social Capita  
        32 - 38 D Participation In Elections  
        39 - 43 E Access to Public Service  
        44 - 46 F Psychological Involvment  
        47 - 52 G Internet and Social Media  
        53 - 54 H Partisanship  
        55 - 68 I Traditionalism  
        69 - 78 J Political Participation  
        79 - 91 K Regime Preferences  
        92 - 95 L Meaning of Democracy  
        96 - 102 M Satisfaction With Government And Democracy  
        103 - 106 N Most Important Problems  
        107 - 126 O Quality Of Governance  
        127 - 130 P Regime Evaluation  
        131 - 135 Q Democratic Legitimacy And Preference For Democracy  
        136 - 155 R Agreement/Disagreement With Specific Statements  
        156 - 160 S Globalization  
        161 - 166 T Redistribution  
        167 - 169 U Citizenship  
        170 - 178 V International Relations
    

    SocioEconomic Indicators:
        0 - 58

    Interview Record:
        0 - 31
     
    Weights:
        0 w
        1 wcross

------------------------------------------------------------------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", createViz); // wait for the page to have loaded before launching createViz()

function createViz() {
    console.log("Using D3 v" + d3.version);
    const geoDataPromiseAsia = d3.json("data/asia2.geojson");
    const geoDataPromiseIndiv = d3.json("data/ph.json"); //map for individual countries
    const csvDataPromise = d3.csv("data/mergeddata.csv");

    // Start measuring time
    const startTime = performance.now();

    Promise.all([geoDataPromiseAsia, geoDataPromiseIndiv, csvDataPromise]).then(([respondents, indivCountry, csvData]) => {
        const countryCounts = countCountries(csvData);

        const columns = csvData.columns;

        // Group columns into variables
        const TimeSpace = columns.slice(0, 6).map(col => ({
            header: col,
            values: csvData.map(row => row[col])
        }));

        const Questions = columns.slice(6, 185).map(col => ({
            header: col,
            values: csvData.map(row => row[col])
        }));
    
        const SocioEconomicIndicators = columns.slice(185, 244).map(col => ({
            header: col,
            values: csvData.map(row => row[col])
        }));
    
        const InterviewRecords = columns.slice(244, 276).map(col => ({
            header: col,
            values: csvData.map(row => row[col])
        }));

        const Weights = columns.slice(276, 278).map(col => ({
            header: col,
            values: csvData.map(row => row[col])
        }));

        console.log(TimeSpace);
        console.log(Questions);
        console.log(SocioEconomicIndicators);
        console.log(InterviewRecords);
        console.log(Weights);
    


        drawMap(respondents, "#respondentMap", countryCounts);
        drawMap(indivCountry, "#individualMap", countryCounts, true); // Note that countryCounts is useless for single-countries

        populateCountryDropdown(csvData);
        populateGroupDropdown();
        Histogram_updates(csvData);

        // scroll back up when all has loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // print time taken to load main page
        const endTime = performance.now(); 
        const loadTime = endTime - startTime; // Time in milliseconds
        console.log("Data loading took:", loadTime, "seconds");
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}