<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>访客登记系统</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <div class="container">
        <h1>访客登记系统</h1>

        <div class="card">
            <h2>访客登记</h2>
            <form id="visitorForm">
                <div class="form-group">
                    <label for="name">姓名</label>
                    <input type="text" id="name" name="name" required placeholder="请输入姓名">
                </div>
                <div class="form-group">
                    <label for="phone">手机号</label>
                    <input type="tel" id="phone" name="phone" required placeholder="请输入手机号">
                </div>
                <div class="form-group">
                    <label for="purpose">来访事由</label>
                    <textarea id="purpose" name="purpose" required placeholder="请输入来访事由" rows="3"></textarea>
                </div>
                <button type="submit" class="btn">提交登记</button>
            </form>
        </div>

        <div class="card">
            <h2>历史访客</h2>
            <div class="search-bar">
                <input type="text" id="searchKeyword" placeholder="搜索姓名或手机号">
                <button class="btn" onclick="searchVisitors()">搜索</button>
                <button class="btn btn-secondary" onclick="loadVisitors()">刷新</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>姓名</th>
                            <th>手机号</th>
                            <th>来访事由</th>
                            <th>来访时间</th>
                        </tr>
                    </thead>
                    <tbody id="visitorList">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="/static/js/app.js"></script>
</body>
</html>
