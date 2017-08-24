import express from 'express';
import logger from 'morgan';
import http from 'http';
import bodyParser from 'body-parser';
import router from './routes/routes';
import jsonErrorHandler from './middlewares/jsonErrorHandler';
import serverErrorHandler from './middlewares/serverErrorHandler';
import methodValidator from './middlewares/methodValidator';
import invalidEndpointReporter from './middlewares/invalidEndpointReporter';

const app = express();
app.set('PORT', process.env.PORT || 3000);
const server = http.createServer(app);
app.use(logger('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(jsonErrorHandler);
app.use(serverErrorHandler);
app.use(methodValidator);
app.use('/api/v1/', router);
app.use('*', invalidEndpointReporter);

server.listen(app.get('PORT'));

export default server;
