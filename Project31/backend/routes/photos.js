const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const Photo = require('../models/Photo');
const Album = require('../models/Album');

const UPLOAD_DIR = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.ensureDirSync(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/album/:albumId', async (req, res) => {
  try {
    const photos = await Photo.find({ album: req.params.albumId }).sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.array('photos', 20), async (req, res) => {
  try {
    const { albumId } = req.body;
    
    if (!albumId) {
      return res.status(400).json({ error: 'Album ID is required' });
    }
    
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    const savedPhotos = [];
    
    for (const file of req.files) {
      const photo = new Photo({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        album: albumId,
        url: `/uploads/${file.filename}`
      });
      
      const savedPhoto = await photo.save();
      savedPhotos.push(savedPhoto);
    }
    
    album.photoCount += savedPhotos.length;
    if (!album.coverPhoto && savedPhotos.length > 0) {
      album.coverPhoto = savedPhotos[0]._id;
    }
    await album.save();
    
    res.status(201).json(savedPhotos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const filePath = path.join(UPLOAD_DIR, photo.filename);
    await fs.remove(filePath);
    
    const album = await Album.findById(photo.album);
    if (album) {
      album.photoCount = Math.max(0, album.photoCount - 1);
      
      if (album.coverPhoto && album.coverPhoto.toString() === photo._id.toString()) {
        const remainingPhoto = await Photo.findOne({ album: album._id, _id: { $ne: photo._id } });
        album.coverPhoto = remainingPhoto ? remainingPhoto._id : null;
      }
      
      await album.save();
    }
    
    await Photo.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
