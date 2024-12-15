import { ctx, loadQuestions } from './parameters.js';  // Import ctx parameters
// import functions from other files
import { drawMap, countCountries } from './maps.js';
import { Histogram_updates, populateCountryDropdown, drawHistogram } from './histograms.js';
import { create_question_table, update_table, populateGroupDropdown } from './display_questions_groups.js';

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
// document.addEventListener("DOMContentLoaded", createViz); // wait for the page to have loaded before launching createViz()

document.addEventListener("DOMContentLoaded", () => { // check which page is loaded to call the proper createViz_ function
    const pageType = document.body.getAttribute("page"); 

    if (pageType === "main_page") {
        createViz_mainPage();
    } else if (pageType === "scatterplots_page") {
        createViz_scatterplotsPage();
    }
});

const csvDataPromise = d3.csv("data/mergeddata.csv");

function createViz_mainPage() {
    console.log("Using D3 v" + d3.version);
    const geoDataPromiseAsia = d3.json("data/asia2.geojson");
    //const geoDataPromiseIndiv = d3.json("data/ph.json"); //map for individual countries

    // Start measuring time
    const startTime1 = performance.now();

    Promise.all([geoDataPromiseAsia, csvDataPromise, loadQuestions()]).then(([respondents, csvData]) => {
        // print time taken to load main page
        ctx.CSVDATA = csvData;
        const endTime1 = performance.now(); 
        const loadTime1 = endTime1 - startTime1; // Time in milliseconds
        const starttime2 = performance.now();
        console.log("Data loading took:", loadTime1, "seconds");
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

        // console.log(TimeSpace);
        // Loop over each question in the Questions object
        for (const key in Questions) {
            if (Questions.hasOwnProperty(key)) {
            // Get the values array for the current question
            const values = Questions[key].values;
            
            // Get distinct values using a Set
            const distinctValues = [...new Set(values)];
            
            // Check if the number of distinct values is greater than 10
            if (distinctValues.length > 10) {
                // Log the distinct values for this question if there are more than 10
                console.log(`${key} distinct values:`, distinctValues);
            }
            }
        }
  
        // console.log(SocioEconomicIndicators);
        // console.log(InterviewRecords);
        // console.log(Weights);
    


        drawMap(respondents, "#respondentMap", countryCounts);
        // drawMap(indivCountry, "#individualMap", countryCounts, true); // Note that countryCounts is useless for single-countries

        populateCountryDropdown(csvData);
        // populateGroupDropdown();

        create_question_table("#group-select-page1");
        Histogram_updates(csvData);


        // scroll back up when all has loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });      

        const endtime2 = performance.now();
        console.log("loading part 2 took", endtime2-starttime2, "seconds");
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}

function createViz_scatterplotsPage() {
    Promise.all([csvDataPromise, loadQuestions()]).then(([csvData]) => {
    create_question_table("#group-select-page2"); // create and display a table of questions according to groups, for page 2

    // Call the function with your CSV file path, X column, Y column, and Country column
    // createScatterplot(csvData, "GDP", "LifeExpectancy", "Country", "#scatterplot-container");
})
};
