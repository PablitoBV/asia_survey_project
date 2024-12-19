import { ctx } from './parameters.js'; // Import ctx and loadQuestions

export function questionSection() {
    const container = d3.select("#visualizationMain");

    if (ctx.appState.currentViz !== 'correlation'){ctx.appState.collapseTab = true}
    // Remove any previous instances of the side page or pull tab
    if (ctx.appState.collapseTab){
        if (ctx.currentViz === 'correlation'){ctx.appState.collapseTab = false}
        container.select("#sidePage").remove();
        container.select("#pullTab").remove();
    }
    // Get the dimensions of the visualizationMain container
    const containerWidth = container.node().clientWidth;
    const containerHeight = container.node().clientHeight;

    const pullTabWidth = 40; // Width of the pull tab
    const animationDuration = 500; // Duration of the slide animation in ms

    // Create the sliding side page container
    const sidePage = container.append("div")
        .attr("id", "sidePage")
        .style("position", "absolute")
        .style("top", "0px")
        .style("right", `-${containerWidth}px`) // Initially hidden to the right
        .style("width", `${containerWidth}px`) // Match visualizationMain width
        .style("height", `${containerHeight}px`) // Match visualizationMain height
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("box-shadow", "-2px 0px 5px rgba(0,0,0,0.3)")
        .style("transition", `right ${animationDuration}ms ease`); // Smooth sliding animation

    // Remove the content inside the side page (now empty)
    // No longer adding the HTML with the details panel text

    if (ctx.appState.currentViz === "questionHistogram") {
        createGroupButtons();
    } else if (ctx.appState.currentViz === "factorHistogram") {
        createSEButtons();
    } else if (ctx.appState.currentViz === "correlation") {
        createGroupButtons();
    }

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
            sidePage.style("right", `-${containerWidth}px`);
            pullTab.style("right", "0px");
            pullTab.select("div").style("transform", "rotate(90deg)"); // Reset arrow
        } else {
            // Slide in
            sidePage.style("right", "0px");
            pullTab.style("right", `${containerWidth}px`);
            pullTab.select("div").style("transform", "rotate(-90deg)"); // Flip arrow
        }
        isOpen = !isOpen; // Toggle state
    });
}

function createGroupButtons() {

    let groupContainer = d3.select("#sidePage")

    if (ctx.appState.currentViz !== 'correlation'){ctx.appState.clearTabContent = true}
    if (ctx.appState.clearTabContent){
        if (ctx.appState.currentViz === 'correlation'){ctx.appState.clearTabContent = false}
        groupContainer
            .html('');
    }

    let distinctGroups = Array.from(new Set(ctx.questions.map(q => q.group)))

    if (ctx.appState.currentViz === "questionHistogram"){
         distinctGroups = distinctGroups
        .filter(group => group !== "Socio-Economic Background"); // Remove the specific group
    }


    // Set some styling variables
    const buttonPadding = 10;
    const buttonMargin = 15;
    const buttonHeight = 40;
    const containerWidth = 800; // You can adjust the container size based on your preference

    // Style the group container to center the buttons
    groupContainer
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("padding", "20px"); // Add padding around the buttons for better spacing

    // Create buttons for each distinct group
    groupContainer.selectAll("button")
        .data(distinctGroups)
        .enter()
        .append("button")
        .attr("class", "group-button")
        .style("width", "400px")  // Fixed width for buttons
        .style("height", `${buttonHeight}px`)
        .style("margin-right", `${buttonMargin}px`)
        .style("margin-bottom", `${buttonMargin}px`)
        .style("border-radius", "12px")
        .style("background-color", "#0097A7")
        .style("color", "white")
        .style("font-size", "14px")
        .style("border", "none")
        .style("cursor", "pointer")
        .text(d => d) // Display the group name
        .on("click", (event, group) => {
            displayQuestions(group);
            d3.select(event.target).style("display", "none");
        });
}

