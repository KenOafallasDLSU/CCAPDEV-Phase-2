const { body } = require('express-validator');

/*User Registration*/
const userRegisterValidation = [
  body('lname').trim().not().isEmpty().withMessage("Last Name is required.").matches(/^[A-Za-z. ]+$/i).withMessage("Name should only contain letters, periods and spaces."),
  body('fname').trim().not().isEmpty().withMessage("First Name is required.").matches(/^[A-Za-z. ]+$/i).withMessage("Name should only contain letters, periods and spaces."),
  body('emailreg').trim().not().isEmpty().withMessage("Email is required.").isEmail().withMessage("Please provide a valid email."),
  body('passreg').isLength({ min: 8 }).withMessage("Password needs to be at least 8 characters long."),
  body('typeuser').not().isEmpty().withMessage("Select a user type.")
];

/*User Login*/
const userLoginValidation = [
  body('emaillog').not().isEmpty().withMessage("Username/Email is required."),
  body('passlog').not().isEmpty().withMessage("Password is required.")
];

module.exports = { userRegisterValidation, userLoginValidation };
