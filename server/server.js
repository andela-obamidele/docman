import express from 'express';
import logger from 'morgan';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import router from './routes/routes';
import jsonErrorHandler from './middlewares/jsonErrorHandler';
import serverErrorHandler from './middlewares/serverErrorHandler';
import methodValidator from './middlewares/methodValidator';
import invalidEndpointReporter from './middlewares/invalidEndpointReporter';

const app = express();
app.use(express.static('./public/'));
app.set('PORT', process.env.PORT || 4001);
app.use(logger('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(jsonErrorHandler);
app.use(methodValidator);
app.use('/api/v1/', router);
app.get('*', (request, response) =>
  response.sendFile(path.resolve(__dirname, '../public/index.html'))
);
app.use('*', invalidEndpointReporter);
app.use(serverErrorHandler);
const server = http.createServer(app);
server.listen(app.get('PORT'));

export default server;
