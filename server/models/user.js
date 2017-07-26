import bcrypt from 'bcrypt';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
      foreignKey: 'roleId',
      targetKey: 'id',
      as: 'role',
      onDelete: 'CASCADE',
    });
  };
  return User;
};
