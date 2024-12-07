import { ctx } from './parameters.js';  // Import ctx parameters
// import functions from other files
import { drawMap, countCountries } from './maps.js';
import { Histogram_updates, populateCountryDropdown, drawHistogram } from './histograms.js';

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
    

        // var respondentMap = d3.select("#respondentMap").append("svg")
        //     .attr("width", ctx.MAP_W)
        //     .attr("height", ctx.MAP_H);

        drawMap(respondents, "#respondentMap", countryCounts);

        // var individualMap = d3.select("#individualMap").append("svg")
        //     .attr("width", ctx.MAP_W)
        //     .attr("height", ctx.MAP_H);
        drawMap(indivCountry, "#individualMap", countryCounts, true); // Note that countryCounts is useless for single-countries

        populateCountryDropdown(csvData);
        Histogram_updates(csvData);

        // scroll back up when all has loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}


///////////////////////////////////////////////////////
/* 
Section for the map of the respondent countries
*/

// // function for counting the respondents by country
// function countCountries(data) {
//     const countryCounts = {};
//     data.forEach(row => {
//         const country = row["country"]; // Adjust if your CSV column name is different
//         if (country) {
//             countryCounts[country] = (countryCounts[country] || 0) + 1;
//         }
//     });
//     return countryCounts;
// }



// function drawMap(geoData, placeOnPage, countryCounts, singleCountry = false) {
//     const svgWidth = ctx.MAP_W;
//     const svgHeight = ctx.MAP_H;

//     const projection = d3.geoMercator();
//     const geoPathGen = d3.geoPath().projection(projection);

//     const bounds = d3.geoBounds(geoData); // geoJSON bounding box

//     const center = [ //center of bounding box
//         (bounds[0][0] + bounds[1][0]) / 2, 
//         (bounds[0][1] + bounds[1][1]) / 2, 
//     ];

//     // width and height of the geographic bounding box
//     const geoWidth = bounds[1][0] - bounds[0][0]; 
//     const geoHeight = bounds[1][1] - bounds[0][1]; 

//     // Determine the scale dynamically based on SVG dimensions and GeoJSON bounding box
//     const scale = Math.min(
//         svgWidth / geoWidth, 
//         svgHeight / geoHeight
//     ) * 50; // Increase multiplier for better size

//     // Set the projection center and scale
//     projection.center(center).translate([svgWidth / 2, svgHeight / 2]).scale(scale);

//     // Draw the map
//     let mapGroup = placeOnPage.append("g");

//     if (singleCountry) { // for single country maps
//         mapGroup
//             .selectAll("path")
//             .data(geoData.features)
//             .enter()
//             .append("path")
//             .attr("d", geoPathGen)
//             .attr("stroke", "black")
//             .attr("stroke-width", 0.2)
//             .attr("class", "country")
//             .style("fill", "rgb(255, 191, 100)"); // light orange for single country map
//     }
//     else { // for the respondents map

//             // Add title inside the SVG
//     placeOnPage.append("text")
//         .attr("x", ctx.MAP_W / 2)
//         .attr("y", 30)
//         .attr("text-anchor", "middle")
//         .attr("font-size", "24px")
//         .attr("font-weight", "bold")
//         .attr("fill", "black")
//         .style("font-family", "'Righteous', sans-serif")
//         .text("Countries included in our study");

//     ctx.proj = d3.geoMercator()
//         .center([100, -10]) // Center on Asia
//         .translate([ctx.MAP_W / 2, ctx.MAP_H / 2])
//         .scale(300); // Scale to fit map

//     const geoPathGen = d3.geoPath(ctx.proj);
//     //var svg = d3.select("svg");

//     // parameters of the on-hover textbox
//     const tooltip = d3.select("body").append("div")
//         .style("position", "absolute")
//         .style("visibility", "hidden")
//         .style("background-color", "white")
//         .style("border", "1px solid #ddd")
//         .style("border-radius", "5px")
//         .style("padding", "8px")
//         .style("font-size", "12px")
//         .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)");

//     // to set the color according to number of respondents (not super useful)
//     // const maxCount = d3.max(Object.values(countryCounts));
//     // const colorScale = d3.scaleSequential(d3.interpolateOrRd)
//     //     .domain([0, maxCount || 1]);

