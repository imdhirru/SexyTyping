// Word lists for different difficulty modes
const wordLists = {
    easy: [
        'cat', 'dog', 'run', 'jump', 'play', 'book', 'tree', 'fish',
        'bird', 'home', 'sun', 'moon', 'star', 'blue', 'red', 'green',
        'walk', 'talk', 'sing', 'dance', 'smile', 'laugh', 'sleep', 'eat',
        'drink', 'work', 'rest', 'love', 'time', 'day', 'night', 'life'
    ],
    normal: [
        'system', 'program', 'function', 'method', 'string', 'array',
        'object', 'number', 'boolean', 'integer', 'character', 'variable',
        'constant', 'module', 'package', 'library', 'framework', 'database',
        'server', 'client', 'network', 'protocol', 'interface', 'algorithm'
    ],
    baap: [
        'algorithm', 'encryption', 'debugging', 'compiler', 'database',
        'framework', 'interface', 'javascript', 'kubernetes', 'middleware',
        'namespace', 'operator', 'parameter', 'recursion', 'sequence',
        'threading', 'variable', 'workflow', 'xml', 'yaml'
    ]
};

let currentMode = 'normal';
let words = wordLists[currentMode];

// DOM Elements
const textDisplay = document.getElementById('text-display');
const cursor = document.getElementById('cursor');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const restartBtn = document.getElementById('restart-btn');
const timeOptions = document.querySelectorAll('.time-option');
const customTimeInput = document.getElementById('custom-time-input');
const customTimeBtn = document.getElementById('custom-time-btn');

// Cursor position
let cursorPosition = { x: 0, y: 0 };
let currentCharIndex = 0;

// Game State
let timeLeft = 30;
let timeInterval = null;
let characters = 0;
let mistakes = 0;
let started = false;
let currentWordIndex = 0;
let currentText = [];
let lastTypedTime = 0;
const typingTimeout = 5000; // 5 seconds timeout

// Generate random text based on current mode
function generateText() {
    currentText = [];
    words = wordLists[currentMode];
    const wordCount = currentMode === 'baap' ? 30 : 50; // Fewer words for BAAP mode due to length
    for (let i = 0; i < wordCount; i++) {
        currentText.push(words[Math.floor(Math.random() * words.length)]);
    }
    currentWordIndex = 0;
    currentCharIndex = 0;
    displayText();
    updateCursorPosition();
}

// Track typed characters for current word
let typedChars = [];

// Display text with current word highlighted and character status
function displayText() {
    const visibleWords = 40; // Show 40 words at a time (about 4 rows)
    const startIndex = Math.max(0, currentWordIndex - 1); // Show only one word behind current
    const words = currentText.slice(startIndex, startIndex + visibleWords).map((word, index) => {
        const wordIndex = startIndex + index;
        if (wordIndex < currentWordIndex) {
            return `<span class="completed">${word}</span>`;
        } else if (wordIndex === currentWordIndex) {
            let wordDisplay = '';
            const currentWord = word.split('');

            // Display typed characters
            for (let i = 0; i < Math.max(currentWord.length, currentCharIndex); i++) {
                if (i < currentCharIndex) {
                    const char = currentWord[i] || '';
                    const typedChar = typedChars[i] || '';
                    const isCorrect = char.toLowerCase() === typedChar.toLowerCase();
                    if (i < currentWord.length) {
                        wordDisplay += `<span class="${isCorrect ? 'correct' : 'incorrect'}">${char}</span>`;
                    } else {
                        wordDisplay += `<span class="extra incorrect">${typedChar}</span>`;
                    }
                } else {
                    wordDisplay += `<span class="remaining">${currentWord[i]}</span>`;
                }
            }
            return `<span class="current">${wordDisplay}</span>`;
        } else {
            return `<span class="remaining">${word}</span>`;
        }
    });

    textDisplay.innerHTML = words.join(' ');
    cursor.classList.add('active');
}

// Calculate WPM
function calculateWPM() {
    const minutes = (30 - timeLeft) / 60;
    const wpm = Math.round((characters / 5) / minutes);
    return wpm || 0;
}

// Calculate accuracy
function calculateAccuracy() {
    const totalCharacters = characters + mistakes;
    return totalCharacters === 0 ? 100 : Math.round((characters / totalCharacters) * 100);
}

// Timer function
function startTimer() {
    timeInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft + 's';
        wpmDisplay.textContent = calculateWPM();
        accuracyDisplay.textContent = calculateAccuracy() + '%';

        // Check for typing timeout
        const currentTime = Date.now();
        if (started && currentTime - lastTypedTime > typingTimeout) {
            finishGame();
            return;
        }

        if (timeLeft === 0) {
            finishGame();
        }
    }, 1000);
}

