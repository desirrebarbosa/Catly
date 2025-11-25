const { validationResult } = require('express-validator');
const catService = require('../services/cat.service');
const catchAsync = require('../utils/catchAsync');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed');
    error.statusCode = 400;
    error.data = errors.array();
    throw error;
  }
};

const addCat = catchAsync(async (req, res) => {
  handleValidation(req);
  // req.user.id comes from the authenticate middleware
  const cat = await catService.createCat(req.user.id, req.body);
  res.status(201).json({ success: true, data: { cat } });
});

const getMyCats = catchAsync(async (req, res) => {
  const cats = await catService.getCatsByOwner(req.user.id);
  res.json({ success: true, data: { cats } });
});

const getCatDetails = catchAsync(async (req, res) => {
  const cat = await catService.getCatById(req.params.id);
  res.json({ success: true, data: { cat } });
});

const updateCat = catchAsync(async (req, res) => {
  handleValidation(req);
  const cat = await catService.updateCat(req.params.id, req.user.id, req.body);
  res.json({ success: true, message: 'Cat updated', data: { cat } });
});

const deleteCat = catchAsync(async (req, res) => {
  await catService.deleteCat(req.params.id, req.user.id);
  res.json({ success: true, message: 'Cat deleted successfully' });
});

module.exports = {
  addCat,
  getMyCats,
  getCatDetails,
  updateCat,
  deleteCat
};