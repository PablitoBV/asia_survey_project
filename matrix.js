import { ctx } from "./parameters.js";


// Initialize a mapping between full country names and their abbreviations
const countryMappings = {
    "United States": "USA",
    "United Arab Emirates/Middle Eastern countries": "UAE/Middle East",
    "European Union": "EU",
    "Association of Southeast Asian Nations, ASEAN": "ASEAN",
    // Add other countries as needed
};

// Function to plot the country vs country heatmap for question 163
export function plotCountryVsCountryMatrix(csvData) {
    const questionColumn = 'q163'; // Pick question

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

    // Initialize a response matrix and store original country names
    const matrix = {};
    // const countryMappings = {}; // Store mappings between country abbreviations and full names

    countries.forEach(country1 => {
        matrix[country1] = {};
        countryMappings[country1] = country1;  // Store original names in the mapping
        answerOptions.forEach(country2 => {
            matrix[country1][country2] = 0;
        });
    });

    // Populate the matrix
    filteredData.forEach(row => {
        const respondentCountry = row.country;
        const selectedCountry = row[questionColumn];
        if (respondentCountry && selectedCountry && matrix[respondentCountry][selectedCountry] !== undefined) {
            matrix[respondentCountry][selectedCountry]++;
        }
    });

    // Set up SVG dimensions and margins
    const containerId = '#matrixDiv';
    const svgWidth = ctx.Matrix_W;
    const svgHeight = ctx.Matrix_H;
    const margin = { top: 80, right: 20, bottom: 80, left: 100 };
    const cellSize = Math.floor((svgWidth - margin.left - margin.right) / answerOptions.length);

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const maxCount = d3.max(countries.map(row => d3.max(answerOptions.map(col => matrix[row][col]))));
    const colorScale = d3.scaleLinear()
        .domain([0, maxCount / 2, maxCount])
        .range(["#ffffcc", "#1f78b4", "#081d58"]);

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
        .attr("fill", d => d.value > 0 ? colorScale(d.value) : "none")
        .attr("stroke", "none") // Border for non-zero values only
        .on("mouseover", function(event, d) {
            if (d && d.row && d.col && d.value !== undefined) {
                handleHover(svg, d, xScale, yScale, cellSize, colorScale, matrix, countries, answerOptions);
            } else {
                console.error("Invalid data in mouseover event: ", d);
            }
        })
        .on("mouseout", function(event, d) {
            if (d && d.row && d.col && d.value !== undefined) {
                handleHoverOut(svg, d);
            }
        });

    // X axis labels
    svg.append("g")
        .selectAll(".x-axis-label")
        .data(answerOptions)
        .enter()
        .append("text")
        .attr("class", d => `x-axis-label x-axis-label-${sanitizeName(d)}`)
        .attr("x", d => xScale(d) + cellSize / 2)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .text(d => {
            // Use the abbreviation from the countryMappings, fallback to the full name if not mapped
            return countryMappings[d] || d;
        })
        .style("font-size", "10px")
        .attr("transform", d => `rotate(-60, ${xScale(d) + cellSize / 2}, ${margin.top - 10})`);

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


    
    const legendWidth = 200;
    const legendHeight = 10;
    const legend = svg.append("g")
        .attr("transform", `translate(${(svgWidth - legendWidth) / 2}, ${svgHeight - margin.bottom + 20})`);

    const legendScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([0, legendWidth]);

    legend.selectAll("rect")
        .data(d3.range(0, maxCount, maxCount / 10))
        .enter()
        .append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", 0)
        .attr("width", legendWidth / 10)
        .attr("height", legendHeight)
        .attr("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 10)
        .attr("text-anchor", "start")
        .text("0");

    legend.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 10)
        .attr("text-anchor", "end")
        .text(maxCount);

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
                    .style("font-weight", "bold")
                    .style("fill", "black") 
                    .text(value === 0 ? "0" : value); 
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

    // Remove the hover value text
    svg.selectAll(".hover-value").remove();
}

// Helper function to clean up country names
function sanitizeName(name) {
    return name.replace(/\s+/g, '-').replace(/[^\w\-]/g, ''); // Replace spaces with hyphens and remove special characters
}
