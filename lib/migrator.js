const Promise = require('bluebird');
const { EventEmitter } = require('events');
const parse = require('csv-parse/lib/sync');
const uuid = require('uuid/v1');

const Establishment = require('./establishment');

class Migrator extends EventEmitter {

  constructor(data, options) {
    super();
    this.id = uuid();
    this.db = options.db;
    this.data = this.parse(data);
    this.type = this.getEntityType(this.data);
    if (options.sse) {
      this.on('message', message => options.sse.send({ message }, this.id));
      this.on('error', error => options.sse.send({ type: 'error', message: error.stack }, this.id));
      this.on('end', () => options.sse.send({ message: 'Done' }, this.id));
    }
  }

  parse(csv) {
    return parse(csv, { columns: true });
  }

  getEntityType(rows) {
    const keys = Object.keys(rows[0]);
    if (rows.length === 0) {
      throw new Error('Dataset provided is empty');
    }
    if (keys[0].match(/^establishments_/)) {
      return 'establishment';
    }
    /*if (keys[0].match(/^locations_/)) {
      return 'place';
    }
    if (keys[0].match(/^named_individuals_/)) {
      return 'role';
    }*/
    throw new Error('Unrecognised data type');
  }

  getRecordMigrator(record) {
    if (this.type === 'establishment') {
      return new Establishment(record, this.db, {
        log: message => {
          this.emit('message', message);
        }
      });
    }
  }

  migrate(data) {
    this.emit('message', `Importing ${this.data.length} ${this.type} records`);
    return this.db.sync({ force: true })
      .then(() => {
        return Promise.map(this.data, record => {
          const migrator = this.getRecordMigrator(record);
          return migrator.migrate();
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