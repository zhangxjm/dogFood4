const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const fs = require('fs-extra');
const path = require('path');

router.get('/', async (req, res) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });
    
    const albumIdsWithCover = albums.filter(a => a.coverPhoto).map(a => a.coverPhoto);
    const coverPhotos = albumIdsWithCover.length > 0 
      ? await Photo.find({ _id: { $in: albumIdsWithCover } })
      : [];
    
    const coverPhotoMap = {};
    coverPhotos.forEach(p => {
      coverPhotoMap[p._id.toString()] = p.url;
    });
    
    const albumsWithCoverUrl = albums.map(album => ({
      ...album.toObject(),
      coverPhotoUrl: album.coverPhoto ? coverPhotoMap[album.coverPhoto.toString()] : null
    }));
    
    res.json(albumsWithCoverUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    const photos = await Photo.find({ album: req.params.id }).sort({ createdAt: -1 });
    res.json({ album, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const album = new Album({
      name: req.body.name,
      description: req.body.description || ''
    });
    const savedAlbum = await album.save();
    res.status(201).json(savedAlbum);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description
      },
      { new: true }
    );
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(album);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    const photos = await Photo.find({ album: req.params.id });
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    
    for (const photo of photos) {
      const filePath = path.join(uploadDir, photo.filename);
      await fs.remove(filePath);
    }
    
    await Photo.deleteMany({ album: req.params.id });
    await Album.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Album deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
