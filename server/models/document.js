module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  Document.associate = (models) => {
    // associations can be defined here
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'author',
      onDelete: 'CASCADE',
    });
  };
  return Document;
};

