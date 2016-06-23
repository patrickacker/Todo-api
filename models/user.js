// standard sequelize stuff
module.exports = function(sequelize, dataTypes) {
  return sequelize.define('user', {
    email: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true, // makes sure no other user records in DB for value
      validate: {
        isEmail: true
      }
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        len: [7,100]
      }
    }
  });
};
