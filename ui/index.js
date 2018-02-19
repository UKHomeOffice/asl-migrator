const ui = require('@asl/service/ui');
const bodyParser = require('body-parser');
const parse = require('csv-parse');
const SSE = require('express-sse');

const Schema = require('@asl/schema');

const Migrator = require('../lib/migrator');

module.exports = settings => {

  const app = ui(settings);
  const sse = new SSE();
  const db = Schema(settings.db);

  app.use(bodyParser.json({ limit: '10mb' }));

  app.static.use((req, res, next) => {
    res.locals.propositionHeader = 'ASL Data Migration';
    next();
  });

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/logs', sse.init);

  app.post('/upload', (req, res, next) => {
    const data = Buffer.from(req.body.data.split('base64,')[1], 'base64').toString('utf8');
    const migrator = new Migrator(data, { db, sse });
    migrator.migrate();
    res.json({ id: migrator.id });
  });

  return app;

};
