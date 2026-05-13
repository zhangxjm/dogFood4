<template>
  <div class="home-container">
    <el-container>
      <el-header class="header">
        <h1>员工档案管理系统</h1>
      </el-header>
      <el-main>
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="员工管理" name="employee">
            <EmployeeComponent></EmployeeComponent>
          </el-tab-pane>
          <el-tab-pane label="部门管理" name="department">
            <DepartmentComponent></DepartmentComponent>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import EmployeeComponent from '../components/Employee.vue'
import DepartmentComponent from '../components/Department.vue'

export default {
  name: 'Home',
  components: {
    EmployeeComponent,
    DepartmentComponent
  },
  data() {
    return {
      activeTab: 'employee'
    }
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}

.header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 30px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
