document.addEventListener('DOMContentLoaded', function() {
    loadVisitors();

    const form = document.getElementById('visitorForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm();
    });
});

function submitForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const purpose = document.getElementById('purpose').value.trim();

    if (!name || !phone || !purpose) {
        alert('请填写完整信息');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('purpose', purpose);

    fetch('/visitor/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('登记成功！');
            document.getElementById('visitorForm').reset();
            loadVisitors();
        } else {
            alert('登记失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('网络错误，请重试');
    });
}

function loadVisitors() {
    fetch('/visitor/list')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                renderTable(data.data);
            } else {
                console.error('加载失败:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function searchVisitors() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    const url = keyword ? '/visitor/list?keyword=' + encodeURIComponent(keyword) : '/visitor/list';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                renderTable(data.data);
            } else {
                console.error('搜索失败:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function renderTable(visitors) {
    const tbody = document.getElementById('visitorList');
    if (!visitors || visitors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = visitors.map((v, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(v.name)}</td>
            <td>${escapeHtml(v.phone)}</td>
            <td>${escapeHtml(v.purpose)}</td>
            <td>${escapeHtml(v.visit_time)}</td>
        </tr>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
