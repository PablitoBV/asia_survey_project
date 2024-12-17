import { ctx } from './parameters.js'; // Import ctx and loadQuestions


export function Questions() {
    questionSection()
}

function questionSection() {
    const container = d3.select("#visualizationMain");

    // Remove any previous instances of the side page or pull tab
    container.select("#sidePage").remove();
    container.select("#pullTab").remove();

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

    createGroupButtons();

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
    const groupContainer = d3.select("#sidePage") // This should be the container where you want to add the buttons
        .html(''); // Clear any previous content

    // Extract the distinct group elements from ctx.questions
    const distinctGroups = Array.from(new Set(ctx.questions.map(q => q.group)))
    .filter(group => group !== "Socio-Economic Background"); // Remove the specific group
    

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
        .style("background-color", "#00BFAE")
        .style("color", "white")
        .style("font-size", "14px")
        .style("border", "none")
        .style("cursor", "pointer")
        .style("transition", "all 0.1s ease-in-out")
        .text(d => d.description)
        .on("click", (event, d) => {
            ctx.appState.currentQuestion = d.id; // Assuming id is the field you want
        })
        .on("mousedown", function() {
            // Simulate a "pressed" effect on mousedown (when the button is clicked)
            d3.select(this)
                .style("box-shadow", "inset 2px 2px 5px rgba(0, 0, 0, 0.3)")  // Inner shadow
                .style("transform", "translateY(2px)"); // Move the button down a bit
        })
        .on("mouseup", function() {
            // Remove the "pressed" effect when the mouse button is released
            d3.select(this)
                .style("box-shadow", "") // Remove shadow
                .style("transform", "translateY(0)"); // Reset position
        })
        .on("mouseout", function() {
            // Reset the "pressed" effect if the mouse leaves the button without releasing the click
            d3.select(this)
                .style("box-shadow", "") // Remove shadow
                .style("transform", "translateY(0)"); // Reset position
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
            // Call the createGroupButtons function when the arrow button is clicked
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


