from datetime import datetime
from app import db

class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    members = db.relationship('Member', backref='department', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'member_count': self.members.count()
        }

class Member(db.Model):
    __tablename__ = 'members'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(50), nullable=False, unique=True)
    gender = db.Column(db.String(10))
    grade = db.Column(db.String(50))
    major = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    position = db.Column(db.String(100))
    join_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    transition_records = db.relationship('TransitionRecord', backref='member', lazy='dynamic', 
                                          cascade='all, delete-orphan')
    
    def to_dict(self):
        dept_name = self.department.name if self.department else '未分配'
        return {
            'id': self.id,
            'name': self.name,
            'student_id': self.student_id,
            'gender': self.gender,
            'grade': self.grade,
            'major': self.major,
            'phone': self.phone,
            'email': self.email,
            'department_id': self.department_id,
            'department_name': dept_name,
            'position': self.position,
            'join_date': str(self.join_date) if self.join_date else None,
            'status': self.status
        }

class Transition(db.Model):
    __tablename__ = 'transitions'
    
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    records = db.relationship('TransitionRecord', backref='transition', lazy='dynamic',
                              cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'year': self.year,
            'semester': self.semester,
            'description': self.description,
            'record_count': self.records.count(),
            'created_at': str(self.created_at)
        }

class TransitionRecord(db.Model):
    __tablename__ = 'transition_records'
    
    id = db.Column(db.Integer, primary_key=True)
    transition_id = db.Column(db.Integer, db.ForeignKey('transitions.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    old_position = db.Column(db.String(100))
    new_position = db.Column(db.String(100))
    old_department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    new_department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    old_dept = db.relationship('Department', foreign_keys=[old_department_id])
    new_dept = db.relationship('Department', foreign_keys=[new_department_id])
    
    def to_dict(self):
        old_dept_name = self.old_dept.name if self.old_dept else '无'
        new_dept_name = self.new_dept.name if self.new_dept else '无'
        member_name = self.member.name if self.member else '未知'
        return {
            'id': self.id,
            'member_id': self.member_id,
            'member_name': member_name,
            'old_position': self.old_position or '无',
            'new_position': self.new_position or '无',
            'old_department': old_dept_name,
            'new_department': new_dept_name,
            'notes': self.notes,
            'created_at': str(self.created_at)
        }
