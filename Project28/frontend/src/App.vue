<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 每个页面公共css */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  padding: 20px;
  min-height: 100vh;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn {
  background-color: #007AFF;
  color: #ffffff;
  border-radius: 6px;
  padding: 12px 24px;
  text-align: center;
  font-size: 16px;
  margin-top: 8px;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  box-sizing: border-box;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.stat-card {
  text-align: center;
  flex: 1;
  margin: 0 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #007AFF;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}
</style>
