const Koa = require("koa");
const cors = require("@koa/cors");
const { koaBody } = require("koa-body");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  koaBody({
    multipart: true,
    jsonLimit: "10mb",
    formLimit: "10mb",
  }),
);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || "Internal Server Error",
    };
    ctx.app.emit("error", err, ctx);
  }
});

app.use(productRoutes.routes());
app.use(productRoutes.allowedMethods());
app.use(orderRoutes.routes());
app.use(orderRoutes.allowedMethods());

app.use(async (ctx) => {
  if (ctx.path === "/api/health") {
    ctx.body = {
      success: true,
      message: "Service is running",
      timestamp: new Date().toISOString(),
    };
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
});
