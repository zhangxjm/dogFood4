const Router = require('koa-router');
const orderController = require('../controllers/orderController');

const router = new Router({ prefix: '/api/orders' });

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
