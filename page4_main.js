import { ctx } from './parameters.js';

export function createStackedEvolutionChart(){
    const question_ids = ['q1', 'q7', 'q33', 'q44', 'q48', 'q55','q56', 'q58', 'q60', 'q61', 'q62', 'q130', 'q139', 'q155']
    const SEfactors_ids = ['se2', 'level', 'se5', 'se7a', 'se12']

    questionSection(question_ids, SEfactors_ids);
    showQuestion();
    stackedEvolutionChart();

    const mainContainer = d3.select("#main-container");


    mainContainer.on("click", function (event) {
        const target = event.target;
        if (target.classList.contains("description-button")) {
            d3.select("#main-container").html('')
            questionSection(question_ids, SEfactors_ids);
            showQuestion();
            stackedEvolutionChart();
        }
    });
}

function showQuestion() {
    const container = d3.select("#main-container");
    const idq = ctx.stackedEvolutionChart.currentQuestion;
    const ids = ctx.stackedEvolutionChart.currentSEfactor;

    const SEdescription = ctx.questions.find(e => e.id === ids)?.description || "No description available";
    const Qdescription = ctx.questions.find(e => e.id === idq)?.description || "No description available";

    // Create a wrapper div for positioning
    const descriptionWrapper = container.append("div")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("right", "10px")
        .style("width", "300px")  
        .style("z-index", "-1"); // Ensure it's above other elements

    // Add the selected question
    descriptionWrapper.append("div")
        .attr("class", "description-container")
        .style("padding", "10px")
        .style("margin", "5px 0")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("background-color", "#f9f9f9")
        .style("font-size", "16px")
        .style("line-height", "1.5")
        .html(`<strong>Selected Question:</strong> <br> ${Qdescription}`);

    // Add the selected socio-economic factor
    descriptionWrapper.append("div")
        .attr("class", "description-container")
        .style("padding", "10px")
        .style("margin", "5px 0")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("background-color", "#f9f9f9")
        .style("font-size", "16px")
        .style("line-height", "1.5")
        .html(`<strong>Selected Socio-Economic Factor:</strong> <br> ${SEdescription}`);

    descriptionWrapper.append("div")
        .attr("class", "description-container")
        .style("padding", "10px")
        .style("margin", "5px 0")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("background-color", "#f9f9f9")
        .style("font-size", "16px")
        .style("line-height", "1.5")
        .html(`<strong>⚠️ Warning, the sampling over time isn't uniform, these results are probably not generalisable.</strong> <br>`);
}



function questionSection(question_ids, SEfactors_ids) {
    const container = d3.select("#main-container");

    const containerWidth = container.node().clientWidth;
    const containerHeight = container.node().clientHeight;

    const pullTabWidth = 40; 
    const animationDuration = 500; 
    const sidePageWidth = containerWidth * 0.4; // Side page takes 40% of the container width

    // Create the sliding side page container
    const sidePage = container.append("div")
        .attr("id", "sidePage")
        .style("position", "absolute")
        .style("top", "0px")
        .style("right", `-${sidePageWidth}px`)
        .style("width", `${sidePageWidth}px`)
        .style("height", `${containerHeight}px`) 
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("box-shadow", "-2px 0px 5px rgba(0,0,0,0.3)")
        .style("transition", `right ${animationDuration}ms ease`);

    // Call createQuestionButtons regardless of ctx.appState.currentViz
    createButtons(question_ids, SEfactors_ids);

    // Create the pull tab
    const pullTab = container.append("div")
        .attr("id", "pullTab")
        .style("position", "absolute")
        .style("top", `${containerHeight / 2 - 40}px`) // Vertically centered
        .style("right", "0px")
        .style("width", `${pullTabWidth}px`)
        .style("height", "80px")
        .style("background", "#007BFF")
        .style("border-top-left-radius", "10px")
        .style("border-bottom-left-radius", "10px")
        .style("cursor", "pointer")
        .style("box-shadow", "-2px 0px 5px rgba(0,0,0,0.3)");

    // Add an arrow indicator inside the pull tab
    pullTab.append("div")
        .style("width", "0")
        .style("height", "0")
        .style("margin", "auto")
        .style("border-left", "10px solid transparent")
        .style("border-right", "10px solid transparent")
        .style("border-top", "15px solid white")
        .style("transform", "rotate(90deg)")
        .style("margin-top", "32px");

    // Add interactivity for opening and closing the side page
    let isOpen = false;

    pullTab.on("click", function () {
        if (isOpen) {
            // Slide out
            sidePage.style("right", `-${sidePageWidth}px`);
            pullTab.style("right", "0px");
            pullTab.select("div").style("transform", "rotate(90deg)"); // Reset arrow
        } else {
            // Slide in
            sidePage.style("right", "0px");
            pullTab.style("right", `${sidePageWidth}px`);
            pullTab.select("div").style("transform", "rotate(-90deg)"); // Flip arrow
        }
        isOpen = !isOpen; // Toggle state
    });
}

