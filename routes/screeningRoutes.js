const router = require('express').Router();
const userController = require('../controllers/userController');
const screeningController = require('../controllers/screeningController');
const {isEmp} = require('../middlewares/checkRoutes.js')

/*
  Movies Page
*/
//get functions
router.get('/movies', screeningController.displayMoviesPage);

router.get('/employeeFacing', isEmp, screeningController.renderEmployeeFacing);
router.get('/screeningForm', isEmp, screeningController.renderAddScreening);
router.get('/posterForm', isEmp, screeningController.renderAddPoster);
router.post('/addScreening', isEmp, screeningController.addScreening)

module.exports = router;
