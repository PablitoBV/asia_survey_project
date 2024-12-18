import { ctx } from './parameters.js';  // Assuming ctx is imported from parameters.js

export function createQuestionNavigator() {
    const mainDiv = d3.select("#visualizationMain");

    // Remove any previous navigator elements
    mainDiv.selectAll(".question-navigator").remove();
    mainDiv.selectAll(".SE-navigator").remove();

    // Create a container for the navigation
    const navigatorContainer = mainDiv.append("div")
    .attr("class", "question-navigator")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("gap", "8px")  // Slightly reduce the gap
    .style("margin", "15px 50px 15px 15px");  // Reduce margin on the right


    // Left arrow button
    const leftArrow = navigatorContainer.append("button")
        .attr("class", "nav-arrow left-arrow")
        .html("&#9664;")  // Left-facing triangle
        .style("font-size", "16px")  // Reduced font size
        .style("padding", "5px")     // Add padding for better clickability
        .style("margin", "0")        // No additional margin
        .style("opacity", ctx.appState.currentQuestion === 'q1' ? 0.5 : 1)
        .style("cursor", ctx.appState.currentQuestion === 'q1' ? "not-allowed" : "pointer")
        .on("click", () => {
            if (ctx.appState.currentQuestion !== 'q1') {
                navigateQuestion(-1); // Navigate to the previous question
            }
        });

    // Text display for the current question description
    const questionText = navigatorContainer.append("span")
        .attr("class", "current-question")
        .style("font-size", "12px")  // Smaller font size for the description
        .style("font-weight", "normal")  // Remove bold styling
        .text(getCurrentQuestionText());

    // Right arrow button
    const rightArrow = navigatorContainer.append("button")
        .attr("class", "nav-arrow right-arrow")
        .html("&#9654;")  // Right-facing triangle
        .style("font-size", "16px")  // Reduced font size
        .style("padding", "5px")     // Add padding for better clickability
        .style("margin", "0")        // No additional margin
        .style("opacity", ctx.appState.currentQuestion === 'q172' ? 0.5 : 1)
        .style("cursor", ctx.appState.currentQuestion === 'q172' ? "not-allowed" : "pointer")
        .on("click", () => {
            if (ctx.appState.currentQuestion !== 'q172') {
                navigateQuestion(1);
            }
        });

    // Helper function to update the display
    function updateNavigator() {
        questionText.text(getCurrentQuestionText());

        // Update left arrow state
        leftArrow
            .style("opacity", ctx.appState.currentQuestion === 'q1' ? 0.5 : 1)
            .style("cursor", ctx.appState.currentQuestion === 'q1' ? "not-allowed" : "pointer");

        // Update right arrow state
        rightArrow
            .style("opacity", ctx.appState.currentQuestion === 'q172' ? 0.5 : 1)
            .style("cursor", ctx.appState.currentQuestion === 'q172' ? "not-allowed" : "pointer");
    }

    // Helper function to get the current question's text
    function getCurrentQuestionText() {
        const currentQuestion = ctx.questions.find(q => q.id === ctx.appState.currentQuestion);
        return currentQuestion ? `${currentQuestion.id}: ${currentQuestion.description}` : "Question not found";
    }

    // Helper function to navigate between questions
    function navigateQuestion(direction) {
        const currentIndex = ctx.questions.findIndex(q => q.id === ctx.appState.currentQuestion);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < ctx.questions.length) {
            ctx.appState.currentQuestion = ctx.questions[newIndex].id;
            updateNavigator();
        }
    }
}

export function createGroupNavigator() {
    const mainDiv = d3.select("#visualizationMain");

    // Remove any previous navigator elements
    mainDiv.selectAll(".group-navigator").remove();

    // Create a container for the navigation
    const navigatorContainer = mainDiv.append("div")
        .attr("class", "group-navigator")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", "10px")
        .style("margin", "20px");

    // Left arrow button
    const leftArrow = navigatorContainer.append("button")
        .attr("class", "nav-arrow left-arrow")
        .html("&#9664;")  // Left-facing triangle
        .style("font-size", "20px")
        .style("opacity", shouldDisableLeftArrow() ? 0.5 : 1)
        .style("cursor", shouldDisableLeftArrow() ? "not-allowed" : "pointer")
        .on("click", () => {
            if (!shouldDisableLeftArrow()) {
                navigateGroup(-1); // Navigate to the previous group
            }
        });

    // Text display for the current group name
    const groupText = navigatorContainer.append("span")
        .attr("class", "current-group")
        .style("font-size", "14px")  // Smaller font size
        .style("font-weight", "normal")  // Remove bold styling
        .text(getCurrentGroupText());

    // Right arrow button
    const rightArrow = navigatorContainer.append("button")
        .attr("class", "nav-arrow right-arrow")
        .html("&#9654;")  // Right-facing triangle
        .style("font-size", "20px")
        .style("opacity", shouldDisableRightArrow() ? 0.5 : 1)
        .style("cursor", shouldDisableRightArrow() ? "not-allowed" : "pointer")
        .on("click", () => {
            if (!shouldDisableRightArrow()) {
                navigateGroup(1); // Navigate to the next group
            }
        });

    // Helper function to update the display
    function updateNavigator() {
        groupText.text(getCurrentGroupText());

        // Update left arrow state
        leftArrow
            .style("opacity", shouldDisableLeftArrow() ? 0.5 : 1)
            .style("cursor", shouldDisableLeftArrow() ? "not-allowed" : "pointer");

        // Update right arrow state
        rightArrow
            .style("opacity", shouldDisableRightArrow() ? 0.5 : 1)
            .style("cursor", shouldDisableRightArrow() ? "not-allowed" : "pointer");
    }

    // Helper function to get the current group's name
    function getCurrentGroupText() {
        const currentQuestion = ctx.questions.find(q => q.id === ctx.appState.currentQuestion);
        return currentQuestion ? currentQuestion.group : "Group not found";
    }

    // Helper function to determine if the left arrow should be disabled
    function shouldDisableLeftArrow() {
        const currentQuestion = ctx.questions.find(q => q.id === ctx.appState.currentQuestion);
        return currentQuestion && currentQuestion.group && currentQuestion.group.startsWith("A");
    }

    // Helper function to determine if the right arrow should be disabled
    function shouldDisableRightArrow() {
        const currentQuestion = ctx.questions.find(q => q.id === ctx.appState.currentQuestion);
        return currentQuestion && currentQuestion.group && currentQuestion.group.startsWith("W");
    }

    // Helper function to navigate between groups
    function navigateGroup(direction) {
        const currentQuestionIndex = ctx.questions.findIndex(q => q.id === ctx.appState.currentQuestion);
        let newIndex = currentQuestionIndex;

        // Find the first question with a different group
        while (newIndex >= 0 && newIndex < ctx.questions.length) {
            newIndex += direction;

            const currentGroup = ctx.questions[currentQuestionIndex].group;
            const newGroup = ctx.questions[newIndex]?.group;

            // Stop if the group changes
            if (newGroup && newGroup !== currentGroup) {
                break;
            }
        }

        // If a valid question in a new group is found, update the current question
        if (newIndex >= 0 && newIndex < ctx.questions.length) {
            ctx.appState.currentQuestion = ctx.questions[newIndex].id;
            updateNavigator();
        }
    }
}

