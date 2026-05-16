const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const fs = require('fs');

const initDatabase = require('./database/init');

const cardTypesRouter = require('./routes/cardTypes');
const membersRouter = require('./routes/members');
const trainersRouter = require('./routes/trainers');
const appointmentsRouter = require('./routes/appointments');
const transactionsRouter = require('./routes/transactions');
const remindersRouter = require('./routes/reminders');

const { initScheduler } = require('./scheduler');

const app = new Koa();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization']
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message || '服务器内部错误' };
  }
});

app.use(cardTypesRouter.routes()).use(cardTypesRouter.allowedMethods());
app.use(membersRouter.routes()).use(membersRouter.allowedMethods());
app.use(trainersRouter.routes()).use(trainersRouter.allowedMethods());
app.use(appointmentsRouter.routes()).use(appointmentsRouter.allowedMethods());
app.use(transactionsRouter.routes()).use(transactionsRouter.allowedMethods());
app.use(remindersRouter.routes()).use(remindersRouter.allowedMethods());

const PORT = process.env.PORT || 3001;

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    initScheduler();
  });
}

startServer();