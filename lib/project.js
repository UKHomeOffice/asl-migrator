const EntityMigrator = require('./entity-migrator');
const moment = require('moment');

class Project extends EntityMigrator {

  get id() {
    return this.inbound.project_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Project;
  }

  static transform(data) {
    return {
      establishmentId: data.establishment,
      migrated_id: data.project_id,
      status: 'active',
      title: data.title,
      issueDate: data.issued,
      expiryDate: moment(data.issued).add(5, 'years').format('YYYY-MM-DD'),
      licenceNumber: `XY-00000${data.project_id}`
    }
  }

  migrate() {
    return Promise.resolve()
      .then(() => {
        return this.models.PIL.findAll({
          where: { establishmentId: this.outbound.establishmentId }
        });
      })
      .then(pils => {
        if (!pils.length) {
          return;
        }
        const index = Math.floor(Math.random() * pils.length);
        const profile = pils[index].profileId;
        this.outbound.licenceHolderId = profile;
        return super.migrate();
      });
  }

}

module.exports = Project;
