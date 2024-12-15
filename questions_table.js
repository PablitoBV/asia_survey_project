import { ctx, loadQuestions } from './parameters.js'; // Import ctx and loadQuestions

function create_question_tables(location) {
    // Populate the dropdown menu with groups
    const dropdown = d3.select(`#${location}`);
    dropdown.selectAll("option")
        .data(groups)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Initialize the table with the first group
    updateTable(groups[0]);

    // Add event listener to the dropdown
    dropdown.on("change", function () {
        const selectedGroup = this.value;
        updateTable(selectedGroup);
    });
}



// Function to update the table based on the selected group
function updateTable(selectedGroup) {
    const filteredData = ctx.questions.filter(item => item.group === selectedGroup);

    const tableBody = d3.select("#questions-table tbody");
    tableBody.selectAll("tr").remove(); // Clear the table

    const rows = tableBody.selectAll("tr")
        .data(filteredData)
        .enter()
        .append("tr");

    rows.append("td").text(d => d.id);
    rows.append("td").text(d => d.description);
}