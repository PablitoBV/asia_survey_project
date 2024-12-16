// Global parameters for our visualization
export const ctx = {
    MAP_W: 750,
    MAP_H: 900,
    HIST_H: 500,
    HIST_W: 600,
    Matrix_H: 800,
    Matrix_W: 800,
    Y_LABEL_WIDTH: 60,
    TOP_MARGIN: 20,
    // smallHIST_W: 800,         
    // smallHIST_H: 400,
    questions: [],
    groups_of_questions : [],
    respondent_map_bounds: NamedNodeMap, 
    appState: {
        currentQuestion: 1,
        selectedCountries: [],
        selectedCountry: "China",
        selectedGroup: null,
    },
};

// Parse the Questions.json file
export function loadQuestions() {
    return new Promise((resolve, reject) => {
        fetch('Questions.json')
            .then(response => response.json())  
            .then(data => {
                ctx.questions = data.elements; 
                resolve();  
                ctx.groups_of_questions = Array.from(new Set(ctx.questions.map(item => item.group)));
            })
            
            .catch(error => {
                console.error("Error loading questions.json:", error);
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