function createButtons(question_ids, SEfactors_ids) {
    // Select the container where the buttons will be added
    const container = d3.select("#sidePage");

    // Create a group for the buttons
    const buttonGroup = container.append("div")
        .attr("class", "group-buttons")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("gap", "20px") 
        .style("height", "100%"); 

    // Create the 'Questions' button
    const questionButton = buttonGroup.append("button")
        .attr("class", "button questions-button")
        .text("Questions")
        .on("click", function () {
            d3.select(this)
                .style("transform", "scale(0.95)")
                .transition()
                .duration(200)
                .style("transform", "scale(1)");
            createQuestionButtons(question_ids); 
        });

    // Create the 'Socio-Economic Factors' button
    const SEButton = buttonGroup.append("button")
        .attr("class", "button SE-button")
        .text("Socio-Economic Factors")
        .on("click", function () {
            d3.select(this)
                .style("transform", "scale(0.95)")
                .transition()
                .duration(200)
                .style("transform", "scale(1)");
            createQuestionButtons(SEfactors_ids);
        });

    // Style the buttons
    d3.selectAll(".button")
        .style("padding", "15px 30px") 
        .style("font-size", "16px")   
        .style("margin", "5px")
        .style("border", "2px solid #ccc") 
        .style("border-radius", "10px")  
        .style("background-color", "#f4f4f4")
        .style("cursor", "pointer")
        .style("transition", "all 0.2s")
        .on("mouseover", function () {
            d3.select(this).style("background-color", "#e0e0e0");
        })
        .on("mouseout", function () {
            d3.select(this).style("background-color", "#f4f4f4");
        });
}

function createQuestionButtons(question_ids) {
    const groupContainer = d3.select("#sidePage");
    groupContainer.selectAll("*").remove();
    
    // Filter questions based on the provided question_ids
    const filteredQuestions = ctx.questions.filter(q => question_ids.includes(q.id));

    const buttonHeight = 50; // Increased height for the buttons
    const containerWidth = groupContainer.node().clientWidth;
    const buttonWidth = containerWidth * 0.6; // 60% of the container width for buttons
    const buttonMargin = 10; // Margin between buttons

    // Enable vertical scrolling if more than 14 buttons
    groupContainer
        .style("overflow-y", "auto") // Enable vertical scrolling
        .style("max-height", "90vh"); // Limit container height for scroll

    // Create a container for the description buttons
    const descriptionContainer = groupContainer.append("div")
        .attr("class", "description-container")
        .style("display", "flex") // Apply flexbox
        .style("flex-direction", "column") // Stack buttons vertically
        .style("align-items", "center") // Center buttons horizontally
        .style("justify-content", "flex-start") // Align buttons at the top
        .style("width", "100%") // Ensure the container takes the full width of parent
        .style("padding", "10px"); // Optional: add some padding

    // Create buttons for each filtered question
    descriptionContainer.selectAll("button")
        .data(filteredQuestions)
        .enter()
        .append("button")
        .attr("class", "description-button")
        .style("width", `${buttonWidth}px`) // Button width
        .style("height", `${buttonHeight}px`) // Button height with increased size
        .style("margin-bottom", `${buttonMargin}px`) // Space between buttons
        .style("border-radius", "12px")
        .style("color", "white")
        .style("font-size", "16px") // Adjusted font size for proportion
        .style("border", "none")
        .style("cursor", "pointer")
        .style("transition", "all 0.1s ease-in-out")
        .text(d => d.description) // Set button text from description
        .on("click", (event, d) => {
            const questionIDs = ['q1', 'q7', 'q33', 'q44', 'q48', 'q55', 'q56', 'q58', 'q60', 'q61', 'q62', 'q92', 'q130', 'q139', 'q155'];
            
            if (questionIDs.includes(d.id)) {
                ctx.stackedEvolutionChart.currentQuestion = d.id;
            } else {
                ctx.stackedEvolutionChart.currentSEfactor = d.id;
            }
        })
        .on("mousedown", function () {
            // "Pressed" effect on mousedown
            d3.select(this)
                .style("box-shadow", "inset 2px 2px 5px rgba(0, 0, 0, 0.3)") // Inner shadow
                .style("transform", "translateY(2px)"); // Move button down
        })
        .on("mouseup", function () {
            // Remove "pressed" effect on mouseup
            d3.select(this)
                .style("box-shadow", "") // Remove shadow
                .style("transform", "translateY(0)"); // Reset position
        })
        .on("mouseout", function () {
            // Reset "pressed" effect on mouseout
            d3.select(this)
                .style("box-shadow", "") // Remove shadow
                .style("transform", "translateY(0)"); // Reset position
        });
}