//     let mapGroup = placeOnPage.append("g");

//     mapGroup.selectAll("path")
//         .data(geoData.features)
//         .enter()
//         .append("path")
//         .attr("d", geoPathGen)
//         .attr("stroke", "black")
//         .attr("stroke-width", 0.2)
//         .attr("class", "country")
//         .style("fill", (d) => {
//             const countryName = d.properties.name; // Adjust based on geojson's country property
//             const count = countryCounts[countryName] || 0;
//             return count > 0 ? "DarkCyan" : "#EEE";
//         })
//         .on("mouseover", (event, d) => {
//             const countryName = d.properties.name;
//             const count = countryCounts[countryName] || 0;

//             // Show tooltip
//             tooltip.html(`<strong>${countryName}</strong><br>Respondents: ${count}`)
//                 .style("visibility", "visible")
//                 .style("top", (event.pageY + 10) + "px")
//                 .style("left", (event.pageX + 10) + "px");

//             // Highlight the country in green
//             d3.select(event.target).style("fill", "green");
//         })
//         .on("mousemove", (event) => {
//             // Update tooltip position
//             tooltip.style("top", (event.pageY + 10) + "px")
//                 .style("left", (event.pageX + 10) + "px");
//         })
//         .on("mouseout", (event, d) => {
//             const countryName = d.properties.name;
//             const count = countryCounts[countryName] || 0;

//             // Hide tooltip
//             tooltip.style("visibility", "hidden");

//             // Reset country color
//             d3.select(event.target).style("fill", count > 0 ? "DarkCyan" : "#EEE");
//         });
//     }
// };

// function Histogram_updatesByQuestion(csvData) {
//     const inputBox = document.getElementById("question-number");
//     const warningMessage = document.getElementById("warning-message");

//     // Handle Question number change
//     inputBox.addEventListener("input", function () {
//         let questionNumber = inputBox.value.replace(/^0+/, ''); // Remove leading 0s

//         // console.log(questionNumber);

//         // Check if the input is empty
//         if (questionNumber === '') {
//             console.log("empty input");
//             warningMessage.textContent = 'Invalid question number. Please enter a number between 1 and 172.';
//             warningMessage.style.display = "block"; // Show warning message
//         }
//         // Check if the input is out of the valid range (1-172)
//         else if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 172) {
//             warningMessage.textContent = 'Invalid question number. Please enter a number between 1 and 172.';
//             warningMessage.style.display = "block"; // Show warning message
//         } else { // Valid input
//             warningMessage.style.display = "none"; // Hide warning message
//             drawHistogram(csvData, questionNumber); // Update the histogram

//             if (!countrySelector.value) {countrySelector.value = "China";} // Set default to "China" if no selection
//             const selectedCountry = countrySelector.value || "China"; 
//             countrySpecificHistogram(selectedCountry, csvData, questionNumber);
           
//         }
//     });

//     const countrySelector = document.getElementById('country-select');

//     // Handle selected country change
//     countrySelector.addEventListener("change", function() {
//         console.log("country changed");
//         let questionNumber = inputBox.value.replace(/^0+/, ''); // Remove leading 0s
//         if (!countrySelector.value) {countrySelector.value = "China";} // Set default to "China" if no selection
//         const selectedCountry = countrySelector.value || "China"; // Default to "China" if no
//         countrySpecificHistogram(selectedCountry, csvData, questionNumber);
//     })

// }


// function drawHistogram(csvData,questionNumber) {    
//     // Extract answers and count frequencies
//     var questionColumn = `q${questionNumber}`;
//     const answers = csvData
//         .map(row => row[questionColumn])
//         .filter(answer => answer !== undefined && answer !== null);
//     const answerCounts = d3.rollup(
//         answers,
//         v => v.length,
//         d => d
//     );

