from flask import Blueprint, request, jsonify
from app import db
from app.models import Category

bp = Blueprint('category', __name__, url_prefix='/api/categories')

@bp.route('/', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories])

@bp.route('/', methods=['POST'])
def create_category():
    data = request.get_json()
    
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Category already exists'}), 400
    
    category = Category(
        name=data['name'],
        icon=data.get('icon', ''),
        description=data.get('description', '')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify(category.to_dict()), 201

def init_default_categories():
    default_categories = [
        {'name': '国内游', 'icon': '🏠', 'description': '探索国内美景'},
        {'name': '海外游', 'icon': '✈️', 'description': '出国旅行攻略'},
        {'name': '自驾游', 'icon': '🚗', 'description': '自驾旅行经验'},
        {'name': '徒步游', 'icon': '🥾', 'description': '徒步登山分享'},
        {'name': '美食游', 'icon': '🍜', 'description': '美食探索之旅'},
        {'name': '摄影游', 'icon': '📷', 'description': '摄影创作路线'}
    ]
    
    for cat_data in default_categories:
        if not Category.query.filter_by(name=cat_data['name']).first():
            category = Category(**cat_data)
            db.session.add(category)
    
    db.session.commit()
