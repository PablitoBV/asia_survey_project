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
        row[id1] !== "Other [please name]" &&
        row[id2] !== "Do not understand the question" &&
        row[id2] !== "Decline to answer" &&
        row[id2] !== "Missing" &&
        row[id2] !== "Can't choose" &&
        row[id2] !== "Other [please name]"
    );

    // Extract unique answers for id1 and id2
    const answerOptions1 = Array.from(new Set(filteredData.map(d => d[id1]))).filter(Boolean);
    const answerOptions2 = Array.from(new Set(filteredData.map(d => d[id2]))).filter(Boolean);

    // Identify which dimension has the larger number of distinct answers
    const largerDimension = answerOptions1.length > answerOptions2.length ? 'id1' : 'id2';
    const largerAnswers = largerDimension === 'id1' ? answerOptions1 : answerOptions2;
    const smallerAnswers = largerDimension === 'id1' ? answerOptions2 : answerOptions1;

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
        const value1 = row[id1];
        const value2 = row[id2];

        // Increment matrix value for matching answers
        if (matrix[value1] && matrix[value1][value2] !== undefined) {
            matrix[value1][value2]++;
        }
    });

    console.log(matrix);

    // Set up SVG dimensions and margins
    const containerId = "#visualizationMain";
    d3.select(containerId).selectAll("svg").remove();
    d3.select(containerId).selectAll(".question-navigator").remove();
    d3.select(containerId).selectAll(".group-navigator").remove();
    d3.select(containerId).selectAll(".SE-navigator").remove();

    const svgWidth = document.querySelector(containerId).clientWidth;  // Full width of the parent container
    const svgHeight = document.querySelector(containerId).clientHeight * 0.8;  // 80% of the parent height
    const margin = { top: svgHeight * 0.2, left: svgWidth * 0.2, bottom: 20, right: 20 };  // 20% margin for labels
    const heatmapWidth = svgWidth * 0.8;  // 80% of the width for the heatmap itself
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
            handleHover(svg, d, xScale, yScale, cellSize, colorScale, matrix, largerAnswers, smallerAnswers);
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

    // Add legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legend = svg.append("g")
        .attr("transform", `translate(${(svgWidth - legendWidth) / 2}, ${svgHeight - margin.bottom + 20})`);

    const legendScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, legendWidth]);

    legend.selectAll("rect")
        .data(d3.range(0, maxValue, maxValue / 10))
        .enter()
        .append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", 0)
        .attr("stroke", "rgb(67, 67, 67)")
        .attr("stroke-width", 1) 
        .attr("width", legendWidth / 10)
        .attr("height", legendHeight)
        .attr("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "middle")
        .text("0");

    legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "middle")
        .text((maxValue / 2).toFixed(0));

    legend.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "middle")
        .text(maxValue);
}






function handleHover(svg, d, xScale, yScale, cellSize, correlationMatrix, countries, answerOptions) {
    if (!d || !d.row || !d.col || d.value === undefined) {
        console.error("Invalid data in handleHover: ", d);
        return;
    }

    svg.selectAll(".hover-value").remove(); // Clear any previous hover

    // Highlight the row and column with borders
    svg.selectAll(`.row-${sanitizeName(d.row)}`)
        .attr("stroke", "gray")
        .attr("stroke-width", 1);
    svg.selectAll(`.col-${sanitizeName(d.col)}`)
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

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

    // Show the correlation values for all rows and columns on hover
    answerOptions.forEach((colCountry) => {
        countries.forEach((rowCountry) => {
            const value = correlationMatrix[rowCountry][colCountry];
            
            // Display the value in the middle of the corresponding cell
            svg.append("text")
                .attr("class", "hover-value")
                .attr("x", xScale(colCountry) + cellSize / 2)
                .attr("y", yScale(rowCountry) + cellSize / 2 + 5)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("fill", "black")
                .text(value === 0 ? "0" : value.toFixed(1));

            // Prevent pointer events on hover text to avoid interfering with interaction
            svg.selectAll(".hover-value")
                .style("pointer-events", "none");
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


function sanitizeName(name) {
    return name.replace(/\s+/g, '-').replace(/[^\w\-]/g, ''); // Replace spaces with hyphens and remove special characters
}


function truncateName(name, maxLength = 12) {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
}