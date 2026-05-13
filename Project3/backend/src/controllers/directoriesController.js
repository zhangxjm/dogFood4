import Directory from '../models/Directory.js';
import Note from '../models/Note.js';
import mongoose from 'mongoose';

export const getAllDirectories = async (req, res) => {
  try {
    const directories = await Directory.find().sort({ order: 1, createdAt: 1 });
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDirectoryById = async (req, res) => {
  try {
    const directory = await Directory.findById(req.params.id);
    if (!directory) {
      return res.status(404).json({ error: '目录不存在' });
    }
    res.json(directory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDirectory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const directory = new Directory({
      name,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null
    });
    const savedDirectory = await directory.save();
    res.status(201).json(savedDirectory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDirectory = async (req, res) => {
  try {
    const { name, parentId, order } = req.body;
    const updateData = { updatedAt: Date.now() };
    
    if (name !== undefined) updateData.name = name;
    if (parentId !== undefined) {
      updateData.parentId = parentId ? new mongoose.Types.ObjectId(parentId) : null;
    }
    if (order !== undefined) updateData.order = order;
    
    const directory = await Directory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!directory) {
      return res.status(404).json({ error: '目录不存在' });
    }
    res.json(directory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDirectory = async (req, res) => {
  try {
    const directoryId = req.params.id;
    const objectId = new mongoose.Types.ObjectId(directoryId);
    
    const getChildIds = async (parentId) => {
      const children = await Directory.find({ parentId });
      let ids = children.map(d => d._id);
      for (const child of children) {
        const grandChildren = await getChildIds(child._id);
        ids = [...ids, ...grandChildren];
      }
      return ids;
    };
    
    const childIds = await getChildIds(objectId);
    const allIds = [objectId, ...childIds];
    
    await Note.updateMany(
      { directoryId: { $in: allIds } },
      { $set: { directoryId: null } }
    );
    
    await Directory.deleteMany({ _id: { $in: allIds } });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
