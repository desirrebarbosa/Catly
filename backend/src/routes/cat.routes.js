const express = require('express');
const router = express.Router();

// middleware
const { authenticate } = require('../middleware/auth.middleware');

// controller
const {
  addCat,
  getMyCats,
  getCatDetails,
  updateCat,
  deleteCat
} = require('../controllers/cat.controller');

// validators
const { createCatValidator, updateCatValidator } = require('../validators/cat.validator');

// all cat routes require login
router.use(authenticate);

// routes
router.post('/', createCatValidator, addCat);       // create a cat
router.get('/', getMyCats);                         // get all my cats
router.get('/:id', getCatDetails);                  // get one cat
router.put('/:id', updateCatValidator, updateCat);  // update a cat
router.delete('/:id', deleteCat);                   // delete a cat

module.exports = router;