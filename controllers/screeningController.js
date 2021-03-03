const userModel = require('../models/DB_User');
const screeningModel = require('../models/DB_Screening');
const slotModel = require('../models/DB_Slot');
const seatModel = require('../models/DB_Seat');
const transactionModel = require('../models/DB_Transaction');
const {validationResult} = require('express-validator');

/*
  Movies Page
*/
//Movies page display
exports.displayMoviesPage = (req, res) => {
  var today = new Date(2020, 4, 9); //hardcoded dates
  var tom = new Date(2020, 4, 10);
  var next = new Date(2020, 4, 11);
  var screens1 = [];
  var screens2 = [];
  var screens3 = [];
  var username;

    screeningModel.forMovies({date: today}, (err, result) => {
        result.forEach(function(doc) {
        screens1.push(doc);
      });
      console.log(screens1[0].slots);
      screeningModel.forMovies({date: tom}, (err, result) => {
          result.forEach(function(doc) {
          screens2.push(doc);
        });
        screeningModel.forMovies({date: next}, (err, result) => {
            result.forEach(function(doc) {
            screens3.push(doc);
        });

        if (req.session.fullname != null && req.session.type == 'C')
          username= req.session.fullname;
        else
          username= "guest";

          console.log(req.session);

          res.render('movies', {
            user: username,
            pageCSS: "BigBrain_Screenings",
            pageJS: "BigBrain_Screenings",
            pageTitle: "Movie Screenings",
            header: "header",
            footer: "footer",
            day1: screens1,
            day2: screens2,
            day3: screens3,
            date1: today.toDateString(),
            date2: tom.toDateString(),
            date3: next.toDateString()
          });
      });
    });
  });
};
