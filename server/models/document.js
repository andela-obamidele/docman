module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    access: {
      type: DataTypes.ENUM,
      values: ['public', 'private', 'role'],
      allowNull: false
    },
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'author',
      targetKey: 'id',
      onDelete: 'CASCADE',
    });
  };
  return Document;
};

