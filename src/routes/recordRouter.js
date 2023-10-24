const express = require('express');
const RecordService = require('../services/recordService');
const validatorHandler = require('../middlewares/validatorHandler');
const { createRecordSchema, updateRecordSchema, alterRecordSchema } = require('../schemas/recordSchema');

const router = express.Router();
const service = new RecordService();

router.post('/',
  validatorHandler(createRecordSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const { sub: userID } = req.user;
      const data = await service.create({ ...body, userID });
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  async (req, res, next) => {
    try {
      const { sub: userID } = req.user;
      const filters = req.query;
      const data = await service.find({ userID, ...filters });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  validatorHandler(alterRecordSchema, 'params'),
  validatorHandler(updateRecordSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const { sub: userID } = req.user;
      const data = await service.update({ id, body }, userID);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(alterRecordSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { sub: userID } = req.user;
      const data = await service.delete({ id, userID });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
