import { ctx } from './parameters.js';  // Import ctx parameters

// Function to create a histogram showing % of improper values for each country
export function drawMissingPercentageHistogram(csvData, containerId, badType = "Missing") {
    
    const countries = Array.from(new Set(csvData.map(row => row.country)));

    const improperData = countries.map(country => {
        
        const countryData = csvData.filter(row => row.country === country);
        const totalAnswers = countryData.length * (Object.keys(countryData[0]).length - 1); // Total answers across all questions

        // Count the number of improper values based on selected type
        let improperCount = 0;

        countryData.forEach(row => {
            Object.entries(row).forEach(([key, value]) => {
                if (key.startsWith('q') && value === badType) {
                    improperCount++;
                }
                else if (key.startsWith('q') && badType === "Missing" && value === "missing") { // the non capitalized "missing" values
                    improperCount++;
                }
            });
        });

        // percentage of improper values
        const improperPercentage = ((improperCount / totalAnswers) * 100).toFixed(1);
        return { country, improperPercentage: parseFloat(improperPercentage) };
    });

    // Sort countries by improper percentage (descending order)
    improperData.sort((a, b) => b.improperPercentage - a.improperPercentage);

    // dimensions for the histogram
    const topMargin = ctx.HIST_H / 20;
    const histWidth = (4 / 5) * ctx.HIST_W;
    const histHeight = (2 / 3) * ctx.HIST_H - topMargin;
    const yLabelWidth = (1 / 5) * ctx.HIST_W;

    // Define scales
    const xScale = d3.scaleBand()
        .domain(improperData.map(d => d.country))
        .range([0, histWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(improperData, d => d.improperPercentage)])
        .nice()
        .range([histHeight, 0]);

    // Clear container before appending a new SVG
    d3.select(containerId).select("svg").remove();

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", ctx.HIST_W)
        .attr("height", ctx.HIST_H);

    const group = svg.append("g")
        .attr("transform", `translate(${yLabelWidth}, ${topMargin})`);

    // Draw bars
    group.selectAll("rect")
        .data(improperData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.country))
        .attr("y", d => yScale(d.improperPercentage))
        .attr("width", xScale.bandwidth())
        .attr("height", d => histHeight - yScale(d.improperPercentage))
        .attr("fill", "rgba(175, 73, 13, 0.84)")
        .on("mouseover", (event, d) => {
            d3.select(event.target).attr("fill", "darkred");
            hoverbox.html(`${d.country}:<br>${d.improperPercentage}% ${badType}`)
                .style("visibility", "visible")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", (event) => {
            d3.select(event.target).attr("fill", "rgba(175, 73, 13, 0.84)");
            hoverbox.style("visibility", "hidden");
        });

    // x-axis
    group.append("g")
        .attr("transform", `translate(0, ${histHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    // y-axis
    group.append("g")
        .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d}%`));

    // Add hoverbox
    const hoverbox = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("font-size", "14px")
        .style("z-index", "9999")
        .style("font-family", "'Righteous', sans-serif");

    // chart title
    svg.append("text")
        .attr("x", ctx.HIST_W / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Percentage of "${badType}" values by respondent country`);

    const averageImproperPercentage = d3.mean(improperData, d => d.improperPercentage);
    
    // horizontal line for the average
    group.append("line")
        .attr("x1", 0)
        .attr("x2", histWidth)
        .attr("y1", yScale(averageImproperPercentage))
        .attr("y2", yScale(averageImproperPercentage))
        .attr("stroke", "steelblue")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 2);
    
    // label for the average line
    group.append("text")
        .attr("x", histWidth - 10)
        .attr("y", yScale(averageImproperPercentage) - 5)
        .attr("text-anchor", "end")
        .style("fill", "steelblue")
        .style("font-size", "16px")
        .text(`Average: ${averageImproperPercentage.toFixed(1)}%`);
}
export function missing_dropdown_updates() {
    // Add event listener to the dropdown
    d3.select("#select_bad_type").on("change", function () {
        const selectedBadType = d3.select(this).property("value");
        console.log(`Selected Bad Type: ${selectedBadType}`);
        drawMissingPercentageHistogram(ctx.CSVDATA, "#bad_values_histogram", selectedBadType);
    });
}
