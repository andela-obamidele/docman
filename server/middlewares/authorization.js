import authHelpers from '../helpers/authHelpers';

export default (request, response, next) => {
  const authorizationToken = request.headers.authorization || '';
  const secret = process.env.SECRET;
  const token = authorizationToken.split(' ')[1];
  const isTokenJWT = authorizationToken.split(' ')[0] === 'JWT';
  authHelpers.verifyAuthToken(token, isTokenJWT, secret)
    .then(() => {
      next();
    })
    .catch(error => response.status(401).json({ error: error.message }));
};
