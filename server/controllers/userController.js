
export default {
  loginUser: (request, response) => {
    response.send({
      endpoint: '/users/login',
      explain: 'logs user in'
    });
  },
  signupUser: (request, response) => {
    response.send({
      endpoint: '/users/',
      explain: 'creates a new user'
    });
  },
  getUser: (request, response) => {
    if (Object.keys(request.query).length) {
      return response.send({
        endpoint: '/user/?limit={integer}&offset={integer}',
        explain: 'Pagination for users'
      });
    }
    response.send({
      endpoint: '/users/',
      explain: 'get matching instances of user'
    });
  },
  deleteUser: (request, response) => {
    response.send({
      endpoint: '/users/:id',
      explain: 'delete user'
    });
  },
  searchUser: (request, response) => {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a user'
    });
  }
};
