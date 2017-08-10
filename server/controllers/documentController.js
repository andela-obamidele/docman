export default {
  createDocument: (request, response) => {
    response.send({
      endpoint: '/documents/',
      explain: 'create a new document instance'
    });
  },
  getDocument: (request, response) => {
    if (Object.keys(request.query).length) {
      return response.send({
        endpoint: '/documents/?limit={integer}&offset={integer}',
        explain: 'pagination for docs'
      });
    }
    response.send({
      endpoint: '/documents/',
      explain: 'find matching instances of document'
    });
  },
  updateDocument: (request, response) => {
    response.send({
      endpoint: '/documents/:id',
      explain: 'updates document'
    });
  },
  deleteDocument: (request, response) => {
    response.send({
      endpoint: '/document/:id',
      explain: 'delete document'
    });
  },
  getUserDocuments: (request, response) => {
    response.send({
      endpoint: '/users/:id/documents',
      explain: 'find documents belonging to the user'
    });
  },
  searchDocuments: (request, response) => {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a document'
    });
  }
};
