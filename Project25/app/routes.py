from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from datetime import datetime
from app import db
from app.models import Department, Member, Transition, TransitionRecord

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/api/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments])

@main.route('/api/departments', methods=['POST'])
def create_department():
    data = request.json
    if not data.get('name'):
        return jsonify({'error': '部门名称不能为空'}), 400
    
    existing = Department.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': '部门名称已存在'}), 400
    
    department = Department(
        name=data['name'],
        description=data.get('description', '')
    )
    db.session.add(department)
    db.session.commit()
    return jsonify(department.to_dict()), 201

@main.route('/api/departments/<int:id>', methods=['PUT'])
def update_department(id):
    department = Department.query.get_or_404(id)
    data = request.json
    
    if data.get('name') and data['name'] != department.name:
        existing = Department.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'error': '部门名称已存在'}), 400
        department.name = data['name']
    
    if 'description' in data:
        department.description = data['description']
    
    db.session.commit()
    return jsonify(department.to_dict())

@main.route('/api/departments/<int:id>', methods=['DELETE'])
def delete_department(id):
    department = Department.query.get_or_404(id)
    
    if department.members.count() > 0:
        return jsonify({'error': '该部门下还有成员，无法删除'}), 400
    
    db.session.delete(department)
    db.session.commit()
    return jsonify({'message': '删除成功'})

@main.route('/api/members', methods=['GET'])
def get_members():
    department_id = request.args.get('department_id', type=int)
    status = request.args.get('status')
    keyword = request.args.get('keyword', '').strip()
    
    query = Member.query
    
    if department_id:
        query = query.filter_by(department_id=department_id)
    
    if status:
        query = query.filter_by(status=status)
    
    if keyword:
        query = query.filter(
            (Member.name.like(f'%{keyword}%')) |
            (Member.student_id.like(f'%{keyword}%')) |
            (Member.major.like(f'%{keyword}%'))
        )
    
    members = query.order_by(Member.id.desc()).all()
    return jsonify([m.to_dict() for m in members])

@main.route('/api/members/<int:id>', methods=['GET'])
def get_member(id):
    member = Member.query.get_or_404(id)
    return jsonify(member.to_dict())

@main.route('/api/members', methods=['POST'])
def create_member():
    data = request.json
    
    if not data.get('name') or not data.get('student_id'):
        return jsonify({'error': '姓名和学号不能为空'}), 400
    
    existing = Member.query.filter_by(student_id=data['student_id']).first()
    if existing:
        return jsonify({'error': '学号已存在'}), 400
    
    join_date = None
    if data.get('join_date'):
        try:
            join_date = datetime.strptime(data['join_date'], '%Y-%m-%d').date()
        except:
            pass
    
    member = Member(
        name=data['name'],
        student_id=data['student_id'],
        gender=data.get('gender'),
        grade=data.get('grade'),
        major=data.get('major'),
        phone=data.get('phone'),
        email=data.get('email'),
        department_id=data.get('department_id'),
        position=data.get('position'),
        join_date=join_date,
        status=data.get('status', 'active')
    )
    db.session.add(member)
    db.session.commit()
    return jsonify(member.to_dict()), 201

@main.route('/api/members/<int:id>', methods=['PUT'])
def update_member(id):
    member = Member.query.get_or_404(id)
    data = request.json
    
    if data.get('student_id') and data['student_id'] != member.student_id:
        existing = Member.query.filter_by(student_id=data['student_id']).first()
        if existing:
            return jsonify({'error': '学号已存在'}), 400
        member.student_id = data['student_id']
    
    if 'name' in data:
        member.name = data['name']
    if 'gender' in data:
        member.gender = data['gender']
    if 'grade' in data:
        member.grade = data['grade']
    if 'major' in data:
        member.major = data['major']
    if 'phone' in data:
        member.phone = data['phone']
    if 'email' in data:
        member.email = data['email']
    if 'department_id' in data:
        member.department_id = data['department_id']
    if 'position' in data:
        member.position = data['position']
    if 'status' in data:
        member.status = data['status']
    
    if data.get('join_date'):
        try:
            member.join_date = datetime.strptime(data['join_date'], '%Y-%m-%d').date()
        except:
            pass
    
    db.session.commit()
    return jsonify(member.to_dict())

@main.route('/api/members/<int:id>', methods=['DELETE'])
def delete_member(id):
    member = Member.query.get_or_404(id)
    db.session.delete(member)
    db.session.commit()
    return jsonify({'message': '删除成功'})

@main.route('/api/transitions', methods=['GET'])
def get_transitions():
    transitions = Transition.query.order_by(Transition.year.desc(), Transition.id.desc()).all()
    return jsonify([t.to_dict() for t in transitions])

@main.route('/api/transitions/<int:id>', methods=['GET'])
def get_transition(id):
    transition = Transition.query.get_or_404(id)
    records = [r.to_dict() for r in transition.records.all()]
    return jsonify({
        **transition.to_dict(),
        'records': records
    })

@main.route('/api/transitions', methods=['POST'])
def create_transition():
    data = request.json
    
    if not data.get('year') or not data.get('semester'):
        return jsonify({'error': '年份和学期不能为空'}), 400
    
    transition = Transition(
        year=data['year'],
        semester=data['semester'],
        description=data.get('description', '')
    )
    db.session.add(transition)
    db.session.commit()
    return jsonify(transition.to_dict()), 201

@main.route('/api/transitions/<int:id>', methods=['DELETE'])
def delete_transition(id):
    transition = Transition.query.get_or_404(id)
    db.session.delete(transition)
    db.session.commit()
    return jsonify({'message': '删除成功'})

@main.route('/api/transitions/<int:transition_id>/records', methods=['POST'])
def add_transition_record(transition_id):
    transition = Transition.query.get_or_404(transition_id)
    data = request.json
    
    if not data.get('member_id'):
        return jsonify({'error': '请选择成员'}), 400
    
    member = Member.query.get(data['member_id'])
    if not member:
        return jsonify({'error': '成员不存在'}), 400
    
    old_position = member.position
    old_department_id = member.department_id
    
    record = TransitionRecord(
        transition_id=transition.id,
        member_id=member.id,
        old_position=old_position,
        new_position=data.get('new_position'),
        old_department_id=old_department_id,
        new_department_id=data.get('new_department_id'),
        notes=data.get('notes', '')
    )
    
    if data.get('new_position'):
        member.position = data['new_position']
    if data.get('new_department_id') is not None:
        member.department_id = data.get('new_department_id')
    
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201

@main.route('/api/transitions/records/<int:id>', methods=['DELETE'])
def delete_transition_record(id):
    record = TransitionRecord.query.get_or_404(id)
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': '删除成功'})

@main.route('/api/stats')
def get_stats():
    total_members = Member.query.count()
    active_members = Member.query.filter_by(status='active').count()
    total_departments = Department.query.count()
    total_transitions = Transition.query.count()
    
    dept_stats = []
    for dept in Department.query.all():
        count = dept.members.filter_by(status='active').count()
        dept_stats.append({
            'id': dept.id,
            'name': dept.name,
            'count': count
        })
    
    return jsonify({
        'total_members': total_members,
        'active_members': active_members,
        'total_departments': total_departments,
        'total_transitions': total_transitions,
        'department_stats': dept_stats
    })
