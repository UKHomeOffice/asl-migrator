const Promise = require('bluebird');
const { EventEmitter } = require('events');
const parse = require('csv-parse/lib/sync');
const uuid = require('uuid/v1');

const Establishment = require('./establishment');
const Location = require('./location');
const Role = require('./role');
const PIL = require('./pil');
const Project = require('./project');

class Migrator extends EventEmitter {

  constructor(data, options) {
    super();
    this.id = uuid();
    if (options.sse) {
      this.on('message', message => options.sse.send({ message }, this.id));
      this.on('error', error => options.sse.send({ type: 'error', message: error.stack }, this.id));
      this.on('end', () => options.sse.send({ message: 'Done' }, this.id));
    }
    this.db = options.db;
    this.data = this.parse(data);
    this.type = this.getEntityType(this.data);
  }

  parse(csv) {
    return parse(csv, { columns: true });
  }

  getEntityType(rows) {
    if (rows.length === 0) {
      throw new Error('Dataset provided is empty');
    }
    const keys = Object.keys(rows[0]);
    if (keys[0].match(/^establishments_/)) {
      return 'establishment';
    }
    if (keys[0].match(/^locations_/)) {
      return 'location';
    }
    if (keys[0].match(/^named_individuals_/)) {
      return 'role';
    }
    if (keys[0].match(/^project/)) {
      return 'project';
    }
    if (keys[0].match(/^pil_establishment/)) {
      return 'pil';
    }
    this.emit('error', new Error('Unrecognised data type'));
  }

  getRecordMigrator(record) {
    const opts = {
      log: message => {
        this.emit('message', message);
      }
    };
    if (this.type === 'establishment') {
      return new Establishment(record, this.db, opts);
    }
    if (this.type === 'location') {
      return new Location(record, this.db, opts);
    }
    if (this.type === 'role') {
      return new Role(record, this.db, opts);
    }
    if (this.type === 'pil') {
      return new PIL(record, this.db, opts);
    }
    if (this.type === 'project') {
      return new Project(record, this.db, opts);
    }
  }

  migrate(data) {
    if (!this.type) {
      return this.done();
    }
    let done = 0;
    this.emit('message', { type: this.type, total: this.data.length, done });
    return this.db.sync()
      .then(() => {
        return Promise.map(this.data, record => {
          const migrator = this.getRecordMigrator(record);
          return migrator.migrate()
            .then(() => {
              done++;
              this.emit('message', { type: this.type, total: this.data.length, done });
            });
        }, { concurrency: 1 })
      })
      .catch(e => this.emit('error', e))
      .then(() => this.done());
  }

  done() {
    this.emit('end');
  }

}

module.exports = Migrator;