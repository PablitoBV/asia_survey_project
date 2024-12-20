import { ctx } from './parameters.js';

export function plotCorrelationMatrix() {
    // Extract feature IDs from current selection
    const [id1, id2] = ctx.appState.currentCorrelationSelection;
    // Filter out invalid responses
    const filteredData = ctx.CSVDATA.filter(row =>
        row[id1] !== "Do not understand the question" &&
        row[id1] !== "Decline to answer" &&
        row[id1] !== "Missing" &&
        row[id1] !== "Can't choose" &&
        row[id1] !== "Not applicable" &&
        row[id2] !== "Do not understand the question" &&
        row[id2] !== "Decline to answer" &&
        row[id2] !== "Missing" &&
        row[id2] !== "Can't choose" &&
        row[id2] !== "Not applicable"
    );

    // Count occurrences of each answer in id1 and id2
    const countOccurrences = (data, id) => {
        const counts = {};
        data.forEach(row => {
            const value = row[id];
            if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        });
        return counts;
    };

    const counts1 = countOccurrences(filteredData, id1);
    const counts2 = countOccurrences(filteredData, id2);

    // Sort the answers by count and keep only the top 30 if needed
    const filterTopAnswers = (counts) => 
        Object.entries(counts)
            .sort(([, a], [, b]) => b - a) // Sort descending by count
            .slice(0, 20)                 // Keep top 30
            .map(([key]) => key);         // Extract the answer options

    let answerOptions1 = Object.keys(counts1);
    let answerOptions2 = Object.keys(counts2);

    if (answerOptions1.length > 20) {
        answerOptions1 = filterTopAnswers(counts1);
    }

    if (answerOptions2.length > 20) {
        answerOptions2 = filterTopAnswers(counts2);
    }

    // Identify which dimension has the larger number of distinct answers
    const largerDimension = answerOptions1.length > answerOptions2.length ? 'id1' : 'id2';
    const largerAnswers = largerDimension === 'id1' ? answerOptions1 : answerOptions2;
    const smallerAnswers = largerDimension === 'id1' ? answerOptions2 : answerOptions1;
    let idlarger = largerDimension === 'id1' ? id1 : id2;
    let idsmaller = largerDimension === 'id1' ? id2 : id1;

    const matrix = {};

    // Initialize matrix with zero values
    largerAnswers.forEach(option1 => {
        matrix[option1] = {};
        smallerAnswers.forEach(option2 => {
            matrix[option1][option2] = 0;
        });
    });

    // Populate matrix with counts
    filteredData.forEach(row => {
        const value1 = row[idlarger];
        const value2 = row[idsmaller];

        // Increment matrix value for matching answers
        if (matrix[value1] && matrix[value1][value2] !== undefined) {
            matrix[value1][value2]++;
        }
    });

    // Set up SVG dimensions and margins
    const containerId = "#visualizationMain";
    d3.select(containerId).selectAll("svg").remove();
    d3.select(containerId).selectAll(".question-navigator").remove();
    d3.select(containerId).selectAll(".group-navigator").remove();
    d3.select(containerId).selectAll(".SE-navigator").remove();

    const svgWidth = document.querySelector(containerId).clientWidth;  // Full width of the parent container
    const svgHeight = document.querySelector(containerId).clientHeight * 0.8;  // 80% of the parent height
    const margin = { top: svgHeight * 0.2, left: svgWidth * 0.2, bottom: 20, right: svgWidth * 0.1 };  // 20% margin for labels
    const heatmapWidth = svgWidth * 0.7;  // 80% of the width for the heatmap itself
    const heatmapHeight = svgHeight * 0.8;  // 80% of the height for the heatmap itself

    // Define cell size based on the larger dimension, so cells are square
    const cellSize = Math.min(
        (heatmapWidth - (largerAnswers.length - 1)) / largerAnswers.length,
        (heatmapHeight - (smallerAnswers.length - 1)) / smallerAnswers.length
    );

    // Remove any existing SVG before creating a new one
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const allValues = largerAnswers.flatMap(option1 => 
        Object.values(matrix[option1] || {}).filter(value => !isNaN(value))
    );

    const maxValue = Math.max(...allValues).toFixed(1);

    // Define color scale for heatmap
    const colorScale = d3.scaleLinear()
        .domain([0, maxValue / 2, maxValue])
        .range(["rgb(220, 234, 214)", "rgb(68, 162, 85)", "rgb(8, 101, 168)"]);

    // Set up x and y scales based on larger and smaller answers
    const xScale = d3.scaleBand()
        .domain(largerAnswers)
        .range([margin.left, svgWidth - margin.right])
        .padding(0);

    const yScale = d3.scaleBand()
        .domain(smallerAnswers)
        .range([margin.top, svgHeight - margin.bottom])
        .padding(0);

    // Draw heatmap cells
    svg.selectAll(".cell")
        .data(largerAnswers.flatMap(option1 =>
            smallerAnswers.map(option2 => ({
                row: option1,
                col: option2,
                value: matrix[option1][option2],
                x: xScale(option1),
                y: yScale(option2)
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
        .data(largerAnswers.flatMap(option1 =>
            smallerAnswers.map(option2 => ({
                row: option1,
                col: option2,
                value: matrix[option1][option2],
                x: xScale(option1),
                y: yScale(option2)
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
            handleHover(svg, d, xScale, yScale, cellSize, matrix, largerAnswers, smallerAnswers);
        })
        .on("mouseleave", function(event, d) {
            handleHoverOut(svg, d);
        });

    // X axis labels
    svg.append("g")
        .selectAll(".x-axis-label")
        .data(largerAnswers)
        .enter()
        .append("text")
        .attr("class", d => `x-axis-label x-axis-label-${sanitizeName(d)}`)
        .attr("x", d => xScale(d) + cellSize / 2)
        .attr("y", margin.top - 10)
        .text(d => truncateName(d))
        .style("font-size", "10px")
        .attr("transform", d => `rotate(-60, ${xScale(d) + cellSize / 2}, ${margin.top - 15})`);

    // Y axis labels
    svg.append("g")
        .selectAll(".y-axis-label")
        .data(smallerAnswers)
        .enter()
        .append("text")
        .attr("class", d => `y-axis-label y-axis-label-${sanitizeName(d)}`)
        .attr("x", margin.left - 10)
        .attr("y", d => yScale(d) + cellSize / 2)
        .attr("text-anchor", "end")
        .text(d => truncateName(d))
        .style("font-size", "10px");

    // Define dimensions for the legend
    const legendWidth = svgWidth * 0.05; 
    const legendHeight = heatmapHeight;

    const legendGroup = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${margin.left - legendWidth - 100}, ${margin.top - 50})`); // Adjusted transform for better alignment

    // Define a linear scale for the legend
    const legendScale = d3.scaleLinear()
        .domain([0, maxValue]) // Match heatmap's data range
        .range([legendHeight, 0]); // Invert scale for vertical orientation

    // Define a vertical color gradient for the legend
    const legendGradient = d3.scaleLinear()
        .domain([0, maxValue / 2, maxValue])
        .range(["rgb(220, 234, 214)", "rgb(68, 162, 85)", "rgb(8, 101, 168)"]);

    // Calculate adjusted rectangle height to cover the full range
    const rectHeight = legendHeight / 20;

    // Draw the legend's gradient as a series of rectangles
    legendGroup.selectAll(".legend-rect")
        .data(d3.range(0, maxValue, maxValue / 20)) 
        .enter()
        .append("rect")
        .attr("class", "legend-rect")
        .attr("x", legendWidth) 
        .attr("y", d => legendScale(d) - rectHeight) 
        .attr("width", legendWidth)
        .attr("height", rectHeight + (rectHeight / 20)) 
        .attr("fill", d => legendGradient(d));

    // Add axis for the legend
    const legendAxis = d3.axisLeft(legendScale) 
        .ticks(5)
        .tickFormat(d3.format(".0f")); 

    legendGroup.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(${legendWidth}, 0)`) 
        .call(legendAxis);

    // Add a label for the legend
    legendGroup.append("text")
        .attr("x", legendWidth / 2 + 5) 
        .attr("y", -10) 
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Value");

}

function handleHover(svg, d, xScale, yScale, cellSize, correlationMatrix, countries, answerOptions) {
    if (!d || !d.row || !d.col || d.value === undefined) {
        console.error("Invalid data in handleHover: ", d);
        return;
    }

    svg.selectAll(".hover-value").remove(); // Clear any previous hover

    // Bolden the names of the countries involved and increase font size by 30%
    svg.selectAll(`.x-axis-label-${sanitizeName(d.col)}`)
        .attr("font-weight", "bold")
        .style("font-size", function() {
            const currentFontSize = parseFloat(d3.select(this).style("font-size")) || 10;
            return `${currentFontSize * 1.25}px`;
        });

    svg.selectAll(`.y-axis-label-${sanitizeName(d.row)}`)
        .attr("font-weight", "bold")
        .style("font-size", function() {
            const currentFontSize = parseFloat(d3.select(this).style("font-size")) || 10;
            return `${currentFontSize * 1.25}px`;
        });

    // Calculate total counts for row and column
    const totalForRow = answerOptions.reduce((sum, colCountry) => sum + (correlationMatrix[d.row][colCountry] || 0), 0);
    const totalForCol = countries.reduce((sum, rowCountry) => sum + (correlationMatrix[rowCountry][d.col] || 0), 0);
    const totalOverall = d3.sum(countries.flatMap(rowCountry =>
        answerOptions.map(colCountry => correlationMatrix[rowCountry][colCountry] || 0)
    ));

    // Calculate percentage contributions
    const rowPercentage = totalForRow ? (d.value / totalForRow * 100).toFixed(1) : "0.0";
    const colPercentage = totalForCol ? (d.value / totalForCol * 100).toFixed(1) : "0.0";
    const overallPercentage = totalOverall ? (d.value / totalOverall * 100).toFixed(1) : "0.0";

    // Display the value and percentage in the middle of the corresponding cell
    svg.append("text")
        .attr("class", "hover-value")
        .attr("x", d.x + cellSize / 2)
        .attr("y", d.y + cellSize / 2 - 5) // Slightly above the center
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text(d.value === 0 ? "0" : d.value.toFixed(0));

    // Display percentage below the value
    svg.append("text")
        .attr("class", "hover-value")
        .attr("x", d.x + cellSize / 2)
        .attr("y", d.y + cellSize / 2 + 15) // Slightly below the center
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "black")
        .text(`(${overallPercentage}%)`);

    // Prevent pointer events on hover text to avoid interfering with interaction
    svg.selectAll(".hover-value")
        .style("pointer-events", "none");
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


function sanitizeName(name) {
    return name.replace(/\s+/g, '-').replace(/[^\w\-]/g, ''); // Replace spaces with hyphens and remove special characters
}


function truncateName(name, maxLength = 14) {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
}