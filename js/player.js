document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Player script starting.");

    const gameGrid = document.getElementById('game-grid');
    const messageArea = document.getElementById('message-area');
    const submitButton = document.getElementById('submit-button');
    const solvedGroupsArea = document.getElementById('solved-groups-area');

    // Modal elements
    const modal = document.getElementById('gameOverModal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalTries = document.getElementById('modal-tries');
    const closeModalSpan = document.getElementsByClassName('close')[0];
    const playAgainButton = document.getElementById('play-again-button');

    console.log("Submit button element found:", submitButton);

    if (submitButton) {
       submitButton.addEventListener('click', handleSubmitClick);
       console.log("Submit button click listener added.");
    } else {
       console.error("Submit button not found!");
    }


    let correctGroups = [];
    let shuffledWords = [];
    let cardElements = [];
    let selectedCards = [];
    let solvedGroupIndexes = [];
    let tries = 0;
    const maxTries = 4;


    // --- Modified Game Initialization ---
    function loadGameData() {
        let gameDataString = null;

        // 1. Check for data in the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const encodedGameDataFromUrl = urlParams.get('gameData');

        if (encodedGameDataFromUrl) {
            console.log("Found game data in URL.");
            try {
                // Decode from Base64
                const decodedGameData = atob(encodedGameDataFromUrl);
                // Parse the JSON string
                const parsedData = JSON.parse(decodedGameData);

                // Basic validation to ensure it looks like our game data structure
                if (Array.isArray(parsedData) && parsedData.length === 4 && parsedData.every(group => Array.isArray(group) && group.length === 4)) {
                     correctGroups = parsedData;
                     gameDataString = decodedGameData; // Use the decoded string for word collection
                } else {
                     console.error("Invalid game data structure found in URL.");
                     messageArea.textContent = 'Error loading game data from link.';
                     submitButton.disabled = true;
                     return false;
                }

            } catch (e) {
                console.error("Failed to decode or parse game data from URL:", e);
                messageArea.textContent = 'Error loading game data from link.';
                submitButton.disabled = true;
                return false;
            }

        } else {
            // 2. If no data in URL, fall back to localStorage
            console.log("No game data in URL, checking localStorage.");
            gameDataString = localStorage.getItem('connectionsGameData');

            if (!gameDataString) {
                // Handle case where no game data is found anywhere
                console.log("No game data found in localStorage.");
                messageArea.textContent = 'No game data found. Please create a game first.';
                submitButton.disabled = true;
                // Optionally, redirect after a delay
                // setTimeout(() => { window.location.href = 'creator.html'; }, 3000); // Maybe don't auto-redirect if user expects to play via link
                return false;
            }

            try {
                 correctGroups = JSON.parse(gameDataString);
            } catch (e) {
                 console.error("Failed to parse game data from localStorage:", e);
                 messageArea.textContent = 'Error loading game data from localStorage.';
                 submitButton.disabled = true;
                 return false;
            }
        }


        // If we reached here, we successfully loaded correctGroups from URL or localStorage
        // Collect all words into a single flat array
        let allWords = [];
        correctGroups.forEach(group => {
            allWords = allWords.concat(group);
        });

        // Shuffle the words
        shuffledWords = shuffleArray(allWords);

        console.log("Game data loaded successfully.");
        console.log("Correct Groups:", correctGroups); // Careful logging sensitive data
        console.log("Shuffled Words:", shuffledWords);


        return true; // Data loaded successfully
    }

    // ... (rest of player.js functions: renderGrid, handleCardClick, handleSubmitClick, etc. - keep them as they are) ...
     function renderGrid() { /* ... */ }
     function handleCardClick(event) { /* ... */ }
     function handleSubmitClick() { /* ... */ } // This function remains the same, it uses correctGroups which is now populated

     function handleCorrectGuess(groupIndex) {
       // ... (your existing handleCorrectGuess function) ...
       // You might want to use correctGroups[groupIndex] here to get the actual group words/theme for display
         const groupTheme = correctGroups[groupIndex].join(', '); // Example: show the words as a "theme"
          messageArea.textContent = `Correct! Group: ${groupTheme}`;
     }

     function handleIncorrectGuess() { /* ... */ }
     function deselectAllCards() { /* ... */ }
     function checkGameOver() { /* ... */ }
     function endGame(isWin) { /* ... */ }

     // --- Modal Event Listeners ---
    closeModalSpan.onclick = function() { modal.style.display = "none"; }
    window.onclick = function(event) { if (event.target === modal) { modal.style.display = "none"; }}
    playAgainButton.onclick = function() { window.location.href = 'creator.html'; }


    // --- Initialize Game on Load ---
    // The loadGameData function now handles URL or localStorage loading
    if (loadGameData()) {
         renderGrid();
         submitButton.disabled = true; // Disable submit initially
    }
});
