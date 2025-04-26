const express = require('express');
const router = express.Router();
const threadController = require('./controllers/threadController');

/**
 * @route   POST /api/extract
 * @desc    Extract media from Threads post URL
 * @access  Public
 */
router.post('/extract', threadController.extractMedia);

/**
 * @route   GET /api/extract
 * @desc    Extract media from Threads post URL (via query parameter)
 * @access  Public
 */
router.get('/extract', threadController.extractMedia);

module.exports = router; 