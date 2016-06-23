// standard sequelize stuff
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // makes sure no other user records in DB for value
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL, // Does not store on DB but is accessible
      allowNull: false,
      validate: {
        len: [7,100]
      },
      set: function(value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
      hooks: {
        beforeValidate: function(user, options){
          if (typeof user.email === 'string') {
            user.email = user.email.toLowerCase();
          }
        }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function(resolve, reject) {
          // Check if valid account
          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject();
          }

          user.findOne({
            where: {
              email: body.email
            }
          }).then(function(user){
            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
              return reject(); // auth possible but failed (bad email)
            }
            resolve(user);
          }, function(e) {
            reject();
          });
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function() {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      },
      generateToken: function(type) {
        if (!_.isString(type)) {
          return undefined;
        }

        try {
          // AES only knows how to encrypt a string
          var stringData = JSON.stringify({ // Turns user id and type into STRING
            id: this.get('id'),
            type: type
          });
          var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
          var token = jwt.sign({
            token: encryptedData // body for token--> when we get token back from user, we can pull token property, then can find user by ID
          }, 'qwertw98'); //2nd argument is password
          return token;
      } catch(e) {
          return undefined;
        }

      }
    }
  });
  return user;
};
