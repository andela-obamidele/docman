import errorMessages from '../constants/errors';

module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [1, 30],
          msg: errorMessages.docTitleLimitError
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 10000],
          msg: errorMessages.docContentLimitError
        }
      }
    },
    access: {
      type: DataTypes.ENUM,
      values: ['public', 'private', 'role'],
      allowNull: false,
    },
  });
  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'author',
      targetKey: 'id',
      onDelete: 'CASCADE',
    });

    Document.belongTo = (models.Role, {
      foreignKey: 'role',
      targetKey: 'id',
      onDelete: 'CASCADE'
    });
  };
  return Document;
};