function displayQuestions(group) {
    const groupContainer = d3.select("#sidePage");

    groupContainer.selectAll(".group-button").remove();

    const filteredQuestions = ctx.questions.filter(q => q.group === group);

    const buttonHeight = 35;
    const containerWidth = groupContainer.node().clientWidth;
    const buttonWidth = containerWidth * 0.9;
    const buttonMargin = 10;

    if (filteredQuestions.length > 14) {
        groupContainer
            .style("overflow-y", "auto") // Enable vertical scrolling
            .style("max-height", "90vh"); // Limit container height for scroll
    } else {
        groupContainer
            .style("overflow", "hidden") // Reset overflow for fewer buttons
            .style("max-height", "none");
    }

    const descriptionContainer = groupContainer.append("div")
        .attr("class", "description-container");

    descriptionContainer.selectAll("button")
        .data(filteredQuestions)
        .enter()
        .append("button")
        .attr("class", "description-button")
        .style("width", `${buttonWidth}px`)
        .style("height", `${buttonHeight}px`)
        .style("margin-bottom", `${buttonMargin}px`)
        .style("border-radius", "12px")
        .style("color", "white")
        .style("font-size", "14px")
        .style("border", "none")
        .style("cursor", "pointer")
        .style("transition", "all 0.1s ease-in-out")
        .text(d => d.description)
        .classed("pushed", function(d) {
            // For correlation view, check if the button is in the currentCorrelationSelection
            return ctx.appState.currentViz === 'correlation' && ctx.appState.currentCorrelationSelection.includes(d.id);
        })
        .on("click", function(event, d) {
            if (ctx.appState.currentViz === 'correlation') {
                const clickedButton = d3.select(this);
                const isPressed = clickedButton.classed("pushed");
        
                // Toggle the pressed state of the clicked button
                clickedButton.classed("pushed", !isPressed);
        
                // Update the correlation selection
                if (isPressed) {
                    // If the button was already pressed and we are unpressing it,
                    // just clear the second selection without updating the first
                    ctx.appState.currentCorrelationSelection[1] = null;
                } else {
                    // If the button was pressed, update the selection
                    ctx.appState.currentCorrelationSelection[0] = ctx.appState.currentCorrelationSelection[1];
                    ctx.appState.currentCorrelationSelection[1] = d.id;  // Set the id of the clicked button
                }
            } else {
                // For question histogram or other visualizations
                ctx.appState.currentQuestion = d.id; // Assuming id is the field you want
            }
        })
        .on("mousedown", function() {
            // Simulate a "pressed" effect on mousedown (when the button is clicked)
            if (ctx.appState.currentViz !== 'correlation' || !d3.select(this).classed("pushed")) {
                d3.select(this)
                    .style("box-shadow", "inset 2px 2px 5px rgba(0, 0, 0, 0.3)")  // Inner shadow
                    .style("transform", "translateY(2px)"); // Move the button down a bit
            }
        })
        .on("mouseup", function() {
            // Remove the "pressed" effect when the mouse button is released
            if (ctx.appState.currentViz !== 'correlation' || !d3.select(this).classed("pushed")) {
                d3.select(this)
                    .style("box-shadow", "") // Remove shadow
                    .style("transform", "translateY(0)"); // Reset position
            }
        })
        .on("mouseout", function() {
            // Reset the "pressed" effect if the mouse leaves the button without releasing the click
            if (ctx.appState.currentViz !== 'correlation' || !d3.select(this).classed("pushed")) {
                d3.select(this)
                    .style("box-shadow", "") // Remove shadow
                    .style("transform", "translateY(0)"); // Reset position
            }
        });

    // Step 4: Create the small arrow button to call createGroupButtons
    groupContainer.append("button")
        .attr("class", "back-button")
        .style("width", "30px")
        .style("height", "30px")
        .style("background-color", "transparent")
        .style("border", "none")
        .style("cursor", "pointer")
        .style("position", "absolute")
        .style("top", "10px")
        .style("left", "10px")
        .style("font-size", "20px")  // Adjust size of the arrow
        .style("color", "#007BFF")  // Arrow color
        .html("←") // Simple left arrow
        .on("click", function() {
            if (ctx.appState.currentViz === 'correlation'){groupContainer.html('')}
            createGroupButtons();
        })
        .append("title") // Tooltip text when hovering
        .text("Go back to the topic selection");

    // Optional: Tooltip text on hover can also be handled via CSS:
    groupContainer.selectAll(".back-button")
    .style("position", "relative")  // Ensure the parent element has relative positioning
    .style("z-index", "1")
    .append("span")
    .attr("class", "tooltip")  // Add class for better control
    .style("position", "absolute")
    .style("top", "50px")  // Position relative to the button
    .style("left", "0")
    .style("background-color", "black")
    .style("color", "white")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("z-index", "2")  // Ensure it's on top of other elements
    .style("opacity", 0)  // Initially hidden
    .style("pointer-events", "none")  // Prevent interaction with the tooltip initially
    .style("transition", "opacity 0.3s ease")  // Smooth transition for opacity
    .text("Go back to the topic selection")
    .on("mouseover", function() {
        d3.select(this).style("opacity", 1)  // Show tooltip on hover
                      .style("pointer-events", "auto");  // Allow interaction
    })
    .on("mouseout", function() {
        d3.select(this).style("opacity", 0)  // Hide tooltip when mouse leaves
                      .style("pointer-events", "none");  // Disable interaction
    });
}


