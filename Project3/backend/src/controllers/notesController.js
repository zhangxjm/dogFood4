import Note from '../models/Note.js';
import mongoose from 'mongoose';

export const getAllNotes = async (req, res) => {
  try {
    const { directoryId, favorite } = req.query;
    const filter = {};
    
    if (directoryId === 'null' || directoryId === null) {
      filter.directoryId = null;
    } else if (directoryId) {
      filter.directoryId = new mongoose.Types.ObjectId(directoryId);
    }
    
    if (favorite === 'true') {
      filter.isFavorite = true;
    }
    
    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, directoryId, tags } = req.body;
    const note = new Note({
      title: title || '无标题笔记',
      content: content || '',
      directoryId: directoryId ? new mongoose.Types.ObjectId(directoryId) : null,
      tags: tags || []
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, content, directoryId, tags, isFavorite } = req.body;
    const updateData = { updatedAt: Date.now() };
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (directoryId !== undefined) {
      updateData.directoryId = directoryId ? new mongoose.Types.ObjectId(directoryId) : null;
    }
    if (tags !== undefined) updateData.tags = tags;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const notes = await Note.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const syncNotes = async (req, res) => {
  try {
    const { notes, timestamp } = req.body;
    const filter = timestamp ? { updatedAt: { $gte: new Date(timestamp) } } : {};
    
    const serverNotes = await Note.find(filter);
    
    if (notes && notes.length > 0) {
      for (const localNote of notes) {
        if (localNote._id) {
          const serverNote = await Note.findById(localNote._id);
          if (!serverNote || new Date(localNote.updatedAt) > new Date(serverNote.updatedAt)) {
            await Note.findByIdAndUpdate(
              localNote._id,
              {
                title: localNote.title,
                content: localNote.content,
                directoryId: localNote.directoryId ? new mongoose.Types.ObjectId(localNote.directoryId) : null,
                tags: localNote.tags || [],
                isFavorite: localNote.isFavorite || false,
                updatedAt: new Date(localNote.updatedAt)
              },
              { upsert: true, new: true }
            );
          }
        }
      }
    }
    
    res.json({ serverNotes, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
