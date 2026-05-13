const express = require("express");
const router = express.Router();
const Wish = require("../models/Wish");

router.get("/", async (req, res) => {
  try {
    const { category, completed } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (completed !== undefined) filter.completed = completed === "true";

    const wishes = await Wish.find(filter).sort({ createdAt: -1 });
    res.json(wishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Wish.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const wish = await Wish.findById(req.params.id);
    if (!wish) return res.status(404).json({ error: "心愿不存在" });
    res.json(wish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const wish = new Wish({
      title,
      description: description || "",
      category: category || "其他",
    });
    const savedWish = await wish.save();
    res.status(201).json(savedWish);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, category, completed } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (completed !== undefined) {
      update.completed = completed;
      update.completedAt = completed ? new Date() : null;
    }

    const wish = await Wish.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!wish) return res.status(404).json({ error: "心愿不存在" });
    res.json(wish);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const wish = await Wish.findByIdAndDelete(req.params.id);
    if (!wish) return res.status(404).json({ error: "心愿不存在" });
    res.json({ message: "删除成功" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
