const router = require('express').Router();
const userController = require('../controllers/userController');
const screeningController = require('../controllers/screeningController');

/*
  Movies Page
*/
//get functions
router.get('/movies', screeningController.displayMoviesPage);

module.exports = router;
