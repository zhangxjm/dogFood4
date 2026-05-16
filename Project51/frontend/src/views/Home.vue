<template>
  <div class="home">
    <div class="jumbotron bg-light p-5 rounded mb-4">
      <h1 class="display-4">欢迎使用医院挂号系统</h1>
      <p class="lead">便捷的在线挂号服务，让就医更简单</p>
      <hr class="my-4">
      <div class="row mt-4">
        <div class="col-md-3 mb-3">
          <div class="card text-center h-100">
            <div class="card-body">
              <h5 class="card-title text-primary">科室管理</h5>
              <p class="card-text">管理医院各科室信息</p>
              <router-link to="/departments" class="btn btn-primary">进入</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card text-center h-100">
            <div class="card-body">
              <h5 class="card-title text-primary">医生管理</h5>
              <p class="card-text">管理医生信息和职称</p>
              <router-link to="/doctors" class="btn btn-primary">进入</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card text-center h-100">
            <div class="card-body">
              <h5 class="card-title text-primary">排班管理</h5>
              <p class="card-text">安排医生出诊时间</p>
              <router-link to="/schedules" class="btn btn-primary">进入</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card text-center h-100">
            <div class="card-body">
              <h5 class="card-title text-primary">在线挂号</h5>
              <p class="card-text">快速完成挂号预约</p>
              <router-link to="/registration" class="btn btn-primary">进入</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
