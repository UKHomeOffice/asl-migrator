const EntityMigrator = require('./entity-migrator');

const { DATE } = require('./type-mappings');

class PIL extends EntityMigrator {

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Profile;
    this.outbound.migrated_id = this.id;
  }

  get id() {
    const {
      pil_establishment,
      first_name,
      last_name,
      dob
    } = this.inbound;
    return `${pil_establishment}-${first_name}-${last_name}-${dob}`;
  }

  static transform(data) {
    return {
      establishment: data.pil_establishment,
      title: data.title,
      firstName: data.first_name,
      lastName: data.last_name,
      dob: data.dob,
      email: data.email,
      telephone: data.phone
    }
  }

  migrate() {
    return super.migrate()
      .then(profile => {
        return profile.addEstablishment(this.outbound.establishment)
          .then(() => profile);
      })
      .then(profile => {
        const input = {
          establishmentId: this.inbound.pil_establishment,
          migrated_id: this.inbound.licenceNumber,
          status: 'active',
          licenceNumber: this.inbound.licenceNumber,
          conditions: this.inbound.conditions,
          issueDate: this.inbound.issued,
          profileId: profile.id
        };
        this.log(`Creating PIL: ${JSON.stringify(input, null, '  ')}`);
        return this.models.PIL.destroy({ where: { migrated_id: input.migrated_id } })
          .then(this.models.PIL.create(input));
      });
  }

}

module.exports = PIL;
