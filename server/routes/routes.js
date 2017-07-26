import express from 'express';


const router = express.Router();

router.post('/users/login', (req, res) => {
  res.send({
    endpoint: '/users/login',
    explain: 'logs user in'
  });
});

router.post('/users/', (req, res) => {
  res.send({
    endpoint: '/users/',
    explain: 'creates a new user'
  });
});

router.get('/users/', (req, res) => {
  if (Object.keys(req.query).length) {
    return res.send({
      endpoint: '/user/?limit={integer}&offset={integer}',
      explain: 'Pagination for users'
    });
  }
  res.send({
    endpoint: '/users/',
    explain: 'get matching instances of user'
  });
});

router.put('/users/:id', (req, res) => {
  res.send({
    endpoint: '/users/:id',
    explain: 'updates user attributes'
  });
});

router.delete('/user/id', (req, res) => {
  res.send({
    endpoint: '/users/:id',
    explain: 'delete user'
  });
});

router.post('/documents/', (req, res) => {
  res.send({
    endpoint: '/documents/',
    explain: 'create a new document instance'
  });
});

router.get('/documents/', (req, res) => {
  if (Object.keys(req.query).length) {
    return res.send({
      endpoint: '/documents/?limit={integer}&offset={integer}',
      explain: 'pagination for docs'
    });
  }
  res.send({ endpoint: '/documents/', explain: 'find matching instances of document' });
});

router.put('/documents/:id', (req, res) => {
  res.send({
    endpoint: '/documents/:id',
    explain: 'updates document'
  });
});

router.delete('/documents/:id', (req, res) => {
  res.send({
    endpoint: '/document/:id',
    explain: 'delete document'
  });
});

router.get('/users/:id/documents', (req, res) => {
  res.send({
    endpoint: '/users/:id/documents',
    explain: 'find documents belonging to the user'
  });
});

router.get('/search/users/', (req, res) => {
  res.send({
    endpoint: '/search/users/',
    explain: 'search for a user'
  });
});

router.get('/search/documents/', (req, res) => {
  res.send({
    endpoint: '/search/documents/',
    explain: 'search for a document'
  });
});

export default router;
