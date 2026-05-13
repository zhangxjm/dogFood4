
<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="mb-1">
            <i class="bi bi-briefcase text-primary me-2"></i>兼职岗位列表
        </h2>
        <p class="text-muted mb-0">发现适合你的校园兼职机会</p>
    </div>
    <a href="/create" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle me-2"></i>发布新岗位
    </a>
</div>

{{if .Error}}
<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="bi bi-exclamation-triangle me-2"></i>{{.Error}}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
{{end}}

{{if .Jobs}}
<div class="row g-4">
    {{range .Jobs}}
    <div class="col-md-6 col-lg-4">
        <div class="card job-card h-100">
            <div class="card-body">
                <h5 class="card-title text-primary mb-2">
                    <i class="bi bi-briefcase me-1"></i>{{.Title}}
                </h5>
                <h6 class="card-subtitle text-muted mb-3">
                    <i class="bi bi-building me-1"></i>{{.Company}}
                </h6>
                
                <div class="mb-3">
                    <span class="badge badge-salary rounded-pill me-2">
                        <i class="bi bi-currency-yen me-1"></i>{{.Salary}}
                    </span>
                    <span class="badge badge-location rounded-pill">
                        <i class="bi bi-geo-alt me-1"></i>{{.Location}}
                    </span>
                </div>
                
                <p class="card-text text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{.Description}}
                </p>
                
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="bi bi-clock me-1"></i>{{.CreatedAt.Format "2006-01-02"}}
                    </small>
                    <div class="btn-group">
                        <a href="/job/{{.ID}}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-eye"></i> 详情
                        </a>
                        <a href="/edit/{{.ID}}" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <button onclick="confirmDelete({{.ID}})" class="btn btn-sm btn-outline-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {{end}}
</div>
{{else}}
<div class="text-center py-5">
    <i class="bi bi-inbox display-1 text-muted mb-3"></i>
    <h4 class="text-muted">暂无兼职岗位</h4>
    <p class="text-muted mb-4">点击上方按钮发布第一个岗位吧！</p>
    <a href="/create" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle me-2"></i>立即发布
    </a>
</div>
{{end}}
