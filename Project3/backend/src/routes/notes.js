import express from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  syncNotes
} from '../controllers/notesController.js';

const router = express.Router();

router.get('/search', searchNotes);
router.post('/sync', syncNotes);
router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
