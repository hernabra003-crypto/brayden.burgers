// State Management
let currentUser = {
    id: Math.random().toString(36).substr(2, 9),
    username: `user_${Math.floor(Math.random() * 10000)}`,
    isCreator: false,
    inPrivateChat: false,
    privateCode: null
};

let chatMode = 'live'; // 'live' or 'private'
let messages = [];
let onlineUsers = [];
let currentGame = null;
let guessingNumber = Math.floor(Math.random() * 100) + 1;
let currentTriviaIndex = 0;

const trivia = [
    {
        question: "what is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1
    },
    {
        question: "what is the capital of france?",
        options: ["london", "berlin", "paris", "madrid"],
        correct: 2
    },
    {
        question: "what is the largest planet?",
        options: ["earth", "mars", "jupiter", "saturn"],
        correct: 2
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    addSystemMessage("welcome to brayden.burgers! choose a chat mode to get started.");
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('liveChatBtn').addEventListener('click', () => joinLiveChat());
    document.getElementById('privateChatBtn').addEventListener('click', () => showPrivateChatCode());
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    document.getElementById('sendBtn').addEventListener('click', () => sendMessage());
    document.getElementById('gameBtn').addEventListener('click', () => toggleGameMenu());
    document.getElementById('voiceToggle').addEventListener('click', () => toggleVoiceChat());
    document.getElementById('videoToggle').addEventListener('click', () => toggleVideoChat());
    document.getElementById('searchBtn').addEventListener('click', () => toggleSearch());

    // Wallpaper selector
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.target.getAttribute('data-color');
            document.body.className = `wallpaper-${color}`;
            localStorage.setItem('wallpaper', color);
        });
    });

    // Load saved wallpaper
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        document.body.className = `wallpaper-${savedWallpaper}`;
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function backToStart() {
    leaveChat();
}

// Private Chat Functions
function showPrivateChatCode() {
    showScreen('privateChatCodeScreen');
}

function createPrivateChat() {
    const code = Math.random().toString().substr(2, 6);
    currentUser.isCreator = true;
    currentUser.privateCode = code;
    chatMode = 'private';
    document.getElementById('lobbyCodeDisplay').textContent = code;
    showScreen('createLobbyScreen');
}

function copyLobbyCode() {
    const code = document.getElementById('lobbyCodeDisplay').textContent;
    navigator.clipboard.writeText(code);
    alert('lobby code copied: ' + code);
}

function enterLobby() {
    chatMode = 'private';
    currentUser.inPrivateChat = true;
    initChat();
}

function joinPrivateChat() {
    const code = document.getElementById('codeInput').value.trim();
    if (code.length !== 6) {
        alert('please enter a valid 6-digit code');
        return;
    }
    currentUser.privateCode = code;
    currentUser.inPrivateChat = true;
    chatMode = 'private';
    document.getElementById('codeInput').value = '';
    initChat();
}

// Chat Functions
function joinLiveChat() {
    chatMode = 'live';
    currentUser.inPrivateChat = false;
    initChat();
}

function initChat() {
    messages = [];
    onlineUsers = [currentUser];
    document.getElementById('chatTitle').textContent = chatMode === 'live' ? 'live chat' : `private lobby - ${currentUser.privateCode}`;
    document.getElementById('chatSubtitle').textContent = `${onlineUsers.length} user${onlineUsers.length !== 1 ? 's' : ''} online`;
    
    if (currentUser.isCreator) {
        showModeration();
    }
    
    showScreen('chatScreen');
    addSystemMessage(`${currentUser.username} joined the ${chatMode} chat!`);
    simulateUsers();
}

function leaveChat() {
    currentGame = null;
    currentUser.isCreator = false;
    currentUser.inPrivateChat = false;
    messages = [];
    onlineUsers = [];
    document.getElementById('messagesContainer').innerHTML = '<div class="welcome-message"><h3>Welcome to brayden.burgers</h3><p>Start chatting below!</p></div>';
    showScreen('startScreen');
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        id: Math.random().toString(36).substr(2, 9),
        user: currentUser,
        text: text,
        timestamp: new Date(),
        own: true
    };
    
    messages.push(message);
    displayMessage(message);
    input.value = '';
    
    // Simulate response
    setTimeout(() => simulateResponse(), 1000 + Math.random() * 2000);
}

