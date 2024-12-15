import { ctx } from './parameters.js'; // Import ctx and loadQuestions
import { drawHistogram, countrySpecificHistogram } from './histograms.js';

export function create_question_table(location) {
    const dropdown = d3.select(location);

    // Populate the dropdown menu with groups
    dropdown.selectAll("option")
        .data(ctx.groups_of_questions)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Initialize the table with the first group
    const firstGroup = ctx.groups_of_questions[0];
    ctx.appState.selectedGroup = firstGroup;

    update_table(firstGroup);

    // Add event listener to the dropdown
    dropdown.on("change", function () {
        const selectedGroup = this.value;
        ctx.appState.selectedGroup = selectedGroup;
        update_table(selectedGroup);
    });
}

export function update_table(selectedGroup) {
    const tableBody = d3.select("#questions-table tbody");

    // Filter questions based on the selected group
    const filteredQuestions = ctx.questions.filter(item => item.group === selectedGroup);

    // Clear previous rows and populate the table
    tableBody.selectAll("tr").remove();

    const rows = tableBody.selectAll("tr")
        .data(filteredQuestions)
        .enter()
        .append("tr")
        .attr("data-question-id", d => d.id)
        .on("click", function (event, d) {
            // Reset all rows and highlight the clicked row
            tableBody.selectAll("tr").classed("clicked", false).style("background-color", ""); // Reset all rows
            d3.select(this).classed("clicked", true).style("background-color", "#d0e8f5"); // Highlight clicked row

            // Update the app state and trigger updates
            ctx.appState.currentQuestion = d.id.replace(/^q+/, '').trim();

            const countrySelector = document.getElementById("country-select");
            ctx.appState.selectedCountry = countrySelector.value || "China";

            drawHistogram(ctx.CSVDATA, "#histogram", ctx.appState.currentQuestion);
            countrySpecificHistogram(ctx.appState.selectedCountry, ctx.CSVDATA, "#country-specific-histogram", ctx.appState.currentQuestion);

            getQuestionDescription(ctx.appState.currentQuestion).then(description => {
                document.getElementById("question-description").innerHTML = description;
            });
        })
        .on("mouseover", function () {
            // Apply hover color only if the row is not clicked
            if (!d3.select(this).classed("clicked")) {
                d3.select(this).style("background-color", "#f0f0f0");
            }
        })
        .on("mouseout", function () {
            // Remove hover color only if the row is not clicked
            if (!d3.select(this).classed("clicked")) {
                d3.select(this).style("background-color", "");
            }
        });

    // Add data to rows
    rows.append("td").text(d => d.id);
    rows.append("td").text(d => d.description);

    // click on first question if nothing else clicked (on page load for example)
    if (filteredQuestions.length > 0) {
        const firstRow = tableBody.select("tr");
        if (!firstRow.empty()) {
            firstRow.dispatch("click"); 
        }
    }
}

// Populate the group dropdown with unique groups from the questions JSON
export function populateGroupDropdown() {
    const groupDropdown = document.getElementById("group-dropdown");

    if (!ctx.groups_of_questions || ctx.groups_of_questions.length === 0) {
        console.log("Groups not available yet.");
        return;
    }

    ctx.groups_of_questions.forEach(group => {
        const option = document.createElement("option");
        option.value = group;
        option.textContent = group;
        groupDropdown.appendChild(option);
    });

    groupDropdown.addEventListener("change", function () {
        ctx.appState.selectedGroup = groupDropdown.value;
        update_table(ctx.appState.selectedGroup);

        // Reset question to the first in the group
        const firstQuestion = ctx.questions.find(q => q.group === ctx.appState.selectedGroup)?.id;
        if (firstQuestion) {
            ctx.appState.currentQuestion = firstQuestion;
            drawHistogram(ctx.CSVDATA, "#histogram", ctx.appState.currentQuestion);
            countrySpecificHistogram(ctx.appState.selectedCountry, ctx.CSVDATA, "#country-specific-histogram", ctx.appState.currentQuestion);
        }
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


// function to write out the question under the input box.
async function getQuestionDescription(questionNumber) {  
    const question = ctx.questions.find(q => q.id === `q${questionNumber}`);
    if (question) {
        return question.description;  // Return the description if found
    } else {
        return "No description available.";  // Return a fallback message
    }
}