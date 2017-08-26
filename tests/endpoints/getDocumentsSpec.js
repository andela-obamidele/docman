import jwt from 'jsonwebtoken';
import { assert } from 'chai';
import supertest from 'supertest';
import { Document, User } from '../../server/models';
import server from '../../server/server';
import dummyAdmins from '../dummyData/dummyAdmins';
import dummyUsers from '../dummyData/dummyUsers';
import errorConstants from '../../server/constants/errorConstants';

const request = supertest(server);

describe('GET /api/v1/documents/', () => {
  const dummyAdmin = dummyAdmins[0];
  const dummyUser = dummyUsers[0];
  let adminAuthToken;
  let userAuthToken;
  before(() => Document
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() =>
      User.destroy({ where: {}, cascade: true, restartIdentity: true }))
    .then(() => User.bulkCreate(dummyAdmins))
    .then(() => request
      .post('/api/v1/users/')
      .send({
        ...dummyUser,
        confirmationPassword: dummyUsers[0].password
      })
      .expect(201)
      .expect((response) => {
        userAuthToken = response.body.token;
      }))
    .then(() => request
      .post('/api/v1/users/login')
      .send({
        email: dummyAdmin.email,
        password: 'password'
      })
      .expect(200)
      .expect((response) => {
        adminAuthToken = response.body.token;
      }))
    .catch(error => error)
  );

  it('should get an array of created documents when endpoint is reached',
    () => request
      .post('/api/v1/documents')
      .send({
        title: 'title',
        content: 'content',
        access: 'public'
      })
      .set('Authorization', userAuthToken)
      .expect(201)
      .then(() => request
        .get('/api/v1/documents')
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const { title, content, access } = response.body.documents[0];
          assert.equal(title, 'title');
          assert.equal(content, 'content');
          assert.equal(access, 'public');
        })
      ));
  it('should not get private document of other users', () => request
    .post('/api/v1/documents')
    .send({
      title: 'some title',
      content: 'some content',
      access: 'private'
    })
    .set('Authorization', adminAuthToken)
    .expect(201)
    .then(() => request
      .get('/api/v1/documents')
      .set('Authorization', userAuthToken)
      .expect(200)
      .expect((response) => {
        const { documents } = response.body;
        assert.lengthOf(documents, 1);
        const { content, access, title } = documents[0];
        assert.notEqual(title, 'some title');
        assert.notEqual(content, 'some content');
        assert.notEqual(access, 'private');
        assert.equal(title, 'title');
        assert.equal(content, 'content');
        assert.equal(access, 'public');
      })
    )
  );
  it(`should not show document marked role that belongs to a user
  with higher role`, () => request
      .post('/api/v1/documents')
      .send({
        title: 'admin secrete document',
        content: 'admn secrete content',
        access: 'role'
      })
      .set('Authorization', adminAuthToken)
      .expect(201)
      .then(() => request
        .get('/api/v1/documents')
        .set('Authorization', userAuthToken)
        .expect(200)
        .expect((response) => {
          const user = jwt.decode(userAuthToken.split(' ')[1]).data;
          const documents = response.body.documents;
          const [doc] = documents;
          assert.lengthOf(documents, 1);
          assert.equal(doc.authorId, user.id);
        }))
  );
  it(`should respond with documents, counts and pages pageMetadata
  when limit and offset is provided as a queries`, () => request
      .get('/api/v1/documents/?limit=2&offset=0')
      .set('Authorization', adminAuthToken)
      .expect(200)
      .expect((response) => {
        const { documents, count, pageMetadata } = response.body;
        assert.lengthOf(documents, 2);
        assert.equal(count, 3);
        assert.containsAllKeys(pageMetadata, [
          'totalCount',
          'currentPage',
          'pageCount',
          'pageSize']);
      })
  );
  it(`should respond with page matadata which contains a message
  when limit and  offset exceed the total number of data available in 
  the database`, () => request
      .get('/api/v1/documents/?limit=10&offset=10')
      .set('Authorization', adminAuthToken)
      .expect(404)
      .expect((response) => {
        const message = response.body.pageMetadata.message;
        assert.equal(message, errorConstants.endOfPageReached);
      })
  );
});
