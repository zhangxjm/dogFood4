from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'campus_market.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    seller_name = db.Column(db.String(50), nullable=False)
    contact = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(500))
    status = db.Column(db.String(20), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = db.relationship('Category', backref=db.backref('items', lazy=True))


with app.app_context():
    db.create_all()
    
    if Category.query.count() == 0:
        default_categories = [
            Category(name='电子产品', description='手机、电脑、平板等'),
            Category(name='图书教材', description='教材、参考书、小说等'),
            Category(name='生活用品', description='宿舍用品、家居等'),
            Category(name='文体用品', description='体育器材、乐器等'),
            Category(name='服装配饰', description='衣服、鞋子、配饰等')
        ]
        db.session.add_all(default_categories)
        db.session.commit()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'description': c.description
    } for c in categories])


@app.route('/api/items', methods=['GET'])
def get_items():
    category_id = request.args.get('category_id')
    status = request.args.get('status', 'available')
    
    query = Item.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if status:
        query = query.filter_by(status=status)
    
    items = query.order_by(Item.created_at.desc()).all()
    
    return jsonify([{
        'id': item.id,
        'title': item.title,
        'description': item.description,
        'price': item.price,
        'category_id': item.category_id,
        'category_name': item.category.name if item.category else None,
        'seller_name': item.seller_name,
        'contact': item.contact,
        'image_url': item.image_url,
        'status': item.status,
        'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': item.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    } for item in items])


@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify({
        'id': item.id,
        'title': item.title,
        'description': item.description,
        'price': item.price,
        'category_id': item.category_id,
        'category_name': item.category.name if item.category else None,
        'seller_name': item.seller_name,
        'contact': item.contact,
        'image_url': item.image_url,
        'status': item.status,
        'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': item.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    })


@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    
    if not data or not all(key in data for key in ['title', 'description', 'price', 'category_id', 'seller_name', 'contact']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    item = Item(
        title=data['title'],
        description=data['description'],
        price=float(data['price']),
        category_id=int(data['category_id']),
        seller_name=data['seller_name'],
        contact=data['contact'],
        image_url=data.get('image_url', '')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({
        'id': item.id,
        'title': item.title,
        'message': 'Item created successfully'
    }), 201


@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'title' in data:
        item.title = data['title']
    if 'description' in data:
        item.description = data['description']
    if 'price' in data:
        item.price = float(data['price'])
    if 'category_id' in data:
        item.category_id = int(data['category_id'])
    if 'seller_name' in data:
        item.seller_name = data['seller_name']
    if 'contact' in data:
        item.contact = data['contact']
    if 'image_url' in data:
        item.image_url = data['image_url']
    
    db.session.commit()
    
    return jsonify({
        'id': item.id,
        'message': 'Item updated successfully'
    })


@app.route('/api/items/<int:item_id>/status', methods=['PUT'])
def update_item_status(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    status = data['status']
    if status not in ['available', 'sold', 'offline']:
        return jsonify({'error': 'Invalid status'}), 400
    
    item.status = status
    db.session.commit()
    
    return jsonify({
        'id': item.id,
        'status': item.status,
        'message': 'Status updated successfully'
    })


@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'})


if __name__ == '__main__':
    app.run(host='0.0.0', port=5000, debug=True)
