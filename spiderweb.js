import { ctx } from './parameters.js';

const questionMapping = {
    "averageAge": "se3_2",
    "selfPlacement": "se13a",
    "parentsPlacement": "se13b",
    "childrenPlacement": "se13c",
    "yearsEducation": "se5a",
    "incomeQuintile": "se14",

};

const quintile_scale = {
    "Lowest quintile": 1,
    "2 nd": 2,
    "3rd": 3,
    "4th": 4,
    "Highest quintile": 5
};

const maxAvgs = {
    "averageAge": 57,
    "selfPlacement": 6,
    "parentsPlacement": 6,
    "childrenPlacement": 7.2,
    "yearsEducation": 13.2,
    "incomeQuintile": 3.1,
};

const globalAvgs = {
    "incomeQuintile": 2.230415638457444,
    "averageAge": 45.10055757575758,
    "parentsPlacement": 5.159647924728735,
    "selfPlacement": 5.218218361926638,
    "childrenPlacement": 6.180441115272576,
    "yearsEducation": 9.542874662742213
};

export function createSpiderChart(selectedCountry = "Hong Kong") {
    const countryData = ctx.CSVDATA.filter(row => row.country === selectedCountry);

    const globalData = [
        globalAvgs.averageAge || 0,
        globalAvgs.selfPlacement || 0,
        globalAvgs.parentsPlacement || 0,
        globalAvgs.childrenPlacement || 0,
        globalAvgs.yearsEducation || 0,
        globalAvgs.incomeQuintile || 0
    ];

    const averages = {
        averageAge: (() => {
            const validAges = countryData
                .map(d => +d[questionMapping.averageAge])
                .filter(value => !isNaN(value) && value !== null);
            return validAges.length > 0 ? d3.mean(validAges) : null;
        })(),
        parentsPlacement: d3.mean(countryData, d => +d[questionMapping.parentsPlacement]) || null,
        selfPlacement: d3.mean(countryData, d => +d[questionMapping.selfPlacement]) || null,
        childrenPlacement: d3.mean(countryData, d => +d[questionMapping.childrenPlacement]) || null,
        yearsEducation: d3.mean(countryData, d => +d[questionMapping.yearsEducation]) || null,
        incomeQuintile: (() => {
            const validIncomeValues = countryData
                .map(d => quintile_scale[d[questionMapping.incomeQuintile]])
                .filter(value => value !== undefined);
            return validIncomeValues.length > 0 ? d3.mean(validIncomeValues) : null;
        })()
    };

    
    const filteredAverages = Object.entries(averages).filter(([key, value]) => value !== null);
    const labels = filteredAverages.map(([key]) => key);
    const data = filteredAverages.map(([key, value]) => value);
    const cleanedData = data.map(d => (isNaN(d) ? 0 : d));

    // dimensions of the chart
    const width = ctx.spiderWeb_W;
    const height = ctx.spiderWeb_H;
    const margin = 70;
    const radius = Math.min(width, height) / 2 - margin;

    const angleSlice = Math.PI * 2 / labels.length;

    const scales = [
        d3.scaleLinear().domain([0, maxAvgs["averageAge"]]).range([0, radius]),
        d3.scaleLinear().domain([0, maxAvgs["selfPlacement"]]).range([0, radius]),
        d3.scaleLinear().domain([0, maxAvgs["parentsPlacement"]]).range([0, radius]),
        d3.scaleLinear().domain([0, maxAvgs["childrenPlacement"]]).range([0, radius]),
        d3.scaleLinear().domain([0, maxAvgs["yearsEducation"]]).range([0, radius]),
        d3.scaleLinear().domain([0, maxAvgs["incomeQuintile"]]).range([0, radius])
    ];

    const visualizationDiv = document.getElementById("spider-web-div");
    d3.select(visualizationDiv).select("svg").remove();

    const svg = d3.select(visualizationDiv)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw axis lines and graduations
    const axis = svg.selectAll(".axis")
        .data(labels)
        .enter()
        .append("g")
        .attr("class", "axis");

        axis.append("line")
        .attr("class", "highlightable")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("stroke", "#999")
        .attr("stroke-width", 1);
    
    axis.append("text")
        .attr("x", (d, i) => {
            if (d === "incomeQuintile") return (radius + 30) * Math.cos(angleSlice * i - Math.PI / 2); // Example adjustment
            return (radius + 20) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("y", (d, i) => {
            if (d === "incomeQuintile") return (radius + 30) * Math.sin(angleSlice * i - Math.PI / 2); // Example adjustment
            return (radius + 20) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .attr("class", "highlightable")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(d => d);

    // Add center 0
    axis.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(d => 0);


    for (let i = 1; i <= 4; i++) {
        const levelFactor = radius * (i / 4);

        // Draw the concentric circles of the chart
        svg.append("circle")
            .attr("r", levelFactor)
            .attr("fill", "none")
            .attr("fill", "rgba(129, 129, 129, 0.1)")
            .attr("stroke", "#d3d3d3")
            .attr("stroke-width", 1);

        // Add graduations for each axis
        axis.append("text")
            .attr("x", (d, j) => levelFactor * Math.cos(angleSlice * j - Math.PI / 2))
            .attr("y", (d, j) => levelFactor * Math.sin(angleSlice * j - Math.PI / 2))
            .attr("font-size", "12px")
            .style("z-index", "999")
            .attr("fill", "#666")
            .text(d => (maxAvgs[d] * i / 4).toFixed(1));
    };

    const webLine = d3.lineRadial()
        .radius((d, i) => scales[i](d))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);

    svg.append("path")
        .datum(cleanedData)
        .attr("d", webLine)
        .attr("fill", "rgba(0, 128, 255, 0.23)")
        .attr("stroke", "#0073e6")
        .attr("stroke-width", 2);

    // Add dots for selected country
    svg.selectAll(".data-point")
        .data(cleanedData)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", (d, i) => scales[i](d) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => scales[i](d) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("r", 6)
        .attr("fill", "#0073e6")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .on("mouseover", function (event, d) {
            d3.select(this)
                .attr("fill", "#ff5733");

            // Highlight the corresponding axis and graduation marks
            svg.selectAll(".highlightable")
                .filter((d, j) => j === i)  // Target the axis corresponding to the hovered point
                .attr("stroke", "#ff5733")  // Change stroke color
                .attr("stroke-width", 2);  // Highlight with a thicker stroke
                
            svg.append("text")
                .attr("x", parseFloat(d3.select(this).attr("cx")) + 10) 
                .attr("y", parseFloat(d3.select(this).attr("cy")) + 5)
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "#666")
                .attr("class", "tooltip")
                .text(d.toFixed(2));
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "#0073e6");
            svg.select(".tooltip").remove();

            // Reset the axis highlighting
            svg.selectAll(".highlightable")
                .attr("stroke", "#999")
                .attr("stroke-width", 1);
        });
        

    // add the grey line for the global average
    svg.append("path")
        .datum(globalData)
        .attr("class", "global-average")
        .attr("d", webLine)
        .attr("fill", "none")
        .attr("stroke", "grey") // Grey for global averages
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 4"); // Dashed line for distinction

    // Add global average points (grey)
    svg.selectAll(".global-point")
        .data(globalData)
        .enter()
        .append("circle")
        .attr("class", "global-point")
        .attr("cx", (d, i) => scales[i](d) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => scales[i](d) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("r", 6)
        .attr("fill", "grey")
        .attr("stroke", "none")
        .on("mouseover", function(event, d, i) {
            d3.select(this).attr("fill", "#ff5733");
            svg.append("text")
                .attr("x", parseFloat(d3.select(this).attr("cx")) + 10) 
                .attr("y", parseFloat(d3.select(this).attr("cy")) + 5)
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "#666")
                .attr("class", "tooltip")
                .text(`${d.toFixed(2)} (AVG)`); // Add (AVG) to the text

            // Highlight the corresponding axis and graduation marks
            svg.selectAll(".highlightable")
                .filter((d, j) => j === i)  // Target the axis corresponding to the hovered point
                .attr("stroke", "#ff5733")  // Change stroke color
                .attr("stroke-width", 2);  // Highlight with a thicker stroke
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "grey");
            svg.select(".tooltip").remove();
            // Reset the axis highlighting
        svg.selectAll(".highlightable")
            .attr("stroke", "#999")
            .attr("stroke-width", 1);
        });
}




