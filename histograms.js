import { ctx, sortDataByScale, sortDataAlphabetically } from './parameters.js';  // Import ctx parameters


export function Histogram_updates(csvData) {
    const countryHistogramDiv = document.getElementById("basicHistogram");
    // Initialization phase
    createHistogram(csvData);

    // Update country-specific histogram on country change
    document.getElementById("respondentMap").addEventListener("click", (event) => {
        createHistogram(csvData)
        });
    }


/////////////////////

// Build another histogram at the side, specific to the country selected and the question selected
export function createHistogram(csvData) {

    const questionColumn = `q${ctx.appState.currentQuestion}`;
    const HistogramDiv = document.getElementById("basicHistogram");

    let selectedCountries = ctx.appState.selectedCountries;

    if (selectedCountries.length === 0) {
        selectedCountries = ["China", "Japan", "Myanmar", "Thailand", "Vietnam", "Cambodia", "Indonesia", "Malaysia", "Hong Kong", "South Korea", "Taiwan", "Singapore", "Mongolia", "Philippines"];
    }

    // Filter data for the selected country
    const filteredCountryData = csvData.filter(row => selectedCountries.includes(row.country));
    if (filteredCountryData.length === 0) {
        console.error(`No data found for country: ${selectedCountry}`);
        return;
    }

    const validAnswers = filteredCountryData
    .map(row => row[questionColumn] !== undefined && row[questionColumn] !== null ? row[questionColumn] : "No data");


    // Count the occurrences of each answer
    const countryAnswerCounts = d3.rollup(validAnswers, v => v.length, d => d);

    // Create an array of answer-count pairs
    const initData = Array.from(countryAnswerCounts, ([answer, count]) => ({ answer, count }));

    // Sort the data alphabetically (with 'Missing' at the end)
    const countryData = initData.sort((a, b) => {
        if (a.answer === 'Missing') return 1;  // Move "Missing" to the end
        if (b.answer === 'Missing') return -1; // If 'Missing' is already at the end, keep it
        return a.answer.localeCompare(b.answer); // Sort alphabetically
    });

    // Define the dimensions for the histogram and label areas
    const topMargin = ctx.HIST_H / 20; // Extra space above the histogram
    const histWidth = (4 / 5) * ctx.HIST_W; // 4/5 for the histogram
    const histHeight = (2 / 3) * ctx.HIST_H - topMargin; // 2/3 for the histogram minus top margin
    const yLabelWidth = (1 / 5) * ctx.HIST_W; // 1/5 for y-axis labels

    // Define scales
    const xScaleCountry = d3.scaleBand()
        .domain(countryData.map(d => d.answer))
        .range([0, histWidth]) // Scale only within the histogram width
        .padding(0.1);

    const yScaleCountry = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.count)])
        .nice()
        .range([histHeight, 0]); // Scale only within the histogram height

    // Clear the container of any existing SVG
    d3.select(HistogramDiv).select("svg").remove();

    // Create a new SVG element
    const countrySvg = d3.select(HistogramDiv)
        .append("svg")
        .attr("width", ctx.HIST_W)
        .attr("height", ctx.HIST_H);

    const countryGroup = countrySvg.append("g")
        .attr("width", ctx.HIST_W)
        .attr("height", ctx.HIST_H)
        .attr("transform", `translate(${yLabelWidth}, ${topMargin})`); // Shift to leave space for y-axis labels and top margin

    // Add bars + hoverbox behavior
    countryGroup.selectAll("rect")
        .data(countryData)
        .enter()
        .append("rect")
        .attr("x", d => xScaleCountry(d.answer))
        .attr("y", d => yScaleCountry(d.count))
        .attr("width", xScaleCountry.bandwidth())
        .attr("height", d => histHeight - yScaleCountry(d.count))
        .attr("fill", "steelblue");

    histHoverAndHighlight(countryGroup.selectAll('rect')); // function to make the histogram hoverbox and the highlighting

    // Add x-axis
    countryGroup.append("g")
        .attr("transform", `translate(0, ${histHeight})`) // Place at the bottom of the histogram
        .call(d3.axisBottom(xScaleCountry)
            .tickFormat(d => d.length > 30 ? d.slice(0, 30) + "..." : d)) // Ensure long answers are truncated
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)"); // Rotate x-axis labels for better readability

    // Add y-axis
    countryGroup.append("g")
        .call(d3.axisLeft(yScaleCountry));
}

// End of main part

////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////



////// Helper functions //


// On-hover behavior (hoverbox + highlight)
export function histHoverAndHighlight(bar, highlightColor="rgb(127,205,187)") {

    // have total count of the data, to have the percentages show up
    const totalCount = d3.sum(bar.data(), d => d.count); 
    
    const hoverbox = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("font-size", "14px")
        .style("z-index", "9999")
        .style("font-family", "'Righteous', sans-serif");

    bar.on("mouseover", (event, d) => {
        const percentage = ((d.count / totalCount) * 100).toFixed(1); //get percentage, rounded to 1 decimal
        // Show hoverbox 
        hoverbox.html(`${d.answer}:<br> ${d.count} (${percentage}%)`)
            .style("visibility", "visible")
            .style("top", (event.pageY + 10) + "px")
            .style("left", (event.pageX + 10) + "px")
            .style("z-index", "9999");
    
        // Highlight country in green
        d3.select(event.target).style("fill", highlightColor);
    })
    .on("mousemove", (event) => { // follow mouse
        hoverbox.style("top", (event.pageY + 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", (event, d) => {
        // Hide hoverbox
        hoverbox.style("visibility", "hidden");
    
        // Reset country color
        d3.select(event.target).style("fill", d.count > 0 ? "steelblue" : "#EEE");

        
    })
};

// function to write out the question under the input box.
async function getQuestionDescription() {  
    const question = ctx.questions.find(q => q.id === `q${ctx.appState.currentQuestion}`);
    if (question) {
        return question.description;  // Return the description if found
    } else {
        return "No description available.";  // Return a fallback message
    }
}
