import supertest from 'supertest';
import { assert } from 'chai';
import { User, Document } from '../../server/models';
import server from '../../server/server';
import dummyAdmins from '../dummyData/dummyAdmins';
import dummyUsers from '../dummyData/dummyUsers';
import errorConstants from '../../server/constants/errorConstants';

const request = supertest(server);
describe('GET /api/v1/documents/?q', () => {
  let user1AuthToken;
  let user2AuthToken;
  let adminAuthToken;
  before(() => Document
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true }))
    .then(() => User.bulkCreate(dummyAdmins))
    .then(() => request
      .post('/api/v1/users/login')
      .send(dummyAdmins[0])
      .expect(200)
      .then((response) => {
        adminAuthToken = response.body.token;
      }))
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUsers[0],
        confirmationPassword: dummyUsers[0].password
      })
      .expect(201)
      .then((response) => {
        user1AuthToken = response.body.token;
      }))
    .then(() => request
      .post('/api/v1/users')
      .send({
        ...dummyUsers[1],
        confirmationPassword: dummyUsers[1].password
      })
      .expect(201)
      .then((response) => {
        user2AuthToken = response.body.token;
      }))
  );

  it(`should respond with ${errorConstants.badDocumentsQuery} when query
  string q is not provided`, () => request
      .get('/api/v1/search/documents/?j=rubish')
      .set('Authorization', user1AuthToken)
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, errorConstants.emptySearchString);
      })
  );
  it('should not find private document of other users for admins',
    () => request
      .post('/api/v1/documents')
      .send({
        title: 'user private document',
        content: 'user private content',
        access: 'private'
      })
      .set('Authorization', user1AuthToken)
      .expect(201)
      .then(() => request
        .get('/api/v1/search/documents/?q=private')
        .set('Authorization', adminAuthToken)
        .expect(404)
        .expect((response) => {
          assert
            .equal(response.body.error, errorConstants.noDocumentFoundError);
        })
      )
  );
  it('should not find private documents of a user for other users',
    () => request
      .get('/api/v1/search/documents/?q=private')
      .set('Authorization', user2AuthToken)
      .expect(404)
      .expect((response) => {
        assert.equal(response.body.error, errorConstants.noDocumentFoundError);
      })
  );
  it('should find private documents for the owner of the document',
    () => request
      .get('/api/v1/documents/?q=private')
      .set('Authorization', user1AuthToken)
      .expect(200)
      .expect((response) => {
        const docs = response.body.documents;
        assert.typeOf(docs, 'Array');
        assert.lengthOf(docs, 1);
        const doc = docs.pop();
        assert.equal(doc.title, 'user private document');
        assert.equal(doc.content, 'user private content');
        assert.equal(doc.access, 'private');
      }));
  it('should find documents with role access for admins', () => request
    .post('/api/v1/documents')
    .send({
      title: 'user role document',
      content: 'user role content',
      access: 'role'
    })
    .set('Authorization', user1AuthToken)
    .expect(201)
    .then(() => request
      .get('/api/v1/search/documents?q=role')
      .set('Authorization', adminAuthToken)
      .expect(200)
      .expect((response) => {
        const docs = response.body.documents;
        assert.typeOf(docs, 'Array');
        assert.lengthOf(docs, 1);
        const doc = docs.pop();
        assert.equal(doc.title, 'user role document');
        assert.equal(doc.content, 'user role content');
        assert.equal(doc.access, 'role');
      })
    ));
  it('should find user document of role access for other users', () => request
    .get('/api/v1/search/documents?q=role')
    .set('Authorization', user2AuthToken)
    .expect(200)
    .expect((response) => {
      const docs = response.body.documents;
      assert.typeOf(docs, 'Array');
      assert.lengthOf(docs, 1);
      const doc = docs.pop();
      assert.equal(doc.title, 'user role document');
      assert.equal(doc.content, 'user role content');
      assert.equal(doc.access, 'role');
    }));
  it('should get user document of role acess to document owner',
    () => request
      .get('/api/v1/search/documents?q=role')
      .set('Authorization', user2AuthToken)
      .expect(200)
      .expect((response) => {
        const docs = response.body.documents;
        assert.typeOf(docs, 'Array');
        assert.lengthOf(docs, 1);
        const doc = docs.pop();
        assert.equal(doc.title, 'user role document');
        assert.equal(doc.content, 'user role content');
        assert.equal(doc.access, 'role');
      }));
  it('should not find admin documents with role access for users',
    () => request
      .post('/api/v1/documents')
      .send({
        title: 'for the admins',
        content: 'content for admins only',
        access: 'role'
      })
      .set('Authorization', adminAuthToken)
      .expect(201)
      .then(() => request
        .get('/api/v1/search/documents/?q=for the admins')
        .set('Authorization', user1AuthToken)
        .expect(404)
        .expect((response) => {
          assert
            .equal(
              response.body.error,
              errorConstants.noDocumentFoundError
            );
        })));
});
