import { ctx } from './parameters.js';  // Import ctx parameters

// Helper function for counting the respondents by country
export function countCountries(data) {
    const countryCounts = {};
    data.forEach(row => {
        const country = row["country"]; // Adjust if your CSV column name is different
        if (country) {
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
    });
    return countryCounts;
}




export function drawMap(geoData, countryCounts) {
    // Color variables
    const lightGray = "#EEE";
    const restColour = "rgb(20, 157, 211)";
    const hoverColour = "rgb(145, 84, 0)";
    const selectedColour = "rgb(145, 84, 0)";
    const smallcountryColour = "rgb(29, 65, 224)";

    d3.select("#respondentMap")
        .append("h2")
        .text("Map")  // Add the text for the heading
        .style("text-align", "center")  // Center the heading
        .style("margin", "0")  // Remove default margin
        .style("padding", "10px")  // Add padding around the heading
        .style("font-size", "24px")  // Adjust font size
        .style("font-weight", "bold");  // Make the font bold

    // Get the container's width and height dynamically
    const svgContainer = d3.select("#respondentMap");
    const svgWidth = svgContainer.node().getBoundingClientRect().width;
    const svgHeight = svgContainer.node().getBoundingClientRect().height;

    // Projection and path generator setup
    const projection = d3.geoMercator();
    const geoPathGen = d3.geoPath().projection(projection);

    ctx.respondent_map_bounds = d3.geoBounds(geoData); // GeoJSON bounding box
    const center = [
        (ctx.respondent_map_bounds[0][0] + ctx.respondent_map_bounds[1][0]) / 2,
        (ctx.respondent_map_bounds[0][1] + ctx.respondent_map_bounds[1][1]) / 2,
    ];

    const geoWidth = ctx.respondent_map_bounds[1][0] - ctx.respondent_map_bounds[0][0];
    const geoHeight = ctx.respondent_map_bounds[1][1] - ctx.respondent_map_bounds[0][1];

    const scale = Math.min(svgWidth / geoWidth, svgHeight / geoHeight) * 50;
    projection.center(center).translate([svgWidth / 2, svgHeight / 2]).scale(scale);

    svgContainer.select("svg").remove();
    // Clear previous SVG and append new SVG
    const svg = svgContainer
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const mapGroup = svg.append("g");

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("padding", "8px")
        .style("font-size", "12px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)");

    // Function to determine fill color based on state
    function getCountryColor(countryName) {
        if (ctx.appState.selectedCountries.includes(countryName)) {
            return selectedColour; // Selected state
        }
        return countryCounts[countryName] > 0 ? restColour : lightGray;
    }

    // Draw countries
    mapGroup.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", geoPathGen)
        .attr("stroke", "black")
        .attr("stroke-width", 0.2)
        .attr("class", "country")
        .style("fill", (d) => getCountryColor(d.properties.name))
        .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            const count = countryCounts[countryName] || 0;

            // Show tooltip only for countries with respondents
            if (count > 0) {
                tooltip.html(`<strong>${countryName}</strong><br>Respondents: ${count}`)
                    .style("visibility", "visible")
                    .style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");

                // Change to dark green if not selected
                if (!ctx.appState.selectedCountries.includes(countryName)) {
                    d3.select(event.target).style("fill", hoverColour);
                }
            }
        })
        .on("mouseout", (event, d) => {
            tooltip.style("visibility", "hidden");

            const countryName = d.properties.name;
            d3.select(event.target).style("fill", getCountryColor(countryName));
        })
        .on("click", (event, d) => {
            const countryName = d.properties.name;

            // Toggle selection
            if (ctx.appState.selectedCountries.includes(countryName)) {
                ctx.appState.selectedCountries = ctx.appState.selectedCountries.filter(c => c !== countryName);
            } else if (countryCounts[countryName] > 0) {
                ctx.appState.selectedCountries.push(countryName);
            }

            d3.select(event.target).style("fill", getCountryColor(countryName));
            console.log("Selected countries:", ctx.appState.selectedCountries);
        });

    // Circle data for Singapore and Hong Kong
    const circleData = [
        { name: "Singapore", coordinates: [103.8198, 1.3521] },
        { name: "Hong Kong", coordinates: [114.1694, 22.3193] }
    ];

    svg.selectAll("circle")
        .data(circleData)
        .enter()
        .append("circle")
        .attr("cx", (d) => projection(d.coordinates)[0])
        .attr("cy", (d) => projection(d.coordinates)[1])
        .attr("r", 5)
        .style("fill", (d) => ctx.appState.selectedCountries.includes(d.name) ? selectedColour : smallcountryColour)
        .on("mouseover", (event, d) => {
            const count = countryCounts[d.name] || 0;
            tooltip.html(`<strong>${d.name}</strong><br>Respondents: ${count}`)
                .style("visibility", "visible")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");

            // Change color to green if not selected
            if (!ctx.appState.selectedCountries.includes(d.name)) {
                d3.select(event.target).style("fill", hoverColour);
            }
        })
        .on("mouseout", (event, d) => {
            tooltip.style("visibility", "hidden");
            d3.select(event.target).style("fill", ctx.appState.selectedCountries.includes(d.name) ? selectedColour : smallcountryColour);
        })
        .on("click", (event, d) => {
            const name = d.name;

            if (ctx.appState.selectedCountries.includes(name)) {
                ctx.appState.selectedCountries = ctx.appState.selectedCountries.filter(c => c !== name);
            } else {
                ctx.appState.selectedCountries.push(name);
            }

            d3.select(event.target).style("fill", ctx.appState.selectedCountries.includes(name) ? selectedColour : smallcountryColour);
        });

    // Unselect button functionality
    d3.select("#unselectButton").on("click", () => {
        ctx.appState.selectedCountries = [];

        d3.selectAll(".country")
            .style("fill", (d) => getCountryColor(d.properties.name));

        d3.selectAll("circle")
            .style("fill", smallcountryColour);
    });
}



