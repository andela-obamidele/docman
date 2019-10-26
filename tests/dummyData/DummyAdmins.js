const DummyAdmins = [
  {
    email: process.env.FIRST_ADMIN_EMAIL,
    password: process.env.FIRST_ADMIN_PASSWORD,
    username: process.env.FIRST_ADMIN_USERNAME,
    roleId: 1
  },
  {
    email: process.env.SECOND_ADMIN_EMAIL,
    password: process.env.SECOND_ADMIN_PASSWORD,
    username: process.env.SECOND_ADMIN_USERNAME,
    roleId: 1
  }
];

export default DummyAdmins;
