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
  //db.sync({ force: true });

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
    const response = req.body.files.map(file => {
      const data = Buffer.from(file.data.split('base64,')[1], 'base64').toString('utf8');
      const migrator = new Migrator(data, { db, sse });
      return { name: file.name, id: migrator.id, migrator };
    });
    response.reduce((p, o) => {
      return p.then(() => o.migrator.migrate());
    }, Promise.resolve());
    res.json(response.map(r => ({ name: r.name, id: r.id })));
  });

  return app;

};
