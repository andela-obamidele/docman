import bcrypt from 'bcryptjs';
import errorConstants from '../constants/errorConstants';

const { userAuthErrors } = errorConstants;

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
          msg: errorConstants.usernameLimitError
        }
      }
    },
    fullName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          arg: [0, 25],
          msg: errorConstants.fullNameLimitError
        }
      }
    },
    bio: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 240],
          msg: errorConstants.bioLimitError
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
      foreignKey: 'author',
      sourceKey: 'id',
      as: 'author',
      onDelete: 'CASCADE'
    });
    User.belongsTo(models.Role, {
      foreignKey: 'role',
      targetKey: 'id',
      defaultValue: 2,
      onDelete: 'CASCADE',
    });
  };
  return User;
};
