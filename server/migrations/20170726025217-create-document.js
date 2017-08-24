
module.exports = {
  /**
  * @description creates Documents table
  * @param {object} queryInterface sequelize orm object
  * @param {object} Sequelize Class that contains Sequelize
  * @returns {function} sequelize query promise
  */
  up: (queryInterface, Sequelize) => {
    const query = queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'authorId',
        }
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id',
          as: 'roleId'
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: 'false'
      },
      access: {
        type: Sequelize.ENUM,
        values: ['public', 'private', 'role'],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    return query;
  },
  down: (queryInterface) => {
    const query = queryInterface.dropTable('Documents');
    return query;
  }
};
