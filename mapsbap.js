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

export function drawMap(geoData, containerId, countryCounts, singleCountry = false) {
    const svgWidth = ctx.MAP_W;
    const svgHeight = ctx.MAP_H;

    const projection = d3.geoMercator();
    const geoPathGen = d3.geoPath().projection(projection);

    const bounds = d3.geoBounds(geoData);
    const center = [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2,
    ];

    const geoWidth = bounds[1][0] - bounds[0][0];
    const geoHeight = bounds[1][1] - bounds[0][1];

    const scale = Math.min(svgWidth / geoWidth, svgHeight / geoHeight) * (singleCountry ? 35 : 50);

    projection.center(center).translate([svgWidth / 2, svgHeight / 2]).scale(scale);

    const svg = d3.select(containerId)
        .html('') // Clear any previous SVG elements
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    
    const mapGroup = svg.append("g");

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("padding", "8px")
        .style("font-size", "12px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)");

    mapGroup.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", geoPathGen)
        .attr("stroke", "black")
        .attr("stroke-width", 0.2)
        .attr("class", "country")
        .style("fill", singleCountry ? "rgb(255, 191, 100)" : (d) => {
            const countryName = d.properties.name;
            const count = countryCounts[countryName] || 0;
            return count > 0 ? "DarkCyan" : "#EEE"; // Countries with respondents are cyan, others gray
        })
        .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            const count = countryCounts[countryName] || 0;

            // Skip hover effect for gray countries
            if (d3.select(event.target).style("fill") === "rgb(238, 238, 238)") {
                return;
            }

            tooltip.html(`<strong>${countryName}</strong><br>Respondents: ${count}`)
                .style("visibility", "visible")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");

            if (!ctx.selectedCountries.includes(countryName)) {
                d3.select(event.target).style("fill", "green"); // Hover color for non-selected
            }
        })
        .on("mouseout", (event, d) => {
            const countryName = d.properties.name;
            const count = countryCounts[countryName] || 0;
            tooltip.style("visibility", "hidden");

            // Skip resetting color for gray countries
            if (d3.select(event.target).style("fill") === "rgb(238, 238, 238)") {
                return;
            }

            // Reset country color if it's not selected
            if (!ctx.selectedCountries.includes(countryName)) {
                d3.select(event.target).style("fill", count > 0 ? "DarkCyan" : "#EEE");
            }
        })
        .on("click", (event, d) => {
            const countryNameClicked = d.properties.name;

            // Prevent selection for gray countries
            if (d3.select(event.target).style("fill") === "rgb(238, 238, 238)") {
                return;
            }

            if (ctx.selectedCountries.includes(countryNameClicked)) {
                // Deselect country
                ctx.selectedCountries = ctx.selectedCountries.filter(c => c !== countryNameClicked);
                d3.select(event.target).style("fill", "DarkCyan");
            } else {
                // Select country
                ctx.selectedCountries.push(countryNameClicked);
                d3.select(event.target).style("fill", "DarkOrange");
            }

            console.log("Selected countries:", ctx.selectedCountries);
        });

    const circleData = [
        {name: "Singapore", coordinates: [103.8198, 1.3521]},
        {name: "Hong Kong", coordinates: [114.1694, 22.3193]}
    ];

    svg.selectAll('circle')
        .data(circleData)
        .enter()
        .append('circle')
        .attr('cx', (d) => projection(d.coordinates)[0])
        .attr('cy', (d) => projection(d.coordinates)[1])
        .attr('r', 5)
        .style('fill', (d) => ctx.selectedCountries.includes(d.name) ? 'DarkOrange' : 'blue')
        .on("mouseover", (event, d) => {
            const count = countryCounts[d.name] || 0;
            tooltip.html(`<strong>${d.name}</strong><br>Respondents: ${count}`)
                .style("visibility", "visible")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            d3.select(event.target).style("fill", "green");
        })
        .on("mouseout", (event, d) => {
            tooltip.style("visibility", "hidden");
            d3.select(event.target).style("fill", ctx.selectedCountries.includes(d.name) ? "DarkOrange" : "blue");
        })
        .on("click", (event, d) => {
            if (ctx.selectedCountries.includes(d.name)) {
                // Deselect
                ctx.selectedCountries = ctx.selectedCountries.filter(c => c !== d.name);
                d3.select(event.target).style("fill", "blue");
            } else {
                // Select
                ctx.selectedCountries.push(d.name);
                d3.select(event.target).style("fill", "DarkOrange");
            }

            console.log("Selected countries:", ctx.selectedCountries);
        });

    const unselectButton = d3.select("#unselectButton");
    unselectButton.on("click", () => {
        ctx.selectedCountries = [];

        d3.selectAll('.country')
            .style('fill', (d) => {
                const countryName = d.properties.name;
                const count = countryCounts[countryName] || 0;
                return count > 0 ? "DarkCyan" : "#EEE"; // Original color
            });

        d3.selectAll('circle')
            .style('fill', "blue");

        console.log("All countries deselected");
    });
}






