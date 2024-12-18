import { ctx } from "./parameters.js";


// Initialize a mapping between full country names and their abbreviations
const countryMappings = {
    "United States": "USA",
    "United Arab Emirates/Middle Eastern countries": "UAE/Middle East",
    "United Arab Emirates/Middle Esatern countries": "UAE/Middle East",
    "European Union": "EU",
    "China and Japan": "China & Japan",
    "US and Japan": "USA & Japan",
    "United States and Japan": "USA & Japan",
    "We should follow our country's own model": "Our country's model",
    "United States, Japan and Singapore": "USA, Japan, Singapore",
    "European countries": "Europe",
    "US and Japan": "USA & Japan",
    "United Kingdom": "UK",
    "China and Singapore":"China & Singapore",
    "Japan and Singapore": "Japan & Singapore",
    "Association of Southeast Asian Nations, ASEAN": "ASEAN",
    "Russian": "Russia",
};


export function populateSmallDropdown() {
    const smallDropdown = document.getElementById("group-select-page2");
    let questions_used = [
        { id: "q163", label: "Which country has the most influence in Asia?" },
        { id: "q166", label: "In ten years, which country will have the most influence in Asia?" },
        { id: "q167", label: "Which country should be a model for our own country’s future development?" }
    ];

    // Populate dropdown with options
    questions_used.forEach(element => {
        const option = document.createElement("option");
        option.value = element.id; // Set value to `id`, as this identifies the question column
        option.textContent = element.label; // Display the label to the user
        smallDropdown.appendChild(option);
    });

    // Set default selected value for questionColumn
    let questionColumn = questions_used[0].id; // Default to the first question

    smallDropdown.addEventListener("change", function () {
        questionColumn = smallDropdown.value;
        // Update app state and plot matrix
        ctx.appState.selectedQuestionMatrix = questionColumn;
        plotCountryVsCountryMatrix(ctx.CSVDATA, questionColumn);
    });
}

