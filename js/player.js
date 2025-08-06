// js/player.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Player script starting.");

    // --- Reset Game State Variables for a Fresh Start ---
    // These must be reset BEFORE any other game logic runs,
    // especially any checks for game over conditions.
    let solvedGroupIndexes = []; // Stores the indexes of groups that have been correctly identified (0, 1, 2, or 3)
    let tries = 0;             // Reset tries count
    // Also clear the display of solved groups from previous games
    const solvedGroupsArea = document.getElementById('solved-groups-area');
    if (solvedGroupsArea) {
        solvedGroupsArea.innerHTML = '';
        console.log("Solved groups area cleared.");
    }


    // --- Get References to DOM Elements ---
    const gameGrid = document.getElementById('game-grid');
    const messageArea = document.getElementById('message-area');
    const submitButton = document.getElementById('submit-button');


    // Modal elements
    const modal = document.getElementById('gameOverModal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalTries = document.getElementById('modal-tries');
    const closeModalSpan = document.getElementsByClassName('close')[0];
    const playAgainButton = document.getElementById('play-again-button');

    // --- Game State Variables (continued, initialized once) ---
    let fullGameData = []; // Stores the original grouped words AND their themes as objects {theme: "", words: []}
    let correctWordsOnly = []; // Stores ONLY the words for game logic (array of arrays of strings)
    let shuffledWords = []; // Stores all 16 words in shuffled order for the grid
    let cardElements = []; // Stores references to the card DOM elements
    let selectedCards = []; // Stores references to the currently selected card elements
    const maxTries = 4; // Standard Connections game allows 4 mistakes

    // Define colors for each group, corresponding to NYT Connections difficulty (Yellow, Green, Blue, Purple)
    // These will be used as CSS class suffixes
    const groupColorClasses = ['yellow', 'green', 'blue', 'purple'];


    // --- Add Event Listeners ---

    // Listener for the Submit Button
    console.log("Submit button element found:", submitButton);
    if (submitButton) { // Check if button was found
       submitButton.addEventListener('click', handleSubmitClick);
       console.log("Submit button click listener added.");
    } else {
       console.error("Submit button not found!"); // Log an error if button wasn't found
    }

    // Listeners for the Modal
    if (closeModalSpan) {
        closeModalSpan.onclick = function() { modal.style.display = "none"; }
    }
    if (playAgainButton) {
         playAgainButton.onclick = function() { window.location.href = 'creator.html'; }
    }
    // Close modal if user clicks outside of it
    if (modal) {
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
    }


    // --- Game Initialization & Data Loading ---

    /**
     * Loads game data from URL parameter or falls back to localStorage.
     * Updates fullGameData and correctWordsOnly.
     * @returns {boolean} true if data was successfully loaded and processed, false otherwise.
     */
    function loadGameData() {
        let gameDataToParse = null;
        let loadedFromUrl = false;
        console.log("Attempting to load game data.");

        // 1. Check for data in the URL query parameter first and prioritize it
        const urlParams = new URLSearchParams(window.location.search);
        const encodedGameDataFromUrl = urlParams.get('gameData');

        console.log("Full URL Search String:", window.location.search);
        console.log("Value of 'gameData' parameter:", encodedGameDataFromUrl);

        if (encodedGameDataFromUrl) {
            console.log("Found game data in URL. Prioritizing URL data.");
            try {
                // Decode from Base64
                console.log("Attempting to decode Base64...");
                const decodedGameData = atob(encodedGameDataFromUrl);
                console.log("Decoded data:", decodedGameData);
                gameDataToParse = decodedGameData;
                loadedFromUrl = true;

                // Clear localStorage if data is successfully loaded from URL
                // This prevents stale data from being loaded if user navigates directly to player.html later
                localStorage.removeItem('connectionsGameData');
                console.log("Cleared localStorage 'connectionsGameData' as URL data was found.");

            } catch (e) {
                console.error("Failed to decode game data from URL:", e);
                if(messageArea) messageArea.textContent = 'Error loading game data from link.';
                if(submitButton) submitButton.disabled = true;
                return false;
            }
        } else {
            // 2. If no data in URL, fall back to localStorage
            console.log("No 'gameData' parameter in URL. Checking localStorage.");
            gameDataToParse = localStorage.getItem('connectionsGameData');

            if (!gameDataToParse) {
                // Handle case where no game data is found anywhere
                console.log("No game data found in localStorage either.");
                if(messageArea) messageArea.textContent = 'No game data found. Please create a game first.';
                if(submitButton) submitButton.disabled = true;
                return false;
            }
            console.log("Game data found in localStorage.");
        }

        // Now, parse the gameDataToParse (either from URL or localStorage)
        if (gameDataToParse) {
            try {
                console.log("Attempting to parse JSON...");
                const parsedData = JSON.parse(gameDataToParse);
                console.log("Parsed data:", parsedData);

                // Validate and process the new data structure (array of objects {theme, words})
                console.log("Checking parsed data structure...");
                if (Array.isArray(parsedData) && parsedData.length === 4 &&
                    parsedData.every(groupObj =>
                        typeof groupObj === 'object' && groupObj !== null &&
                        typeof groupObj.theme === 'string' && groupObj.theme.trim() !== '' &&
                        Array.isArray(groupObj.words) && groupObj.words.length === 4 &&
                        groupObj.words.every(word => typeof word === 'string' && word.trim() !== '')
                    )
                ) {
                    fullGameData = parsedData; // Store the full data including themes
                    correctWordsOnly = fullGameData.map(groupObj => groupObj.words); // Extract only words for game logic
                    console.log("Data structure looks valid.");
                } else {
                    console.error("Invalid game data structure.");
                    if(messageArea) messageArea.textContent = 'Error loading game data: Invalid format.';
                    if(submitButton) submitButton.disabled = true;
                    return false;
                }

            } catch (e) {
                console.error("Failed to parse game data:", e);
                if(messageArea) messageArea.textContent = 'Error loading game data.';
                if(submitButton) submitButton.disabled = true;
                return false;
            }
        } else {
            // This case should ideally be caught by the initial checks
            console.error("No game data to parse.");
            if(messageArea) messageArea.textContent = 'No game data found.';
            if(submitButton) submitButton.disabled = true;
            return false;
        }


        // If we reached here, fullGameData and correctWordsOnly should be populated
        if(fullGameData && fullGameData.length === 4) {
             let allWords = [];
             correctWordsOnly.forEach(group => { // Use correctWordsOnly for collecting all words
                 allWords = allWords.concat(group);
             });
             if (allWords.length !== 16) {
                  console.error("Incorrect number of words collected:", allWords.length);
                   if(messageArea) messageArea.textContent = 'Error: Game data has incorrect number of words.';
                   if(submitButton) submitButton.disabled = true;
                   return false;
             }
             shuffledWords = shuffleArray(allWords); // Call the shuffle function from game.js
             console.log("Shuffled words generated.");
             return true; // Data loaded and processed successfully
        } else {
            console.error("fullGameData is not correctly populated after loading attempt.");
            if(messageArea) messageArea.textContent = 'Failed to process game data.';
            if(submitButton) submitButton.disabled = true;
            return false;
        }
    }

    /**
     * Renders the game grid based on the shuffled words.
     */
    function renderGrid() {
        console.log("renderGrid function entered."); // Log to confirm call
        if (!gameGrid) {
             console.error("Game grid element not found!");
             return; // Prevent errors if #game-grid doesn't exist
        }
        gameGrid.innerHTML = ''; // Clear previous grid
        cardElements = []; // Clear previous card references

        shuffledWords.forEach(word => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.textContent = word;
            card.dataset.word = word; // Store the word data on the element
            card.addEventListener('click', handleCardClick);
            gameGrid.appendChild(card);
            cardElements.push(card); // Store reference
        });
         console.log("Grid rendering complete. Card elements created:", cardElements.length);
    }


    // --- Event Handler Functions ---

    /**
     * Handles click events on the word cards.
     * @param {Event} event The click event.
     */
    function handleCardClick(event) {
        const card = event.target;

        // Prevent selecting solved cards
        if (card.classList.contains('solved')) {
            console.log("Clicked solved card, ignoring.");
            return;
        }

        // Toggle selection class
        card.classList.toggle('selected');
        console.log("Card clicked:", card.dataset.word, ". Card now selected:", card.classList.contains('selected'));


        // Update selectedCards array based on current 'selected' class state
        selectedCards = cardElements.filter(card => card.classList.contains('selected'));
        console.log("Selected cards count:", selectedCards.length);
        console.log("Selected cards list:", selectedCards.map(c => c.dataset.word));


        // Update message area and submit button state
        if (selectedCards.length > 0 && selectedCards.length < 4) {
             messageArea.textContent = `Selected: ${selectedCards.length}`;
             submitButton.disabled = true; // Still disabled until 4
        } else if (selectedCards.length === 4) {
             messageArea.textContent = '4 selected. Ready to submit!';
             submitButton.disabled = false; // Enable when 4 are selected
        } else {
             messageArea.textContent = ''; // Clear message when 0 selected
             submitButton.disabled = true; // Disable if not exactly 4
        }
    }

    /**
     * Handles the click event on the submit button.
     */
    function handleSubmitClick() {
        console.log("Submit button clicked!");

        if (selectedCards.length !== 4) {
            console.warn("Submit clicked with incorrect selection count:", selectedCards.length);
            messageArea.textContent = 'Please select exactly 4 words.'; // Should be disabled, but safety check
            submitButton.disabled = true; // Ensure disabled
            return;
        }

        submitButton.disabled = true; // Disable button immediately on submit

        const selectedWords = selectedCards.map(card => card.dataset.word);
        console.log("Selected words for checking:", selectedWords);

        // Call the checkSelection function from game.js, passing only the words
        const checkResult = checkSelection(selectedWords, correctWordsOnly, solvedGroupIndexes);
        console.log("Result from checkSelection:", checkResult);

        switch (checkResult.type) {
            case 'correct':
                console.log("Result: Correct group found at index", checkResult.groupIndex);
                handleCorrectGuess(checkResult.groupIndex);
                break;
            case 'incorrect':
                console.log("Result: Incorrect guess.");
                handleIncorrectGuess();
                break;
             case 'already-solved':
                console.log("Result: Group already solved.");
                messageArea.textContent = 'This group has already been solved.';
                 // Deselect cards after a short delay for feedback
                 setTimeout(deselectAllCards, 1000);
                break;
            // 'invalid-count' should ideally be caught by the length check before calling checkSelection
            case 'invalid-count':
                 console.error("Internal error: Invalid count returned from checkSelection.");
                 messageArea.textContent = 'Internal error: Invalid selection.';
                 deselectAllCards();
                 break;
        }

        // Check for game over after handling the guess, but give time for feedback/animation
         setTimeout(checkGameOver, 800); // Check slightly after feedback animation
    }


    // --- Game Logic Outcomes ---

    /**
     * Handles the UI update when a correct group is guessed.
     * @param {number} groupIndex - The index of the correctly solved group.
     */
    function handleCorrectGuess(groupIndex) {
        solvedGroupIndexes.push(groupIndex);
        solvedGroupIndexes.sort((a, b) => a - b); // Keep solved groups sorted by original index

        // Get the theme and words for the solved group from fullGameData
        const solvedGroup = fullGameData[groupIndex];
        const groupTheme = solvedGroup.theme;
        const groupWords = solvedGroup.words; // Get the words for display if needed
        messageArea.textContent = `Correct! ${groupTheme}`;


        // Create the container for the solved group row
        const solvedGroupContainer = document.createElement('div');
        solvedGroupContainer.classList.add('solved-group-row');
        solvedGroupContainer.dataset.groupIndex = groupIndex;

        // Add the color class based on the group index
        solvedGroupContainer.classList.add(`solved-group-${groupColorClasses[groupIndex]}`);


        // Add theme/title
        const themeTitle = document.createElement('h3');
        themeTitle.textContent = groupTheme; // Display the actual theme
        solvedGroupContainer.appendChild(themeTitle);


        // Sort the cards visually by their word content for consistent display in the solved row
        const cardsToMove = [];
        selectedCards.forEach(card => {
            card.classList.remove('selected'); // Remove selected state
            card.classList.add('solved'); // Add solved state class
            // Add the specific color class to the card itself
            card.classList.add(`card-solved-${groupColorClasses[groupIndex]}`);
            card.removeEventListener('click', handleCardClick); // Make solved cards non-clickable
            cardsToMove.push(card); // Collect cards to move
        });

        // Clear selected cards array
        selectedCards = [];

        // Sort the cards visually by their word content for consistent display in the solved row
        const sortedCardsToMove = cardsToMove.sort((a, b) => {
            const wordA = a.dataset.word.toLowerCase();
            const wordB = b.dataset.word.toLowerCase();
            if (wordA < wordB) return -1;
            if (wordA > wordB) return 1;
            return 0;
        });

        // Append the sorted cards to the solved group container
        const cardsWrapper = document.createElement('div');
        cardsWrapper.classList.add('solved-cards-wrapper'); // A wrapper for the cards within the solved row
        sortedCardsToMove.forEach(card => {
            // Ensure cards are visible when moved to the solved area
            card.style.display = ''; // Reset display style if it was set to 'none' in the main grid logic
            cardsWrapper.appendChild(card); // Move the actual DOM element
        });
        solvedGroupContainer.appendChild(cardsWrapper); // Append the wrapper to the solved group container


        // Find the correct position to insert the new solved row (sorted by group index)
        const solvedRows = Array.from(solvedGroupsArea.querySelectorAll('.solved-group-row'));
        let inserted = false;
        for(const row of solvedRows) {
            if (parseInt(row.dataset.groupIndex) > groupIndex) {
                solvedGroupsArea.insertBefore(solvedGroupContainer, row);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
             solvedGroupsArea.appendChild(solvedGroupContainer); // Append if it's the last group or the first row
        }


        // Re-arrange the remaining cards in the grid visually (hide moved ones from the main grid)
        // This hides the original card elements from the main grid once they've been moved.
         cardElements.forEach(card => {
             if (card.classList.contains('solved') && card.parentNode === gameGrid) {
                 card.style.display = 'none'; // Hide solved cards from the main grid area
             }
         });

         // After cards are moved/hidden, clear the message area after a brief delay
         setTimeout(() => {
              messageArea.textContent = '';
         }, 1500); // Clear message after 1.5 seconds
    }


    /**
     * Handles the UI update when an incorrect group is guessed.
     */
    function handleIncorrectGuess() {
        tries++;
        const remainingTries = maxTries - tries;

        messageArea.textContent = `Try again! ${remainingTries} mistake${remainingTries === 1 ? '' : 's'} left.`;
        console.log(`Incorrect guess. Tries: ${tries}/${maxTries}`);

        // Add vibration class to selected cards
        selectedCards.forEach(card => {
            card.classList.add('vibrate');
        });

        // Remove vibration class and deselect after animation
        const animationDuration = 300; // Should match CSS animation-duration
        setTimeout(() => {
            selectedCards.forEach(card => {
                card.classList.remove('vibrate');
            });
            deselectAllCards(); // Clear selected cards and remove 'selected' class
            submitButton.disabled = true; // Ensure disabled until new cards are selected

             // Keep the try count message visible for a bit longer
             setTimeout(() => {
                 if (messageArea.textContent.startsWith('Try again')) {
                     messageArea.textContent = '';
                 }
             }, 1000); // Clear message after 1 second
        }, animationDuration);
    }

    /**
     * Removes 'selected' class from all cards and clears the selectedCards array.
     */
    function deselectAllCards() {
        console.log("Deselecting all cards.");
        cardElements.forEach(card => {
             card.classList.remove('selected');
        });
        selectedCards = [];
    }

    /**
     * Checks if the game is over (all groups solved or run out of tries).
     */
    function checkGameOver() {
        console.log("Checking if game is over. Solved:", solvedGroupIndexes.length, "Tries:", tries);
        if (solvedGroupIndexes.length === fullGameData.length) { // Use fullGameData.length for total groups
            console.log("Game Over: All groups solved!");
            endGame(true); // Win
        } else if (tries >= maxTries) {
            console.log("Game Over: Ran out of tries.");
            endGame(false); // Lose (run out of tries)
        } else {
             console.log("Game not over yet.");
        }
    }

    /**
     * Ends the game and shows the result modal.
     * @param {boolean} isWin - True if the player won, false otherwise.
     */
    function endGame(isWin) {
        console.log("Ending game. Win status:", isWin);
        if(submitButton) submitButton.disabled = true;
        if(gameGrid) gameGrid.style.pointerEvents = 'none';
        if(messageArea) messageArea.textContent = '';

        if (modal) {
            if (isWin) {
                if(modalTitle) modalTitle.textContent = "Congratulations!";
                if(modalMessage) modalMessage.textContent = "You solved all the connections!";
                if(modalTries) modalTries.textContent = `It took you ${tries} mistake${tries === 1 ? '' : 's'}.`;
            } else {
                 if(modalTitle) modalTitle.textContent = "Game Over!";
                 if(modalMessage) modalMessage.textContent = "You ran out of tries.";
                 if(modalTries) modalTries.textContent = "Keep practicing!";
                 // Optional: Reveal remaining groups visually here
            }
             modal.style.display = "block";
             console.log("Game Over modal shown.");
        } else {
             console.error("Game over modal element not found!");
             // Fallback message if modal isn't found
             alert(isWin ? `Congratulations! You solved it in ${tries} mistakes.` : `Game Over! You ran out of tries.`);
        }
    }


    // --- Initial Game Setup on Load ---
    // This runs once when the player.html page finishes loading DOM content.
    // After initial state resets, load game data and render grid.
    if (loadGameData()) {
         renderGrid();
         if(submitButton) submitButton.disabled = true;
    } else {
         console.log("Game data not loaded. Game not started.");
         // loadGameData already sets messageArea and disables button on failure
    }

}); // End of DOMContentLoaded listener
