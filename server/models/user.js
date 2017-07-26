import bcrypt from 'bcrypt';
import errorMessages from '../helpers/constants/errors';

const { userAuthErrors } = errorMessages;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          msg: userAuthErrors.BAD_EMAIL_ERROR
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.hashPassword(user);
      }
    }
  });
  User.prototype.hashPassword = (user) => {
    user.password = bcrypt.hashSync(user.password, 10);
  };
  User.associate = (models) => {
    // associations can be defined here
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      sourceKey: 'id',
      as: 'author',
      onDelete: 'CASECADE'
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
