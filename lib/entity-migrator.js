class EntityMigrator {

  constructor(data, db, options) {
    this.inbound = data;
    this.outbound = this.constructor.transform(data);
    this.log = options.log;
    this.models = db;
  }

  log(message) {
    if (this.log) {
      this.log(message);
    }
  }

  static transform(data) {
    return data;
  }

  insert() {
    this.log(`Inserting record ${this.id} ${JSON.stringify(this.outbound, null, '  ')}`);
    return this.model.create(this.outbound);
  }

  update(model) {
    this.log(`Updating record ${this.id} ${JSON.stringify(this.outbound, null, '  ')}`);
    model.set(this.outbound);
    return model.save();
  }

  migrate() {
    return this.model.findOne({ where: { migrated_id: this.id } })
      .then(model => {
        return model ? this.update(model) : this.insert();
      });
  }

}

module.exports = EntityMigrator;
