import { Document } from '../models';
import errorConstants from '../constants/errorConstants';
import successConstants from '../constants/successConstants';
import documentHelpers from '../helpers/documentHelpers';

const getPageMetadata = documentHelpers.getPageMetadata;
const documentControllers = {
  /**
   * @description creates a document. accepts title, content
   * and access. responds with a created document object if 
   * document creation succeeds
   * @param {object} request http request object from express
   * @param {object} response http response object  from expressjs
   * @returns {Promise} promise from express http response
   */
  createDocument: (request, response) => {
    const { title, content, access } = request.body;
    const { id, roleId } = response.locals.user;
    return Document.create({ title, content, access, roleId, authorId: id })
      .then(doc =>
        response.status(201).json({
          document: doc.dataValues
        })
      )
      .catch(error => documentHelpers
        .handleCreateDocumentError(error, response));
  },
  /**
  * @description gets an array of documents available in the database
  * @param {object} request http request object from express
  * @param {object} response http response object  from expressjs
  * @returns {Promise} promise from express http response
  */
  getDocuments: (request, response) => {
    const paginationQueryStrings = response.locals.paginationQueryStrings;
    const currentUser = response.locals.user;
    const options = documentHelpers
      .generateFindDocumentsOptions(currentUser, paginationQueryStrings);
    return Document.findAndCountAll(options)
      .then((docs) => {
        let statusCode = 200;
        const responseData = { documents: docs.rows, count: docs.count };
        if (paginationQueryStrings) {
          const pageMetadata = getPageMetadata(
            options.limit,
            options.offset,
            docs);
          if (!docs.rows[0]) {
            pageMetadata.message = errorConstants.endOfPageReached;
            statusCode = 404;
          }
          responseData.pageMetadata = pageMetadata;
        } else if (!docs.rows[0]) {
          return response
            .status(404).json({ error: errorConstants.noDocumentFoundError });
        }
        return response.status(statusCode).json(responseData);
      });
  },
  /**
   * @description gets one document from database
   * @param {object} request expressjs request object
   * @param {object} response  expressjs response object
   * @returns {Promise} promise from express http resonse object
   */
  getDocument(request, response) {
    const currentUser = response.locals.user;
    let documentId = request.params.id;
    documentId = Number.parseInt(documentId, 10);
    Document.findById(documentId)
      .then((doc) => {
        if (!doc) {
          return response
            .status(404)
            .json({ error: errorConstants.noDocumentFoundError });
        } else if (!documentHelpers.isUserCanAccessDocument(currentUser, doc)) {
          return response
            .status(403)
            .json({ error: errorConstants.fileQueryForbiddenError });
        }
        return response
          .json({ document: doc });
      });
  },
  /**
   * @description update password, username, email but not id
   * @param {object} request expressjs http request object
   * @param {object} response expressjs http response object
   * @returns {Promise} Promise returned from expressjs response object
   */
  updateDocument: (request, response) => {
    const currentUserId = response.locals.user.id;
    return Document.findById(request.params.id)
      .then((doc) => {
        const updateData = documentHelpers.getTruthyDocUpdate(request.body);
        documentHelpers
          .terminateDocUpdateOnBadPayload(doc, currentUserId, updateData);
        return doc.update(updateData);
      })
      .then(updatedDoc => response
        .json({ document: updatedDoc.dataValues }))
      .catch(error => documentHelpers
        .handleDocumentUpdateErrors(error, response));
  },
  /**
   * @description delete a document using its id
   * @param {object} request expressjs request object
   * @param {object} response expressjs reponse object
   * @returns {Promise} promise from expressjs response object
   */
  deleteDocument: (request, response) => {
    const id = request.params.id;
    return Document
      .destroy({ where: { id }, cascade: true, restartIdentity: true })
      .then(() => response.json({
        message: successConstants.docDeleteSuccessful
      })
      );
  },
  /**
   * @description gets documents that belongs to a particular user
   * @param {object} request expressjs request object
   * @param {object} response expressjs response object
   * @return {Promise} Promise from expressjs response object
   */
  getUserDocuments: (request, response) => {
    const currentUser = response.locals.user;
    const userToSearchId = request.params.id;
    const queryOptions = documentHelpers
      .generateFindUserDocumentsOptions(currentUser, userToSearchId);
    return Document.findAll(queryOptions)
      .then((doc) => {
        if (!doc[0]) {
          return response
            .status(404)
            .json({ error: errorConstants.noDocumentFoundError });
        }
        return response.json({ documents: doc });
      });
  },
  /**
   * @description search through document title and sends http
   * response of an array containing matched objects
   * @param {object} request expressjs request object
   * @param {object} response expressjs response object
   * @returns {Promise} Promise from expressjs response ojectb
   */
  searchDocuments(request, response) {
    const query = request.query.q;
    if (!query) {
      return response
        .status(400).json({ error: errorConstants.badDocumentsQuery });
    }
    return Document.findAndCountAll({
      where: { title: { $ilike: `%${query}%` } },
    })
      .then((docs) => {
        if (!docs.count) {
          return response
            .status(404)
            .json({ error: errorConstants.noDocumentFoundError });
        }
        const currentUser = response.locals.user;
        docs = documentHelpers
          .removeRestrictedDocuments(currentUser, docs.rows);
        if (!docs[0]) {
          return response.status(404).json({
            error: errorConstants.noDocumentFoundError
          });
        }
        return response.json({ documents: docs });
      });
  }
};
export default documentControllers;
