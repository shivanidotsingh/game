// js/creator.js

document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.getElementById('create-game-button');
    const container = document.querySelector('.container'); // Get the container to add the link output

    createButton.addEventListener('click', () => {
        const groups = [];
        let allInputsValid = true;

        // ... (code to get words from inputs - keep this) ...
        // Get words from Group 1
        const group1Inputs = document.querySelectorAll('.group1-word');
        const group1Words = [];
        group1Inputs.forEach(input => {
            if (input.value.trim() === '') {
                allInputsValid = false;
            }
            group1Words.push(input.value.trim());
        });
        groups.push(group1Words);

        // Get words from Group 2
        const group2Inputs = document.querySelectorAll('.group2-word');
        const group2Words = [];
        group2Inputs.forEach(input => {
            if (input.value.trim() === '') {
                allInputsValid = false;
            }
            group2Words.push(input.value.trim());
        });
        groups.push(group2Words);

        // Get words from Group 3
        const group3Inputs = document.querySelectorAll('.group3-word');
        const group3Words = [];
        group3Inputs.forEach(input => {
            if (input.value.trim() === '') {
                allInputsValid = false;
            }
            group3Words.push(input.value.trim());
        });
        groups.push(group3Words);

        // Get words from Group 4
        const group4Inputs = document.querySelectorAll('.group4-word');
        const group4Words = [];
        group4Inputs.forEach(input => {
            if (input.value.trim() === '') {
                allInputsValid = false;
            }
            group4Words.push(input.value.trim());
        });
        groups.push(group4Words);


        // Basic validation
        if (!allInputsValid) {
            alert('Please fill in all 16 words.');
            return;
        }

        // --- NEW SHARING LOGIC ---

        // 1. Stringify the game data (the groups array)
        const gameDataString = JSON.stringify(groups);

        // 2. Encode the string for URL safety (using Base64)
        // btoa() creates a Base64 encoded string from a string
        const encodedGameData = btoa(gameDataString);

        // 3. Get the base URL of the player page
        // This assumes player.html is in the same directory or easily relative
        const playerPageUrl = '/player.html'; 

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
            navigator.clipboard.writeText(linkInput.value).then(() => {
                alert("Link copied to clipboard!");
            }).catch(err => {
                console.error("Failed to copy link: ", err);
                alert("Could not copy link. Please copy it manually.");
            });
        });


        // OPTIONAL: Still save to localStorage for immediate local play if desired
        localStorage.setItem('connectionsGameData', gameDataString);

        // --- END NEW SHARING LOGIC ---
    });
});
