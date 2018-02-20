const EntityMigrator = require('./entity-migrator');

const { DATE, BOOL } = require('./type-mappings');

class Establishment extends EntityMigrator {

  get id() {
    return this.inbound.establishments_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Establishment;
    this.elh = this.transformProfile(this.inbound);
  }

  transform(data) {
    return {
      id: this.id,
      migrated_id: this.id,
      name: data.establishments_establishment_name,
      type: data.establishments_type,
      status: data.establishments_licence_status.toLowerCase(),
      issueDate: DATE(data.establishments_issued_at),
      revocationDate: DATE(data.establishments_revoked_on),
      licenceNumber: data.establishments_licence_no,

      country: data.establishments_country.toLowerCase(),
      address: data.establishments_establishment_address,
      email: data.establishments_licence_email,

      procedure: BOOL(data.establishments_procedure_establishment),
      breeding: BOOL(data.establishments_breeding_establishment),
      supplying: BOOL(data.establishments_supplying_establishment),
      killing: BOOL(data.establishments_has_killing_methods),
      rehomes: BOOL(data.establishments_has_set_free_rehomes),

      conditions: data.establishments_conditions
    }
  }

  transformProfile(data) {
    return {
      migrated_id: `elh_${data.establishments_id}`,
      title: data.establishments_title,
      firstName: data.establishments_forename,
      lastName: data.establishments_surname,
      dob: DATE(data.establishments_date_of_birth),
      position: data.establishments_position,
      qualifications: data.establishments_qualifications,
      address: data.establishments_correspondence_address,
      postcode: data.establishments_correspondence_postcode,
      email: data.establishments_email,
      telephone: data.establishments_phone_no,
      notes: data.establishments_experience
    }
  }

  migrate() {
    return super.migrate()
      .then(establishment => {
        return this.models.Profile.findOne({ where: { migrated_id: this.elh.migrated_id } })
          .then(profile => {
            if (profile) {
              return profile.set(this.elh).save();
            }
            return this.models.Profile.create(this.elh);
          })
          .then(profile => {
            return this.models.Role.destroy({ where: { type: 'elh', establishmentId: this.id } })
              .then(() => {
                return establishment.createRole({
                  type: 'elh',
                  migrated_id: this.elh.migrated_id,
                  profileId: profile.id
                })
              });
          });

      });
  }

}

module.exports = Establishment;
