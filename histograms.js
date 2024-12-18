import { ctx } from './parameters.js';  // Import ctx parameters


export function createHistogram() {
    const questionColumn = ctx.appState.currentQuestion;

    let selectedCountries = ctx.appState.selectedCountries;
    if (selectedCountries.length === 0) {
        selectedCountries = ["China", "Japan", "Myanmar", "Thailand", "Vietnam", "Cambodia", "Indonesia", "Malaysia", "Hong Kong", "South Korea", "Taiwan", "Singapore", "Mongolia", "Philippines"];
    }
    const filteredCountryData = ctx.CSVDATA.filter(row => selectedCountries.includes(row.country));

    let filteredDateData = filteredCountryData;
    if (ctx.appState.currentDate !== 'all') {
        filteredDateData = filteredCountryData.filter(row => row.year === ctx.appState.currentDate);
    }

    const validAnswers = filteredDateData
        .map(row => row[questionColumn] !== undefined && row[questionColumn] !== null ? row[questionColumn] : "No data");

    // Count the occurrences of each answer
    const countryAnswerCounts = d3.rollup(validAnswers, v => v.length, d => d);

    // Create an array of answer-count pairs
    const initData = Array.from(countryAnswerCounts, ([answer, count]) => ({ answer, count }));

    // Sort the data alphabetically (with 'Missing' at the end)
    // const countryData = initData.sort((a, b) => {
    //     if (a.answer === 'Missing') return 1;
    //     if (b.answer === 'Missing') return -1;
    //     return a.answer.localeCompare(b.answer);
    // });

    const actualQuestion = ctx.questions.find(q => q.id === questionColumn);
   
    const scaleName = actualQuestion.order_outputs; // Default to 'alphabetical' if not found
    console.log("question:", actualQuestion, "scaleName:", scaleName);

    const scale = ctx.scales[scaleName] || ctx.scales['alphabetical']; // Default to 'alphabetical' if scaleName is not found
    console.log("Scale used for sorting:", scale);


   const countryData = sortByScale(initData, scaleName);


    // Clear the container of any existing SVG
    const visualizationDiv = document.getElementById("visualizationMain");
    d3.select(visualizationDiv).select("svg").remove();

    // Get parent dimensions
    const parentWidth = visualizationDiv.clientWidth;
    const parentHeight = visualizationDiv.clientHeight;

    // Calculate dimensions with 5% padding
    const paddingPercent = 0.05;
    const svgWidth = parentWidth * (1 - 2 * paddingPercent); // 90% width
    const svgHeight = parentHeight * (1 - 6 * paddingPercent); // 90% height
    const marginLeft = parentWidth * paddingPercent; // Left padding
    const marginTop = parentHeight * paddingPercent; // Top padding

    // Position axes
    const yAxisWidth = svgWidth * 0.2;    // 20% of the width for y-axis
    const histWidth = svgWidth * 0.7;     // 70% width for the histogram bars
    const histHeight = svgHeight * 0.7;   // Push x-axis to 60% of the SVG height

    const countrySvg = d3.select(visualizationDiv)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("margin-left", `${marginLeft}px`)
        .style("margin-top", `${marginTop}px`);

    // Group containing the histogram
    const countryGroup = countrySvg.append("g")
        .attr("transform", `translate(${yAxisWidth}, 0)`); // Shift group rightwards by 20%

    // Define scales
    const xScaleCountry = d3.scaleBand()
        .domain(countryData.map(d => d.answer))
        .range([0, histWidth]) // Bars start after the y-axis
        .padding(0.1);

    const yScaleCountry = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.count)])
        .nice()
        .range([histHeight, 0]); // Bars go upward from the 60% mark

    // Add bars
    countryGroup.selectAll("rect")
        .data(countryData)
        .enter()
        .append("rect")
        .attr("x", d => xScaleCountry(d.answer))
        .attr("y", d => yScaleCountry(d.count))
        .attr("width", xScaleCountry.bandwidth())
        .attr("height", d => histHeight - yScaleCountry(d.count))
        .attr("fill", "tomato") // Bars colored tomato
        .on("mouseenter", function (event, d) {
            histHoverAndHighlight(d3.select(this), "rgb(255,99,71,0.8)"); // Highlight slightly lighter tomato
        })
        .on("mouseleave", function (event, d) {
            histHoverAndHighlight(d3.select(this), "tomato"); // Reset to tomato
        });

    // Add x-axis (rotated labels beneath the bars)
    countryGroup.append("g")
        .attr("transform", `translate(0, ${histHeight})`) // Place x-axis at 60% of height
        .call(d3.axisBottom(xScaleCountry)
            .tickFormat(d => d.length > 30 ? d.slice(0, 30) + "..." : d)) // Truncate long labels
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)"); // Diagonal labels for readability

    // Add y-axis (labels to the left of the histogram)
    countryGroup.append("g")
        .call(d3.axisLeft(yScaleCountry)
            .tickValues(yScaleCountry.ticks().slice(0, -1)) // Remove the last (top) tick
        );

    // Add blue dashed line for the average
    const averageCount = d3.mean(countryData, d => d.count);

    countryGroup.append("line")
        .attr("x1", 0)
        .attr("x2", histWidth)
        .attr("y1", yScaleCountry(averageCount))
        .attr("y2", yScaleCountry(averageCount))
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "4 4") // Dashed line
        .attr("stroke-width", 2);

    // Add a label for the average line
    countryGroup.append("text")
        .attr("x", histWidth + 5)
        .attr("y", yScaleCountry(averageCount) - 5)
        .text(`Avg: ${averageCount.toFixed(2)}`)
        .attr("fill", "blue")
        .style("font-size", "12px");
}

