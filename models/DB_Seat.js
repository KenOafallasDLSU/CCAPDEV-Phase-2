const mongoose = require('mongoose');
const databaseURL = 'mongodb+srv://OafallasKenneth:a1b2c3d4@ccapdev-mp-bigbrainmovies-mubsx.gcp.mongodb.net/BigBrainDB?retryWrites=true&w=majority';

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
