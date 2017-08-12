
module.exports = {
  up: (queryInterface) => {
    const query = queryInterface.bulkInsert('Users', [
      {
        email: 'admin@docman.com',
        password: 'password',
        username: 'admin',
        role: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin2@docman.com',
        password: 'password',
        username: 'admin2',
        role: 1,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    ]);
    return query;
  },

  down: (queryInterface) => {
    const query = queryInterface.bulkDelete('Users', null, {});
    return query;
  }
};

