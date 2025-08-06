// js/creator.js

document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.getElementById('create-game-button');
    const container = document.querySelector('.container'); // Get the container to add the link output

    createButton.addEventListener('click', () => {
        const gameGroups = []; // This will store objects, each containing a theme and its words
        let allInputsValid = true;

        // Loop through each group (1 to 4) to get both words and theme
        for (let i = 1; i <= 4; i++) {
            const groupWords = [];
            const themeInput = document.getElementById(`group${i}-theme`);
            const theme = themeInput ? themeInput.value.trim() : ''; // Get the theme for the current group

            // Get words for the current group
            const wordInputs = document.querySelectorAll(`.group${i}-word`);
            wordInputs.forEach(input => {
                if (input.value.trim() === '') {
                    allInputsValid = false;
                }
                groupWords.push(input.value.trim());
            });

            // Validate theme input
            if (theme === '') {
                allInputsValid = false;
            }

            // Add the group's theme and words to the gameGroups array
            gameGroups.push({ theme: theme, words: groupWords });
        }

        // Basic validation
        if (!allInputsValid) {
            alert('Please fill in all 16 words and all 4 category themes.');
            return;
        }

        // --- NEW SHARING LOGIC ---

        // 1. Stringify the game data (now includes themes and words)
        const gameDataString = JSON.stringify(gameGroups);

        // 2. Encode the string for URL safety (using Base64)
        const encodedGameData = btoa(gameDataString);

        // 3. Get the base URL of the player page
        // This assumes player.html is in the same directory or easily relative
        const playerPageUrl = 'https://shivanidotsingh.github.io/game/player.html';

        // 4. Construct the full URL with the encoded data as a query parameter
        const shareableLink = `${playerPageUrl}?gameData=${encodedGameData}`;

        // 5. Display the link to the user instead of redirecting
        // Remove the input form and button
        container.innerHTML = `
            <h2>Game Created!</h2>
            <p>Share this link with your friend:</p>
            <input type="text" id="share-link-input" value="${shareableLink}" readonly style="width: 90%; padding: 8px; margin-bottom: 10px;">
            <button id="copy-link-button">Copy Link</button>
            <p><a href="${shareableLink}">Or click here to play yourself</a></p>
            <p><a href="creator.html">Create another game</a></p>
        `;

        // Add copy button functionality
        document.getElementById('copy-link-button').addEventListener('click', () => {
            const linkInput = document.getElementById('share-link-input');
            linkInput.select(); // Select the text field
            linkInput.setSelectionRange(0, 99999); // For mobile devices

            // Copy the text inside the text field
            document.execCommand('copy'); // Use document.execCommand for clipboard operations in iframes
            alert("Link copied to clipboard!");
        });


        // OPTIONAL: Still save to localStorage for immediate local play if desired
        localStorage.setItem('connectionsGameData', gameDataString);

        // --- END NEW SHARING LOGIC ---
    });
});
