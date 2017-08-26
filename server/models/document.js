import errorConstants from '../constants/errorConstants';
/**
 * @description defines Document model
 * @param {object} sequelize sequelize orm object
 * @param {object} DataTypes Class that contains Sequelize
 * @returns {function} Constructor function that describes
 * Document model and queries that are possible with it
 */
module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [1, 30],
          msg: errorConstants.docTitleLimitError
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 10000],
          msg: errorConstants.docContentLimitError
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
      foreignKey: 'authorId',
      targetKey: 'id',
      onDelete: 'CASCADE',
    });

    Document.belongTo = (models.Role, {
      foreignKey: 'roleId',
      targetKey: 'id',
      onDelete: 'CASCADE'
    });
  };
  return Document;
};

