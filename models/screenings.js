const mongoose = require('mongoose');
const databaseURL = 'mongodb://localhost:27017/mpdb';

const options = { useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false };

mongoose.connect(databaseURL, options);

const ScreeningSchema = new mongoose.Schema(
  {
    date: {type: Date, required: true},
    screenNum: {type: Number, required: true, min: 1, max: 4, get: v => Math.round(v), set: v => Math.round(v)},
    title: {type: String, required: true, max: 100},
    posterUrl: {type: String, required: false}, //POSTER SET TO FALSE FOR TESTING
    desc: {type: String, required: true},
    rating: {type: String, required: true, max: 30},
    duration: {type: String, required: true, min: 1},
    price: {type: Number, required: true},

    time1: {type: String, required: false},
    time2: {type: String, required: false},
    time3: {type: String, required: false}
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

ScreeningSchema.virtual('datetxt')
.get(function() {
  return this.date.toDateString();
})


module.exports = mongoose.model('Screenings', ScreeningSchema);
