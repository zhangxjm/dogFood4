const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testLogin(username, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password
    });
    console.log(`✅ 登录成功: ${username}, 角色: ${response.data.role}`);
    return response.data;
  } catch (error) {
    console.log(`❌ 登录失败: ${username}, 错误: ${error.message}`);
    throw error;
  }
}

async function testConcurrentLogins() {
  console.log('\n=== 并发登录测试 ===');
  const users = [
    { username: 'student1', password: '123456' },
    { username: 'student2', password: '123456' },
    { username: 'student3', password: '123456' },
    { username: 'teacher1', password: '123456' },
    { username: 'teacher2', password: '123456' },
  ];

  console.log(`开始 ${users.length} 个并发登录请求...`);
  const startTime = Date.now();

  try {
    const results = await Promise.all(
      users.map(user => testLogin(user.username, user.password))
    );
    const endTime = Date.now();
    console.log(`\n✅ 全部登录成功! 总耗时: ${endTime - startTime}ms`);
    return results;
  } catch (error) {
    console.log('\n❌ 部分请求失败');
  }
}

async function testConcurrentGetRequests() {
  console.log('\n=== 并发GET请求测试 ===');
  const requests = [
    { name: '获取请假类型', url: `${API_BASE}/leave-types/enabled` },
    { name: '获取班级统计', url: `${API_BASE}/statistics/all-classes` },
    { name: '获取所有请假', url: `${API_BASE}/leaves/all` },
  ];

  console.log(`开始 ${requests.length} 个并发GET请求...`);
  const startTime = Date.now();

  try {
    const results = await Promise.all(
      requests.map(async (req) => {
        const response = await axios.get(req.url);
        console.log(`✅ ${req.name} 成功, 数据量: ${Array.isArray(response.data) ? response.data.length : 1} 条`);
        return response.data;
      })
    );
    const endTime = Date.now();
    console.log(`\n✅ 全部GET请求成功! 总耗时: ${endTime - startTime}ms`);
    return results;
  } catch (error) {
    console.log(`\n❌ 请求失败: ${error.message}`);
  }
}

async function testHighConcurrency() {
  console.log('\n=== 高并发压力测试 (20个请求) ===');
  const requestCount = 20;
  const requests = [];

  for (let i = 0; i < requestCount; i++) {
    requests.push(axios.get(`${API_BASE}/leave-types/enabled`));
  }

  console.log(`开始 ${requestCount} 个并发请求...`);
  const startTime = Date.now();

  try {
    await Promise.all(requests);
    const endTime = Date.now();
    console.log(`✅ 全部 ${requestCount} 个请求成功! 总耗时: ${endTime - startTime}ms`);
    console.log(`平均每个请求: ${((endTime - startTime) / requestCount).toFixed(2)}ms`);
  } catch (error) {
    console.log(`❌ 高并发测试失败: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 开始API并发测试...\n');
  
  await testConcurrentLogins();
  await testConcurrentGetRequests();
  await testHighConcurrency();
  
  console.log('\n🎉 所有并发测试完成!');
}

main().catch(console.error);