function displayMessage(message) {
    const container = document.getElementById('messagesContainer');
    
    if (container.querySelector('.welcome-message')) {
        container.innerHTML = '';
    }
    
    const msgEl = document.createElement('div');
    msgEl.className = `message ${message.own ? 'own' : 'other'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message.text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = `${message.user.username} • ${formatTime(message.timestamp)}`;
    
    msgEl.appendChild(bubble);
    msgEl.appendChild(time);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

function addSystemMessage(text) {
    const container = document.getElementById('messagesContainer');
    
    if (container.querySelector('.welcome-message')) {
        container.innerHTML = '';
    }
    
    const msgEl = document.createElement('div');
    msgEl.style.textAlign = 'center';
    msgEl.style.color = '#999';
    msgEl.style.padding = '10px';
    msgEl.style.fontSize = '0.9em';
    msgEl.textContent = `• ${text} •`;
    
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function simulateUsers() {
    const userCount = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < userCount; i++) {
        onlineUsers.push({
            id: Math.random().toString(36).substr(2, 9),
            username: `user_${Math.floor(Math.random() * 99999)}`,
            isCreator: false
        });
    }
    updateUserCount();
}

function simulateResponse() {
    if (!messages.length) return;
    
    const responses = [
        "that's cool!",
        "haha nice!",
        "agree with you",
        "interesting...",
        "let's play a game!",
        "anyone here?",
        "what's up?",
        "this chat is awesome!"
    ];
    
    const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
    const message = {
        id: Math.random().toString(36).substr(2, 9),
        user: randomUser,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        own: false
    };
    
    messages.push(message);
    displayMessage(message);
}

function updateUserCount() {
    document.getElementById('chatSubtitle').textContent = `${onlineUsers.length} user${onlineUsers.length !== 1 ? 's' : ''} online`;
}

// Voice Chat
async function toggleVoiceChat() {
    const btn = document.getElementById('voiceToggle');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        btn.style.opacity = '1';
        btn.style.background = 'rgba(255, 100, 100, 0.4)';
        addSystemMessage("voice chat enabled - 🎤");
        
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            btn.style.opacity = '0.7';
            btn.style.background = 'rgba(255, 255, 255, 0.2)';
            addSystemMessage("voice chat disabled");
        }, 5000);
    } catch (e) {
        alert('microphone access denied');
    }
}

// Video Chat
async function toggleVideoChat() {
    const videoContainer = document.getElementById('videoContainer');
    const btn = document.getElementById('videoToggle');
    
    if (videoContainer.classList.contains('hidden')) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 400, height: 300 },
                audio: true 
            });
            
            const video = document.getElementById('localVideo');
            video.srcObject = stream;
            videoContainer.classList.remove('hidden');
            btn.style.opacity = '1';
            btn.style.background = 'rgba(100, 200, 255, 0.4)';
            addSystemMessage("video chat started - 📹");
            
            // Simulate remote video
            setTimeout(() => {
                const remoteVideos = document.getElementById('remoteVideos');
                const remoteVideo = document.createElement('video');
                remoteVideo.autoplay = true;
                remoteVideo.style.width = '150px';
                remoteVideo.style.height = '150px';
                remoteVideos.appendChild(remoteVideo);
            }, 1000);
        } catch (e) {
            alert('camera/microphone access denied');
        }
    } else {
        const video = document.getElementById('localVideo');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        videoContainer.classList.add('hidden');
        document.getElementById('remoteVideos').innerHTML = '';
        btn.style.opacity = '0.7';
        btn.style.background = 'rgba(255, 255, 255, 0.2)';
        addSystemMessage("video chat ended");
    }
}

document.getElementById('videoCloseBtn').addEventListener('click', toggleVideoChat);

// Search Engine
function toggleSearch() {
    const searchPanel = document.getElementById('searchPanel');
    searchPanel.classList.toggle('hidden');
    if (!searchPanel.classList.contains('hidden')) {
        document.getElementById('searchInput').focus();
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    // Simulated search results
    const mockResults = [
        {
            title: `search results for "${query}"`,
            description: "here are some results related to your search query",
            url: "https://www.google.com/search?q=" + encodeURIComponent(query)
        },
        {
            title: `${query} on wikipedia`,
            description: "learn more about " + query + " from wikipedia",
            url: "https://wikipedia.org/search?search=" + encodeURIComponent(query)
        },
        {
            title: `${query} images`,
            description: "view images related to " + query,
            url: "https://images.google.com/search?q=" + encodeURIComponent(query)
        }
    ];
    
    mockResults.forEach(result => {
        const resultEl = document.createElement('div');
        resultEl.className = 'search-result-item';
        resultEl.innerHTML = `
            <h4>${result.title}</h4>
            <p>${result.description}</p>
            <a href="${result.url}" target="_blank">visit →</a>
        `;
        resultsContainer.appendChild(resultEl);
    });
}

function closeSearch() {
    document.getElementById('searchPanel').classList.add('hidden');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

// Games
function toggleGameMenu() {
    const gamesMenu = document.getElementById('gamesMenu');
    gamesMenu.classList.toggle('hidden');
}

function playGame(game) {
    currentGame = game;
    document.getElementById('gamesMenu').classList.add('hidden');
    
    if (game === 'tictactoe') {
        initTicTacToe();
    } else if (game === 'guessing') {
        guessingNumber = Math.floor(Math.random() * 100) + 1;
        document.getElementById('guessResult').textContent = '';
    } else if (game === 'trivia') {
        currentTriviaIndex = 0;
        showTriviaQuestion();
    }
    
    document.getElementById(game + 'Game').classList.remove('hidden');
}

function closeGame() {
    document.getElementById(currentGame + 'Game').classList.add('hidden');
    currentGame = null;
    addSystemMessage(`game ended!`);
}

function closeGames() {
    document.getElementById('gamesMenu').classList.add('hidden');
}

// Tic Tac Toe
let tictactoeBoard = ['', '', '', '', '', '', '', '', ''];
let tictactoePlayer = 'x';

function initTicTacToe() {
    tictactoeBoard = ['', '', '', '', '', '', '', '', ''];
    tictactoePlayer = 'x';
    renderTicTacToe();
}

function renderTicTacToe() {
    const board = document.getElementById('tictactoeBoard');
    board.innerHTML = '';
    
    tictactoeBoard.forEach((cell, index) => {
        const cellEl = document.createElement('div');
        cellEl.className = 'tictactoe-cell';
        cellEl.textContent = cell;
        cellEl.addEventListener('click', () => playTicTacToe(index));
        board.appendChild(cellEl);
    });
}

function playTicTacToe(index) {
    if (tictactoeBoard[index] === '') {
        tictactoeBoard[index] = tictactoePlayer;
        const winner = checkTicTacToeWinner();
        if (winner) {
            addSystemMessage(`${winner} wins at tic tac toe!`);
        } else if (tictactoeBoard.every(cell => cell !== '')) {
            addSystemMessage("tic tac toe game is a tie!");
        }
        tictactoePlayer = tictactoePlayer === 'x' ? 'o' : 'x';
        renderTicTacToe();
        
        if (tictactoePlayer === 'o') {
            setTimeout(aiTicTacToe, 500);
        }
    }
}

function aiTicTacToe() {
    let emptyCells = tictactoeBoard.map((cell, i) => cell === '' ? i : -1).filter(i => i !== -1);
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        tictactoeBoard[randomIndex] = 'o';
        tictactoePlayer = 'x';
        renderTicTacToe();
    }
}

function checkTicTacToeWinner() {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let line of lines) {
        if (tictactoeBoard[line[0]] && 
            tictactoeBoard[line[0]] === tictactoeBoard[line[1]] && 
            tictactoeBoard[line[0]] === tictactoeBoard[line[2]]) {
            return tictactoeBoard[line[0]];
        }
    }
    return null;
}

// Guessing Game
function submitGuess() {
    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);
    const resultEl = document.getElementById('guessResult');
    
    if (isNaN(guess)) {
        resultEl.textContent = 'please enter a number';
        return;
    }
    
    if (guess === guessingNumber) {
        resultEl.textContent = `you got it! the number was ${guessingNumber}! 🎉`;
        resultEl.style.color = 'green';
    } else if (guess < guessingNumber) {
        resultEl.textContent = 'too low! try higher';
        resultEl.style.color = 'orange';
    } else {
        resultEl.textContent = 'too high! try lower';
        resultEl.style.color = 'orange';
    }
    
    input.value = '';
}

// Trivia
function showTriviaQuestion() {
    if (currentTriviaIndex >= trivia.length) {
        addSystemMessage("trivia quiz completed!");
        closeGame();
        return;
    }
    
    const question = trivia[currentTriviaIndex];
    document.getElementById('triviaQuestion').textContent = question.question;
    
    const optionsEl = document.getElementById('triviaOptions');
    optionsEl.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'trivia-option';
        btn.textContent = option;
        btn.addEventListener('click', () => {
            if (index === question.correct) {
                addSystemMessage("correct! ✓");
            } else {
                addSystemMessage("wrong! the answer was: " + question.options[question.correct]);
            }
            currentTriviaIndex++;
            setTimeout(showTriviaQuestion, 1500);
        });
        optionsEl.appendChild(btn);
    });
}

// Moderation (for lobby creator)
function showModeration() {
    const moderationPanel = document.getElementById('moderationPanel');
    moderationPanel.classList.remove('hidden');
    updateModerationPanel();
}

function updateModerationPanel() {
    if (!currentUser.isCreator) return;
    
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    onlineUsers.forEach(user => {
        if (user.id === currentUser.id) return;
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <span>${user.username}</span>
            <div class="user-actions">
                <button class="user-action-btn kick-btn" onclick="kickUser('${user.id}')">kick</button>
                <button class="user-action-btn ban-btn" onclick="banUser('${user.id}')">ban</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

function kickUser(userId) {
    onlineUsers = onlineUsers.filter(u => u.id !== userId);
    addSystemMessage("user has been kicked from the lobby");
    updateModerationPanel();
    updateUserCount();
}

function banUser(userId) {
    onlineUsers = onlineUsers.filter(u => u.id !== userId);
    addSystemMessage("user has been banned from this lobby");
    updateModerationPanel();
    updateUserCount();
}