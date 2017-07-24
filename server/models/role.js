
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: {
      type: DataTypes.ENUM,
      values: ['admin', 'user'],
      allowNull: false
    }
  });

  Role.associate = (models) => {
    // associations can be defined here
    Role.hasMany(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };
  return Role;
};
