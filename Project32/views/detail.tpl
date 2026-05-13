
{{with .Job}}
<div class="row justify-content-center">
    <div class="col-lg-10">
        <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/">岗位列表</a></li>
                <li class="breadcrumb-item active" aria-current="page">岗位详情</li>
            </ol>
        </nav>

        <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="mb-0 text-primary">
                        <i class="bi bi-briefcase me-2"></i>{{.Title}}
                    </h2>
                    <small class="text-muted">
                        <i class="bi bi-building me-1"></i>{{.Company}}
                    </small>
                </div>
                <div class="btn-group">
                    <a href="/edit/{{.ID}}" class="btn btn-outline-secondary">
                        <i class="bi bi-pencil me-1"></i>编辑
                    </a>
                    <button onclick="confirmDelete({{.ID}})" class="btn btn-outline-danger">
                        <i class="bi bi-trash me-1"></i>删除
                    </button>
                </div>
            </div>
            <div class="card-body p-4">
                <div class="row g-4">
                    <div class="col-md-8">
                        <div class="mb-4">
                            <h5 class="mb-3">
                                <i class="bi bi-file-text text-primary me-2"></i>岗位描述
                            </h5>
                            <p class="text-muted">{{if .Description}}{{.Description}}{{else}}暂无描述{{end}}</p>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-3">
                                <i class="bi bi-clipboard-check text-primary me-2"></i>任职要求
                            </h5>
                            <p class="text-muted">{{if .Requirement}}{{.Requirement}}{{else}}暂无要求{{end}}</p>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card bg-light border-0">
                            <div class="card-body">
                                <h5 class="mb-3">
                                    <i class="bi bi-info-circle text-primary me-2"></i>岗位信息
                                </h5>

                                <div class="mb-3">
                                    <small class="text-muted d-block">薪资待遇</small>
                                    <span class="badge badge-salary rounded-pill fs-6">
                                        <i class="bi bi-currency-yen me-1"></i>{{if .Salary}}{{.Salary}}{{else}}面议{{end}}
                                    </span>
                                </div>

                                <div class="mb-3">
                                    <small class="text-muted d-block">工作地点</small>
                                    <span class="badge badge-location rounded-pill fs-6">
                                        <i class="bi bi-geo-alt me-1"></i>{{if .Location}}{{.Location}}{{else}}待补充{{end}}
                                    </span>
                                </div>

                                <div class="mb-3">
                                    <small class="text-muted d-block">工作时间</small>
                                    <p class="mb-0 fw-medium">
                                        <i class="bi bi-clock me-1 text-secondary"></i>{{if .WorkTime}}{{.WorkTime}}{{else}}待补充{{end}}
                                    </p>
                                </div>

                                <hr>

                                <div>
                                    <small class="text-muted d-block">联系方式</small>
                                    <p class="mb-0 fw-medium">
                                        <i class="bi bi-envelope me-1 text-secondary"></i>{{if .Contact}}{{.Contact}}{{else}}暂无{{end}}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3 small text-muted">
                            <p class="mb-1"><i class="bi bi-calendar-plus me-1"></i>发布时间：{{.CreatedAt.Format "2006-01-02 15:04"}}</p>
                            <p class="mb-0"><i class="bi bi-calendar3 me-1"></i>更新时间：{{.UpdatedAt.Format "2006-01-02 15:04"}}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white border-top text-end">
                <a href="/" class="btn btn-secondary">
                    <i class="bi bi-arrow-left me-1"></i>返回列表
                </a>
            </div>
        </div>
    </div>
</div>
{{end}}
