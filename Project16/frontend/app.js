const API_BASE = '/api';

let books = [];
let students = [];
let activeBorrows = [];

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    if (tabName === 'active') {
        loadActiveBorrows();
    } else if (tabName === 'borrow') {
        loadBorrowFormData();
    }
}

async function apiRequest(url, method = 'GET', data = null) {
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE}${normalizedUrl}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '请求失败');
    }
    return response.json();
}

async function loadBooks() {
    try {
        books = await apiRequest('/books/');
        renderBooks();
    } catch (error) {
        showToast('加载图书列表失败: ' + error.message, 'error');
    }
}

async function loadStudents() {
    try {
        students = await apiRequest('/students/');
        renderStudents();
    } catch (error) {
        showToast('加载学生列表失败: ' + error.message, 'error');
    }
}

function renderBooks() {
    const tbody = document.getElementById('books-table');
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无图书，请添加图书</td></tr>';
        return;
    }
    tbody.innerHTML = books.map(book => `
        <tr>
            <td>${book.book_id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.publisher || '-'}</td>
            <td>${book.total_quantity}</td>
            <td>${book.available_quantity}</td>
            <td>
                <button class="btn-danger" onclick="deleteBook(${book.id}, '${book.book_id}')">删除</button>
            </td>
        </tr>
    `).join('');
}

function renderStudents() {
    const tbody = document.getElementById('students-table');
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无学生，请添加学生</td></tr>';
        return;
    }
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.student_id}</td>
            <td>${student.name}</td>
            <td>${student.class_name}</td>
            <td>
                <button class="btn-danger" onclick="deleteStudent(${student.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = content;
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

function showAddBookModal() {
    showModal(`
        <h2>📚 登记新图书</h2>
        <form onsubmit="handleAddBook(event)">
            <div class="form-group">
                <label>图书编号 *</label>
                <input type="text" id="book-id" required placeholder="例如：B001">
            </div>
            <div class="form-group">
                <label>书名 *</label>
                <input type="text" id="book-title" required placeholder="例如：三国演义">
            </div>
            <div class="form-group">
                <label>作者 *</label>
                <input type="text" id="book-author" required placeholder="例如：罗贯中">
            </div>
            <div class="form-group">
                <label>出版社</label>
                <input type="text" id="book-publisher" placeholder="例如：人民文学出版社">
            </div>
            <div class="form-group">
                <label>总数量 *</label>
                <input type="number" id="book-quantity" required min="1" value="1">
            </div>
            <button type="submit" class="btn-primary">登记图书</button>
        </form>
    `);
}

function showAddStudentModal() {
    showModal(`
        <h2>👨‍🎓 添加新学生</h2>
        <form onsubmit="handleAddStudent(event)">
            <div class="form-group">
                <label>学号 *</label>
                <input type="text" id="student-id" required placeholder="例如：2024001">
            </div>
            <div class="form-group">
                <label>姓名 *</label>
                <input type="text" id="student-name" required placeholder="例如：张三">
            </div>
            <div class="form-group">
                <label>班级 *</label>
                <input type="text" id="student-class" required placeholder="例如：初一(1)班">
            </div>
            <button type="submit" class="btn-primary">添加学生</button>
        </form>
    `);
}

async function handleAddBook(event) {
    event.preventDefault();
    const data = {
        book_id: document.getElementById('book-id').value.trim(),
        title: document.getElementById('book-title').value.trim(),
        author: document.getElementById('book-author').value.trim(),
        publisher: document.getElementById('book-publisher').value.trim(),
        total_quantity: parseInt(document.getElementById('book-quantity').value),
    };
    try {
        await apiRequest('/books/', 'POST', data);
        closeModal();
        showToast('图书登记成功！');
        loadBooks();
    } catch (error) {
        showToast('登记失败: ' + error.message, 'error');
    }
}

async function handleAddStudent(event) {
    event.preventDefault();
    const data = {
        student_id: document.getElementById('student-id').value.trim(),
        name: document.getElementById('student-name').value.trim(),
        class_name: document.getElementById('student-class').value.trim(),
    };
    try {
        await apiRequest('/students/', 'POST', data);
        closeModal();
        showToast('学生添加成功！');
        loadStudents();
    } catch (error) {
        showToast('添加失败: ' + error.message, 'error');
    }
}

