import { ctx } from './parameters.js';  // Import ctx parameters

export function createDates() {
    const parentDiv = d3.select("#dates");

    // Clear any existing content
    parentDiv.html("");

    // Title at the top-left of the parent division
    parentDiv.append("h3")
        .text("Considered Time")
        .style("margin", "10px 0 20px 10px") // Add spacing
        .style("font-family", "Arial, sans-serif")
        .style("color", "#333")
        .style("font-size", "18px");

    // Find distinct years
    const yearObject = ctx.csvTimeSpace.find(d => d.header === "year");
    let distinctYears = [];

    if (yearObject && Array.isArray(yearObject.values)) {
        distinctYears = Array.from(new Set(yearObject.values));
    }

    // Add "all" to the list of buttons
    const allYears = ["all", ...distinctYears];

    // Button container for equal spacing
    const buttonContainer = parentDiv.append("div")
        .style("display", "flex")
        .style("justify-content", "space-evenly") // Equal spacing
        .style("align-items", "center")
        .style("flex-wrap", "wrap") // Wrap if the buttons overflow
        .style("margin", "10px");

    // Add buttons
    const buttons = buttonContainer.selectAll("button")
        .data(allYears)
        .enter()
        .append("button")
        .text(d => d)
        .attr("class", "time-button")
        .style("background-color", "#00BFAE")
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