// Function to plot the country vs country heatmap for questions 163,166,167
export function plotCountryVsCountryMatrix(csvData, questionColumn) {
    // Filter out invalid responses
    const filteredData = csvData.filter(row =>
        row[questionColumn] !== "Do not understand the question" &&
        row[questionColumn] !== "Decline to answer" &&
        row[questionColumn] !== "Missing" &&
        row[questionColumn] !== "Can't choose" &&
        row[questionColumn] !== "Other [please name]"
    );
    // Extract unique countries and answer options
    const countries = Array.from(new Set(filteredData.map(d => d.country))).filter(Boolean);
    const answerOptions = Array.from(new Set(filteredData.map(d => d[questionColumn]))).filter(Boolean);

    if (!filteredData.length || !countries.length || !answerOptions.length) {
        console.error("No data available for the selected question. Cannot render heatmap.", questionColumn);
        return;
      }

    const matrix = {};

    // init matrix with zero values
    countries.forEach(country1 => {
        matrix[country1] = {};
        answerOptions.forEach(country2 => {
            matrix[country1][country2] = 0;
        });
    });

    filteredData.forEach(row => {
        const respondentCountry = row.country;
        const selectedCountry = row[questionColumn];

        // check validity
        if (respondentCountry && selectedCountry && matrix[respondentCountry] && matrix[respondentCountry][selectedCountry] !== undefined) {
            matrix[respondentCountry][selectedCountry]++;
        }
    });

    // Row totals for normalization
    const rowTotals = countries.reduce((totals, country) => {
        if (matrix[country]) {
            totals[country] = Object.values(matrix[country]).reduce((sum, val) => sum + val, 0);
        } else {
            totals[country] = 0; // Default to zero if no data
        }
        return totals;
    }, {});

    // Normalize matrix values to percentages
    countries.forEach(country1 => {
        answerOptions.forEach(country2 => {
            if (rowTotals[country1] > 0) {
                matrix[country1][country2] = (matrix[country1][country2] / rowTotals[country1]) * 100;
            }
        });
    });

    // Set up SVG dimensions and margins
    const containerId = '#matrixDiv';
    const svgWidth = ctx.Matrix_W;
    const svgHeight = ctx.Matrix_H;
    const margin = { top: 80, right: 20, bottom: 80, left: 100 };
    const cellSize = Math.floor((svgWidth - margin.left - margin.right) / answerOptions.length);

    // Remove any existing SVG before creating a new one
    d3.select(containerId).selectAll("svg").remove();   
    
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    // Add a dark grey bounding box with rounded corners
    svg.append("rect")
        .attr("x", margin.left - 10) 
        .attr("y", margin.top - 60)  
        .attr("width", svgWidth - margin.left - margin.right + 20)  
        .attr("height", svgHeight - margin.top - margin.bottom + 40)  
        .attr("rx", 10)  
        .attr("ry", 10)  // Rounded corners
        .attr("fill", "darkgrey") 
        .attr("stroke", "none");  

    const allValues = countries.flatMap(rowCountry => 
        Object.values(matrix[rowCountry] || {}).filter(value => !isNaN(value))
    );
    
    const maxPercentage = (allValues.length > 0 ? Math.max(...allValues) : 0).toFixed(1);

    console.log("max val;", maxPercentage);
    const colorScale = d3.scaleLinear()
        .domain([0, maxPercentage/2, maxPercentage])
        .range(["rgb(220, 234, 214)", "rgb(68, 162, 85)", "rgb(8, 101, 168)"]);

    const xScale = d3.scaleBand()
        .domain(answerOptions)
        .range([margin.left, svgWidth - margin.right])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(countries)
        .range([margin.top, svgHeight - margin.bottom])
        .padding(0.05);

    // Draw heatmap cells
    svg.selectAll(".cell")
        .data(countries.flatMap(rowCountry =>
            answerOptions.map(colCountry => ({
                row: rowCountry,
                col: colCountry,
                value: matrix[rowCountry][colCountry],
                x: xScale(colCountry),
                y: yScale(rowCountry)
            }))
        ))
        .enter()
        .append("rect")
        .attr("class", d => `cell row-${sanitizeName(d.row)} col-${sanitizeName(d.col)}`)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", d => d.value > 0 ? colorScale(d.value) : ctx.background_color) // Use background color for zero
        .attr("stroke", "none");

    // Draw invisible hover boxes above the cells (trigger hover behavior more consistently)
    svg.selectAll(".hover-box")
        .data(countries.flatMap(rowCountry =>
            answerOptions.map(colCountry => ({
                row: rowCountry,
                col: colCountry,
                value: matrix[rowCountry][colCountry],
                x: xScale(colCountry),
                y: yScale(rowCountry)
            }))
        ))
        .enter()
        .append("rect")
        .attr("class", "hover-box")
        .attr("x", d => d.x)
        .attr("y", d => d.y)  // Position it above the cell
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", "transparent")  // Invisible box
        .style("z-index", "999")
        .attr("stroke", "none")
        .on("mouseenter", function(event, d) {
            handleHover(svg, d, xScale, yScale, cellSize, colorScale, matrix, countries, answerOptions);
        })
        .on("mouseleave", function(event, d) {
            handleHoverOut(svg, d);
        });


    // X axis labels
    svg.append("g")
        .selectAll(".x-axis-label")
        .data(answerOptions)
        .enter()
        .append("text")
        .attr("class", d => `x-axis-label x-axis-label-${sanitizeName(d)}`)
        .attr("x", d => xScale(d))
        .attr("y", margin.top-10)
        .text(d => {
            // Use the abbreviation from the countryMappings, fallback to the full name if not mapped
            const displayName = countryMappings[d] || d;
            return truncateName(displayName);
        })
        .style("font-size", "10px")
        .attr("transform", d => `rotate(-60, ${xScale(d) + cellSize / 2}, ${margin.top -15})`);

    // Y axis labels
    svg.append("g")
        .selectAll(".y-axis-label")
        .data(countries)
        .enter()
        .append("text")
        .attr("class", d => `y-axis-label y-axis-label-${sanitizeName(d)}`)
        .attr("x", margin.left - 10)
        .attr("y", d => yScale(d) + cellSize / 2)
        .attr("text-anchor", "end")
        .text(d => {
            // Use full country name or abbreviation from the mappings
            return countryMappings[d] || d;
        })
        .style("font-size", "10px");


    
    const legendWidth = 400;
    const legendHeight = 30;
    const legend = svg.append("g")
        .attr("transform", `translate(${(svgWidth - legendWidth) / 2}, ${svgHeight - margin.bottom + 20})`);

    const legendScale = d3.scaleLinear()
        .domain([0, maxPercentage])
        .range([0, legendWidth]);

    legend.selectAll("rect")
        .data(d3.range(0, maxPercentage, maxPercentage / 10))
        .enter()
        .append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", 0)
        .attr("width", legendWidth / 10)
        .attr("height", legendHeight)
        .attr("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "start")
        .text("0");

    legend.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "end")
        .text(maxPercentage);
}



