const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['身份证', '健康证', '技能证书', '其他']
  },
  name: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['待审核', '审核通过', '审核不通过'],
    default: '待审核'
  },
  auditComment: {
    type: String
  }
}, { _id: true });

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  idCard: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  schedule: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['未认证', '待审核', '审核通过', '审核不通过'],
    default: '未认证'
  },
  certificationDocuments: [documentSchema],
  auditHistory: [{
    action: {
      type: String,
      required: true
    },
    comment: {
      type: String
    },
    status: {
      type: String,
      enum: ['待审核', '审核通过', '审核不通过']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  canReceiveOrders: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);
