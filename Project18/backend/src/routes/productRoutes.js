const Router = require('koa-router');
const productController = require('../controllers/productController');

const router = new Router({ prefix: '/api/products' });

router.get('/categories', productController.getCategories);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
