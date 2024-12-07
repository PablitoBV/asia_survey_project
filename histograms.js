import { ctx, loadQuestions } from './parameters.js';  // Import ctx parameters




// trigger histogram updates when a question or a country is selected
export function Histogram_updates(csvData) {
    const inputBox = document.getElementById("question-number");
    const descriptionDiv = document.getElementById("question-description"); // future display of selected question
    const warningMessage = document.getElementById("warning-message");
    const countrySelector = document.getElementById('country-select');
    


    // Initialization phase (load page with question 1 used directly)
    if (inputBox) {
        inputBox.value = 1;  // default value to 1
    }
    drawHistogram(csvData, 1);
    if (!countrySelector.value) {countrySelector.value = "China";} // Set default to "China" if no selection
        const selectedCountry = countrySelector.value || "China"; // Default to "China" if no value
        countrySpecificHistogram(selectedCountry, csvData, 1);

    getQuestionDescription(1).then(description => {
        descriptionDiv.innerHTML = description;  // Display the description
    });
    // end of initialization phase

    // Handle Question number change
    inputBox.addEventListener("input", function () {
        let questionNumber = inputBox.value.replace(/^0+/, ''); // Remove leading 0s

        // Check if input is empty
        if (questionNumber === '') {
            console.log("empty input");
            warningMessage.textContent = 'Invalid question number. Please enter a number between 1 and 172.';
            warningMessage.style.display = "block"; // Show warning message
        }
        // Check if the input is out of the valid range (1-172)
        else if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 172) {
            warningMessage.textContent = 'Invalid question number. Please enter a number between 1 and 172.';
            warningMessage.style.display = "block"; // Show warning message

        } else { // Valid input
            warningMessage.style.display = "none"; // Hide warning message
            drawHistogram(csvData, questionNumber); // Update the histogram

            if (!countrySelector.value) {countrySelector.value = "China";} // Set default to "China" if no selection
            const selectedCountry = countrySelector.value || "China"; 
            countrySpecificHistogram(selectedCountry, csvData, questionNumber);
            getQuestionDescription(questionNumber).then(description => {
                descriptionDiv.innerHTML = description;  // Update the description div
            });
        }
    });

    // Handle selected country change
    countrySelector.addEventListener("change", function() {
        // console.log("country changed");
        let questionNumber = inputBox.value.replace(/^0+/, ''); // Remove leading 0s
        if (!countrySelector.value) {countrySelector.value = "China";} // Set default to "China" if no selection
        const selectedCountry = countrySelector.value || "China"; // Default to "China" if no value
        countrySpecificHistogram(selectedCountry, csvData, questionNumber);
    })

}

// Draw a histogram for the selected question, aggregating all countries
export function drawHistogram(csvData,questionNumber) {    
    // Extract answers and count frequencies
    var questionColumn = `q${questionNumber}`;
    const answers = csvData
        .map(row => row[questionColumn])
        .filter(answer => answer !== undefined && answer !== null);
    const answerCounts = d3.rollup(
        answers,
        v => v.length,
        d => d
    );

    var initData = Array.from(answerCounts, ([answer, count]) => ({ answer, count }));

    var sorted_data = initData.sort((a, b) => a.answer.localeCompare(b.answer));
    var data = sorted_data.sort((a, b) => {
        if (a.answer === 'Missing') return 1;  // Move "Missing" to the end
        if (b.answer === 'Missing') return -1; // If 'Missing' is already at the end, keep it
        return 0;
    });
    // Define the dimensions for the histogram and label areas
    const topMargin = ctx.HIST_H/20; // Extra space above the histogram
    const histWidth = (4 / 5) * ctx.HIST_W; // 4/5 for the histogram
    const histHeight = (2 / 3) * ctx.HIST_H - topMargin; // 2/3 for the histogram minus top margin
    const yLabelWidth = (1 / 5) * ctx.HIST_W; // 1/5 for y-axis labels
    const xLabelHeight = (1 / 3) * ctx.HIST_H; // 1/3 for x-axis labels

    // Define scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.answer))
        .range([0, histWidth]) // Scale only within the histogram width
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([histHeight, 0]); // Scale only within the histogram height

    // Update SVG
    const svg = d3.select("#histogram")
        .attr("width", ctx.HIST_W)
        .attr("height", ctx.HIST_H);

    svg.selectAll("*").remove(); // Clear existing visuals

    const group = svg.append("g")
        .attr("transform", `translate(${yLabelWidth}, ${topMargin})`); // Shift to leave space for y-axis labels and top margin

    // Add bars + hoverbox behavior
    group.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.answer))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => histHeight - yScale(d.count))
        .attr("fill", "steelblue");
    
    histHoverAndHighlight(group.selectAll('rect')); // function to make the histogram hoverbox and the highlighting

    // Add x-axis
    group.append("g")
        .attr("transform", `translate(0, ${histHeight})`) // Place at the bottom of the histogram
        .call(d3.axisBottom(xScale)
            .tickFormat(d => d.length > 30 ? d.slice(0, 30) + "..." : d))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${yLabelWidth}, ${topMargin})`) // Align with histogram
        .call(d3.axisLeft(yScale));
};


// Build another histogram at the side, specific to the country selected and the question selected
export function countrySpecificHistogram(selectedCountry, csvData, questionNumber) {
    if (!selectedCountry || !csvData) {
        console.error("Invalid country or CSV data");
        return; // Exit the function if selectedCountry or csvData is invalid
    }

    const questionColumn = `q${questionNumber}`;

    // Filter data for the selected country
    const filteredCountryData = csvData.filter(row => row.country === selectedCountry);
    if (filteredCountryData.length === 0) {
        console.error(`No data found for country: ${selectedCountry}`);
        return;
    }

    const validAnswers = filteredCountryData
        .map(row => row[questionColumn])
        .filter(answer => answer !== undefined && answer !== null);

    if (validAnswers.length === 0) {
        console.log("No valid answers found for this country.");
        return;
    }

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

    // Update SVG
    const countrySvg = d3.select("#country-specific-histogram")
        .attr("width", ctx.HIST_W)
        .attr("height", ctx.HIST_H);

    countrySvg.selectAll("*").remove(); // Remove existing elements

    const countryGroup = countrySvg.append("g")
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


//////////////////////////////////////////////

// Helper functions 


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
        hoverbox.html(`${d.count} (${percentage}%)`)
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

// function to put the list of countries in the dropdown menu of the histogram.
export function populateCountryDropdown(csvData) {
    const countries = Array.from(new Set(csvData.map(d => d.country)));
    const selectElement = document.getElementById('country-select');

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        selectElement.appendChild(option);
    });
}

// function to write out the question under the input box.
async function getQuestionDescription(questionNumber) {
    // Wait until the questions are loaded
    await loadQuestions();  // This will wait for the questions to be fully loaded

    const question = ctx.questions.find(q => q.id === `q${questionNumber}`);
    if (question) {
        return question.description;  // Return the description if found
    } else {
        return "No description available.";  // Return a fallback message
    }
}

