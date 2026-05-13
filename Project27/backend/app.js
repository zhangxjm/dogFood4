const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const wishesRoutes = require("./routes/wishes");

const app = express();
const PORT = 3000;
const MONGODB_URI = "mongodb://localhost:27017/wishlist";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB 连接成功"))
  .catch((err) => console.error("MongoDB 连接失败:", err));

app.use("/api/wishes", wishesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "心愿清单 API 运行中" });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
