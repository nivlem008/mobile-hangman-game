// Mobile Hangman Game JavaScript

class MobileHangmanGame {
    constructor() {
        // Game state
        this.gameMode = null; // 'single' or 'two'
        this.currentLevel = 1;
        this.maxLives = 6;
        this.lives = this.maxLives;
        this.score = 0;
        this.guessedLetters = [];
        this.currentWord = '';
        this.currentClue = '';
        this.gameActive = false;

        // Two player mode
        this.player1Name = '';
        this.player2Name = '';
        this.currentPlayer = 1;
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRound = 1;
        this.maxRounds = 5;

        // Word bank with cryptic clues
        this.wordBank = {
            1: [ // Level 1: 5-6 letters
                {word: "OCEAN", clue: "Where Neptune rules and sailors fear to tread deep"},
                {word: "PIANO", clue: "Black and white soldiers standing in perfect harmony"},
                {word: "FLAME", clue: "Dancing spirit that consumes but gives warmth"},
                {word: "HEART", clue: "The drum that never stops its rhythm in your chest"},
                {word: "STORM", clue: "Nature's tantrum with lightning spears and thunder roars"}
            ],
            2: [ // Level 2: 6-7 letters
                {word: "SUNSET", clue: "When the sky bleeds gold and the day surrenders"},
                {word: "BRIDGE", clue: "A path that dares to leap across the impossible"},
                {word: "MIRROR", clue: "The honest liar that shows you backwards truth"},
                {word: "GARDEN", clue: "Eden in miniature where patience blooms into beauty"},
                {word: "CASTLE", clue: "Stone dreams reaching for clouds, built by kings' ambitions"}
            ],
            3: [ // Level 3: 7-8 letters
                {word: "RAINBOW", clue: "Nature's promise painted in seven sacred bands"},
                {word: "THUNDER", clue: "The sky's applause after lightning's brilliant performance"},
                {word: "DIAMOND", clue: "Carbon's ultimate transformation under earth's pressure"},
                {word: "PHOENIX", clue: "The bird that mocks death with flames as its cradle"},
                {word: "LABYRINTH", clue: "A puzzle of paths where only patience finds the center"}
            ],
            4: [ // Level 4: 8-10 letters
                {word: "SYMPHONY", clue: "Organized chaos where silence becomes music's canvas"},
                {word: "BUTTERFLY", clue: "Metamorphosis with wings, beauty born from patient darkness"},
                {word: "TREASURE", clue: "Fortune's reward hidden where X marks forgotten dreams"},
                {word: "WATERFALL", clue: "Gravity's masterpiece carving stone with liquid persistence"},
                {word: "MIDNIGHT", clue: "When darkness reigns supreme and dreams dare to whisper"}
            ],
            5: [ // Level 5: 10-12 letters
                {word: "CONSTELLATION", clue: "Ancient stories written in diamonds across night's canvas"},
                {word: "PHILOSOPHER", clue: "One who seeks wisdom in questions rather than answers"},
                {word: "KALEIDOSCOPE", clue: "Reality's fragments dancing in infinite beautiful patterns"},
                {word: "ENCHANTMENT", clue: "Magic woven so subtly that reality itself becomes questionable"},
                {word: "CRYSTALLINE", clue: "Perfect geometric harmony hiding in mineral's secret heart"}
            ]
        };

        this.canvas = null;
        this.ctx = null;
        this.initializeGame();
    }

    initializeGame() {
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.showModeSelection();
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 20, 200);
        const maxHeight = Math.min(250, maxWidth * 1.25);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxHeight + 'px';
        
