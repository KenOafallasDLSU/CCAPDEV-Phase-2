const mongoose = require('./connection');

const userSchema = new mongoose.Schema(
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

userSchema.virtual('full_name')
  .get(function() {
    return this.first_name + ' ' + this.family_name;
  })
  .set(function(value) {
    var splitName = value.split(' ');

    this.first_name = splitName[0]
    this.family_name = splitName[1]
  });

  const userModel = mongoose.model('users', userSchema);

  // create a new user
  exports.create = (object, next) => {
      const newUser = new userModel(object);
      newUser.save((err, user) => {
          next(err, user);
      });
  };

  // look for an existing user in the db
  exports.getOne = (query, next) => {
      userModel.findOne(query, (err, user) => {
          next(err, user);
      });
  };

  // update a user with new values based on the query
  exports.updateOne = (query, newvalues, next) => {
      userModel.updateOne(query, newvalues, (err, user) => {
          next(err, user);
      });
  };
