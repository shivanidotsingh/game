// js/game.js

/**
 * Shuffles an array using the Fisher-Yates (aka Knuth) algorithm.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

/**
 * Checks if a set of selected words matches one of the correct groups.
 * Also checks if the matched group has already been solved.
 * @param {string[]} selectedWords - The array of words currently selected by the user.
 * @param {string[][]} correctGroups - The original array of correct groups.
 * @param {number[]} solvedGroupIndexes - An array of indexes of groups already solved.
 * @returns {{type: 'correct', groupIndex: number} | {type: 'incorrect'} | {type: 'already-solved'} | {type: 'invalid-count'}}
 */
function checkSelection(selectedWords, correctGroups, solvedGroupIndexes) {
    if (selectedWords.length !== 4) {
        return { type: 'invalid-count' }; // Should be handled by UI before calling
    }

    // Sort selected words for easier comparison (case-insensitive)
    const sortedSelected = [...selectedWords].map(word => word.toLowerCase()).sort();

    for (let i = 0; i < correctGroups.length; i++) {
        // If this group is already solved, skip it for matching
        if (solvedGroupIndexes.includes(i)) {
            continue;
        }

        const groupWords = correctGroups[i];
        // Sort the current correct group words (case-insensitive)
        const sortedGroup = [...groupWords].map(word => word.toLowerCase()).sort();

        // Check if the sorted selected words exactly match the sorted current group words
        if (JSON.stringify(sortedSelected) === JSON.stringify(sortedGroup)) {
            return { type: 'correct', groupIndex: i }; // Found a correct, unsolved group
        }
    }

    // If we looped through all unsolved groups and found no match
    return { type: 'incorrect' };
}

// You might add other core game logic functions here later
// e.g., getGroupTheme(groupIndex), getWordGroupIndex(word, correctGroups) etc.