// export function drawMap(geoData, containerId, countryCounts, singleCountry = false) {
//     const svgWidth = ctx.MAP_W;
//     const svgHeight = ctx.MAP_H;

//     const projection = d3.geoMercator();
//     const geoPathGen = d3.geoPath().projection(projection);

//     const bounds = d3.geoBounds(geoData); // geoJSON bounding box
//     console.log("Geo Data Bounds:", bounds);

//     const center = [ //center of bounding box
//         (bounds[0][0] + bounds[1][0]) / 2, 
//         (bounds[0][1] + bounds[1][1]) / 2, 
//     ];

//     // width and height of the geographic bounding box
//     const geoWidth = bounds[1][0] - bounds[0][0]; 
//     const geoHeight = bounds[1][1] - bounds[0][1]; 
//     console.log("Geo Width:", geoWidth);
//     console.log("Geo Height:", geoHeight);
//     // Determine the scale dynamically based on SVG dimensions and GeoJSON bounding box
//     const scale = Math.min(
//         svgWidth / geoWidth, 
//         svgHeight / geoHeight
//     ) * (singleCountry? 35 : 50 ); // Increase multiplier for better size

//     console.log("Scale Factor:", scale);
//     // Set the projection center and scale
//     projection.center(center).translate([svgWidth / 2, svgHeight / 2]).scale(scale);

//     const svg = d3.select(containerId)
//         .html('') // Clear any previous SVG elements to avoid overlap
//         .append("svg")
//         .attr("width", svgWidth)
//         .attr("height", svgHeight)
//         .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`); // Add the viewBox for responsiveness
//     let mapGroup = svg.append("g");

//     if (singleCountry) { // for single country maps
//         mapGroup
//             .selectAll("path")
//             .data(geoData.features)
//             .enter()
//             .append("path")
//             .attr("d", geoPathGen)
//             .attr("stroke", "black")
//             .attr("stroke-width", 0.2)
//             .attr("class", "country")
//             .style("fill", "rgb(255, 191, 100)"); // light orange for single country map
//     }
//     else { // for the respondents map

//                 // Add title inside the SVG
//         svg.append("text")
//             .attr("x", ctx.MAP_W / 2)
//             .attr("y", 30)
//             .attr("text-anchor", "middle")
//             .attr("font-size", "24px")
//             .attr("font-weight", "bold")
//             .attr("fill", "black")
//             .style("font-family", "'Righteous', sans-serif")
//             .text("Countries included in our study");

//         ctx.proj = d3.geoMercator()
//             .center([100, -10]) // Center on Asia
//             .translate([ctx.MAP_W / 2, ctx.MAP_H / 2])
//             .scale(300); // Scale to fit map

//         const geoPathGen = d3.geoPath(ctx.proj);
//         //var svg = d3.select("svg");

//         // parameters of the on-hover textbox
//         const tooltip = d3.select("body").append("div")
//             .style("position", "absolute")
//             .style("visibility", "hidden")
//             .style("background-color", "white")
//             .style("border", "1px solid #ddd")
//             .style("border-radius", "5px")
//             .style("padding", "8px")
//             .style("font-size", "12px")
//             .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)");

//         // to set the color according to number of respondents (not super useful)
//         // const maxCount = d3.max(Object.values(countryCounts));
//         // const colorScale = d3.scaleSequential(d3.interpolateOrRd)
//         //     .domain([0, maxCount || 1]);

//         // let mapGroup = svg.append("g");

//         mapGroup.selectAll("path")
//             .data(geoData.features)
//             .enter()
//             .append("path")
//             .attr("d", geoPathGen)
//             .attr("stroke", "black")
//             .attr("stroke-width", 0.2)
//             .attr("class", "country")
//             .style("fill", (d) => {
//                 const countryName = d.properties.name; // Adjust based on geojson's country property
//                 const count = countryCounts[countryName] || 0;
//                 return count > 0 ? "DarkCyan" : "#EEE";
//             })
//             .on("mouseover", (event, d) => {
//                 const countryName = d.properties.name;
//                 const count = countryCounts[countryName] || 0;

//                 // Show tooltip
//                 tooltip.html(`<strong>${countryName}</strong><br>Respondents: ${count}`)
//                     .style("visibility", "visible")
//                     .style("top", (event.pageY + 10) + "px")
//                     .style("left", (event.pageX + 10) + "px");

//                 // Highlight the country in green
//                 d3.select(event.target).style("fill", "green");
//             })
//             .on("mousemove", (event) => {
//                 // Update tooltip position
//                 tooltip.style("top", (event.pageY + 10) + "px")
//                     .style("left", (event.pageX + 10) + "px");
//             })
//             .on("mouseout", (event, d) => {
//                 const countryName = d.properties.name;
//                 const count = countryCounts[countryName] || 0;

//                 // Hide tooltip
//                 tooltip.style("visibility", "hidden");

//                 // Reset country color
//                 d3.select(event.target).style("fill", count > 0 ? "DarkCyan" : "#EEE");
//             });
//         }
// };