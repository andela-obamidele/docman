import { Document } from '../models';
import errorMessages from '../constants/errors';
import successMessages from '../constants/successes';
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
    const currentUserId = response.locals.user.id;
    const documentId = request.params.id;
    if (Number.isNaN(Number(documentId))) {
      return response
        .status(400).json({ error: errorMessages.wrongIdTypeError });
    }
    return Document.findById(request.params.id)
      .then((doc) => {
        const updateData = helpers.getTruthyDocUpdate(request.body);
        helpers.terminateDocUpdateOnBadPayload(doc, currentUserId, updateData);

        return doc.update(updateData);
      })
      .then(updatedDoc => response
        .json({ document: updatedDoc.dataValues }))
      .catch(error => helpers.handleDocumentUpdateErrors(error, response));
  },
  deleteDocument: (request, response) => {
    const id = request.params.id;
    return Document
      .destroy({ where: { id }, cascade: true, restartIdentity: true })
      .then(() => response.send({
        message: successMessages.docDeleteSuccessful
      })
      );
  },
  getUserDocuments: (request, response) => {
    const loggedInUser = response.locals.user;
    let userToSearchId = request.params.id;
    userToSearchId = Number.parseInt(userToSearchId, 10);
    if (Number.isNaN(userToSearchId)) {
      return response.status(400).json({ error: 'id must be a number' });
    }
    const queryOptions = { where: {} };
    queryOptions.where = { author: userToSearchId };

    if (loggedInUser.role === 1) {
      queryOptions.where.$or = [
        { access: 'public' },
        {
          access: 'role',
        },
      ];
    } else if (loggedInUser.role === 2 && loggedInUser.id !== userToSearchId) {
      queryOptions.where.$or = [
        { access: 'public' },
        {
          access: 'role',
        },
      ];
      queryOptions.where.$and = { role: 2 };
    }

    return Document.findAll(queryOptions)
      .then((doc) => {
        if (!doc[0]) {
          return response
            .status(404)
            .json({ error: errorMessages.noDocumentFoundError });
        }
        return response.json({ documents: doc });
      });
  },
  searchDocuments(request, response) {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a document'
    });
  }
};
