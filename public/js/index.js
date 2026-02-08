const API_URL = 'https://quizland-xyy3.onrender.com/api';

let allQuizzes = [];

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('userSection').style.display = 'flex';
                document.getElementById('authButtons').style.display = 'none';
                document.getElementById('dashboardLink').style.display = 'block';
                document.getElementById('createQuizBtn').style.display = 'inline-block';
                document.getElementById('getStartedBtn').style.display = 'none';
                document.getElementById('userName').textContent = data.user.username;
                document.getElementById('userAvatar').textContent = data.user.avatar;
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
        }
    }
}

async function loadQuizzes() {
    try {
        document.getElementById('loadingSpinner').style.display = 'flex';
        document.getElementById('quizzesGrid').innerHTML = '';
        document.getElementById('emptyState').classList.add('hidden');

        const response = await fetch(`${API_URL}/quizzes`);
        const data = await response.json();

        console.log('Loaded quizzes:', data); // Для отладки

        allQuizzes = data.quizzes || [];
        displayQuizzes(allQuizzes);
    } catch (error) {
        console.error('Error loading quizzes:', error);
        showAlert('Failed to load quizzes', 'error');
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

function displayQuizzes(quizzes) {
    const grid = document.getElementById('quizzesGrid');

    if (!quizzes || quizzes.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        grid.innerHTML = '';
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');

    grid.innerHTML = quizzes.map(quiz => `
        <div class="quiz-card" onclick="goToQuiz('${quiz._id}')">
            <div class="quiz-card-header">
                <div class="quiz-card-icon">${quiz.coverImage || '📚'}</div>
            </div>
            <div class="quiz-card-body">
                <h3 class="quiz-card-title">${quiz.title}</h3>
                <p class="quiz-card-description">${quiz.description || 'No description'}</p>
                
                <div class="quiz-meta">
                    <span class="badge badge-primary">${quiz.category}</span>
                    <span class="badge ${getDifficultyBadgeClass(quiz.difficulty)}">${quiz.difficulty}</span>
                </div>
                
                <div class="quiz-meta">
                    <span class="quiz-meta-item">
                        📝 ${quiz.questions ? quiz.questions.length : 0} Questions
                    </span>
                    <span class="quiz-meta-item">
                        🎮 ${quiz.timesPlayed || 0} Plays
                    </span>
                </div>
                
                <div class="quiz-meta">
                    <span class="quiz-meta-item">
                        👤 By ${quiz.author ? quiz.author.username : 'Anonymous'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;

    let filtered = allQuizzes;

    if (search) {
        filtered = filtered.filter(quiz =>
            quiz.title.toLowerCase().includes(search) ||
            (quiz.description && quiz.description.toLowerCase().includes(search))
        );
    }

    if (category) {
        filtered = filtered.filter(quiz => quiz.category === category);
    }

    if (difficulty) {
        filtered = filtered.filter(quiz => quiz.difficulty === difficulty);
    }

    console.log('Filtered quizzes:', filtered); // Для отладки
    displayQuizzes(filtered);
}

function getDifficultyBadgeClass(difficulty) {
    switch(difficulty) {
        case 'Easy': return 'badge-success';
        case 'Medium': return 'badge-warning';
        case 'Hard': return 'badge-danger';
        default: return 'badge-primary';
    }
}

function goToQuiz(quizId) {
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm('You need to login to play quizzes. Go to login page?')) {
            window.location.href = '/auth.html';
        }
        return;
    }
    window.location.href = `/play-quiz.html?id=${quizId}`;
}

function scrollToQuizzes() {
    document.getElementById('quizzesSection').scrollIntoView({ behavior: 'smooth' });
}

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}

function showAlert(message, type) {
    alert(message);
}

window.addEventListener('load', () => {
    checkAuth();
    loadQuizzes();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
});