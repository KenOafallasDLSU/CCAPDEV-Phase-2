const mongoose = require('mongoose');
const databaseURL = 'mongodb+srv://OafallasKenneth:a1b2c3d4@ccapdev-mp-bigbrainmovies-mubsx.gcp.mongodb.net/BigBrainDB?retryWrites=true&w=majority';

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
