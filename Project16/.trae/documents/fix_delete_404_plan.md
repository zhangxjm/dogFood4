# 修复图书删除接口 404 问题

## 问题分析

用户点击图书管理页面的"删除"按钮时，接口返回 HTTP 404：
- 请求 URL: `http://localhost:8000/api/books/2`
- 代码中构造的 URL: `/api/books/${id}/` (带尾部斜杠)

**根本原因：** Django REST Framework 的 `DefaultRouter` 生成的路由需要严格匹配尾部斜杠。对于非 GET 请求（如 DELETE），Django 的 `APPEND_SLASH` 中间件不会自动添加斜杠并重定向。

当前前端代码虽然请求的是带斜杠的 URL，但实际浏览器网络请求显示的是不带斜杠的 URL，可能是浏览器或 fetch 的某些行为导致。

## 解决方案

采用**双重保障**策略：

### 方案一：修改前端代码（确保请求 URL 不带尾部斜杠）
移除 DELETE 请求 URL 中的尾部斜杠，与 DRF 路由的两种格式都兼容。

### 方案二：配置 DRF SimpleRouter + 允许两种 URL 格式
使用 `SimpleRouter` 的 `trailing_slash=False` 或在后端添加额外路由以支持不带斜杠的 URL。

## 修改文件

1. **frontend/app.js**
   - 修改 `deleteBook` 函数，移除 URL 尾部斜杠
   - 修改 `deleteStudent` 函数，移除 URL 尾部斜杠（保持一致）

2. **books/urls.py**
   - 可选：使用 `SimpleRouter` 并设置 `trailing_slash=False`，使路由不带斜杠

## 执行步骤

1. 修改 `frontend/app.js` 中删除函数的 URL 格式
2. 验证 DELETE 请求正常工作
3. 测试学生删除功能是否也正常

## 风险评估

- 低风险：仅修改 URL 格式，不影响业务逻辑
- 前端修改后需要刷新浏览器才能生效
