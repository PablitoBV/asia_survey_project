import { ctx, loadQuestions } from './parameters.js';  // Import ctx parameters
// import functions from other files
import { drawMap, countCountries } from './maps.js';
import { createHistogram, createSEHistogram } from './histograms.js';
import { questionSection } from './display_questions_groups.js';
import { plotCountryVsCountryMatrix, populateSmallDropdown } from './matrix.js';
import { drawMissingPercentageHistogram, missing_dropdown_updates } from './missing_values.js';
import { questionCorrelation, SECorrelation } from './correlation.js';
import { createDates } from './date.js';
import { linksToTemplates } from './template_links.js';
import { createQuestionNavigator, createGroupNavigator, createSENavigator} from './navigator.js';
import { createSpiderChart } from './spiderweb.js';

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

document.body.style.backgroundColor = ctx.background_color; // set background color on all pages

document.addEventListener("DOMContentLoaded", () => { // check which page is loaded to call the proper createViz_ function
    const pageType = document.body.getAttribute("page"); 

    if (pageType === "main_page") {
        createViz_mainPage();
    } else if (pageType === "page2") {
        createViz_Page2();
    } else if (pageType === "page3") {
        createViz_Page3();
    }
});

const csvDataPromise = d3.csv("data/mergeddata.csv");

function createViz_mainPage() {
    console.log("Using D3 v" + d3.version);
    const geoDataPromiseAsia = d3.json("data/asia2.geojson");
    //const geoDataPromiseIndiv = d3.json("data/ph.json"); //map for individual countries

    document.getElementById("loading1").style.display = "block";
    // Start measuring time
    const startTime1 = performance.now();

    Promise.all([geoDataPromiseAsia, csvDataPromise, loadQuestions()]).then(([respondents, csvData]) => {
        document.getElementById("loading1").style.display = "none";
        // print time taken to load main page
        ctx.CSVDATA = csvData;
        const endTime1 = performance.now(); 
        const loadTime1 = endTime1 - startTime1; // Time in milliseconds
        const starttime2 = performance.now();
        console.log("Data loading took:", loadTime1, "seconds");

        const countryCounts = countCountries(csvData);
        drawMap(respondents, countryCounts);
        createDates();
        createButtonSelection();
        linksToTemplates();

        centralisedDisplay();

        
        // scroll back up when all has loaded
        window.scrollTo({ top: 0, behavior: 'smooth' }); 

    }).catch(error => {
        console.error("Error loading data:", error);
    });
}

function createViz_Page2() {
    document.getElementById("loading2").style.display = "block";
    if (ctx.CSVDATA.length === 0) {
        Promise.all([csvDataPromise, loadQuestions()]).then(([csvData]) => {
            document.getElementById("loading2").style.display = "none";
            ctx.CSVDATA = csvData;
            populateSmallDropdown(); // populate dropdown and draw matrix page 2
            plotCountryVsCountryMatrix(ctx.CSVDATA, 'q163');
            drawMissingPercentageHistogram(ctx.CSVDATA, "#bad_values_histogram", "Missing")
            missing_dropdown_updates();
            //create_question_table("#group-select-page2"); // create and display a table of questions according to groups, for page 2
            
        })
    }
    else {
        populateSmallDropdown(); // populate dropdown and draw matrix page 2
        plotCountryVsCountryMatrix(ctx.CSVDATA, 'q163');
        drawMissingPercentageHistogram(ctx.CSVDATA, "#bad_values_histogram", "Missing")
        missing_dropdown_updates();
    }
};

function centralisedDisplay() {

    d3.selectAll(".selection-button")
        .on("click", function() {
            modifyDisplay();
        });

    document.getElementById("respondentMap").addEventListener("click", (event) => {
        modifyDisplay();
        });

    document.getElementById("unselectButton").addEventListener("click", (event) => {
        modifyDisplay();
        });

    document.getElementById("dates")
        .addEventListener("click", function(){
            modifyDisplay();
        })

        d3.select("#visualization")
        .on("click", function (event) {
            const target = event.target;
            if (target.classList.contains("nav-arrow")) {
                console.log("Arrow clicked:", target.classList.contains("right-arrow") ? "Right arrow" : "Left arrow");
                modifyDisplay();
            }
            else if (target.classList.contains("description-button")) {
                console.log("vksjdna");
                modifyDisplay();
            }
        });
}

function modifyDisplay(){
    if (ctx.appState.currentViz === "questionHistogram") {
        createHistogram();
        questionSection();
        createQuestionNavigator();
        createGroupNavigator();
    } else if (ctx.appState.currentViz === "factorHistogram") {
        createSEHistogram();
        questionSection();
        createSENavigator();
    } else if (ctx.appState.currentViz === "questionCorrelation") {
        createCorrelation_update();
    }
    else if (ctx.appState.currentViz === "factorCorrelation") {
        createSECorrelation_update();
    }
}


function createButtonSelection() {
    const buttonContainer = document.getElementById("visualizationSelection");

    // Clear any existing buttons in the container
    buttonContainer.innerHTML = '';

    // Create buttons
    const buttonNames = [
        { id: "questionHistogramBtn", label: "Question Histogram", icon: "📊" },
        { id: "factorHistogramBtn", label: "SE Histogram", icon: "📊" },
        { id: "questionCorrelationBtn", label: "Question Correlation", icon: "📈" },
        { id: "factorCorrelationBtn", label: "SE Correlation", icon: "📈" }
    ];

    let lastClickedBtn = null;

    buttonNames.forEach(button => {
        // Create the button element
        const btn = document.createElement("button");
        btn.id = button.id;
        btn.textContent = button.label;
        btn.classList.add("selection-button");

        const iconSpan = document.createElement("span");
        iconSpan.classList.add("button-icon");
        iconSpan.textContent = button.icon;
        btn.insertBefore(iconSpan, btn.firstChild);

        // Append the button to the container
        buttonContainer.appendChild(btn);

        btn.addEventListener("click", () => {
            if (lastClickedBtn) {
                lastClickedBtn.classList.remove("pushed");
            }
            btn.classList.add("pushed");
            lastClickedBtn = btn;
            ctx.appState.currentViz = btn.id.slice(0, -3);
        });
        buttonContainer.appendChild(btn);
    });
}



function createViz_Page3() {
    document.getElementById("loading3").style.display = "block";
    if (ctx.CSVDATA.length === 0) {
        Promise.all([csvDataPromise, loadQuestions()]).then(([csvData]) => {
            document.getElementById("loading3").style.display = "none";
            ctx.CSVDATA = csvData;  
            createSpiderChart();         
        })
    }
    else {
        createSpiderChart();
    }
};





// const columns = csvData.columns;

// // Group columns into variables
// ctx.csvTimeSpace = columns.slice(0, 6).map(col => ({
//     header: col,
//     values: csvData.map(row => row[col])
// }));

// ctx.csvQuestions = columns.slice(6, 185).map(col => ({
//     header: col,
//     values: csvData.map(row => row[col])
// }));

// ctx.csvSEIndicators = columns.slice(185, 244).map(col => ({
//     header: col,
//     values: csvData.map(row => row[col])
// }));

// ctx.csvInterviewRecords = columns.slice(244, 276).map(col => ({
//     header: col,
//     values: csvData.map(row => row[col])
// }));

// ctx.csvWeights = columns.slice(276, 278).map(col => ({
//     header: col,
//     values: csvData.map(row => row[col])
// }));