const express = require('express');
const Worker = require('../models/Worker');
const router = express.Router();

module.exports = (upload) => {
  router.post('/upload/:workerId', upload.single('document'), async (req, res) => {
    try {
      const worker = await Worker.findById(req.params.workerId);
      if (!worker) {
        return res.status(404).json({ message: '服务人员不存在' });
      }

      const { type, name, expiryDate } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: '请上传文件' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/api/uploads/${req.file.filename}`;

      const newDocument = {
        type,
        name,
        fileUrl,
        fileName: req.file.originalname,
        expiryDate: expiryDate || null,
        status: '待审核'
      };

      worker.certificationDocuments.push(newDocument);
      
      if (worker.verificationStatus === '未认证' || worker.verificationStatus === '审核不通过') {
        worker.verificationStatus = '待审核';
      }

      worker.auditHistory.push({
        action: '提交资质文件',
        comment: `提交了 ${name} 文件`,
        status: '待审核'
      });

      await worker.save();
      res.status(201).json({ message: '文件上传成功', document: newDocument });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/worker/:workerId', async (req, res) => {
    try {
      const worker = await Worker.findById(req.params.workerId);
      if (!worker) {
        return res.status(404).json({ message: '服务人员不存在' });
      }
      res.json({
        verificationStatus: worker.verificationStatus,
        canReceiveOrders: worker.canReceiveOrders,
        documents: worker.certificationDocuments,
        auditHistory: worker.auditHistory
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/pending', async (req, res) => {
    try {
      const workers = await Worker.find({
        verificationStatus: '待审核',
        isActive: true
      }).select('name phone verificationStatus certificationDocuments createdAt');
      
      const pendingWorkers = workers.map(worker => ({
        _id: worker._id,
        name: worker.name,
        phone: worker.phone,
        verificationStatus: worker.verificationStatus,
        documentCount: worker.certificationDocuments.length,
        pendingDocumentCount: worker.certificationDocuments.filter(d => d.status === '待审核').length,
        submittedAt: worker.createdAt
      }));
      
      res.json(pendingWorkers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/all', async (req, res) => {
    try {
      const { status } = req.query;
      let query = { isActive: true };
      
      if (status) {
        query.verificationStatus = status;
      }

      const workers = await Worker.find(query)
        .select('name phone verificationStatus certificationDocuments canReceiveOrders createdAt auditHistory')
        .sort({ createdAt: -1 });
      
      res.json(workers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/audit/:workerId', async (req, res) => {
    try {
      const worker = await Worker.findById(req.params.workerId);
      if (!worker) {
        return res.status(404).json({ message: '服务人员不存在' });
      }

      const { status, comment, documentIds } = req.body;

      if (!['审核通过', '审核不通过'].includes(status)) {
        return res.status(400).json({ message: '无效的审核状态' });
      }

      if (documentIds && documentIds.length > 0) {
        worker.certificationDocuments.forEach(doc => {
          if (documentIds.includes(doc._id.toString())) {
            doc.status = status;
            doc.auditComment = comment;
          }
        });
      } else {
        worker.certificationDocuments.forEach(doc => {
          if (doc.status === '待审核') {
            doc.status = status;
            doc.auditComment = comment;
          }
        });
      }

      worker.verificationStatus = status;
      worker.canReceiveOrders = status === '审核通过';

      worker.auditHistory.push({
        action: '资质审核',
        comment: comment || '',
        status: status
      });

      await worker.save();
      res.json({ message: '审核完成', worker: {
        verificationStatus: worker.verificationStatus,
        canReceiveOrders: worker.canReceiveOrders
      }});
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.delete('/document/:workerId/:documentId', async (req, res) => {
    try {
      const worker = await Worker.findById(req.params.workerId);
      if (!worker) {
        return res.status(404).json({ message: '服务人员不存在' });
      }

      const docIndex = worker.certificationDocuments.findIndex(
        doc => doc._id.toString() === req.params.documentId
      );

      if (docIndex === -1) {
        return res.status(404).json({ message: '文档不存在' });
      }

      worker.certificationDocuments.splice(docIndex, 1);

      worker.auditHistory.push({
        action: '删除资质文件',
        status: worker.verificationStatus
      });

      await worker.save();
      res.json({ message: '文档删除成功' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
