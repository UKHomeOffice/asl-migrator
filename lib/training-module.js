const { sample } = require('lodash');
const EntityMigrator = require('./entity-migrator');

const species = [
  'Rats and mice',
  'Ferrets',
  'Fish',
  'Non-human primates',
  'Equidae',
  null
];

class TrainingModule extends EntityMigrator {

  get id() {
    return this.inbound.training_module_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.TrainingModule;
  }

  static transform(data) {
    return {
      migrated_id: data.training_module_id,
      module: data.training_module_module,
      species: sample(species),
      pass_date: data.training_module_pass_date.replace(/\//g, '-'),
      not_applicable: data.training_module_not_applicable,
      accrediting_body: data.training_module_accrediting_body,
      other_accrediting_body: data.training_module_other_accrediting_body,
      certificate_number: data.training_module_certificate_number,
      exemption: data.training_module_exemption,
      exemption_description: data.training_module_exemption_description
    }
  }

  migrate() {
    return Promise.resolve()
      .then(() => this.models.Profile.findAll())
      .then(profiles => {
        if (!profiles.length) {
          return;
        }
        const index = Math.floor(Math.random() * profiles.length);
        this.outbound.profileId = profiles[index].id;
        return super.migrate();
      });
  }

}

module.exports = TrainingModule;
