const userModel = require('../models/DB_User');
const screeningModel = require('../models/DB_Screening');
const slotModel = require('../models/DB_Slot');
const seatModel = require('../models/DB_Seat');
const transactionModel = require('../models/DB_Transaction');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');

/*
  Login Page
*/
//login page display
exports.displayLoginPage = (req, res) => {
  res.render('login', {
    layout: 'home',
    img: 'img/brain.png',
  });
};

//user registration function
exports.userRegistration = (req, res) => {
  const errors = validationResult(req);
  if(errors.isEmpty()) {
    const {fname, lname, emailreg, passreg, typeuser} = req.body;
    userModel.getOne({email: emailreg}, (err, result) => {
      if(result) {
        req.flash('error_msg', 'User already exists. Please login.');
        res.redirect('/');
      } else {
        const saltRounds = 10;
        bcrypt.hash(passreg, saltRounds, (err, hashed) => {
          const newUser = {
            first_name: fname,
            family_name: lname,
            email: emailreg,
            password: hashed,
            usertype: typeuser
          };
          userModel.create(newUser, (err, user) => {
            if(err) {
              req.flash('error_msg', 'Error creating new account. Please try again.');
              res.redirect('/');
            } else {
              req.flash('success_msg', 'Registration successful! Please login.');
              res.redirect('/');
            }
          });
        });
      }
    });
  } else {
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/');
  }
};

//user login function
exports.userLogin = (req, res) => {
  const errors = validationResult(req);
  if(errors.isEmpty()) {
    const {emaillog, passlog} = req.body;
    userModel.getOne({email: emaillog}, (err, user) => {
      if(err) {
        console.log(err); //testing
        res.redirect('/login');
      } else {
        if(user) {
          bcrypt.compare(passlog, user.password, (err, result) => {
            if (result) {
              req.session.user = user._id;
              req.session.fullname = user.full_name;
              req.session.type = user.usertype;
              if (user.usertype == 'C')
                res.redirect('/movies');
              else
                res.redirect('/employeeFacing')
            } else {
              req.flash('error_msg', 'Incorrect password. Please try again.');
              res.redirect('/');
            }
          });
        } else {
          req.flash('error_msg', 'User not found. Please try again.');
          res.redirect('/');
        }
      }
    });
  } else {
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/');
  }
};

/*
Header
*/
//user profile page navigation
exports.displayProfilePage = (req, res) => {
    userModel.getOne({_id: req.session.user}, (err, result) => {

      res.render('BigBrain_Profile', {
        user: result.full_name,
        fullname: result.full_name,
        pageCSS: "BigBrain_Profile",
        pageJS: "BigBrain_Profile",
        pageTitle: "User Profile",
        header: "header",
        footer: "footer",
        email: result.email
      });
    });
};

//user logout function
exports.userLogout = (req, res) => {
  if(req.session){
    console.log(req.session);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  };
};
