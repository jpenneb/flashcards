//const csvFilePath = 'flashcards.csv'
const csvFilePath = 'need_to_study_most.csv'

async function fetchCsv(filePath) {
    const response = await fetch(filePath);
    return response.text();
}

function parseCsv(csvText) {
    const lines = csvText.split("\n");
    return lines.map(line => {
        const fields = [];
        let field = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i - 1] === ',')) {
                // Start or end of a quoted field
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                // End of a field
                fields.push(field);
                field = '';
            } else {
                // Part of a field
                field += char;
            }
        }

        // Add the last field
        fields.push(field);

        return {
            term: fields[0].trim(),
            definition: fields[1].trim().replace(/^"|"$/g, '') // Remove surrounding quotes from the definition
        };
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function displayFlashcard(flashcard) {
    const termElement = document.getElementById('term');
    const definitionElement = document.getElementById('definition');

    termElement.textContent = flashcard.term;
    definitionElement.textContent = flashcard.definition;
    
    termElement.style.display = 'none'; // Hide the term initially
}

async function initFlashcards() {
    const csvText = await fetchCsv(csvFilePath);
    console.log(csvText)
    const flashcards = parseCsv(csvText);
    shuffleArray(flashcards); // Shuffle the flashcards
    let currentIndex = 0;

    displayFlashcard(flashcards[currentIndex]);

    const correctButton = document.getElementById('correctButton');
    const incorrectButton = document.getElementById('incorrectButton');

    if (correctButton) {
        correctButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % flashcards.length;
            displayFlashcard(flashcards[currentIndex]);
        });
    }

    if (incorrectButton) {
        incorrectButton.addEventListener('click', () => {
            updateIncorrectCount(flashcards[currentIndex].term);
            currentIndex = (currentIndex + 1) % flashcards.length;
            displayFlashcard(flashcards[currentIndex]);
        });
    }
}

function updateIncorrectCount(term) {
    let incorrectCounts = JSON.parse(localStorage.getItem('incorrectCounts')) || {};
    incorrectCounts[term] = (incorrectCounts[term] || 0) + 1;
    localStorage.setItem('incorrectCounts', JSON.stringify(incorrectCounts));
}

// Add event listener for the Show Term button
document.getElementById('showTermButton').addEventListener('click', () => {
    document.getElementById('term').style.display = 'block'; // Show the term
});

initFlashcards();
