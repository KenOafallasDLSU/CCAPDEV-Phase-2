const userModel = require('../models/DB_User');
const screeningModel = require('../models/DB_Screening');
const slotModel = require('../models/DB_Slot');
const seatModel = require('../models/DB_Seat');
const transactionModel = require('../models/DB_Transaction');
const ObjectId= require('mongodb').ObjectId;

/*
 Checkout Page
*/

// get function
exports.getCheckout = (req,res) => {
    var user
    var username
    var today = new Date(2020, 4, 9);
    var sort = {seatNum: 1}
    var slotp;
    req.session.seatString = ""
    if (req.session.fullname != null) {
      user = req.session.user
      username = req.session.fullname
    }
    else
      user = false
    if (req.session.slot != null) {
      slotp = req.session.slot;
    }
    if (user) {
      userModel.getOne({_id:user},(err,client) => {
        if (err) throw err
        if (client) {
          seatModel.getUserSeats(client,slotp,sort,(err,seats)=> {
            if (err) throw err
            if (seats) {
              var seatArray =[];
              var mov = {};
              var seatString = "";
              seats.forEach(item => {
                var seatObj = {};
                seatObj['seatNum'] = item.seatNum
                seatObj['id'] = item._id
                seatArray.push(seatObj)
                seatString = seatString+item.seatNum + " "
                req.session.seatString = seatString;
              })
              slotModel.getMovie({_id:slotp},(err,slot)=> {
                if (err) throw err
                console.log(slot)
                if (slot){
                  screeningModel.getOne({_id:slot.screening},(err,screening) => {
                    if (err) throw err
                    if (screening) {
                      var totalPrice = screening.price * seatArray.length
                      res.render('BigBrain_Checkout', {
                        user: username,
                        pageCSS: "BigBrain_Checkout",
                        pageJS: "BigBrain_Checkout",
                        pageTitle: "Checkout",
                        header: "header",
                        footer: "footer",
                        seats: seatArray,
                        title: screening.title,
                        img: screening.posterUrl,
                        slotStart: slot.slotStart,
                        slotEnd: slot.slotEnd,
                        cost: totalPrice
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }

exports.createTransaction = (req,res) => {
  var slotp
  var user;
  var date = new Date()
  console.log(date)
  var cardnum;
  var sort = {seatNum:1}
  var seatString;
  if (req.session.fullname != null) {
    user = req.session.user
  }
  else user = false
  if (req.session.slot != null && req.session.slot) {
    slotp = req.session.slot
  }
  if (req.body.cardnum != null && req.body.cardnum) {
    cardnum = req.body.cardnum
  }
  if (req.session.seatString != null && req.session.seatString) {
    seatString = req.session.seatString
    req.session.seatString = null;
  }
  if (user){
    userModel.getOne({_id:user},(err,client)=> {
      if (err) throw err
      if (client) {
        seatModel.reserveSeats({status:"R",slot:slotp,owner:client},{$set: {status: "U",owner:ObjectId(user)}},(err,result) => {
          if (err) throw err
          if (result) {
                slotModel.getMovie({_id:slotp},(err,slot) => {
                  if (err) throw err
                  if (slot) {
                    console.log(':(')
                    transactionModel.create({date:date,creditCardNum:cardnum,client:ObjectId(user),screening:ObjectId(slot.screening),slot:ObjectId(slotp),seats:seatString},(err,fin) =>{
                      if (err) throw err
                      res.send(fin)
                    })
                  }
                })
          }
        })
      }
    })
  }
}
// post function - cancel seats
exports.cancelSeats = (req,res) => {
    var user;
    var slotp;
    if (req.session.fullname != null)
      user = req.session.user
    else
      user = false
    if (req.session.slot != null)
      slotp = req.session.slot
    if (user){
      userModel.getOne({_id:user}, (err,client) => {
        if (err) throw err
        if (client) {
          seatModel.reserveSeats({status:'R',slot:slotp,owner: client},{$set: {status: "A", owner: ObjectId('nilnilnilnil')}},(err,result) => {
            if (err) throw err
            res.send(result)
          })
        }
      })
    }
}


/*
Transaction History Page
*/

//get function
exports.getHistory = async (req,res) => {
    let user
    const today = new Date(2020, 5, 8);
    const sort = {date: 1}
    if (req.session.fullname != null)
      user = req.session.user
    else
      user = false
  
    let getSingleTrans = element => {
      return new Promise(async (resolve, reject) => {
        const movie = await screeningModel.getOneAsync({_id:element.screening})
        const result = await slotModel.getOne({_id:element.slot})
        if (movie && result) {
          resolve({
            title: movie.title,
            date: movie.datetxt,
            seats: element.seats,
            status: element.date < today ? 'Completed' : 'Reserved',
            start: result.slotStart,
            end: result.slotEnd
          })
        }
      })
    }
    
    const transactions = await transactionModel.getUserTransactionsAsync(ObjectId(user), sort)
    let getAllTrans = await Promise.all(
      transactions.map(async element => {
        let trans = await getSingleTrans(element)
        return trans
      })
    )
  
    res.render('BigBrain_TransactionHistory', {
      user: req.session.fullname,
      user_email: req.session.email,
      pageCSS: "BigBrain_TransactionHistory",
      pageTitle: "Transaction History",
      header: "header",
      footer: "footer",
      transactions: getAllTrans
    })
  }