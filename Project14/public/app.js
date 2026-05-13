const API_BASE = '/api';
let allCategories = [];
let selectedType = 'expense';

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function formatMoney(num) {
  return '¥' + Number(num || 0).toFixed(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

function getTodayStr() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCategoryIcon(name) {
  const cat = allCategories.find(c => c.name === name);
  return cat ? cat.icon : '📝';
}

async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();
  if (data.success) {
    allCategories = data.data;
    renderCategoryList();
  }
}

function renderCategoryList() {
  const container = document.getElementById('category-list');
  const cats = allCategories.filter(c => c.type === selectedType);
  container.innerHTML = '';
  cats.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.textContent = `${cat.icon} ${cat.name}`;
    div.dataset.name = cat.name;
    div.onclick = () => selectCategory(div);
    container.appendChild(div);
  });
  document.getElementById('category').value = '';
}

function selectCategory(el) {
  document.querySelectorAll('.category-item').forEach(item => item.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('category').value = el.dataset.name;
}

async function submitRecord(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;

  if (!amount || !category || !date) {
    showToast('请填写完整信息');
    return;
  }

  const record = {
    amount,
    type: selectedType,
    category,
    description,
    date: new Date(date).toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    const data = await res.json();
    if (data.success) {
      showToast('保存成功');
      e.target.reset();
      document.getElementById('date').value = getTodayStr();
      document.querySelectorAll('.category-item').forEach(item => item.classList.remove('selected'));
      document.getElementById('category').value = '';
    } else {
      showToast(data.message || '保存失败');
    }
  } catch (err) {
    showToast('网络错误');
  }
}

async function loadMonthStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/month`);
    const data = await res.json();
    if (data.success) {
      const d = data.data;
      document.getElementById('month-income').textContent = formatMoney(d.totalIncome);
      document.getElementById('month-expense').textContent = formatMoney(d.totalExpense);
      document.getElementById('month-balance').textContent = formatMoney(d.balance);
      
      const statsEl = document.getElementById('category-stats');
      if (d.categoryStats.length === 0) {
        statsEl.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>暂无数据</p></div>';
      } else {
        statsEl.innerHTML = d.categoryStats.map(s => `
          <div class="stat-item">
            <div class="stat-icon">${getCategoryIcon(s.category)}</div>
            <div class="stat-info">
              <span>${s.category}</span>
              <small>${s.type === 'income' ? '收入' : '支出'}</small>
            </div>
            <div class="stat-amount ${s.type}">${s.type === 'income' ? '+' : '-'}${formatMoney(s.total)}</div>
          </div>
        `).join('');
      }
      
      renderRecords('month-records', d.records);
    }
  } catch (err) {
    console.error(err);
  }
}

function renderRecords(containerId, records) {
  const container = document.getElementById(containerId);
  if (records.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>暂无记录</p></div>';
    return;
  }
  
  container.innerHTML = records.map(r => `
    <div class="record-item">
      <div class="record-icon">${getCategoryIcon(r.category)}</div>
      <div class="record-info">
        <div class="category">${r.category}</div>
        <div class="desc">${r.description || '—'}</div>
      </div>
      <div class="record-right">
        <div class="amount ${r.type}">${r.type === 'income' ? '+' : '-'}${formatMoney(r.amount)}</div>
        <div class="date">${formatDate(r.date)}</div>
      </div>
      <button class="delete-btn" onclick="deleteRecord('${r._id}')">删除</button>
    </div>
  `).join('');
}

async function deleteRecord(id) {
  if (!confirm('确定要删除这条记录吗？')) return;
  try {
    const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('删除成功');
      loadMonthStats();
    } else {
      showToast(data.message || '删除失败');
    }
  } catch (err) {
    showToast('网络错误');
  }
}

async function searchHistory(e) {
  e.preventDefault();
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const type = document.getElementById('filter-type').value;
  
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (type) params.set('type', type);
  
  try {
    const res = await fetch(`${API_BASE}/records?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      renderRecords('history-records', data.data);
    }
  } catch (err) {
    showToast('查询失败');
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = content.id === `${tabName}-tab` ? 'block' : 'none';
  });
  if (tabName === 'flow') {
    loadMonthStats();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').value = getTodayStr();
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });
  
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
      renderCategoryList();
    };
  });
  
  document.getElementById('record-form').addEventListener('submit', submitRecord);
  document.getElementById('history-form').addEventListener('submit', searchHistory);
  
  fetchCategories();
});
