import express from 'express';
import {
  getAllDirectories,
  getDirectoryById,
  createDirectory,
  updateDirectory,
  deleteDirectory
} from '../controllers/directoriesController.js';

const router = express.Router();

router.get('/', getAllDirectories);
router.get('/:id', getDirectoryById);
router.post('/', createDirectory);
router.put('/:id', updateDirectory);
router.delete('/:id', deleteDirectory);

export default router;
