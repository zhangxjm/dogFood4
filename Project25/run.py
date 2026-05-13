from app import create_app, db
from app.models import Department

app = create_app()

def init_departments():
    with app.app_context():
        if Department.query.count() == 0:
            default_departments = [
                ('主席团', '社团核心管理层'),
                ('秘书处', '负责社团日常事务和文档管理'),
                ('宣传部', '负责社团宣传和活动推广'),
                ('组织部', '负责社团活动组织和策划'),
                ('外联部', '负责对外联络和资源整合'),
                ('技术部', '负责技术支持和开发工作')
            ]
            for name, desc in default_departments:
                dept = Department(name=name, description=desc)
                db.session.add(dept)
            db.session.commit()
            print('已初始化默认部门')

if __name__ == '__main__':
    init_departments()
    app.run(host='0.0.0.0', port=5000, debug=True)