async function deleteBook(id, bookId) {
    if (!confirm(`确定要删除图书 ${bookId} 吗？`)) return;
    try {
        await apiRequest(`/books/${id}`, 'DELETE');
        showToast('图书删除成功！');
        loadBooks();
    } catch (error) {
        showToast('删除失败: ' + error.message, 'error');
    }
}

async function deleteStudent(id) {
    if (!confirm('确定要删除该学生吗？')) return;
    try {
        await apiRequest(`/students/${id}`, 'DELETE');
        showToast('学生删除成功！');
        loadStudents();
    } catch (error) {
        showToast('删除失败: ' + error.message, 'error');
    }
}

async function loadBorrowFormData() {
    try {
        const [booksData, studentsData, activeData] = await Promise.all([
            apiRequest('/books/'),
            apiRequest('/students/'),
            apiRequest('/borrows/active/')
        ]);
        books = booksData;
        students = studentsData;
        activeBorrows = activeData;
        populateBorrowSelects();
    } catch (error) {
        showToast('加载数据失败: ' + error.message, 'error');
    }
}

function populateBorrowSelects() {
    const studentSelect = document.getElementById('borrow-student');
    const bookSelect = document.getElementById('borrow-book');
    const returnSelect = document.getElementById('return-record');

    studentSelect.innerHTML = '<option value="">请选择学生</option>' + 
        students.map(s => `<option value="${s.student_id}">${s.name} (${s.student_id})</option>`).join('');

    const availableBooks = books.filter(b => b.available_quantity > 0);
    bookSelect.innerHTML = '<option value="">请选择图书</option>' + 
        availableBooks.map(b => `<option value="${b.book_id}">${b.title} (${b.book_id}) - 可借:${b.available_quantity}</option>`).join('');

    returnSelect.innerHTML = '<option value="">请选择要归还的图书</option>' + 
        activeBorrows.map(b => `<option value="${b.id}">${b.student_name} - ${b.book_title} (借于: ${b.borrow_date})</option>`).join('');
}

async function handleBorrow(event) {
    event.preventDefault();
    const data = {
        student_id: document.getElementById('borrow-student').value,
        book_id: document.getElementById('borrow-book').value,
    };
    if (!data.student_id || !data.book_id) {
        showToast('请选择学生和图书', 'error');
        return;
    }
    try {
        await apiRequest('/borrows/borrow/', 'POST', data);
        showToast('借阅登记成功！');
        document.getElementById('borrow-form').reset();
        loadBorrowFormData();
        loadBooks();
    } catch (error) {
        showToast('借阅失败: ' + error.message, 'error');
    }
}

async function handleReturn(event) {
    event.preventDefault();
    const recordId = document.getElementById('return-record').value;
    if (!recordId) {
        showToast('请选择要归还的图书', 'error');
        return;
    }
    try {
        await apiRequest(`/borrows/${recordId}/return/`, 'POST');
        showToast('归还登记成功！');
        document.getElementById('return-form').reset();
        loadBorrowFormData();
        loadBooks();
    } catch (error) {
        showToast('归还失败: ' + error.message, 'error');
    }
}

async function loadActiveBorrows() {
    try {
        activeBorrows = await apiRequest('/borrows/active/');
        renderActiveBorrows();
    } catch (error) {
        showToast('加载在借图书失败: ' + error.message, 'error');
    }
}

function renderActiveBorrows() {
    const tbody = document.getElementById('active-table');
    if (activeBorrows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">暂无在借图书</td></tr>';
        return;
    }
    tbody.innerHTML = activeBorrows.map(record => `
        <tr>
            <td>${record.student_id}</td>
            <td>${record.student_name}</td>
            <td>${record.book_id}</td>
            <td>${record.book_title}</td>
            <td>${record.borrow_date}</td>
            <td>
                <button class="btn-success" onclick="quickReturn(${record.id})">归还</button>
            </td>
        </tr>
    `).join('');
}

async function quickReturn(recordId) {
    if (!confirm('确定要归还这本图书吗？')) return;
    try {
        await apiRequest(`/borrows/${recordId}/return/`, 'POST');
        showToast('归还成功！');
        loadActiveBorrows();
        loadBooks();
    } catch (error) {
        showToast('归还失败: ' + error.message, 'error');
    }
}

document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

loadBooks();
loadStudents();