function stackedEvolutionChart() {

    const ids = ctx.stackedEvolutionChart.currentSEfactor;
    const idq = ctx.stackedEvolutionChart.currentQuestion;

    const csvData = ctx.CSVDATA.filter(row =>
        row[ids] !== "Do not understand the question" &&
        row[ids] !== "Decline to answer" &&
        row[ids] !== "Missing" &&
        row[ids] !== "Can't choose" &&
        row[ids] !== "Not applicable" &&
        row[ids] !== "Do not undersand the question" &&
        row[idq] !== "Do not understand the question" &&
        row[idq] !== "Decline to answer" &&
        row[idq] !== "Missing" &&
        row[idq] !== "Can't choose" &&
        row[idq] !== "Do not undersand the question" &&
        row[idq] !== "Not applicable"
    );

    const months = Array.from(
        new Set(csvData.map(row => `${row.year}-${row.month}`)) // Get unique year-month combinations
    ).map(combined => {
        const [year, month] = combined.split("-").map(Number); // Split into year and month as numbers
        return { year, month }; // Create objects of the form { year, month }
    })
    .sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year; // First, sort by year
        }
        return a.month - b.month; // Then, sort by month within the same year
    });

    // Step 2: Create the aggregation object
    let distinctSEFactors = Array.from(new Set(csvData.map(row => row[ids])));
    if (ids === 'se5'){
        distinctSEFactors = [
            'No formal education',
            'Incomplete primary/elementary',
            'Complete primary/elementary',
            'Incomplete secondary/high school: technical/vocational type',
            'Incomplete secondary/high school',
            'Complete secondary/high school: technical/vocational type',
            'Complete secondary/high school',
            'Some university education',
            'University education completed',
            'Post-graduate degree',
            'other'
        ];
    }
    if (ids === 'se7a'){
        distinctSEFactors = [
            'Not religious at all',
            'Lightly religious',
            'Moderately religious',
            'Very religious'
        ]
    }
    if (ids === 'se12'){
        distinctSEFactors = [
            'Lowest status',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'Higest status'
        ]
    }


    const aggregatedData = months.map(({ year, month }) => {
        const dataForMonth = csvData.filter(row => row['year'] === String(year) && row['month'] === String(month)); // Filter rows for this month
    
        return distinctSEFactors.map(seFactor => {
            const relevantRows = dataForMonth.filter(row => row[ids] === seFactor);
            let aggregateValue = aggregate_values(relevantRows.map(row => row[idq]));
    
            // Set aggregateValue to 0 if it is NaN
            if (isNaN(aggregateValue)) {
                aggregateValue = 0;
            }
    
            return {
                seFactor,       // The distinct value at `ctx.CSVDATA[ids]`
                aggregateValue, // Aggregated value for `ctx.CSVDATA[idq]`
                year,           // Year for this aggregation
                month           // Month for this aggregation
            };
        });
    });
    
    aggregatedData.forEach((monthData, monthIndex) => {
        // Skip the first month as it has no previous data
        if (monthIndex > 0) {
            monthData.forEach((data, dataIndex) => {
                // Check if the aggregateValue is 0
                if (data.aggregateValue === 0) {
                    // Replace with the aggregateValue from the previous month at the same position in the tuple
                    data.aggregateValue = aggregatedData[monthIndex - 1][dataIndex].aggregateValue;
                }
            });
        }
    });

    console.log(aggregatedData)


    // Fixed dimensions for the SVG element
    const margin = { top: 100, right: 400, bottom: 50, left: 60 };
    const width = 1200 - margin.left - margin.right; // Fixed width for the chart
    const height = 600 - margin.top - margin.bottom; // Fixed height for the chart

    // SVG Container
    d3.select("#main-container").select("svg").remove();

    const svg = d3.select("#main-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3.scalePoint()
        .domain(months.map(d => `${d.year}-${d.month}`))
        .range([0, width]);

    // Y Scale
    const maxY = d3.max(aggregatedData, d => d.reduce((sum, v) => sum + v.aggregateValue, 0));
    const yScale = d3.scaleLinear()
        .domain([0, maxY])
        .range([height, 0]);

    // Stack Data
    const stack = d3.stack()
        .keys(distinctSEFactors)
        .value((d, key) => {
            const valueObj = d.find(v => v.seFactor === key); // Correct key reference
            return valueObj ? valueObj.aggregateValue : 0; // Return 0 if not found
        });

    const stackedData = stack(aggregatedData);

    // Axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat((d, i) => {
            const [year, month] = d.split("-"); // Split into year and month
            return (month === "1" || (year === '2014' && month === '6')) ? year : month; // Show year only for January (month 1)
        });

    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("text-anchor", "middle");

    svg.append("g").call(yAxis);

    // Colors for SE factors using a green-blue scale
    const color = d3.scaleOrdinal(d3.schemeSet3) // Color scale with distinct colors
        .domain(distinctSEFactors);

    const area = d3.area()
        .x((d, i) => xScale(`${months[i].year}-${months[i].month}`))  // Format months[i] into a string
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]));

    // Draw Stacked Areas
    svg.selectAll(".layer")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", d => {
            const path = area(d);
            if (!path) {
                console.error('Invalid path data:', d);
            }
            return path;
        })
        .style("fill", d => color(d.key)) // Use the color scale for each layer
        .style("opacity", 0.8);

    // Legend