// Finish game
function finishGame() {
    clearInterval(timeInterval);
    started = false;
    cursor.classList.remove('active');

    // Add glitch effect to final score
    wpmDisplay.classList.add('glitch');
    accuracyDisplay.classList.add('glitch');
}

// Reset game
function resetGame() {
    clearInterval(timeInterval);
    characters = 0;
    mistakes = 0;
    currentWordIndex = 0;
    currentCharIndex = 0;
    started = false;
    cursor.classList.remove('active');
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    timeDisplay.textContent = timeLeft + 's';
    wpmDisplay.classList.remove('glitch');
    accuracyDisplay.classList.remove('glitch');
    generateText();
    updateCursorPosition();
}

// Handle typing
document.addEventListener('keydown', (e) => {
    lastTypedTime = Date.now();
    // Ignore if game is finished
    if (timeLeft === 0) return;
    
    // Ignore special key combinations
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const currentWord = currentText[currentWordIndex];
    
    if (e.key === ' ') {
        e.preventDefault();
        if (currentCharIndex === 0) return; // Prevent empty space input

        // Start timer on first word
        if (!started) {
            started = true;
            startTimer();
            cursor.classList.add('active');
        }

        // Calculate accuracy for the completed word
        for (let i = 0; i < typedChars.length; i++) {
            if (i < currentWord.length) {
                if (typedChars[i].toLowerCase() === currentWord[i].toLowerCase()) {
                    characters++;
                } else {
                    mistakes++;
                }
            } else {
                mistakes++; // Extra characters count as mistakes
            }
        }
        if (typedChars.length < currentWord.length) {
            mistakes += currentWord.length - typedChars.length; // Missing characters count as mistakes
        }

        // Move to next word
        currentWordIndex++;
        currentCharIndex = 0;
        typedChars = [];

        // Generate new text if needed
        if (currentWordIndex >= currentText.length) {
            generateText();
        }

        displayText();
        updateCursorPosition();
    } else if (e.key === 'Backspace') {
        if (e.ctrlKey && currentWordIndex > 0) {
            // Go back to previous word
            currentWordIndex--;
            currentCharIndex = currentText[currentWordIndex].length;
            typedChars = Array.from(currentText[currentWordIndex]);
            displayText();
            updateCursorPosition();
        } else if (currentCharIndex > 0) {
            currentCharIndex--;
            typedChars.pop();
            displayText();
            updateCursorPosition();
        }
    } else if (e.key.length === 1) {
        // Start timer on first character
        if (!started) {
            started = true;
            startTimer();
            cursor.classList.add('active');
        }

        if (currentCharIndex < currentWord.length + 5) { // Limit extra characters
            typedChars[currentCharIndex] = e.key;
            currentCharIndex++;
            displayText();
            updateCursorPosition();
        }
    }
});

// Update cursor position
function updateCursorPosition() {
    requestAnimationFrame(() => {
        const currentWordElement = document.querySelector('.current');
        if (currentWordElement) {
            const chars = currentWordElement.children;
            let targetChar;
            
            if (currentCharIndex < chars.length) {
                targetChar = chars[currentCharIndex];
            } else if (chars.length > 0) {
                targetChar = chars[chars.length - 1];
            }

            if (targetChar) {
                const rect = targetChar.getBoundingClientRect();
                const parentRect = textDisplay.getBoundingClientRect();
                const charWidth = rect.width;
                
                cursor.style.left = currentCharIndex === 0 ?
                    `${rect.left - parentRect.left - 2}px` :
                    `${rect.right - parentRect.left}px`;
                cursor.style.top = `${rect.top - parentRect.top}px`;
                cursor.style.height = `${rect.height}px`;
            }
        }
    });
}

restartBtn.addEventListener('click', () => {
    resetGame();
});

timeOptions.forEach(option => {
    option.addEventListener('click', () => {
        timeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        timeLeft = parseInt(option.dataset.time);
        resetGame();
    });
});

// Custom time option
customTimeBtn.addEventListener('click', () => {
    const customTime = parseInt(customTimeInput.value);
    if (customTime && customTime > 0 && customTime <= 999) {
        timeOptions.forEach(opt => opt.classList.remove('active'));
        customTimeBtn.classList.add('active');
        timeLeft = customTime;
        resetGame();
    }
});

// Mode selection handling
const modeOptions = document.querySelectorAll('.mode-option');
modeOptions.forEach(option => {
    option.addEventListener('click', () => {
        modeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        currentMode = option.dataset.mode;
        resetGame();
    });
});

// Initialize
generateText();
displayText();
updateCursorPosition();

// Initial focus
document.addEventListener('DOMContentLoaded', () => {
    cursor.classList.add('active');
    updateCursorPosition();
});