from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Comment, Guide

bp = Blueprint('comment', __name__, url_prefix='/api/comments')

@bp.route('/', methods=['POST'])
@jwt_required()
def create_comment():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    guide = Guide.query.get_or_404(data['guide_id'])
    
    comment = Comment(
        content=data['content'],
        user_id=user_id,
        guide_id=data['guide_id'],
        parent_id=data.get('parent_id')
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@bp.route('/guide/<int:guide_id>', methods=['GET'])
def get_guide_comments(guide_id):
    comments = Comment.query.filter_by(guide_id=guide_id, parent_id=None).order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments])

@bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    
    if comment.user_id != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return '', 204
