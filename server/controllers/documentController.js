import { Document } from '../models';
import errorMessages from '../constants/errors';
import helpers from '../helpers/helpers';

const getPageMetadata = helpers.getPageMetadata;
export default {
  createDocument: (request, response) => {
    const { title, content, access } = request.body;
    const { id, role } = response.locals.user;
    return Document.create({ title, content, access, role, author: id })
      .then(doc =>
        response.status(201).json({
          document: doc.dataValues
        })
      )
      .catch(error => helpers.handleCreateDocumentError(error, response));
  },
  getDocument: (request, response) => {
    const options = {};
    const { limit, offset } = request.query;
    const isPaginationRequired = limit && offset;
    if (isPaginationRequired) {
      if (Number.isNaN(Number(limit)) || Number.isNaN(Number(offset))) {
        return response
          .status(406)
          .json({ error: errorMessages.paginationQueryError });
      }
      options.limit = Number.parseInt(limit, 10);
      options.offset = Number.parseInt(offset, 10);
    }
    options.where = {
      $or: [{ access: 'public' }, {
        access: 'role',
        $and: { role: response.locals.user.role }
      }, {
        access: 'private',
        $and: { author: response.locals.user.id }
      }]
    };

    return Document.findAndCountAll(options)
      .then((docs) => {
        let statusCode = 200;
        const responseData = { documents: docs.rows, count: docs.count };
        if (isPaginationRequired) {
          const pageMetadata = getPageMetadata(
            options.limit,
            options.offset,
            docs);
          if (!docs.rows[0]) {
            pageMetadata.message = errorMessages.endOfPageReached;
            statusCode = 404;
          }
          responseData.pageMetadata = pageMetadata;
        }
        return response.status(statusCode).json(responseData);
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
  searchDocuments(request, response) {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a document'
    });
  }
};
