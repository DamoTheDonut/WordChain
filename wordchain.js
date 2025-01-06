let dictionary = [];
let dictionaryCommon = [];
let currentWord = "";
let targetWord = "";
let wordCount = 0;
let usedWordsStart = [];
let usedWordsEnd = [];
let previousWords = [];
let isFlipped = false;

async function loadWords() {
    let response;
    response = await fetch('dictionary.txt');
    dictionary = await response.text();
    dictionary = dictionary.split(/\r?\n/).filter(word => word.trim().length > 0);

    response = await fetch('dictionaryCommon.txt');
    dictionaryCommon = await response.text();
    dictionaryCommon = dictionaryCommon.split(/\r?\n/).filter(word => word.trim().length > 0);
    startGame();
}

function startGame() {
    currentWord = getRandomWord();
    targetWord = getRandomWord();

    document.getElementById('start-word').innerText = currentWord;
    document.getElementById('end-word').innerText = targetWord;
    resetWordLists();
    wordCount = 0;
    usedWordsStart = [currentWord];
    usedWordsEnd = [targetWord];
    previousWords = [];
    document.getElementById('user-word').disabled = false;
    document.getElementById('new-game-button').style.display = "none";
    document.getElementById('undo-button').style.display = "none";
    updateWordLists();
}

function getRandomWord() {
    let randomWord = "";
    do {
        randomWord = dictionaryCommon[Math.floor(Math.random() * dictionaryCommon.length)];
    } while (randomWord.length < 4 || randomWord.length > 6);
    return randomWord;
}

function submitWord() {
    const userWord = document.getElementById('user-word').value.trim().toUpperCase();
    const message = document.getElementById('message');

    if (!dictionary.includes(userWord)) {
        message.innerText = "Invalid word! Word not in list.";
        return;
    }

    if (!isOneLetterChange(currentWord, userWord)) {
        message.innerText = "Invalid move! You can only add, remove, or change one letter.";
        return;
    }

    previousWords.push(currentWord);
    currentWord = userWord;

    if (!isFlipped) {
        usedWordsStart.push(currentWord);
    } else {
        usedWordsEnd.push(currentWord);
    }

    wordCount++;
    document.getElementById('start-word').innerText = currentWord;
    document.getElementById('user-word').value = "";
    updateWordLists();
    document.getElementById('word-counter').innerText = `Words used: ${wordCount}`;
    document.getElementById('undo-button').style.display = "inline-block";

    if (currentWord === targetWord) {
        message.innerText = "Congratulations! You reached the target word.";
        document.getElementById('user-word').disabled = true;
        document.getElementById('new-game-button').style.display = "inline-block";
    } else {
        message.innerText = "Good move! Keep going.";
    }
}

function updateWordLists() {
    const wordListStart = document.getElementById('word-list-start');
    const wordListEnd = document.getElementById('word-list-end');
    
    if (!isFlipped) {
        wordListStart.innerHTML = usedWordsStart.map(word => `<span>${word}</span>`).join('');
        wordListEnd.innerHTML = usedWordsEnd.map(word => `<span>${word}</span>`).join('');
    } else {
        wordListStart.innerHTML = usedWordsEnd.slice().reverse().map(word => `<span>${word}</span>`).join('');
        wordListEnd.innerHTML = usedWordsStart.slice().reverse().map(word => `<span>${word}</span>`).join('');
    }
}

function resetWordLists() {
    document.getElementById('word-list-start').innerHTML = "";
    document.getElementById('word-list-end').innerHTML = "";
}

function isOneLetterChange(word1, word2) {
    if (word1 === word2) return false;

    if (Math.abs(word1.length - word2.length) > 1) return false;

    let differences = 0;

    if (word1.length === word2.length) {
        for (let i = 0; i < word1.length; i++) {
            if (word1[i] !== word2[i]) differences++;
            if (differences > 1) return false;
        }
    } else {
        const [shorter, longer] = word1.length < word2.length ? [word1, word2] : [word2, word1];
        let i = 0, j = 0;
        while (i < shorter.length && j < longer.length) {
            if (shorter[i] !== longer[j]) {
                differences++;
                if (differences > 1) return false;
                j++;
            } else {
                i++;
                j++;
            }
        }
    }

    return true;
}

function toggleMode() {
    document.body.classList.toggle('dark-mode');
}

function startNewGame() {
    startGame();
}

function undoMove() {
    if (previousWords.length > 0) {
        currentWord = previousWords.pop();
        if (!isFlipped) {
            usedWordsStart.pop();
        } else {
            usedWordsEnd.pop();
        }
        wordCount--;
        document.getElementById('start-word').innerText = currentWord;
        updateWordLists();
        document.getElementById('word-counter').innerText = `Words used: ${wordCount}`;

        if (previousWords.length === 0) {
            document.getElementById('undo-button').style.display = "none";
        }
    }
}

function handleEnter(event) {
    if (event.key === "Enter") {
        submitWord();
    }
}

function toggleChainDirection() {
    isFlipped = !isFlipped;
    document.getElementById('message').innerText = isFlipped ? "Working towards the start word." : "Working towards the end word.";
    updateWordLists();
}

function shareGame() {
    const url = `${window.location.origin}${window.location.pathname}?start=${currentWord}&end=${targetWord}`;
    navigator.clipboard.writeText(url).then(() => {
        alert("Game URL copied to clipboard!");
    });
}

window.onload = loadWords;
