const router = require('express').Router();
const userController = require('../controllers/userController');
const screeningController = require('../controllers/screeningController');
const {isCustomer, isEmp} = require('../middlewares/checkRoutes.js');
const {userRegisterValidation, userLoginValidation} = require('../validators.js');

/*
  Login Page
*/
//get functions
router.get('/', userController.displayLoginPage);

//post functions
router.post('/user-register', userRegisterValidation, userController.userRegistration);
router.post('/user-login', userLoginValidation, userController.userLogin);

/*
  Header
*/
//get functions
router.get('/profile', isCustomer, userController.displayProfilePage);
router.get('/logout', userController.userLogout);
//post functions

module.exports = router;
