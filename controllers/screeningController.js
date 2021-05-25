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
exports.displayMoviesPage = async (req, res) => {
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

exports.renderAddScreening = (req, res) => {
  res.render("BigBrain_AddScreening", {
    //header
    user: req.session.fullname,

    //head
    pageCSS: "BigBrain_AddScreening",
    pageJS: "BigBrain_AddScreening",
    pageTitle: "Add Screening",
    header: "BigBrain_EmployeeHeader",
    footer: "BigBrain_EmployeeFooter"
  });
}

exports.renderAddPoster = (req, res) => {
  res.render("BigBrain_AddPoster", {
    //header
    user: req.session.fullname,

    //head
    pageCSS: "BigBrain_AddPoster",
    pageJS: "BigBrain_AddPoster",
    pageTitle: "Add Poster",
    header: "BigBrain_EmployeeHeader",
    footer: "BigBrain_EmployeeFooter"
  });
}

exports.renderEmployeeFacing = (req, res) => {
  userModel.getOne({_id: req.session.user}, (err, result) => {
    res.render("BigBrain_EmployeeFacing", {
      //header
      user: req.session.fullname,

      //head
      pageCSS: "BigBrain_EmployeeFacing",
      pageJS: "BigBrain_EmployeeFacing",
      pageTitle: "Employee Home",
      header: "BigBrain_EmployeeHeader",
      footer: "BigBrain_EmployeeFooter",

      //body
      name: req.session.fullname,
      email:  result.email
    });
  })
}

exports.addScreening = async (req, res) => {
  const screening = {
    date: req.body.date,
    screenNum: req.body.screenNum,
    title: req.body.title,
    posterUrl: req.body.poster,
    desc: req.body.desc,
    rating: req.body.rating,
    duration: req.body.duration,
    price: req.body.price
  }
  const screeningId = await screeningModel.addOneAsync(screening)
  console.log(screeningId)

  const slot1 = {
    screening: screeningId,
    slotOrder: 1,
    slotStart: req.body.time1start,
    slotEnd: req.body.time1end
  }
  const slot2 = {
    screening: screeningId,
    slotOrder: 2,
    slotStart: req.body.time2start,
    slotEnd: req.body.time2end
  }
  const slot3 = {
    screening: screeningId,
    slotOrder: 3,
    slotStart: req.body.time3start,
    slotEnd: req.body.time3end
  }
  const slotIdList = await slotModel.addManyAsync([slot1, slot2, slot3])
  console.log(slotIdList)

  let aSeats = [];
  let letter = 'A';
  let number = 1;
  for(let slotNum = 0; slotNum < 3; slotNum++){
    letter = 'A';
    number = 1;

    for(let i = 0; i < 10; i++){
      for(let j = 0; j < 10; j++){
        const tempSeat = {
          seatNum: String.fromCharCode(letter.charCodeAt() + i).concat(number + j),
          status: "A",
          slot: slotIdList[slotNum]
        }

        aSeats.push(tempSeat);
      }
    }
  }
  const seatsIdList = await seatModel.addManyAsync(aSeats)
  console.log(seatsIdList)
}