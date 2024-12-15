// import { ctx, loadQuestions } from './parameters.js'; // Import ctx and loadQuestions

// // Scatterplot Function
// function createScatterplot(csvFilePath, xColumn, yColumn, countryColumn, containerId) {
//     // Set dimensions and margins for the scatterplot
//     const margin = { top: 20, right: 40, bottom: 50, left: 60 };
//     const width = 800 - margin.left - margin.right;
//     const height = 600 - margin.top - margin.bottom;

//     // Append an SVG object to the container
//     const svg = d3.select(containerId)
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Load the CSV file
//     d3.csv(csvFilePath).then(data => {
//         // Parse the data into numerical format where applicable
//         data.forEach(d => {
//             d[xColumn] = +d[xColumn];
//             d[yColumn] = +d[yColumn];
//         });

//         // Create a list of unique countries for color assignment
//         const countries = Array.from(new Set(data.map(d => d[countryColumn])));

//         // Create a color scale
//         const colorScale = d3.scaleOrdinal()
//             .domain(countries)
//             .range(d3.schemeCategory10);

//         // Define scales for the scatterplot
//         const xScale = d3.scaleLinear()
//             .domain([d3.min(data, d => d[xColumn]), d3.max(data, d => d[xColumn])])
//             .range([0, width]);

//         const yScale = d3.scaleLinear()
//             .domain([d3.min(data, d => d[yColumn]), d3.max(data, d => d[yColumn])])
//             .range([height, 0]);

//         // Add X-axis
//         svg.append("g")
//             .attr("transform", `translate(0,${height})`)
//             .call(d3.axisBottom(xScale))
//             .append("text")
//             .attr("x", width / 2)
//             .attr("y", 40)
//             .attr("fill", "black")
//             .style("text-anchor", "middle")
//             .text(xColumn);

//         // Add Y-axis
//         svg.append("g")
//             .call(d3.axisLeft(yScale))
//             .append("text")
//             .attr("transform", "rotate(-90)")
//             .attr("x", -height / 2)
//             .attr("y", -40)
//             .attr("fill", "black")
//             .style("text-anchor", "middle")
//             .text(yColumn);

//         // Add points to the scatterplot
//         svg.selectAll("circle")
//             .data(data)
//             .enter()
//             .append("circle")
//             .attr("cx", d => xScale(d[xColumn]))
//             .attr("cy", d => yScale(d[yColumn]))
//             .attr("r", 5)
//             .attr("fill", d => colorScale(d[countryColumn]))
//             .attr("opacity", 0.8);

//         // Add a legend for countries
//         const legend = svg.append("g")
//             .attr("transform", `translate(${width - 150}, 20)`);

//         countries.forEach((country, i) => {
//             const legendRow = legend.append("g")
//                 .attr("transform", `translate(0, ${i * 20})`);

//             legendRow.append("rect")
//                 .attr("width", 10)
//                 .attr("height", 10)
//                 .attr("fill", colorScale(country));

//             legendRow.append("text")
//                 .attr("x", 20)
//                 .attr("y", 10)
//                 .attr("fill", "black")
//                 .style("text-anchor", "start")
//                 .style("alignment-baseline", "middle")
//                 .text(country);
//         });
//     }).catch(error => {
//         console.error("Error loading the CSV file:", error);
//     });
// }

