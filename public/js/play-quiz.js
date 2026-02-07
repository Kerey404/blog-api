const API_URL = '/api';
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

let quiz = null;
let gameSession = null;
let currentQuestionIndex = 0;
let currentQuestion = null;
let timerInterval = null;
let timeRemaining = 0;
let questionStartTime = 0;
let score = 0;
let correctAnswers = 0;

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to play quizzes');
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            window.location.href = '/auth.html';
            return;
        }

        const data = await response.json();
        document.getElementById('userName').textContent = data.user.username;
        document.getElementById('userAvatar').textContent = data.user.avatar;

        loadQuiz();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/auth.html';
    }
}

async function loadQuiz() {
    if (!quizId) {
        alert('Invalid quiz ID');
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/quizzes/${quizId}`);
        const data = await response.json();

        if (!data.success) {
            alert('Quiz not found');
            window.location.href = '/';
            return;
        }

        quiz = data.quiz;
        displayQuizInfo();
    } catch (error) {
        console.error('Load quiz error:', error);
        alert('Failed to load quiz');
        window.location.href = '/';
    }
}

function displayQuizInfo() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';

    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizDescription').textContent = quiz.description || 'No description';
    document.getElementById('quizCoverImage').textContent = quiz.coverImage;
    document.getElementById('quizCategory').textContent = quiz.category;
    document.getElementById('quizDifficulty').textContent = quiz.difficulty;
    document.getElementById('quizDifficulty').className = `badge ${getDifficultyBadgeClass(quiz.difficulty)}`;
    document.getElementById('totalQuestions').textContent = quiz.questions.length;
    document.getElementById('timesPlayed').textContent = quiz.timesPlayed;

    const avgTime = quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0);
    document.getElementById('estimatedTime').textContent = Math.ceil(avgTime / 60);
}

async function startQuiz() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/game/start/${quizId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            gameSession = data.gameSession;

            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameScreen').classList.remove('hidden');

            document.getElementById('totalQuestionsGame').textContent = quiz.questions.length;

            loadQuestion();
        } else {
            alert('Failed to start game: ' + data.message);
        }
    } catch (error) {
        console.error('Start game error:', error);
        alert('Failed to start game');
    }
}

function loadQuestion() {
    if (currentQuestionIndex >= quiz.questions.length) {
        finishQuiz();
        return;
    }

    currentQuestion = quiz.questions[currentQuestionIndex];

    document.getElementById('currentQuestionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = currentQuestion.questionText;
    document.getElementById('currentScore').textContent = score;

    const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '%';

    displayOptions();

    startTimer();
}

function displayOptions() {
    const container = document.getElementById('optionsContainer');
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = currentQuestion.options.map((option, index) => `
        <button class="option-btn" onclick="selectAnswer(${index})" id="option${index}">
            <span class="option-letter">${letters[index]}</span>
            <span>${option.text}</span>
        </button>
    `).join('');
}

function startTimer() {
    timeRemaining = currentQuestion.timeLimit;
    questionStartTime = Date.now();
    document.getElementById('timerDisplay').textContent = timeRemaining;
    document.getElementById('timerFill').style.width = '100%';

    timerInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('timerDisplay').textContent = timeRemaining;

        const percentage = (timeRemaining / currentQuestion.timeLimit) * 100;
        document.getElementById('timerFill').style.width = percentage + '%';

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitAnswer(-1); // Время вышло
        }
    }, 1000);
}

function selectAnswer(optionIndex) {
    clearInterval(timerInterval);

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });

    document.getElementById(`option${optionIndex}`).classList.add('selected');

    submitAnswer(optionIndex);
}

async function submitAnswer(selectedOption) {
    const timeSpent = Math.ceil((Date.now() - questionStartTime) / 1000);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/game/${gameSession.id}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId: currentQuestion._id,
                selectedOption: selectedOption,
                timeSpent: timeSpent
            })
        });

        const data = await response.json();

        if (data.success) {
            showAnswerFeedback(data.isCorrect, data.correctOption, selectedOption);

            if (data.isCorrect) {
                score += data.pointsEarned;
                correctAnswers++;
            }

            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 2000);
        } else {
            alert('Error submitting answer: ' + data.message);
        }
    } catch (error) {
        console.error('Submit answer error:', error);
        alert('Failed to submit answer');
    }
}

function showAnswerFeedback(isCorrect, correctOption, selectedOption) {
    if (selectedOption >= 0) {
        const selectedBtn = document.getElementById(`option${selectedOption}`);
        selectedBtn.classList.remove('selected');
        selectedBtn.classList.add(isCorrect ? 'correct' : 'incorrect');
    }

    if (!isCorrect && correctOption >= 0) {
        document.getElementById(`option${correctOption}`).classList.add('correct');
    }
}

async function finishQuiz() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/game/${gameSession.id}/finish`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = `/results.html?session=${gameSession.id}`;
        } else {
            alert('Error finishing game: ' + data.message);
        }
    } catch (error) {
        console.error('Finish game error:', error);
        alert('Failed to finish game');
    }
}

function getDifficultyBadgeClass(difficulty) {
    switch(difficulty) {
        case 'Easy': return 'badge-success';
        case 'Medium': return 'badge-warning';
        case 'Hard': return 'badge-danger';
        default: return 'badge-primary';
    }
}

window.addEventListener('load', checkAuth);

