<template>
  <div class="department-container">
    <el-card class="table-card">
      <div style="margin-bottom: 20px;">
        <el-button type="success" @click="add">新增部门</el-button>
      </div>
      <el-table :data="departments" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="部门名称" width="200"></el-table-column>
        <el-table-column prop="description" label="部门描述"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="edit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteDepartment(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="部门描述">
          <el-input type="textarea" v-model="form.description" :rows="3"></el-input>
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
  name: 'Department',
  data() {
    return {
      departments: [],
      dialogVisible: false,
      dialogTitle: '新增部门',
      form: {
        id: null,
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadDepartments()
  },
  methods: {
    loadDepartments() {
      this.$http.get('/api/department/list').then(res => {
        if (res.data.code === 200) {
          this.departments = res.data.data
        }
      })
    },
    add() {
      this.dialogTitle = '新增部门'
      this.form = {
        id: null,
        name: '',
        description: ''
      }
      this.dialogVisible = true
    },
    edit(row) {
      this.dialogTitle = '编辑部门'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    submit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          if (this.form.id) {
            this.$http.put('/api/department', this.form).then(res => {
              if (res.data.code === 200) {
                this.$message.success(res.data.message)
                this.dialogVisible = false
                this.loadDepartments()
              } else {
                this.$message.error(res.data.message)
              }
            })
          } else {
            this.$http.post('/api/department', this.form).then(res => {
              if (res.data.code === 200) {
                this.$message.success(res.data.message)
                this.dialogVisible = false
                this.loadDepartments()
              } else {
                this.$message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    deleteDepartment(row) {
      this.$confirm('确认要删除该部门吗？如果部门下有员工将无法删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/department/${row.id}`).then(res => {
          if (res.data.code === 200) {
            this.$message.success(res.data.message)
            this.loadDepartments()
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
.department-container {
  padding: 10px;
}

.table-card {
  margin-bottom: 20px;
}
</style>
