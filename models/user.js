// standard sequelize stuff
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // makes sure no other user records in DB for value
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [7,100]
      }
    }
  }, {
      hooks: {
        beforeValidate: function(user, options){
          if (typeof user.email === 'string') {
            user.email = user.email.toLowerCase();
          }
        }
    }
  });
};
