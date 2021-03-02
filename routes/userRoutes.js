const router = require('express').Router();
const userController = require('../controllers/userController');
const screeningController = require('../controllers/screeningController');
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
//post functions
router.get('/logout', userController.userLogout);

module.exports = router;