///////////////////////////////////////////////////////////////////////////////////
// one-time-use stuff to compute the two averages object (globalAvgs, maxAvgs (by country)) at the top of the file

// const temp_global_averages = { // for each, we convert to number and filter valid numeric values (and use the quintile scale above for the quintiles)
//     "incomeQuintile": d3.mean(ctx.CSVDATA, row => +(quintile_scale[row[questionMapping.incomeQuintile]] || null)),
//     "averageAge": d3.mean(ctx.CSVDATA, row => +(row[questionMapping.averageAge] || null)),
//     "parentsPlacement": d3.mean(ctx.CSVDATA, row => +(row[questionMapping.parentsPlacement] || null)),
//     "selfPlacement": d3.mean(ctx.CSVDATA, row => +(row[questionMapping.selfPlacement] || null)),
//     "childrenPlacement": d3.mean(ctx.CSVDATA, row => +(row[questionMapping.childrenPlacement] || null)),
//     "yearsEducation": d3.mean(ctx.CSVDATA, row => +(row[questionMapping.yearsEducation] || null)),
// };


// export function get_max_averages_for_spiderweb() {

//     console.log("launching this!!!");
//     const incomeQuintile = d3.max(ctx.CSVDATA, d => d3.mean(ctx.CSVDATA.filter(row => row.country === d.country), row => +(quintile_scale[row[questionMapping.incomeQuintile]] || null)));
//     console.log(incomeQuintile);
//     const age = d3.max(ctx.CSVDATA, d => d3.mean(ctx.CSVDATA.filter(row => row.country === d.country), row => +row[questionMapping.averageAge]));
//     console.log(age);
//     const selfPlacement = d3.max(ctx.CSVDATA, d => d3.mean(ctx.CSVDATA.filter(row => row.country === d.country), row => +row[questionMapping.selfPlacement]));
//     console.log(selfPlacement);
//     const parentsPlacement = d3.max(ctx.CSVDATA, d => d3.mean(ctx.CSVDATA.filter(row => row.country === d.country), row => +row[questionMapping.parentsPlacement]));
//     console.log(parentsPlacement);
//     const childrenPlacement = d3.max(ctx.CSVDATA, d => d3.mean(ctx.CSVDATA.filter(row => row.country === d.country), row => +row[questionMapping.childrenPlacement]));
//     console.log(childrenPlacement);
//     const yearsEducation = d3.max(ctx.CSVDATA, d => d3.mean(ctx.CSVDATA.filter(row => row.country === d.country), row => +row[questionMapping.yearsEducation]));
//     console.log(yearsEducation);

//     const maxAvgs = {  // maximum averages (over all countries)
//         Age: age,
//         selfPlacement: selfPlacement,
//         parentsPlacement: parentsPlacement,
//         childrenPlacement : childrenPlacement,
//         yearsEducation : yearsEducation,
//         incomeQuintile: incomeQuintile
//     };
//     console.log(maxAvgs);
//     return;
// }