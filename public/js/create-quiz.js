const API_URL = "https://quizland-xyy3.onrender.com";
let currentQuizId = null;
let questions = [];

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
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
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/auth.html';
    }
}

async function createQuizInfo() {
    const title = document.getElementById('quizTitle').value.trim();
    const description = document.getElementById('quizDescription').value.trim();
    const category = document.getElementById('quizCategory').value;
    const difficulty = document.getElementById('quizDifficulty').value;
    const coverImage = document.getElementById('quizCoverImage').value;

    if (!title) {
        showAlert('❌ Please enter a quiz title', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                category,
                difficulty,
                coverImage
            })
        });

        const data = await response.json();

        if (data.success) {
            currentQuizId = data.quiz._id;
            showAlert('✅ Quiz created! Now add questions.', 'success');

            document.getElementById('questionsSection').classList.remove('hidden');

            document.querySelectorAll('#quizTitle, #quizDescription, #quizCategory, #quizDifficulty, #quizCoverImage').forEach(input => {
                input.disabled = true;
            });

            updateOptionsCount();
        } else {
            showAlert('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Create quiz error:', error);
        showAlert('❌ Failed to create quiz', 'error');
    }
}

function updateOptionsCount() {
    const type = document.getElementById('questionType').value;
    const container = document.getElementById('optionsContainer');

    if (type === 'true-false') {
        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Correct Answer *</label>
                <div class="grid grid-2">
                    <label class="option-btn">
                        <input type="radio" name="correctAnswer" value="0" checked>
                        <span class="option-letter">✓</span>
                        <span>True</span>
                    </label>
                    <label class="option-btn">
                        <input type="radio" name="correctAnswer" value="1">
                        <span class="option-letter">✗</span>
                        <span>False</span>
                    </label>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Options (select the correct one) *</label>
                ${[0, 1, 2, 3].map(i => `
                    <div class="flex" style="gap: 12px; margin-bottom: 12px;">
                        <input type="radio" name="correctAnswer" value="${i}" ${i === 0 ? 'checked' : ''}>
                        <input type="text" class="form-control" id="option${i}" placeholder="Option ${String.fromCharCode(65 + i)}" required>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

async function addQuestion() {
    const questionText = document.getElementById('questionText').value.trim();
    const questionType = document.getElementById('questionType').value;
    const timeLimit = parseInt(document.getElementById('questionTimeLimit').value);
    const points = parseInt(document.getElementById('questionPoints').value);

    if (!questionText) {
        showAlert('❌ Please enter a question text', 'error');
        return;
    }

    let options = [];

    if (questionType === 'true-false') {
        const correctAnswer = parseInt(document.querySelector('input[name="correctAnswer"]:checked').value);
        options = [
            { text: 'True', isCorrect: correctAnswer === 0 },
            { text: 'False', isCorrect: correctAnswer === 1 }
        ];
    } else {
        const correctAnswerIndex = parseInt(document.querySelector('input[name="correctAnswer"]:checked').value);

        for (let i = 0; i < 4; i++) {
            const optionText = document.getElementById(`option${i}`).value.trim();
            if (!optionText) {
                showAlert(`❌ Please fill in all options`, 'error');
                return;
            }
            options.push({
                text: optionText,
                isCorrect: i === correctAnswerIndex
            });
        }
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/quizzes/${currentQuizId}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionText,
                questionType,
                options,
                timeLimit,
                points
            })
        });

        const data = await response.json();

        if (data.success) {
            questions.push(data.question);
            showAlert('✅ Question added!', 'success');

            document.getElementById('questionText').value = '';
            if (questionType === 'multiple-choice') {
                for (let i = 0; i < 4; i++) {
                    document.getElementById(`option${i}`).value = '';
                }
            }

            updateQuestionsList();
        } else {
            showAlert('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Add question error:', error);
        showAlert('❌ Failed to add question', 'error');
    }
}

function updateQuestionsList() {
    const container = document.getElementById('questionsList');
    const emptyState = document.getElementById('questionsEmpty');
    const publishBtn = document.getElementById('publishBtn');

    document.getElementById('questionCount').textContent = `${questions.length} Questions`;

    if (questions.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        publishBtn.disabled = true;
        return;
    }

    emptyState.style.display = 'none';
    publishBtn.disabled = false;

    container.innerHTML = questions.map((q, index) => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="flex-between">
                    <div style="flex: 1;">
                        <strong>Q${index + 1}:</strong> ${q.questionText}
                        <div class="quiz-meta mt-1">
                            <span class="badge badge-primary">${q.questionType}</span>
                            <span class="quiz-meta-item">⏱️ ${q.timeLimit}s</span>
                            <span class="quiz-meta-item">⭐ ${q.points} pts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function publishQuiz() {
    if (questions.length === 0) {
        showAlert('❌ Add at least one question before publishing', 'error');
        return;
    }

    showAlert('✅ Quiz published successfully!', 'success');

    setTimeout(() => {
        window.location.href = '/dashboard.html';
    }, 1500);
}

function showAlert(message, type) {
    const alert = document.getElementById('alertMessage');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.classList.remove('hidden');

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

window.addEventListener('load', () => {
    checkAuth();
});