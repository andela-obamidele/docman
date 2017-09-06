import bcrypt from 'bcryptjs';
import ErrorConstants from '../constants/ErrorConstants';

const { userAuthErrors } = ErrorConstants;
/**
 * @description defines User model
 * @param {object} sequelize sequelize orm object
 * @param {object} DataTypes Class that contains Sequelize
 * @returns {function} Constructor function that describes
 * Role model and queries that are possible with it
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: userAuthErrors.badEmailError
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        len: {
          args: [2, 15],
          msg: ErrorConstants.usernameLimitError
        }
      }
    },
    fullName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          arg: [0, 25],
          msg: ErrorConstants.fullNameLimitError
        }
      }
    },
    bio: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 240],
          msg: ErrorConstants.bioLimitError
        }
      }
    }
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.hashPassword(user);
      },
      beforeUpdate: (user) => {
        user.hashPassword(user);
      }
    }
  });
  User.prototype.hashPassword = (user) => {
    user.password = bcrypt.hashSync(user.password, 10);
  };
  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'authorId',
      sourceKey: 'id',
      as: 'authorId',
      onDelete: 'CASCADE'
    });
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      targetKey: 'id',
      defaultValue: 2,
      onDelete: 'CASCADE',
    });
  };
  return User;
};
