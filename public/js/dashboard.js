const API_URL = 'https://quizland-xyy3.onrender.com/api';
let currentUser = null;
let myQuizzes = [];

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/auth.html';
            return;
        }

        const data = await response.json();
        currentUser = data.user;

        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('userAvatar').textContent = currentUser.avatar;
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.username}! 👋`;

        updateStats();
        loadMyQuizzes();
        loadRecentPlays();
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        window.location.href = '/auth.html';
    }
}

function updateStats() {
    document.getElementById('quizzesCreatedCount').textContent = currentUser.quizzesCreated.length;
    document.getElementById('quizzesPlayedCount').textContent = currentUser.quizzesPlayed.length;
}

async function loadMyQuizzes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/quizzes/my/created`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        myQuizzes = data.quizzes;

        if (myQuizzes.length === 0) {
            document.getElementById('myQuizzesLoading').style.display = 'none';
            document.getElementById('myQuizzesEmpty').classList.remove('hidden');
            return;
        }

        const totalPlays = myQuizzes.reduce((sum, quiz) => sum + quiz.timesPlayed, 0);
        document.getElementById('totalPlaysCount').textContent = totalPlays;

        displayMyQuizzes();
    } catch (error) {
        console.error('Error loading quizzes:', error);
        document.getElementById('myQuizzesLoading').innerHTML = '<p class="text-danger">Failed to load quizzes</p>';
    }
}

function displayMyQuizzes() {
    const grid = document.getElementById('myQuizzesGrid');
    document.getElementById('myQuizzesLoading').style.display = 'none';

    grid.innerHTML = myQuizzes.map(quiz => `
        <div class="quiz-card">
            <div class="quiz-card-header">
                <div class="quiz-card-icon">${quiz.coverImage}</div>
            </div>
            <div class="quiz-card-body">
                <h3 class="quiz-card-title">${quiz.title}</h3>
                <p class="quiz-card-description">${quiz.description || 'No description'}</p>
                
                <div class="quiz-meta">
                    <span class="badge badge-primary">${quiz.category}</span>
                    <span class="badge ${getDifficultyBadgeClass(quiz.difficulty)}">${quiz.difficulty}</span>
                </div>
                
                <div class="quiz-meta">
                    <span class="quiz-meta-item">📝 ${quiz.questions.length} Questions</span>
                    <span class="quiz-meta-item">🎮 ${quiz.timesPlayed} Plays</span>
                    <span class="quiz-meta-item">⭐ ${quiz.averageScore} Avg Score</span>
                </div>
                
                <div class="btn-group mt-3">
                    <button class="btn btn-primary btn-sm" onclick="editQuiz('${quiz._id}')">✏️ Edit</button>
                    <button class="btn btn-success btn-sm" onclick="playQuiz('${quiz._id}')">▶️ Play</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuiz('${quiz._id}', '${quiz.title}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadRecentPlays() {
    const container = document.getElementById('recentPlaysContainer');
    const recentPlays = currentUser.quizzesPlayed.slice(-5).reverse();

    if (recentPlays.length === 0) {
        document.getElementById('recentPlaysEmpty').classList.remove('hidden');
        return;
    }

    container.innerHTML = recentPlays.map(play => {
        const date = new Date(play.playedAt).toLocaleDateString();
        return `
            <div class="card mb-2">
                <div class="flex-between">
                    <div>
                        <strong>Quiz ID: ${play.quiz}</strong>
                        <br>
                        <small class="text-muted">Played on ${date}</small>
                    </div>
                    <div class="text-center">
                        <div class="stat-value" style="font-size: 1.5rem;">${play.score}</div>
                        <div class="text-muted">Points</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function editQuiz(quizId) {
    window.location.href = `/create-quiz.html?edit=${quizId}`;
}

function playQuiz(quizId) {
    window.location.href = `/play-quiz.html?id=${quizId}`;
}

async function deleteQuiz(quizId, quizTitle) {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Quiz deleted successfully!');
            window.location.reload();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('❌ Failed to delete quiz');
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

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

window.addEventListener('load', checkAuth);