const API = '/blogs';

async function loadPosts() {
    const res = await fetch(API);
    const data = await res.json();
    const container = document.getElementById('posts');

    container.innerHTML = data.map(p => `
        <div class="blog-post card">
            <h3>${p.title}</h3>
            <p>${p.body}</p>
            <small>Автор: ${p.author}</small>
            <div class="actions">
                <button class="btn-edit" onclick="editPost('${p._id}', '${p.title}', '${p.body}')">✏️ Редактировать</button>
                <button class="btn-delete" onclick="deletePost('${p._id}')">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}
async function createPost() {
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    const author = document.getElementById('author').value;

    await fetch(API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title, body, author: author })
    });

    alert("Пост создан!");
    loadPosts();
}
async function editPost(id, oldTitle, oldBody) {
    const newTitle = prompt("Новый заголовок:", oldTitle);
    const newBody = prompt("Новый текст:", oldBody);

    if (newTitle && newBody) {
        await fetch(`${API}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title: newTitle, body: newBody })
        });
        loadPosts();
    }
}
async function deletePost(id) {
    if (confirm("Удалить этот пост?")) {
        await fetch(`${API}/${id}`, { method: 'DELETE' });
        loadPosts();
    }
}