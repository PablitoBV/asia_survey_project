import { ctx } from './parameters.js';  // Import ctx parameters

export function createDates() {
    const parentDiv = d3.select("#dates");

    // Clear any existing content
    parentDiv.html("");

    // Title at the top-left of the parent division with left padding
    const titleHeight = 0.5 * parentDiv.node().clientHeight; // 50% of the height for the title
    parentDiv.append("h3")
        .text("Considered Time")
        .style("margin", "0")  // Remove margin to fit the 50% height
        .style("font-family", "Arial, sans-serif")
        .style("color", "#333")
        .style("font-size", "16px")
        .style("height", `${titleHeight}px`)  // Set height to 50% of the container's height
        .style("line-height", `${titleHeight}px`)  // Center the text vertically
        .style("padding-left", "20px");  // Add padding to the left of the heading

    // Find distinct years
    let distinctYears = [...new Set(ctx.CSVDATA.map(d => d.year))];

    // Add "all" to the list of buttons
    const allYears = ["all", ...distinctYears];

    // Get the width and height of the parent container
    const containerWidth = parentDiv.node().clientWidth;
    const containerHeight = parentDiv.node().clientHeight;

    // Calculate button width (15% of the container width) and height (50% of the container height minus padding)
    const buttonWidth = containerWidth * 0.15;
    const buttonHeight = (containerHeight * 0.5) - (containerHeight * 0.1); // 50% of height minus padding

    // Calculate the space (8% of the container width and 10% of the container height)
    const spaceWidth = containerWidth * 0.08;
    const spaceHeight = containerHeight * 0.1;

    // Button container for equal spacing
    const buttonContainer = parentDiv.append("div")
        .style("display", "flex")
        .style("justify-content", "space-evenly") // Equal spacing
        .style("align-items", "center")
        .style("flex-wrap", "wrap") // Wrap if the buttons overflow
        .style("height", `${containerHeight * 0.4}px`)  // 50% height for buttons
        .style("padding", `0 ${spaceWidth}px`)  // Padding on left and right
        .style("box-sizing", "border-box"); // Prevent overflow of content

    // Add buttons
    const buttons = buttonContainer.selectAll("button")
        .data(allYears)
        .enter()
        .append("button")
        .text(d => d)
        .attr("class", "time-button")
        .style("color", "white")
        .style("border", "none")
        .style("border-radius", "8px")
        .style("padding", "10px 15px")
        .style("cursor", "pointer")
        .style("font-size", "14px")
        .style("font-family", "Arial, sans-serif")
        .style("transition", "all 0.1s ease-in-out")
        .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.3)") // Default shadow
        .style("transform", "translateY(0)") // Default position
        .style("width", `${buttonWidth}px`)  // Set button width dynamically
        .style("height", `${buttonHeight}px`)  // Set button height dynamically
        .on("click", function(event, d) {
            buttons
                .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.3)") // Reset shadow
                .style("transform", "translateY(0)"); // Reset position
            d3.select(this)
                .style("box-shadow", "inset 2px 2px 5px rgba(0, 0, 0, 0.3)")
                .style("transform", "translateY(2px)");
            ctx.appState.currentDate = d; // Assuming you use a state variable to store the selection
            console.log("Selected time:", d);
        });

    // Set the "all" button as pressed by default
    buttonContainer.selectAll("button")
        .filter(d => d === "all")
        .style("box-shadow", "inset 2px 2px 5px rgba(0, 0, 0, 0.3)")
        .style("transform", "translateY(2px)");
}
