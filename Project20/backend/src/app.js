const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const drinksRouter = require('./routes/drinks');
const ordersRouter = require('./routes/orders');
const { initDatabase } = require('./config/database');

const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.status = err.status || 500;
    ctx.body = {
      code: ctx.status,
      message: err.message || '服务器内部错误',
      data: null
    };
  }
});

app.use(drinksRouter.routes());
app.use(drinksRouter.allowedMethods());
app.use(ordersRouter.routes());
app.use(ordersRouter.allowedMethods());

app.use(async (ctx) => {
  if (ctx.path === '/') {
    ctx.body = {
      code: 200,
      message: '奶茶店点单系统 API',
      data: {
        version: '1.0.0',
        endpoints: {
          drinks: '/api/drinks',
          orders: '/api/orders'
        }
      }
    };
  }
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
