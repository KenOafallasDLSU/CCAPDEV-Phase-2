const mongoose = require('mongoose');
const databaseURL = 'mongodb://localhost:27017/mpdb';

const options = { useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false };
  
mongoose.connect(databaseURL, options);

const SlotSchema = new mongoose.Schema(
    {
        screening: {type: mongoose.Schema.Types.ObjectId, ref: "Screenings", required: true},
        slotOrder: {type: Number, required: true, min: 1, max: 3},
        slotStart: {type: String, required: true},
        slotEnd: {type: String, required: true}
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

module.exports = mongoose.model('Slot', SlotSchema);