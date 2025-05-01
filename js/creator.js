document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.getElementById('create-game-button');

    createButton.addEventListener('click', () => {
        const groups = [];
        let allInputsValid = true;

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
            return; // Stop the function if inputs are empty
        }

        // Store the groups data
        // Using a simple key like 'connectionsGameData' for now
        // In a real app, you might generate a unique ID per game
        localStorage.setItem('connectionsGameData', JSON.stringify(groups));

        // Redirect to the player page
        window.location.href = 'player.html';
    });
});
