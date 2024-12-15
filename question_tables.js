import { ctx } from './parameters.js'; // Import ctx and loadQuestions


// console.log("in scatterpage1", questionsLoaded);

export function create_question_table(location) {
    // console.log("in scatterpage2", questionsLoaded);

    console.log("Unique groups of questions:", ctx.groups_of_questions);

    // Populate the dropdown menu with groups
    const dropdown = d3.select(location);

    dropdown.selectAll("option")
        .data(ctx.groups_of_questions)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Initialize the table with the first group
    update_table(ctx.groups_of_questions[0]);
    // Add event listener to the dropdown
    dropdown.on("change", function () {
        const selectedGroup = this.value;
        update_table(selectedGroup);
    });
}




// Function to update the table based on the selected group
export function update_table(selectedGroup) {
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


// Populate the group dropdown with unique groups from the questions JSON
export function populateGroupDropdown() {
    const groupDropdown = document.getElementById("group-dropdown");

    // Make sure the groups are available
    if (!ctx.groups_of_questions || ctx.groups_of_questions.length === 0) {
        console.error("Groups not available yet.");
        return;
    }

    ctx.groups_of_questions.forEach(group => {
        const option = document.createElement("option");
        option.value = group;
        option.textContent = group;
        groupDropdown.appendChild(option);
    });

    groupDropdown.addEventListener("change", function () {
        const selectedGroup = groupDropdown.value;
        populateQuestionDropdownByGroup(selectedGroup);
    });
}


// Populate the question dropdown based on the selected group
export function populateQuestionDropdownByGroup(selectedGroup) {
    const questionDropdown = document.getElementById("question-dropdown");
    questionDropdown.innerHTML = ""; // Clear previous options

    // Filter questions based on the selected group
    const filteredQuestions = ctx.questions.filter(q => q.group === selectedGroup);

    filteredQuestions.forEach(question => {
        const option = document.createElement("option");
        option.value = question.id; // Set the question ID as the value
        option.textContent = question.description; // Display the question description
        questionDropdown.appendChild(option);
    });
}

// Call this function to initialize the group dropdown when the page loads
export function initializeDropdowns() {
    populateGroupDropdown();
}