export function createSEHistogram() {
    const questionColumn = ctx.appState.currentSEIndicator;
    console.log(questionColumn)

    let selectedCountries = ctx.appState.selectedCountries;
    if (selectedCountries.length === 0) {
        selectedCountries = ["China", "Japan", "Myanmar", "Thailand", "Vietnam", "Cambodia", "Indonesia", "Malaysia", "Hong Kong", "South Korea", "Taiwan", "Singapore", "Mongolia", "Philippines"];
    }
    const filteredCountryData = ctx.CSVDATA.filter(row => selectedCountries.includes(row.country));

    let filteredDateData = filteredCountryData;
    if (ctx.appState.currentDate !== 'all') {
        filteredDateData = filteredCountryData.filter(row => row.year === ctx.appState.currentDate);
    }

    let validAnswers = filteredDateData
        .map(row => row[questionColumn] !== undefined && row[questionColumn] !== null ? row[questionColumn] : "No data");

    // Filter or group the data based on the specific indicator
    if (questionColumn === 'se11a' || questionColumn === 'se10c' || questionColumn === 'se9c') {
        // Filter out answers with count below 20 for these specific indicators
        validAnswers = validAnswers.filter(answer => {
            const count = validAnswers.filter(a => a === answer).length;
            return count >= 20;
        });
    } else if (questionColumn === 'se3_2') {
        // Group ages by 4 years
        validAnswers = validAnswers.map(age => {
            if (typeof age === 'number') {
                const group = Math.floor(age / 4) * 4;
                return `${group} - ${group + 3}`;
            }
            return age;
        });
    } else if (questionColumn === 'se3_1') {
        // Group birth years by 5 years
        validAnswers = validAnswers.map(year => {
            if (typeof year === 'number') {
                const group = Math.floor(year / 5) * 5;
                return `${group} - ${group + 4}`;
            }
            return year;
        });
    }

    // Count the occurrences of each answer
    const countryAnswerCounts = d3.rollup(validAnswers, v => v.length, d => d);

    // Create an array of answer-count pairs
    const initData = Array.from(countryAnswerCounts, ([answer, count]) => ({ answer, count }));

    const actualQuestion = ctx.questions.find(q => q.id === questionColumn);
    const scaleName = actualQuestion.order_outputs; // Default to 'alphabetical' if not found
    console.log("question:", actualQuestion, "scaleName:", scaleName);

    const scale = ctx.scales[scaleName] || ctx.scales['alphabetical']; // Default to 'alphabetical' if scaleName is not found
    console.log("Scale used for sorting:", scale);

    const countryData = sortByScale(initData, scaleName);

    // Clear the container of any existing SVG
    const visualizationDiv = document.getElementById("visualizationMain");
    d3.select(visualizationDiv).select("svg").remove();

    // Get parent dimensions
    const parentWidth = visualizationDiv.clientWidth;
    const parentHeight = visualizationDiv.clientHeight;

    // Calculate dimensions with 5% padding
    const paddingPercent = 0.05;
    const svgWidth = parentWidth * (1 - 2 * paddingPercent); // 90% width
    const svgHeight = parentHeight * (1 - 6 * paddingPercent); // 90% height
    const marginLeft = parentWidth * paddingPercent; // Left padding
    const marginTop = parentHeight * paddingPercent; // Top padding

    // Position axes
    const yAxisWidth = svgWidth * 0.2;    // 20% of the width for y-axis
    const histWidth = svgWidth * 0.7;     // 70% width for the histogram bars
    const histHeight = svgHeight * 0.7;   // Push x-axis to 60% of the SVG height

    const countrySvg = d3.select(visualizationDiv)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("margin-left", `${marginLeft}px`)
        .style("margin-top", `${marginTop}px`);

    // Group containing the histogram
    const countryGroup = countrySvg.append("g")
        .attr("transform", `translate(${yAxisWidth}, 0)`); // Shift group rightwards by 20%

    // Define scales
    const xScaleCountry = d3.scaleBand()
        .domain(countryData.map(d => d.answer))
        .range([0, histWidth]) // Bars start after the y-axis
        .padding(0.1);

    const yScaleCountry = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.count)])
        .nice()
        .range([histHeight, 0]); // Bars go upward from the 60% mark

    // Add bars
    countryGroup.selectAll("rect")
        .data(countryData)
        .enter()
        .append("rect")
        .attr("x", d => xScaleCountry(d.answer))
        .attr("y", d => yScaleCountry(d.count))
        .attr("width", xScaleCountry.bandwidth())
        .attr("height", d => histHeight - yScaleCountry(d.count))
        .attr("fill", "tomato") // Bars colored tomato
        .on("mouseenter", function (event, d) {
            histHoverAndHighlight(d3.select(this), "rgb(255,99,71,0.8)"); // Highlight slightly lighter tomato
        })
        .on("mouseleave", function (event, d) {
            histHoverAndHighlight(d3.select(this), "tomato"); // Reset to tomato
        });

    // Add x-axis (rotated labels beneath the bars)
    countryGroup.append("g")
        .attr("transform", `translate(0, ${histHeight})`) // Place x-axis at 60% of height
        .call(d3.axisBottom(xScaleCountry)
            .tickFormat(d => d.length > 30 ? d.slice(0, 30) + "..." : d)) // Truncate long labels
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)"); // Diagonal labels for readability

    // Add y-axis (labels to the left of the histogram)
    countryGroup.append("g")
        .call(d3.axisLeft(yScaleCountry)
            .tickValues(yScaleCountry.ticks().slice(0, -1)) // Remove the last (top) tick
        );

    // Add blue dashed line for the average
    const averageCount = d3.mean(countryData, d => d.count);

    countryGroup.append("line")
        .attr("x1", 0)
        .attr("x2", histWidth)
        .attr("y1", yScaleCountry(averageCount))
        .attr("y2", yScaleCountry(averageCount))
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "4 4") // Dashed line
        .attr("stroke-width", 2);

    // Add a label for the average line
    countryGroup.append("text")
        .attr("x", histWidth + 5)
        .attr("y", yScaleCountry(averageCount) - 5)
        .text(`Avg: ${averageCount.toFixed(2)}`)
        .attr("fill", "blue")
        .style("font-size", "12px");
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

    bar.on("mouseenter", (event, d) => {
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
    .on("mouseleave", (event, d) => {
        // Hide hoverbox
        hoverbox.style("visibility", "hidden");
    
        // Reset country color
        d3.select(event.target).style("fill", d.count > 0 ? "tomato" : "#EEE");

        
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


function sortByScale(data, scaleName) {
    // Retrieve the scale from ctx.scales using the scaleName
    const scale = ctx.scales[scaleName] || ctx.scales['alphabetical']; // Default to 'alphabetical' if scaleName is not found

    return data.sort((a, b) => {
        const indexA = scale.indexOf(a.answer);
        const indexB = scale.indexOf(b.answer);

        // Move invalid answers (not found in the scale) to the end
        if (indexA === -1) return 1;  // Move invalid answers to the end
        if (indexB === -1) return -1; // Move invalid answers to the end

        // Otherwise, compare based on the scale's order
        return indexA - indexB;
    });
}