//     var initData = Array.from(answerCounts, ([answer, count]) => ({ answer, count }));
//     sorted_data = initData.sort((a, b) => a.answer.localeCompare(b.answer));
//     data = sorted_data.sort((a, b) => {
//         if (a.answer === 'Missing') return 1;  // Move "Missing" to the end
//         if (b.answer === 'Missing') return -1; // If 'Missing' is already at the end, keep it
//         return 0;
//     });
//     // Define the dimensions for the histogram and label areas
//     const topMargin = ctx.HIST_H/20; // Extra space above the histogram
//     const histWidth = (4 / 5) * ctx.HIST_W; // 4/5 for the histogram
//     const histHeight = (2 / 3) * ctx.HIST_H - topMargin; // 2/3 for the histogram minus top margin
//     const yLabelWidth = (1 / 5) * ctx.HIST_W; // 1/5 for y-axis labels
//     const xLabelHeight = (1 / 3) * ctx.HIST_H; // 1/3 for x-axis labels

//     // Define scales
//     const xScale = d3.scaleBand()
//         .domain(data.map(d => d.answer))
//         .range([0, histWidth]) // Scale only within the histogram width
//         .padding(0.1);

//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.count)])
//         .nice()
//         .range([histHeight, 0]); // Scale only within the histogram height

//     // Update SVG
//     const svg = d3.select("#histogram")
//         .attr("width", ctx.HIST_W)
//         .attr("height", ctx.HIST_H);

//     svg.selectAll("*").remove(); // Clear existing visuals

//     const group = svg.append("g")
//         .attr("transform", `translate(${yLabelWidth}, ${topMargin})`); // Shift to leave space for y-axis labels and top margin

//     // Add bars + hoverbox behavior
//     group.selectAll("rect")
//         .data(data)
//         .enter()
//         .append("rect")
//         .attr("x", d => xScale(d.answer))
//         .attr("y", d => yScale(d.count))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => histHeight - yScale(d.count))
//         .attr("fill", "steelblue");
    
//     histHoverAndHighlight(group.selectAll('rect')); // function to make the histogram hoverbox and the highlighting

//     // Add x-axis
//     group.append("g")
//         .attr("transform", `translate(0, ${histHeight})`) // Place at the bottom of the histogram
//         .call(d3.axisBottom(xScale)
//             .tickFormat(d => d.length > 30 ? d.slice(0, 30) + "..." : d))
//         .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-0.8em")
//         .attr("dy", "0.15em")
//         .attr("transform", "rotate(-45)");

//     // Add y-axis
//     svg.append("g")
//         .attr("transform", `translate(${yLabelWidth}, ${topMargin})`) // Align with histogram
//         .call(d3.axisLeft(yScale));
// };



// function countrySpecificHistogram(selectedCountry, csvData, questionNumber) {
//     if (!selectedCountry || !csvData) {
//         console.error("Invalid country or CSV data");
//         return; // Exit the function if selectedCountry or csvData is invalid
//     }

//     const questionColumn = `q${questionNumber}`;

//     // Filter data for the selected country
//     const filteredCountryData = csvData.filter(row => row.country === selectedCountry);
//     if (filteredCountryData.length === 0) {
//         console.error(`No data found for country: ${selectedCountry}`);
//         return;
//     }

//     const validAnswers = filteredCountryData
//         .map(row => row[questionColumn])
//         .filter(answer => answer !== undefined && answer !== null);

//     if (validAnswers.length === 0) {
//         console.log("No valid answers found for this country.");
//         return;
//     }

//       // Count the occurrences of each answer
//       const countryAnswerCounts = d3.rollup(validAnswers, v => v.length, d => d);

//       // Create an array of answer-count pairs
//       const initData = Array.from(countryAnswerCounts, ([answer, count]) => ({ answer, count }));
  
//       // Sort the data alphabetically (with 'Missing' at the end)
//       const countryData = initData.sort((a, b) => {
//           if (a.answer === 'Missing') return 1;  // Move "Missing" to the end
//           if (b.answer === 'Missing') return -1; // If 'Missing' is already at the end, keep it
//           return a.answer.localeCompare(b.answer); // Sort alphabetically
//       });
  
