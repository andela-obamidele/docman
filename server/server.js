import express from 'express';
import logger from 'morgan';
import http from 'http';
import bodyParser from 'body-parser';
import router from './routes/routes';

const app = express();
app.set('PORT', process.env.PORT || 3000);
const server = http.createServer(app);
app.use(logger('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/v1/', router);
app.use('*', (req, res, next) => {
  res.status(404).send('the resource you\'re trying to access is not available');
  next();
});

server.listen(app.get('PORT'));

export default server;
