import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '无标题笔记'
  },
  content: {
    type: String,
    default: ''
  },
  directoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Directory',
    default: null
  },
  tags: [{
    type: String
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

noteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
