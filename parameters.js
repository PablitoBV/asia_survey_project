// Global parameters for our visualization
export const ctx = {
    MAP_W: 750,
    MAP_H: 900,
    HIST_H: 500,
    HIST_W: 600,
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