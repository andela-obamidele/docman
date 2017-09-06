/**
 * @description defines Role model
 * 
 * @param {object} sequelize sequelize orm object
 * @param {object} DataTypes Class that contains Sequelize
 * 
 * @returns {function} Constructor function that describes
 * Role model and queries that are possible with it
 */
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
      foreignKey: 'roleId',
      sourceKey: 'id',
      onDelete: 'CASCADE'
    });

    Role.hasMany(models.Document, {
      foreignKey: 'roleId',
      sourceKey: 'id',
      onDelete: 'CASCADE'
    });
  };
  return Role;
};
