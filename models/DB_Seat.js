const mongoose = require('mongoose');
const databaseURL = 'mongodb://localhost:27017/mpdb';

const options = { useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false };
  
mongoose.connect(databaseURL, options);

const SeatSchema = new mongoose.Schema(
    {
        seatNum: {type: String, required: true},
        status: {type: String, required: true, enum: ["A", "R", "U"], default: "A"},
        slot: {type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true},
        owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false}
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

module.exports = mongoose.model('Seat', SeatSchema);