export default {
  createDocument: (req, res) => {
    res.send({
      endpoint: '/documents/',
      explain: 'create a new document instance'
    });
  },
  getDocument: (req, res) => {
    if (Object.keys(req.query).length) {
      return res.send({
        endpoint: '/documents/?limit={integer}&offset={integer}',
        explain: 'pagination for docs'
      });
    }
    res.send({ endpoint: '/documents/', explain: 'find matching instances of document' });
  },
  updateDocument: (req, res) => {
    res.send({
      endpoint: '/documents/:id',
      explain: 'updates document'
    });
  },
  deleteDocument: (req, res) => {
    res.send({
      endpoint: '/document/:id',
      explain: 'delete document'
    });
  },
  getUserDocuments: (req, res) => {
    res.send({
      endpoint: '/users/:id/documents',
      explain: 'find documents belonging to the user'
    });
  },
  searchDocuments: (req, res) => {
    res.send({
      endpoint: '/search/documents/',
      explain: 'search for a document'
    });
  }
};
