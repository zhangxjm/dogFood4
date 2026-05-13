
<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom">
                <h3 class="mb-0">
                    <i class="bi bi-plus-circle text-primary me-2"></i>发布新岗位
                </h3>
            </div>
            <div class="card-body">
                {{if .Error}}
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>{{.Error}}
                </div>
                {{end}}

                <form method="POST" action="/create" novalidate>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="title" class="form-label fw-bold">
                                <i class="bi bi-briefcase me-1 text-primary"></i>岗位名称 <span class="text-danger">*</span>
                            </label>
                            <input type="text" class="form-control" id="title" name="title" placeholder="如：校园图书管理员" required>
                        </div>
                        <div class="col-md-6">
                            <label for="company" class="form-label fw-bold">
                                <i class="bi bi-building me-1 text-primary"></i>招聘单位 <span class="text-danger">*</span>
                            </label>
                            <input type="text" class="form-control" id="company" name="company" placeholder="如：校园图书馆" required>
                        </div>

                        <div class="col-12">
                            <label for="description" class="form-label fw-bold">
                                <i class="bi bi-file-text me-1 text-primary"></i>岗位描述
                            </label>
                            <textarea class="form-control" id="description" name="description" rows="4" placeholder="请详细描述工作内容..."></textarea>
                        </div>

                        <div class="col-md-6">
                            <label for="salary" class="form-label fw-bold">
                                <i class="bi bi-currency-yen me-1 text-primary"></i>薪资待遇
                            </label>
                            <input type="text" class="form-control" id="salary" name="salary" placeholder="如：15元/小时">
                        </div>
                        <div class="col-md-6">
                            <label for="location" class="form-label fw-bold">
                                <i class="bi bi-geo-alt me-1 text-primary"></i>工作地点
                            </label>
                            <input type="text" class="form-control" id="location" name="location" placeholder="如：校图书馆">
                        </div>

                        <div class="col-md-6">
                            <label for="work_time" class="form-label fw-bold">
                                <i class="bi bi-clock me-1 text-primary"></i>工作时间
                            </label>
                            <input type="text" class="form-control" id="work_time" name="work_time" placeholder="如：每周10-15小时">
                        </div>
                        <div class="col-md-6">
                            <label for="requirement" class="form-label fw-bold">
                                <i class="bi bi-clipboard-check me-1 text-primary"></i>任职要求
                            </label>
                            <input type="text" class="form-control" id="requirement" name="requirement" placeholder="如：细心负责">
                        </div>

                        <div class="col-12">
                            <label for="contact" class="form-label fw-bold">
                                <i class="bi bi-envelope me-1 text-primary"></i>联系方式
                            </label>
                            <input type="text" class="form-control" id="contact" name="contact" placeholder="邮箱或电话">
                        </div>

                        <div class="col-12 pt-3">
                            <div class="d-flex justify-content-end gap-2">
                                <a href="/" class="btn btn-secondary">
                                    <i class="bi bi-arrow-left me-1"></i>返回
                                </a>
                                <button type="reset" class="btn btn-outline-secondary">
                                    <i class="bi bi-x-circle me-1"></i>重置
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle me-1"></i>发布岗位
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
