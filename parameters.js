// Global parameters for our visualization
export const ctx = {
    CSVDATA: [],
    MAP_W: 500,
    MAP_H: 400,
    HIST_H: 500,
    HIST_W: 600,
    Matrix_H: 800,
    Matrix_W: 800,
    Y_LABEL_WIDTH: 60,
    TOP_MARGIN: 20,
    questions: [],
    respondent_map_bounds: NamedNodeMap, 
    appState: {
        currentQuestion: 'q1',
        currentCorrelationSelection: ['se2','q44'],
        selectedCountries: [],
        selectedGroup: null,
        selectedQuestionMatrix: "q163",
        currentViz: '',
        collapseTab: true,
        clearTabContent: true,
        currentFactors: [''],
        currentDate: 'all',
        currentSEIndicator: 'se2',
    },
    background_color: "rgb(190,190,190)"
};

export function loadQuestions() {
    return new Promise((resolve, reject) => {
        fetch('Questions.json')
            .then(response => response.json())
            .then(data => {
                ctx.scales = data.scales
                ctx.questions = data.elements;  // Store the entire elements array in ctx.questions
                resolve();
            })
            .catch(error => {
                console.error("Error loading Questions.json:", error);
                reject(error);
            });
    });
};




export function sortDataByScale(data, scale) {
    
    const scaleOrder = scale.reduce((order, value, index) => {
        order[value.toLowerCase()] = index; // Convert to lowercase for case-insensitive comparison
        return order;
    }, {});

    // Sort the data based on the scale order
    return data.sort((a, b) => {
        const aValue = a.answer.toLowerCase();
        const bValue = b.answer.toLowerCase();

        // Handle missing or unmatched values
        const aOrder = scaleOrder.hasOwnProperty(aValue) ? scaleOrder[aValue] : Infinity;
        const bOrder = scaleOrder.hasOwnProperty(bValue) ? scaleOrder[bValue] : Infinity;

        return aOrder - bOrder; // Sort by scale order
    });
}


export function sortDataAlphabetically(data, customOrder) {
    const customOrderMap = customOrder.reduce((order, value, index) => {
        order[value.toLowerCase()] = index + 1000; // Offset to move these values to the end
        return order;
    }, {});

    return data.sort((a, b) => {
        const aValue = a.answer.toLowerCase();
        const bValue = b.answer.toLowerCase();

        // Check for custom order
        const aCustomOrder = customOrderMap[aValue] || 0;
        const bCustomOrder = customOrderMap[bValue] || 0;

        if (aCustomOrder || bCustomOrder) {
            return aCustomOrder - bCustomOrder;
        }

        // If not in custom order, sort alphabetically
        return aValue.localeCompare(bValue);
    });
}

