const API_BASE = '/api/anniversaries';

let anniversaries = [];
let currentFilter = 'all';

const elements = {
  list: document.getElementById('anniversaryList'),
  emptyState: document.getElementById('emptyState'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  form: document.getElementById('anniversaryForm'),
  editId: document.getElementById('editId'),
  title: document.getElementById('title'),
  type: document.getElementById('type'),
  date: document.getElementById('date'),
  note: document.getElementById('note'),
  addBtn: document.getElementById('addBtn'),
  closeModal: document.getElementById('closeModal'),
  cancelBtn: document.getElementById('cancelBtn'),
  typeFilter: document.getElementById('typeFilter'),
  toast: document.getElementById('toast')
};

const typeLabels = {
  birthday: '🎂 生日',
  festival: '🎉 节日',
  other: '📌 其他'
};

function showToast(message, type = 'success') {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString('zh-CN', options);
}

async function fetchAnniversaries() {
  try {
    const response = await fetch(API_BASE);
    const result = await response.json();
    
    if (result.success) {
      anniversaries = result.data;
      renderList();
    } else {
      showToast('获取数据失败', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('网络错误', 'error');
  }
}

function renderList() {
  let filtered = anniversaries;
  
  if (currentFilter !== 'all') {
    filtered = anniversaries.filter(a => a.type === currentFilter);
  }

  if (filtered.length === 0) {
    elements.list.innerHTML = '';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';
  elements.list.innerHTML = filtered.map(item => `
    <div class="anniversary-card type-${item.type}">
      <div class="card-header">
        <h3 class="card-title">${item.title}</h3>
        <span class="card-type ${item.type}">${typeLabels[item.type]}</span>
      </div>
      <div class="card-date">📆 ${formatDisplayDate(item.date)}</div>
      ${item.note ? `<div class="card-note">${item.note}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-primary" onclick="openEditModal('${item._id}')">编辑</button>
        <button class="btn btn-danger" onclick="deleteAnniversary('${item._id}')">删除</button>
      </div>
    </div>
  `).join('');
}

function openAddModal() {
  elements.modalTitle.textContent = '添加纪念日';
  elements.editId.value = '';
  elements.form.reset();
  elements.modal.classList.add('show');
}

function openEditModal(id) {
  const item = anniversaries.find(a => a._id === id);
  if (!item) return;

  elements.modalTitle.textContent = '编辑纪念日';
  elements.editId.value = item._id;
  elements.title.value = item.title;
  elements.type.value = item.type;
  elements.date.value = formatDate(item.date);
  elements.note.value = item.note || '';
  elements.modal.classList.add('show');
}

function closeModal() {
  elements.modal.classList.remove('show');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const data = {
    title: elements.title.value.trim(),
    type: elements.type.value,
    date: elements.date.value,
    note: elements.note.value.trim()
  };

  const editId = elements.editId.value;
  
  try {
    let response;
    if (editId) {
      response = await fetch(`${API_BASE}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('修改成功');
    } else {
      response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('添加成功');
    }

    const result = await response.json();
    
    if (result.success) {
      closeModal();
      fetchAnniversaries();
    } else {
      showToast(result.message || '操作失败', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('网络错误', 'error');
  }
}

async function deleteAnniversary(id) {
  if (!confirm('确定要删除这个纪念日吗？')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('删除成功');
      fetchAnniversaries();
    } else {
      showToast(result.message || '删除失败', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('网络错误', 'error');
  }
}

function handleFilterChange(e) {
  currentFilter = e.target.value;
  renderList();
}

elements.addBtn.addEventListener('click', openAddModal);
elements.closeModal.addEventListener('click', closeModal);
elements.cancelBtn.addEventListener('click', closeModal);
elements.form.addEventListener('submit', handleFormSubmit);
elements.typeFilter.addEventListener('change', handleFilterChange);

elements.modal.addEventListener('click', (e) => {
  if (e.target === elements.modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
    closeModal();
  }
});

window.openEditModal = openEditModal;
window.deleteAnniversary = deleteAnniversary;

fetchAnniversaries();
