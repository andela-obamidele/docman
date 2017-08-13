
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: {
      type: DataTypes.ENUM,
      values: ['admin', 'user'],
      allowNull: false
    }
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role',
      sourceKey: 'id',
      onDelete: 'CASCADE'
    });
  };
  return Role;
};
