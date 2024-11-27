const ctx = {
    MAP_W: 1024,
    MAP_H: 1024,
    HIST_H: 650,
    HIST_W: 650,
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
        Histogram(csvData);
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
    };

    function Histogram(csvData) {
        // Handle "Submit" button click
        document.getElementById("submit-question").addEventListener("click", function () {
            const questionNumber = parseInt(document.getElementById("question-number").value);
            const warningMessage = document.getElementById("warning-message");
    
            if (questionNumber < 1 || questionNumber > 172) {
                warningMessage.style.display = "block"; // Show warning message
            } else {
                warningMessage.style.display = "none";
                drawHistogram(csvData,questionNumber);
            }
        });
    
        // Handle "Enter" keypress in the input field
        document.getElementById("question-number").addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                document.getElementById("submit-question").click(); // Simulate click on the "Submit" button
            }
        });
    }    

    function drawHistogram(csvData,questionNumber) {    
        // Extract answers and count frequencies
        const questionColumn = `q${questionNumber}`;
        const answers = csvData
            .map(row => row[questionColumn])
            .filter(answer => answer !== undefined && answer !== null);
        const answerCounts = d3.rollup(
            answers,
            v => v.length,
            d => d
        );

        const data = Array.from(answerCounts, ([answer, count]) => ({ answer, count }));

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

        // Add bars
        group.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.answer))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => histHeight - yScale(d.count))
            .attr("fill", "steelblue")
            .append("title")
                .text(d => d.answer);

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
    