const DummyAdmins = [
  {
    email: 'admin@docman.com',
    password: process.env.FIRST_ADMIN_PASSWORD,
    username: 'admin',
    roleId: 1
  },
  {
    email: 'admin2@docman.com',
    password: process.env.SECOND_ADMIN_PASSWORD,
    username: 'admin2',
    roleId: 1
  }
];

export default DummyAdmins;