// Adjust the legend to correspond directly to the distinctSEFactors
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 10}, 10)`); // Move legend outside the main SVG area

    legend.selectAll("rect")
        .data(distinctSEFactors) // Use distinctSEFactors directly
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => color(d)); // Use the color scale to fill

    legend.selectAll("text")
        .data(distinctSEFactors) // Use distinctSEFactors for text labels
        .enter()
        .append("text")
        .attr("x", 15)
        .attr("y", (d, i) => i * 20 + 10)
        .style("font-size", "12px") // Ensure text is readable
        .text(d => d); // Display the SE factor name in the legend


}

function aggregate_values(values) {
    const idq = ctx.stackedEvolutionChart.currentQuestion;
    const currentQuestion = ctx.questions.find(q => q.id === idq);
    const orderOutputs = currentQuestion.order_outputs; // Assuming order_outputs is the name of the scale

    // Step 2: Find the corresponding scale in ctx.scales
    const scale = ctx.scales[orderOutputs];

    if (!scale) {
        console.error("Scale not found in ctx.scales for orderOutputs:", orderOutputs);
    }
    
    // Step 3: Get distinct values from the `values` argument
    const distinctValues = Array.from(new Set(values));

    // Step 4: Filter the scale based on the distinct values
    const filteredScale = scale.filter(value => distinctValues.includes(value));

    // Step 5: Sum the indexes of each value in the filtered scale
    let indexSum = 0;
    values.forEach(value => {
        const valueIndex = filteredScale.indexOf(value);
        if (valueIndex !== -1) {
            indexSum += valueIndex;
        }
    });

    // Step 6: Calculate the average of the summed indexes
    const averageIndex = indexSum / values.length;

    return averageIndex; // Return the average index as the aggregate value
}
