const ctx = {
    MAP_W: 1024,
    MAP_H: 1024,
};

function createViz() {
    console.log("Using D3 v" + d3.version);
    
    const svg = d3.select("#mapContainer").append("svg")
        .attr("width", ctx.MAP_W)
        .attr("height", ctx.MAP_H);

    // Add title inside the SVG
    svg.append("text")
        .attr("x", ctx.MAP_W / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "black")
        .text("Map of Asia");

    loadData();
}

function loadData() {
    const geoDataPromise = d3.json("data/asia2.geojson");
    const csvDataPromise = d3.csv("data/mergeddata.csv");

    Promise.all([geoDataPromise, csvDataPromise]).then(([geoData, csvData]) => {
        const countryCounts = countCountries(csvData);
        console.log(countryCounts);
        drawMap(geoData, countryCounts);
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}

function countCountries(data) {
    const countryCounts = {};

    data.forEach(row => {
        const country = row["country"]; // Adjust if your CSV column name is different
        if (country) {
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
    });

    return countryCounts;
}


function drawMap(geoData, countryCounts) {
    ctx.proj = d3.geoMercator()
        .center([100, -10]) // Center on Asia
        .translate([ctx.MAP_W / 2, ctx.MAP_H / 2])
        .scale(300); // Scale to fit map

    const geoPathGen = d3.geoPath(ctx.proj);
    const svg = d3.select("svg");

    // parameters of the on-hover textbox
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("padding", "8px")
        .style("font-size", "12px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)");

    // to set the color according to number of respondents (not super useful)
    // const maxCount = d3.max(Object.values(countryCounts));
    // const colorScale = d3.scaleSequential(d3.interpolateOrRd)
    //     .domain([0, maxCount || 1]);

    let mapGroup = svg.append("g");

    mapGroup.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", geoPathGen)
        .attr("stroke", "black")
        .attr("stroke-width", 0.2)
        .attr("class", "country")
        .style("fill", (d) => {
            const countryName = d.properties.name; // Adjust based on geojson's country property
            console.log(countryName);
            const count = countryCounts[countryName] || 0;
            return count > 0 ? "DarkCyan" : "#EEE";
        })
        .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            const count = countryCounts[countryName] || 0;

            // Show tooltip
            tooltip.html(`<strong>${countryName}</strong><br>Respondents: ${count}`)
                .style("visibility", "visible")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");

            // Highlight the country in green
            d3.select(event.target).style("fill", "green");
        })
        .on("mousemove", (event) => {
            // Update tooltip position
            tooltip.style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", (event, d) => {
            const countryName = d.properties.name;
            const count = countryCounts[countryName] || 0;

            // Hide tooltip
            tooltip.style("visibility", "hidden");

            // Reset country color
            d3.select(event.target).style("fill", count > 0 ? "DarkCyan" : "#EEE");
        });
}