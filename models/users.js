const mongoose = require('mongoose');
const databaseURL = 'mongodb+srv://OafallasKenneth:a1b2c3d4@ccapdev-mp-bigbrainmovies-mubsx.gcp.mongodb.net/BigBrainDB?retryWrites=true&w=majority';

const options = { useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false };

mongoose.connect(databaseURL, options);

const UserSchema = new mongoose.Schema(
  {
    first_name: {type: String, required: [true, "No first name provided."], max: 100},
    family_name: {type: String, required: [true, "No family name provided."], max: 100},
    email: {type: String, required: [true, "No email address provided."], max: 100},
    password: {type: String, required: [true, "No password provided."], max: 100},
    usertype: {type: String, required: true, enum: ['C', 'E']}
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

UserSchema.virtual('full_name')
  .get(function() {
    return this.first_name + ' ' + this.family_name;
  })
  .set(function(value) {
    var splitName = value.split(' ');

    this.first_name = splitName[0]
    this.family_name = splitName[1]
  });

module.exports = mongoose.model('User', UserSchema);