function handleHover(svg, d, xScale, yScale, cellSize, colorScale, matrix, countries, answerOptions) {
    if (!d || !d.row || !d.col || d.value === undefined) {
        console.error("Invalid data in handleHover: ", d);
        return;
    }

    svg.selectAll(".hover-value").remove(); // clear any previous hover

    // Highlight the row and column with borders
    svg.selectAll(`.row-${sanitizeName(d.row)}`)
        .attr("stroke", "gray")
        .attr("stroke-width", 1);
    svg.selectAll(`.col-${sanitizeName(d.col)}`)
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

    // bolden the name of the countries involved
    svg.selectAll(`.x-axis-label-${sanitizeName(d.col)}`)
        .attr("font-weight", "bold")
        .style("font-size", function() { // increase font size by 30%
            const currentFontSize = parseFloat(d3.select(this).style("font-size")) || 10;
            return `${currentFontSize * 1.15}px`;  
        });

    svg.selectAll(`.y-axis-label-${sanitizeName(d.row)}`)
        .attr("font-weight", "bold")
        .style("font-size", function() { // increase font size by 30%
            const currentFontSize = parseFloat(d3.select(this).style("font-size")) || 10;
            return `${currentFontSize * 1.15}px`;  
        });

    // Show numbers on row and column
    countries.forEach((rowCountry) => {
        answerOptions.forEach((colCountry) => {
            const value = matrix[rowCountry][colCountry];
            
            if (rowCountry === d.row || colCountry === d.col) {
                svg.append("text")
                    .attr("class", "hover-value")
                    .attr("x", xScale(colCountry) + cellSize / 2)
                    .attr("y", yScale(rowCountry) + cellSize / 2 + 5) 
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .style("z-index", 100)
                    .style("font-weight", "bold")
                    .style("fill", "black") 
                    .text(value === 0 ? "0" : value.toFixed(1)); 
                
                svg.selectAll(".hover-value") // remove any hover behavior of the numbers
                    .style("pointer-events", "none");
            }
        });
    });
}

function handleHoverOut(svg, d) {
    // Check data exists
    if (!d || !d.row || !d.col || d.value === undefined) {
        console.error("Invalid data in handleHoverOut: ", d);
        return;
    }

    // Remove row and column highlights
    svg.selectAll(`.row-${sanitizeName(d.row)}`)
        .attr("stroke", "none");
    svg.selectAll(`.col-${sanitizeName(d.col)}`)
        .attr("stroke", "none");

    // Remove bolden name of the row and column labels, and the increased font size
    svg.selectAll(".x-axis-label").attr("font-weight", "normal").style("font-size", "10px");;
    svg.selectAll(".y-axis-label").attr("font-weight", "normal").style("font-size", "10px");; 

    // Remove the hover value text
    svg.selectAll(".hover-value").remove();
}

// Helper function to clean up country names
function sanitizeName(name) {
    return name.replace(/\s+/g, '-').replace(/[^\w\-]/g, ''); // Replace spaces with hyphens and remove special characters
}

// Helper function to limit country names to 12 characters
function truncateName(name, maxLength = 12) {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
}