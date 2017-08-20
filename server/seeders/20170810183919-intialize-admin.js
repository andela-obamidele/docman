
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
        password: '$2a$10$1Ck.42mvEh6va/uM9im0XO4kWzTDoLtvy' +
        'jVQWMPPcVOyIkkloq/Ky',
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

