import { ctx, loadQuestions } from './parameters.js';  // Import ctx parameters

export function linksToTemplates() {
    const linksDiv = d3.select("#linksToTemplates");

    // Remove any previous buttons
    linksDiv.selectAll(".template-button").remove();

    // Add heading for the division
    const containerWidth = linksDiv.node().clientWidth;
    const titleHeight = 0.2 * linksDiv.node().clientHeight; // 50% of the height for the title

    linksDiv.append("h2")
        .text("Templates")
        .style("margin", "0")  // Remove margin to fit the 50% height
        .style("font-family", "Arial, sans-serif")
        .style("color", "#333")
        .style("font-size", "16px")
        .style("height", `${titleHeight}px`)  // Set height to 50% of the container's height
        .style("line-height", `${titleHeight}px`)  // Center the text vertically
        .style("padding-left", "20px");  // Add padding to the left of the heading

    const buttonData = [
        { id: "button1", link: "page2.html", image: "images/heatmap.png", description: "Heatmap of questions per countries" },
        { id: "button2", link: "page3.html", image: "images/spiderchart.png", description: "Spider web chart of various economic factors" },
        { id: "button3", link: "page2.html", image: "images/heatmap.png", description: "description3" }
    ];

    const containerHeight = linksDiv.node().clientHeight;

    // Set the height for the heading (20% of the parent container height)

    // Set the remaining height (80% of the parent container height) for the buttons
    const buttonsHeight = 4 * titleHeight;

    const buttonWidth = containerWidth * 0.25;
    const buttonHeight = buttonsHeight * 0.8;

    const Padding = buttonsHeight * 0.05;

    // Add a div to contain the buttons with the calculated padding
    const buttonContainer = linksDiv.append("div")
        .style("height", buttonHeight)  // Adjust container height to fit padding
        .style("padding-top", `${Padding}px`)
        .style("padding-bottom", `${Padding}px`)
        .style("display", "flex")
        .style("align-items", "center")  // Vertically center the buttons
        .style("justify-content", "space-evenly");  // Distribute buttons evenly

    buttonData.forEach((d, i) => {
        // Create a button for each element in buttonData
        buttonContainer.append("button")
            .attr("class", "template-button")
            .attr("id", d.id)
            .style("width", `${buttonWidth}px`)
            .style("height", `${buttonHeight}px`)
            .style("background-image", `url(${d.image})`)
            .style("background-size", "cover")
            .style("border", "none")
            .style("cursor", "pointer")
            .style("border-radius", "10px")
            .style("transition", "all 0.2s ease-in-out")
            .on("click", () => window.location.href = d.link) // Link to another page

            .on("mouseover", function () {
                // On hover, shift the image and decrease opacity
                d3.select(this)
                    .style("transform", "scale(1.05)")  // Slightly enlarge the image
                    .style("opacity", "0.8");  // Reduce opacity
                // Show description on hover
                const description = d3.select(this).append("div")
                    .attr("class", "description")
                    .style("position", "absolute")
                    .style("bottom", "10px")
                    .style("left", "10px")
                    .style("background-color", "rgba(0, 0, 0, 0.7)")
                    .style("color", "white")
                    .style("padding", "5px")
                    .style("border-radius", "5px")
                    .style("font-size", "14px")
                    .style("opacity", 0)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .text(d.description);
            })
            .on("mouseout", function () {
                // Reset image and opacity when mouse leaves
                d3.select(this)
                    .style("transform", "scale(1)")  // Reset image size
                    .style("opacity", "1");  // Reset opacity

                // Remove the description on mouseout
                d3.select(this).select(".description")
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
                    .remove();
            });
    });
}