        if (this.gameActive) {
            this.drawHangman();
        }
    }

    setupEventListeners() {
        // Mode selection
        document.getElementById('singlePlayerBtn').addEventListener('click', () => {
            this.gameMode = 'single';
            this.hideModeSelection();
            this.startSinglePlayer();
        });

        document.getElementById('twoPlayerBtn').addEventListener('click', () => {
            this.gameMode = 'two';
            this.hideModeSelection();
            this.showPlayerNamesModal();
        });

        // Player names
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.getPlayerNames();
        });

        // Game controls
        document.getElementById('guessBtn').addEventListener('click', () => {
            this.makeGuess();
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.confirmReset();
        });

        // Input handling
        const guessInput = document.getElementById('guessInput');
        guessInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        });

        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        });

        // Virtual keyboard
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                this.handleVirtualKeyPress(key.dataset.key);
            });
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
        });

        // Prevent zoom on input focus (iOS)
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
    }

    showModeSelection() {
        document.getElementById('modeModal').style.display = 'flex';
    }

    hideModeSelection() {
        document.getElementById('modeModal').style.display = 'none';
    }

    showPlayerNamesModal() {
        document.getElementById('namesModal').style.display = 'flex';
        document.getElementById('player1Name').focus();
    }

    hidePlayerNamesModal() {
        document.getElementById('namesModal').style.display = 'none';
    }

    getPlayerNames() {
        const player1 = document.getElementById('player1Name').value.trim();
        const player2 = document.getElementById('player2Name').value.trim();

        if (!player1 || !player2) {
            this.showMobileAlert('Please enter both player names!');
            return;
        }

        this.player1Name = player1;
        this.player2Name = player2;
        this.hidePlayerNamesModal();
        this.startTwoPlayer();
    }

    startSinglePlayer() {
        this.gameMode = 'single';
        this.currentLevel = 1;
        this.score = 0;
        this.showSinglePlayerInfo();
        this.newGame();
    }

    startTwoPlayer() {
        this.gameMode = 'two';
        this.currentPlayer = 1;
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRound = 1;
        this.showTwoPlayerInfo();
        this.newGame();
    }

    showSinglePlayerInfo() {
        document.getElementById('singlePlayerInfo').style.display = 'flex';
        document.getElementById('twoPlayerInfo').style.display = 'none';
        document.getElementById('gameSubtitle').textContent = 'Guess the word with cryptic clues!';
        this.updateSinglePlayerDisplay();
    }

    showTwoPlayerInfo() {
        document.getElementById('singlePlayerInfo').style.display = 'none';
        document.getElementById('twoPlayerInfo').style.display = 'block';
        document.getElementById('gameSubtitle').textContent = 'Two Player Challenge Mode!';
        this.updateTwoPlayerDisplay();
    }

    updateSinglePlayerDisplay() {
        document.getElementById('levelDisplay').textContent = `${this.currentLevel}/5`;
        document.getElementById('scoreDisplay').textContent = this.score;
    }

    updateTwoPlayerDisplay() {
        const currentPlayerName = this.currentPlayer === 1 ? this.player1Name : this.player2Name;
        document.getElementById('currentPlayerDisplay').textContent = `${currentPlayerName}'s Turn`;
        document.getElementById('player1Score').textContent = `${this.player1Name}: ${this.player1Score}`;
        document.getElementById('player2Score').textContent = `${this.player2Name}: ${this.player2Score}`;
        document.getElementById('roundDisplay').textContent = `Round: ${this.currentRound}/${this.maxRounds}`;
    }

    newGame() {
        this.lives = this.maxLives;
        this.guessedLetters = [];
        this.gameActive = true;
        
        // Select word based on game mode
        if (this.gameMode === 'single') {
            const levelWords = this.wordBank[this.currentLevel];
            const randomWord = levelWords[Math.floor(Math.random() * levelWords.length)];
            this.currentWord = randomWord.word;
            this.currentClue = randomWord.clue;
        } else {
            // For two player, select from all levels
            const allWords = [];
            for (let level = 1; level <= 5; level++) {
                allWords.push(...this.wordBank[level]);
            }
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            this.currentWord = randomWord.word;
            this.currentClue = randomWord.clue;
        }

        this.updateDisplay();
        this.resetVirtualKeyboard();
        this.drawHangman();
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('guessInput').disabled = false;
        document.getElementById('guessBtn').disabled = false;
    }

    makeGuess() {
        if (!this.gameActive) return;

        const guessInput = document.getElementById('guessInput');
        const guess = guessInput.value.toUpperCase();

        if (!guess || guess.length !== 1 || !/[A-Z]/.test(guess)) {
            this.showMobileAlert('Please enter a single letter!');
            return;
        }

        if (this.guessedLetters.includes(guess)) {
            this.showMobileAlert('You already guessed that letter!');
            return;
        }

        this.guessedLetters.push(guess);
        guessInput.value = '';

        // Update virtual keyboard
        this.updateVirtualKey(guess);

        if (this.currentWord.includes(guess)) {
            // Correct guess
            this.handleCorrectGuess(guess);
        } else {
            // Wrong guess
            this.handleWrongGuess(guess);
        }

        this.updateDisplay();
    }

    handleCorrectGuess(guess) {
        this.updateVirtualKey(guess, true);
        
        if (this.isWordComplete()) {
            this.handleWordComplete();
        }
    }

    handleWrongGuess(guess) {
        this.lives--;
        this.drawHangman();
        
        if (this.lives === 0) {
            this.handleGameOver();
        }
    }

    handleWordComplete() {
        this.gameActive = false;
        document.getElementById('guessInput').disabled = true;
        document.getElementById('guessBtn').disabled = true;

        if (this.gameMode === 'single') {
            const points = this.calculatePoints();
            this.score += points;
            this.updateSinglePlayerDisplay();

            if (this.currentLevel < 5) {
                document.getElementById('nextLevelBtn').style.display = 'block';
                this.showMobileAlert(`🎉 Congratulations! You earned ${points} points!\n\nWord: ${this.currentWord}\nReady for Level ${this.currentLevel + 1}?`, 'success');
            } else {
                this.showMobileAlert(`🏆 GAME COMPLETED!\n\nFinal Score: ${this.score + points}\nYou've mastered all levels!`, 'success');
            }
        } else {
            this.handleTwoPlayerRoundComplete();
        }
    }

    handleTwoPlayerRoundComplete() {
        const points = this.calculatePoints();
        if (this.currentPlayer === 1) {
            this.player1Score += points;
        } else {
            this.player2Score += points;
        }

        const currentPlayerName = this.currentPlayer === 1 ? this.player1Name : this.player2Name;
        this.showMobileAlert(`🎉 ${currentPlayerName} guessed correctly!\n\nWord: ${this.currentWord}\nPoints earned: ${points}`, 'success');

        // Switch player or advance round
        if (this.currentPlayer === 1) {
            this.currentPlayer = 2;
            this.updateTwoPlayerDisplay();
            setTimeout(() => this.newGame(), 2000);
        } else {
            this.currentPlayer = 1;
            this.currentRound++;
            
            if (this.currentRound > this.maxRounds) {
                this.handleTwoPlayerGameEnd();
            } else {
                this.updateTwoPlayerDisplay();
                setTimeout(() => this.newGame(), 2000);
            }
        }
    }

    handleTwoPlayerGameEnd() {
        let winner;
        if (this.player1Score > this.player2Score) {
            winner = this.player1Name;
        } else if (this.player2Score > this.player1Score) {
            winner = this.player2Name;
        } else {
            winner = "It's a tie!";
        }

        this.showMobileAlert(`🏆 GAME OVER!\n\n${this.player1Name}: ${this.player1Score} points\n${this.player2Name}: ${this.player2Score} points\n\nWinner: ${winner}`, 'success');
    }

    handleGameOver() {
        this.gameActive = false;
        document.getElementById('guessInput').disabled = true;
        document.getElementById('guessBtn').disabled = true;

        if (this.gameMode === 'single') {
            this.showMobileAlert(`💀 Game Over!\n\nThe word was: ${this.currentWord}\nFinal Score: ${this.score}`, 'error');
        } else {
            const currentPlayerName = this.currentPlayer === 1 ? this.player1Name : this.player2Name;
            this.showMobileAlert(`💀 ${currentPlayerName} failed to guess the word!\n\nThe word was: ${this.currentWord}`, 'error');
            
            // Switch to next player
            if (this.currentPlayer === 1) {
                this.currentPlayer = 2;
                this.updateTwoPlayerDisplay();
                setTimeout(() => this.newGame(), 2000);
            } else {
                this.currentPlayer = 1;
                this.currentRound++;
                
                if (this.currentRound > this.maxRounds) {
                    this.handleTwoPlayerGameEnd();
                } else {
                    this.updateTwoPlayerDisplay();
                    setTimeout(() => this.newGame(), 2000);
                }
            }
        }
    }

    calculatePoints() {
        const basePoints = this.currentWord.length * 10;
        const livesBonus = this.lives * 5;
        return basePoints + livesBonus;
    }

    nextLevel() {
        this.currentLevel++;
        this.newGame();
    }

    isWordComplete() {
        return this.currentWord.split('').every(letter => this.guessedLetters.includes(letter));
    }

    updateDisplay() {
        // Update word display
        const wordDisplay = this.currentWord.split('').map(letter => 
            this.guessedLetters.includes(letter) ? letter : '_'
        ).join(' ');
        document.getElementById('wordDisplay').textContent = wordDisplay;

        // Update clue
        document.getElementById('clueText').textContent = this.currentClue;

        // Update guessed letters
        const guessedText = this.guessedLetters.length > 0 ? this.guessedLetters.join(', ') : 'None yet';
        document.getElementById('guessedLetters').textContent = guessedText;

        // Update lives
        const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(this.maxLives - this.lives);
        document.getElementById('livesDisplay').textContent = `${hearts} (${this.lives})`;

        // Update game mode specific displays
        if (this.gameMode === 'single') {
            this.updateSinglePlayerDisplay();
        } else {
            this.updateTwoPlayerDisplay();
        }
    }

    handleVirtualKeyPress(key) {
        if (!this.gameActive) return;

        if (key === 'BACKSPACE') {
            document.getElementById('guessInput').value = '';
            return;
        }

        if (this.guessedLetters.includes(key)) {
            return; // Key already used
        }

        document.getElementById('guessInput').value = key;
        this.makeGuess();
    }

    updateVirtualKey(letter, isCorrect = false) {
        const key = document.querySelector(`[data-key="${letter}"]`);
        if (key) {
            key.classList.add('used');
            if (isCorrect) {
                key.classList.add('correct');
            }
        }
    }

    resetVirtualKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('used', 'correct');
        });
    }

    drawHangman() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const scale = Math.min(this.canvas.width / 200, this.canvas.height / 250);
        this.ctx.save();
        this.ctx.scale(scale, scale);
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        // Base
        this.ctx.beginPath();
        this.ctx.moveTo(20, 230);
        this.ctx.lineTo(80, 230);
        this.ctx.stroke();

        // Pole
        this.ctx.beginPath();
        this.ctx.moveTo(50, 230);
        this.ctx.lineTo(50, 20);
        this.ctx.stroke();

        // Top beam
        this.ctx.beginPath();
        this.ctx.moveTo(50, 20);
        this.ctx.lineTo(130, 20);
        this.ctx.stroke();

        // Noose
        this.ctx.beginPath();
        this.ctx.moveTo(130, 20);
        this.ctx.lineTo(130, 50);
        this.ctx.stroke();

        const wrongGuesses = this.maxLives - this.lives;

        // Head
        if (wrongGuesses >= 1) {
            this.ctx.beginPath();
            this.ctx.arc(130, 70, 20, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Face (sad)
            if (wrongGuesses >= 2) {
                // Eyes
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(125, 65, 3, 3);
                this.ctx.fillRect(135, 65, 3, 3);
                
                // Sad mouth
                this.ctx.beginPath();
                this.ctx.arc(130, 77, 5, 0.2 * Math.PI, 0.8 * Math.PI);
                this.ctx.stroke();
            }
        }

        // Body
        if (wrongGuesses >= 3) {
            this.ctx.beginPath();
            this.ctx.moveTo(130, 90);
            this.ctx.lineTo(130, 170);
            this.ctx.stroke();
        }

        // Left arm
        if (wrongGuesses >= 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(130, 110);
            this.ctx.lineTo(100, 140);
            this.ctx.stroke();
        }

        // Right arm
        if (wrongGuesses >= 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(130, 110);
            this.ctx.lineTo(160, 140);
            this.ctx.stroke();
        }

        // Left leg
        if (wrongGuesses >= 6) {
            this.ctx.beginPath();
            this.ctx.moveTo(130, 170);
            this.ctx.lineTo(100, 200);
            this.ctx.stroke();
            
            // Right leg
            this.ctx.beginPath();
            this.ctx.moveTo(130, 170);
            this.ctx.lineTo(160, 200);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    confirmReset() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
            this.resetGame();
        }
    }

    resetGame() {
        this.gameMode = null;
        this.currentLevel = 1;
        this.score = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRound = 1;
        this.currentPlayer = 1;
        this.gameActive = false;
        
        document.getElementById('player1Name').value = '';
        document.getElementById('player2Name').value = '';
        
        this.showModeSelection();
        this.resetVirtualKeyboard();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        document.getElementById('wordDisplay').textContent = '_ _ _ _ _';
        document.getElementById('clueText').textContent = 'Select a game mode to start!';
        document.getElementById('guessedLetters').textContent = 'None yet';
        document.getElementById('livesDisplay').textContent = '❤️❤️❤️❤️❤️❤️ (6)';
        document.getElementById('nextLevelBtn').style.display = 'none';
    }

    showMobileAlert(message, type = 'info') {
        // Create and show custom mobile-friendly alert
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 
                        type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 
                        'linear-gradient(135deg, #667eea, #764ba2)'};
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 90vw;
            text-align: center;
            font-size: 16px;
            line-height: 1.4;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;
        
        alertDiv.innerHTML = `
            <div style="white-space: pre-line; margin-bottom: 15px;">${message}</div>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            ">OK</button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds for success/info messages
        if (type !== 'error') {
            setTimeout(() => {
                if (alertDiv.parentElement) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MobileHangmanGame();
});

// Prevent zoom on iOS
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

// Disable pull-to-refresh
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // Horizontal swipe
    } else {
        // Vertical swipe
        if (yDiff < 0 && window.scrollY === 0) {
            // Downward swipe at top of page (pull-to-refresh)
            evt.preventDefault();
        }
    }
    xDown = null;
    yDown = null;
}
