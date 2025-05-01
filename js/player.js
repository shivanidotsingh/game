// js/player.js

document.addEventListener('DOMContentLoaded', () => {
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


    let correctGroups = []; // Stores the original grouped words from localStorage
    let shuffledWords = []; // Stores all 16 words in shuffled order
    let cardElements = []; // Stores references to the card DOM elements
    let selectedCards = []; // Stores references to the currently selected card elements
    let solvedGroupIndexes = []; // Stores the indexes of groups that have been correctly identified
    let tries = 0;
    const maxTries = 4; // Standard Connections game allows 4 mistakes


    // --- Game Initialization ---
    function loadGameData() {
        const gameDataString = localStorage.getItem('connectionsGameData');
        if (!gameDataString) {
            // Handle case where no game data is found (e.g., redirect to creator)
            messageArea.textContent = 'No game data found. Please create a game first.';
            submitButton.disabled = true;
            // Optionally, redirect after a delay
            setTimeout(() => { window.location.href = 'creator.html'; }, 3000);
            return false;
        }

        correctGroups = JSON.parse(gameDataString);

        // Collect all words into a single flat array
        let allWords = [];
        correctGroups.forEach(group => {
            allWords = allWords.concat(group);
        });

        // Shuffle the words
        shuffledWords = shuffleArray(allWords);

        return true; // Data loaded successfully
    }

    function renderGrid() {
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
    }

    // --- Event Handlers ---
    function handleCardClick(event) {
        const card = event.target;

        // Prevent selecting solved cards
        if (card.classList.contains('solved')) {
            return;
        }

        // Toggle selection
        card.classList.toggle('selected');

        // Update selectedCards array
        if (card.classList.contains('selected')) {
            if (selectedCards.length < 4) {
                selectedCards.push(card);
            } else {
                // If already 4 selected, deselect the card just clicked
                card.classList.remove('selected');
            }
        } else {
            // Remove from selectedCards array
            selectedCards = selectedCards.filter(c => c !== card);
        }

        // Enable/Disable submit button based on selection count
        submitButton.disabled = selectedCards.length !== 4;
        messageArea.textContent = selectedCards.length > 0 ? `Selected: ${selectedCards.length}` : '';
    }

    function handleSubmitClick() {
        if (selectedCards.length !== 4) {
            messageArea.textContent = 'Please select exactly 4 words.';
            return; // Should be disabled, but safety check
        }

        const selectedWords = selectedCards.map(card => card.dataset.word);
        const checkResult = checkSelection(selectedWords, correctGroups, solvedGroupIndexes);

        switch (checkResult.type) {
            case 'correct':
                const solvedIndex = checkResult.groupIndex;
                handleCorrectGuess(solvedIndex);
                break;
            case 'incorrect':
                handleIncorrectGuess();
                break;
             case 'already-solved':
                messageArea.textContent = 'This group has already been solved.';
                 // Deselect cards after a short delay
                 setTimeout(deselectAllCards, 1000);
                break;
            case 'invalid-count':
                 // Should not happen if button is disabled correctly
                 messageArea.textContent = 'Internal error: Invalid selection count.';
                 break;
        }

        // Check for game over after handling the guess
         checkGameOver();
    }

    // --- Game Logic Outcomes ---
    function handleCorrectGuess(groupIndex) {
        messageArea.textContent = `Correct! Group ${groupIndex + 1}`; // Display group number (or theme later)

        solvedGroupIndexes.push(groupIndex);

        // Mark selected cards as solved and add solved class
        selectedCards.forEach(card => {
            card.classList.remove('selected'); // Remove selected state
            card.classList.add('solved'); // Add solved state class
            card.removeEventListener('click', handleCardClick); // Make solved cards non-clickable
        });

        // Move solved cards to the solved area (basic implementation)
        // This part needs more sophisticated layout logic for a clean "move to top" animation/effect.
        // For now, we'll just append them and remove them from the grid.
        const solvedGroupContainer = document.createElement('div');
        solvedGroupContainer.classList.add('solved-group-row'); // Style this in CSS
        solvedGroupContainer.innerHTML = `<h3>Group ${groupIndex + 1}</h3>`; // Or theme

        const sortedSolvedCards = selectedCards.sort((a, b) => {
            // Basic sorting to keep them in a consistent order in the solved row
            const wordA = a.dataset.word.toLowerCase();
            const wordB = b.dataset.word.toLowerCase();
            if (wordA < wordB) return -1;
            if (wordA > wordB) return 1;
            return 0;
        });


         sortedSolvedCards.forEach(card => {
             // Clone the card to move it, keep original in grid (will be re-rendered or hidden later)
             // Simpler: just append the element itself and remove from grid container
             solvedGroupContainer.appendChild(card);
         });

         solvedGroupsArea.appendChild(solvedGroupContainer);


        // Remove solved cards from the main grid display (simplest way is to re-render or hide)
        // A simple approach is to just update the layout or filter them out visually.
        // More complex: physically remove from DOM or hide. Let's just clear selected and rely on logic.

        selectedCards = []; // Clear selected cards
        submitButton.disabled = true; // Disable submit until new cards are selected

        // Re-render or update grid layout might be needed here
        // For now, the cards are physically moved in the DOM
    }


    function handleIncorrectGuess() {
        tries++;
        const remainingTries = maxTries - tries;

        messageArea.textContent = `Try again! ${remainingTries} mistake${remainingTries === 1 ? '' : 's'} left.`;

        // Add vibration class to selected cards
        selectedCards.forEach(card => {
            card.classList.add('vibrate');
        });

        // Remove vibration class and deselect after animation
        setTimeout(() => {
            selectedCards.forEach(card => {
                card.classList.remove('vibrate');
            });
            deselectAllCards(); // Clear selected cards
            submitButton.disabled = true; // Disable submit
             messageArea.textContent = remainingTries > 0 ? `Mistakes left: ${remainingTries}` : messageArea.textContent; // Keep message if game over
        }, 700); // Match the duration of the vibration CSS animation
    }

    function deselectAllCards() {
        selectedCards.forEach(card => {
            card.classList.remove('selected');
        });
        selectedCards = [];
        messageArea.textContent = ''; // Clear message
    }

    function checkGameOver() {
        // Game is over if all groups are solved OR user runs out of tries
        if (solvedGroupIndexes.length === correctGroups.length) {
            endGame(true); // Win
        } else if (tries >= maxTries) {
            endGame(false); // Lose (run out of tries)
        }
    }

    function endGame(isWin) {
        submitButton.disabled = true; // Disable button
        gameGrid.style.pointerEvents = 'none'; // Disable clicks on cards

        if (isWin) {
            modalTitle.textContent = "Congratulations!";
            modalMessage.textContent = "You solved all the connections!";
            modalTries.textContent = `It took you ${tries} mistake${tries === 1 ? '' : 's'}.`;
        } else {
             modalTitle.textContent = "Game Over!";
            modalMessage.textContent = "You ran out of tries.";
             modalTries.textContent = ""; // No need to show tries on a loss
            // Optionally reveal the remaining groups here
        }

        modal.style.display = "block"; // Show the modal
    }

    // --- Modal Event Listeners ---
    closeModalSpan.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

     playAgainButton.onclick = function() {
         // Redirect back to the creator page to make a new game
         window.location.href = 'creator.html';
     }


    // --- Initialize Game on Load ---
    if (loadGameData()) {
         renderGrid();
         submitButton.disabled = true; // Disable submit initially
    }
});
