const API_URL = '/api';

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTabBtn.className = 'btn btn-primary';
        registerTabBtn.className = 'btn btn-outline';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTabBtn.className = 'btn btn-outline';
        registerTabBtn.className = 'btn btn-primary';
    }
    hideAlert();
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert('✅ Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showAlert('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('❌ Server error. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const avatar = document.querySelector('input[name="avatar"]:checked').value;
    const btn = document.getElementById('registerBtn');

    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, avatar })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert('✅ Account created successfully! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showAlert('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showAlert('❌ Server error. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
}

function showAlert(message, type) {
    const alert = document.getElementById('alertMessage');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.classList.remove('hidden');
}

function hideAlert() {
    document.getElementById('alertMessage').classList.add('hidden');
}

window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    }
});