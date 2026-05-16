from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Guide, GuideImage, Category, Like, User
from datetime import datetime, timedelta
import os
import uuid
from werkzeug.utils import secure_filename

bp = Blueprint('guide', __name__, url_prefix='/api/guides')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_hot_score(guide):
    now = datetime.utcnow()
    age = (now - guide.created_at).total_seconds() / 3600
    like_count = len(guide.likes)
    comment_count = len(guide.comments)
    view_count = guide.view_count
    
    gravity = 1.8
    score = (like_count * 10 + comment_count * 5 + view_count) / pow(age + 2, gravity)
    return score

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    
    files = request.files.getlist('images')
    uploaded_urls = []
    
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            uploaded_urls.append(f"/api/uploads/{filename}")
    
    return jsonify({'urls': uploaded_urls})

@bp.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@bp.route('/', methods=['POST'])
@jwt_required()
def create_guide():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    guide = Guide(
        title=data['title'],
        content=data['content'],
        cover_image=data.get('cover_image', ''),
        location=data.get('location', ''),
        days=data.get('days', 1),
        budget=data.get('budget', 0),
        user_id=user_id,
        category_id=data['category_id']
    )
    
    db.session.add(guide)
    db.session.flush()
    
    images = data.get('images', [])
    for idx, img_url in enumerate(images):
        guide_img = GuideImage(
            guide_id=guide.id,
            image_url=img_url,
            order=idx
        )
        db.session.add(guide_img)
    
    db.session.commit()
    return jsonify(guide.to_dict()), 201

@bp.route('/', methods=['GET'])
def get_guides():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    sort = request.args.get('sort', 'latest')
    search = request.args.get('search', '')
    
    query = Guide.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if search:
        query = query.filter(Guide.title.ilike(f'%{search}%'))
    
    if sort == 'hot':
        guides = query.all()
        guides_with_score = [(g, calculate_hot_score(g)) for g in guides]
        guides_with_score.sort(key=lambda x: x[1], reverse=True)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_guides = [g[0] for g in guides_with_score[start:end]]
        total = len(guides_with_score)
    else:
        pagination = query.order_by(Guide.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        paginated_guides = pagination.items
        total = pagination.total
    
    return jsonify({
        'guides': [g.to_dict(include_content=False) for g in paginated_guides],
        'total': total,
        'page': page,
        'per_page': per_page
    })

@bp.route('/hot', methods=['GET'])
def get_hot_guides():
    limit = request.args.get('limit', 5, type=int)
    guides = Guide.query.all()
    guides_with_score = [(g, calculate_hot_score(g)) for g in guides]
    guides_with_score.sort(key=lambda x: x[1], reverse=True)
    hot_guides = [g[0] for g in guides_with_score[:limit]]
    return jsonify([g.to_dict(include_content=False) for g in hot_guides])

@bp.route('/<int:guide_id>', methods=['GET'])
def get_guide(guide_id):
    guide = Guide.query.get_or_404(guide_id)
    guide.view_count += 1
    db.session.commit()
    return jsonify(guide.to_dict())

@bp.route('/<int:guide_id>', methods=['PUT'])
@jwt_required()
def update_guide(guide_id):
    user_id = get_jwt_identity()
    guide = Guide.query.get_or_404(guide_id)
    
    if guide.user_id != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    guide.title = data.get('title', guide.title)
    guide.content = data.get('content', guide.content)
    guide.cover_image = data.get('cover_image', guide.cover_image)
    guide.location = data.get('location', guide.location)
    guide.days = data.get('days', guide.days)
    guide.budget = data.get('budget', guide.budget)
    guide.category_id = data.get('category_id', guide.category_id)
    
    GuideImage.query.filter_by(guide_id=guide_id).delete()
    images = data.get('images', [])
    for idx, img_url in enumerate(images):
        guide_img = GuideImage(
            guide_id=guide.id,
            image_url=img_url,
            order=idx
        )
        db.session.add(guide_img)
    
    db.session.commit()
    return jsonify(guide.to_dict())

@bp.route('/<int:guide_id>', methods=['DELETE'])
@jwt_required()
def delete_guide(guide_id):
    user_id = get_jwt_identity()
    guide = Guide.query.get_or_404(guide_id)
    
    if guide.user_id != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    db.session.delete(guide)
    db.session.commit()
    return '', 204

@bp.route('/<int:guide_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(guide_id):
    user_id = get_jwt_identity()
    guide = Guide.query.get_or_404(guide_id)
    
    like = Like.query.filter_by(user_id=user_id, guide_id=guide_id).first()
    
    if like:
        db.session.delete(like)
        liked = False
    else:
        like = Like(user_id=user_id, guide_id=guide_id)
        db.session.add(like)
        liked = True
    
    db.session.commit()
    
    return jsonify({
        'liked': liked,
        'like_count': len(guide.likes)
    })

@bp.route('/<int:guide_id>/like-status', methods=['GET'])
@jwt_required()
def get_like_status(guide_id):
    user_id = get_jwt_identity()
    like = Like.query.filter_by(user_id=user_id, guide_id=guide_id).first()
    return jsonify({'liked': like is not None})

@bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_guides(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Guide.query.filter_by(user_id=user_id).order_by(Guide.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'guides': [g.to_dict(include_content=False) for g in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page
    })