//     // Define the dimensions for the histogram and label areas
//     const topMargin = ctx.HIST_H / 20; // Extra space above the histogram
//     const histWidth = (4 / 5) * ctx.HIST_W; // 4/5 for the histogram
//     const histHeight = (2 / 3) * ctx.HIST_H - topMargin; // 2/3 for the histogram minus top margin
//     const yLabelWidth = (1 / 5) * ctx.HIST_W; // 1/5 for y-axis labels

//     // Define scales
//     const xScaleCountry = d3.scaleBand()
//         .domain(countryData.map(d => d.answer))
//         .range([0, histWidth]) // Scale only within the histogram width
//         .padding(0.1);

//     const yScaleCountry = d3.scaleLinear()
//         .domain([0, d3.max(countryData, d => d.count)])
//         .nice()
//         .range([histHeight, 0]); // Scale only within the histogram height

//     // Update SVG
//     const countrySvg = d3.select("#country-specific-histogram")
//         .attr("width", ctx.HIST_W)
//         .attr("height", ctx.HIST_H);

//     countrySvg.selectAll("*").remove(); // Remove existing elements

//     const countryGroup = countrySvg.append("g")
//         .attr("transform", `translate(${yLabelWidth}, ${topMargin})`); // Shift to leave space for y-axis labels and top margin

//     // Add bars + hoverbox behavior
//     countryGroup.selectAll("rect")
//         .data(countryData)
//         .enter()
//         .append("rect")
//         .attr("x", d => xScaleCountry(d.answer))
//         .attr("y", d => yScaleCountry(d.count))
//         .attr("width", xScaleCountry.bandwidth())
//         .attr("height", d => histHeight - yScaleCountry(d.count))
//         .attr("fill", "steelblue");

//     histHoverAndHighlight(countryGroup.selectAll('rect')); // function to make the histogram hoverbox and the highlighting

//     // Add x-axis
//     countryGroup.append("g")
//         .attr("transform", `translate(0, ${histHeight})`) // Place at the bottom of the histogram
//         .call(d3.axisBottom(xScaleCountry)
//             .tickFormat(d => d.length > 30 ? d.slice(0, 30) + "..." : d)) // Ensure long answers are truncated
//         .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-0.8em")
//         .attr("dy", "0.15em")
//         .attr("transform", "rotate(-45)"); // Rotate x-axis labels for better readability

//     // Add y-axis
//     countryGroup.append("g")
//         .call(d3.axisLeft(yScaleCountry));
// }


// function histHoverAndHighlight(bar, highlightColor="rgb(127,205,187)") {

//     const hoverbox = d3.select("body").append("div")
//         .attr("class", "tooltip")
//         .style("position", "absolute")
//         .style("z-index", "10")
//         .style("visibility", "hidden")
//         .style("background-color", "rgba(0, 0, 0, 0.75)")
//         .style("color", "#fff")
//         .style("padding", "5px")
//         .style("border-radius", "5px")
//         .style("font-size", "14px")
//         .style("z-index", "9999")
//         .style("font-family", "'Righteous', sans-serif");

//     bar.on("mouseover", (event, d) => {
//         // Show hoverbox 
//         hoverbox.html(`${d.count}`)
//             .style("visibility", "visible")
//             .style("top", (event.pageY + 10) + "px")
//             .style("left", (event.pageX + 10) + "px")
//             .style("z-index", "9999");
    
//         // Highlight country in green
//         d3.select(event.target).style("fill", highlightColor);
//     })
//     .on("mousemove", (event) => { // follow mouse
//         hoverbox.style("top", (event.pageY + 10) + "px")
//             .style("left", (event.pageX + 10) + "px");
//     })
//     .on("mouseout", (event, d) => {
//         // Hide hoverbox
//         hoverbox.style("visibility", "hidden");
    
//         // Reset country color
//         d3.select(event.target).style("fill", d.count > 0 ? "steelblue" : "#EEE");

        
//     })
// };

// // function to put the list of countries in the dropdown menu of the histogram.
// function populateCountryDropdown(csvData) {
//     const countries = Array.from(new Set(csvData.map(d => d.country)));
//     const selectElement = document.getElementById('country-select');

//     countries.forEach(country => {
//         const option = document.createElement('option');
//         option.value = country;
//         option.textContent = country;
//         selectElement.appendChild(option);
//     });
// }