function createSEButtons() {
    const groupContainer = d3.select("#sidePage");

    // Remove any previously added buttons
    groupContainer.selectAll(".group-button").remove();

    const filteredSEIndicators = ctx.questions.filter(q => q.group === 'Socio-Economic Background');

    const buttonHeight = 35;
    const containerWidth = groupContainer.node().clientWidth;
    const buttonWidth = containerWidth * 0.6;  // 60% of the container width for buttons
    const buttonMargin = 10;  // Margin between buttons

    // Enable vertical scrolling if more than 14 buttons
    groupContainer
        .style("overflow-y", "auto")  // Enable vertical scrolling
        .style("max-height", "90vh");  // Limit container height for scroll

    // Create a container for the description buttons
    const descriptionContainer = groupContainer.append("div")
        .attr("class", "description-container")
        .style("display", "flex")              // Apply flexbox
        .style("flex-direction", "column")     // Stack buttons vertically
        .style("align-items", "center")        // Center buttons horizontally
        .style("justify-content", "flex-start") // Align buttons at the top, adjust as needed
        .style("width", "100%")                // Ensure the container takes the full width of parent
        .style("padding", "10px");             // Optional: add some padding

    // Create buttons for each filtered indicator
    descriptionContainer.selectAll("button")
        .data(filteredSEIndicators)
        .enter()
        .append("button")
        .attr("class", "description-button")
        .style("width", `${buttonWidth}px`)  // Button width
        .style("height", `${buttonHeight}px`) // Button height
        .style("margin-bottom", `${buttonMargin}px`) // Space between buttons
        .style("border-radius", "12px")
        .style("color", "white")
        .style("font-size", "14px")
        .style("border", "none")
        .style("cursor", "pointer")
        .style("transition", "all 0.1s ease-in-out")
        .text(d => d.description)  // Set button text from description
        .on("click", (event, d) => {
            ctx.appState.currentSEIndicator = d.id; // Update currentSEIndicator in appState
        })
        .on("mousedown", function () {
            // "Pressed" effect on mousedown
            d3.select(this)
                .style("box-shadow", "inset 2px 2px 5px rgba(0, 0, 0, 0.3)")  // Inner shadow
                .style("transform", "translateY(2px)"); // Move button down
        })
        .on("mouseup", function () {
            // Remove "pressed" effect on mouseup
            d3.select(this)
                .style("box-shadow", "")  // Remove shadow
                .style("transform", "translateY(0)");  // Reset position
        })
        .on("mouseout", function () {
            // Reset "pressed" effect on mouseout
            d3.select(this)
                .style("box-shadow", "")  // Remove shadow
                .style("transform", "translateY(0)");  // Reset position
        });
}