export function createSENavigator() {
    const mainDiv = d3.select("#visualizationMain");

    // Remove any previous navigator elements
    mainDiv.selectAll(".SE-navigator").remove();
    mainDiv.selectAll(".group-navigator").remove();
    mainDiv.selectAll(".question-navigator").remove();

    // Create a container for the navigation
    const navigatorContainer = mainDiv.append("div")
        .attr("class", "SE-navigator")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", "8px")  // Slightly reduce the gap
        .style("margin", "15px 50px 15px 15px");  // Reduce margin on the right

    // Left arrow button
    const leftArrow = navigatorContainer.append("button")
        .attr("class", "nav-arrow left-arrow")
        .html("&#9664;")  // Left-facing triangle
        .style("font-size", "16px")  // Reduced font size
        .style("padding", "5px")     // Add padding for better clickability
        .style("margin", "0")        // No additional margin
        .style("opacity", ctx.appState.currentSEIndicator === 'se2' ? 0.5 : 1)
        .style("cursor", ctx.appState.currentSEIndicator === 'se2' ? "not-allowed" : "pointer")
        .on("click", () => {
            if (ctx.appState.currentSEIndicator !== 'se2') {
                navigateQuestion(-1); // Navigate to the previous question
            }
        });

    // Text display for the current question description
    const questionText = navigatorContainer.append("span")
        .attr("class", "current-question")
        .style("font-size", "12px")  // Smaller font size for the description
        .style("font-weight", "normal")  // Remove bold styling
        .text(getCurrentQuestionText());

    // Right arrow button
    const rightArrow = navigatorContainer.append("button")
        .attr("class", "nav-arrow right-arrow")
        .html("&#9654;")  // Right-facing triangle
        .style("font-size", "16px")  // Reduced font size
        .style("padding", "5px")     // Add padding for better clickability
        .style("margin", "0")        // No additional margin
        .style("opacity", ctx.appState.currentSEIndicator === 'se15o' ? 0.5 : 1)
        .style("cursor", ctx.appState.currentSEIndicator === 'se15o' ? "not-allowed" : "pointer")
        .on("click", () => {
            if (ctx.appState.currentSEIndicator !== 'se15o') {
                navigateQuestion(1); // Navigate to the next question
            }
        });

    // Helper function to update the display
    function updateNavigator() {
        questionText.text(getCurrentQuestionText());

        // Update left arrow state
        leftArrow
            .style("opacity", ctx.appState.currentSEIndicator === 'se2' ? 0.5 : 1)
            .style("cursor", ctx.appState.currentSEIndicator === 'se2' ? "not-allowed" : "pointer");

        // Update right arrow state
        rightArrow
            .style("opacity", ctx.appState.currentSEIndicator === 'se15o' ? 0.5 : 1)
            .style("cursor", ctx.appState.currentSEIndicator === 'se15o' ? "not-allowed" : "pointer");
    }

    // Helper function to get the current question's text
    function getCurrentQuestionText() {
        const currentSE = ctx.questions.find(q => q.id === ctx.appState.currentSEIndicator);
        return currentSE ? `${currentSE.id}: ${currentSE.description}` : "Question not found";
    }

    // Helper function to navigate between questions
    function navigateQuestion(direction) {
        const currentIndex = ctx.questions.findIndex(q => q.id === ctx.appState.currentSEIndicator);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < ctx.questions.length) {
            ctx.appState.currentSEIndicator = ctx.questions[newIndex].id;  // Update to next question
            updateNavigator();  // Update navigator display
        }
    }
}
