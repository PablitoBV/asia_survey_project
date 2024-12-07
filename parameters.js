// Global parameters for our visualization
export const ctx = {
    MAP_W: 750,
    MAP_H: 900,
    HIST_H: 500,
    HIST_W: 500,
    Y_LABEL_WIDTH: 60,
    TOP_MARGIN: 20,
    // smallHIST_W: 800,         
    // smallHIST_H: 400,
    questions: []
};

// Parse the Questions.json file
export function loadQuestions() {
    return new Promise((resolve, reject) => {
        fetch('Questions.json')
            .then(response => response.json())  
            .then(data => {
                ctx.questions = data.elements; 
                resolve();  
            })
            .catch(error => {
                console.error("Error loading questions.json:", error);
                reject(error);  
            });
    });
}

// Load the questions at the start
loadQuestions().then(() => {
    console.log("Done loading questions"); 
}).catch(error => {
    console.log("Error loading questions", error);  
});