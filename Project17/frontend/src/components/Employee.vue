<template>
  <div class="employee-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.departmentId" placeholder="请选择部门" clearable>
            <el-option
              v-for="item in departments"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在职" value="在职"></el-option>
            <el-option label="离职" value="离职"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
          <el-button type="success" @click="add">新增员工</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="employees" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名" width="100"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80"></el-table-column>
        <el-table-column prop="departmentName" label="部门" width="120"></el-table-column>
        <el-table-column prop="position" label="职位" width="120"></el-table-column>
        <el-table-column prop="phone" label="电话" width="130"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="80"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="edit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteEmployee(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择部门">
            <el-option
              v-for="item in departments"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position"></el-input>
        </el-form-item>
        <el-form-item label="入职日期" prop="joinDate">
          <el-date-picker
            v-model="form.joinDate"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="在职">在职</el-radio>
            <el-radio label="离职">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="form.address"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Employee',
  data() {
    return {
      searchForm: {
        name: '',
        departmentId: null,
        status: ''
      },
      employees: [],
      departments: [],
      dialogVisible: false,
      dialogTitle: '新增员工',
      form: {
        id: null,
        name: '',
        gender: '男',
        birthday: '',
        phone: '',
        email: '',
        address: '',
        departmentId: null,
        position: '',
        joinDate: '',
        status: '在职'
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
        departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  mounted() {
    this.loadDepartments()
    this.search()
  },
  methods: {
    loadDepartments() {
      this.$http.get('/api/department/list').then(res => {
        if (res.data.code === 200) {
          this.departments = res.data.data
        }
      })
    },
    search() {
      const params = {}
      if (this.searchForm.name) params.name = this.searchForm.name
      if (this.searchForm.departmentId) params.departmentId = this.searchForm.departmentId
      if (this.searchForm.status) params.status = this.searchForm.status

      if (Object.keys(params).length === 0) {
        this.$http.get('/api/employee/list').then(res => {
          if (res.data.code === 200) {
            this.employees = res.data.data
          }
        })
      } else {
        this.$http.get('/api/employee/search', { params }).then(res => {
          if (res.data.code === 200) {
            this.employees = res.data.data
          }
        })
      }
    },
    reset() {
      this.searchForm = {
        name: '',
        departmentId: null,
        status: ''
      }
      this.search()
    },
    add() {
      this.dialogTitle = '新增员工'
      this.form = {
        id: null,
        name: '',
        gender: '男',
        birthday: '',
        phone: '',
        email: '',
        address: '',
        departmentId: null,
        position: '',
        joinDate: '',
        status: '在职'
      }
      this.dialogVisible = true
    },
    edit(row) {
      this.dialogTitle = '编辑员工'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    submit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          if (this.form.id) {
            this.$http.put('/api/employee', this.form).then(res => {
              if (res.data.code === 200) {
                this.$message.success(res.data.message)
                this.dialogVisible = false
                this.search()
              } else {
                this.$message.error(res.data.message)
              }
            })
          } else {
            this.$http.post('/api/employee', this.form).then(res => {
              if (res.data.code === 200) {
                this.$message.success(res.data.message)
                this.dialogVisible = false
                this.search()
              } else {
                this.$message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    deleteEmployee(row) {
      this.$confirm('确认要删除该员工吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/employee/${row.id}`).then(res => {
          if (res.data.code === 200) {
            this.$message.success(res.data.message)
            this.search()
          } else {
            this.$message.error(res.data.message)
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.employee-container {
  padding: 10px;
}

.search-card, .table-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 10px;
}
</style>
