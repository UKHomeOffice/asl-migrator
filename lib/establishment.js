const EntityMigrator = require('./entity-migrator');

const { DATE, BOOL } = require('./type-mappings');

class Establishment extends EntityMigrator {

  get id() {
    return this.inbound.establishments_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Establishment;
    this.elh = Establishment.transformProfile(this.inbound);
  }

  static transform(data) {
    return {
      id: data.establishments_id,
      migrated_id: data.establishments_id,
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

      conditions: 'Ensure that Natalie Page and Terrance Lang attend an accredited NACWO training course within the next 6 months. They are forbidden to work with LA until proof of this training has been provided to ASRU.'
    }
  }

  static transformProfile(data) {
    return {
      userId: data.user_id,
      migrated_id: data.establishments_email,
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
            return establishment.createProfile(this.elh);
          })
          .then(profile => {
            return this.models.Role.destroy({ where: { type: 'pelh', establishmentId: this.id } })
              .then(() => {
                return establishment.createRole({
                  type: 'pelh',
                  migrated_id: this.elh.migrated_id,
                  profileId: profile.id
                })
              });
          })
          .then(() => {
            return this.models.Authorisation.destroy({ where: { establishmentId: this.id } })
              .then(() => {
                if (establishment.killing) {
                  return establishment.createAuthorisation({
                    type: 'killing',
                    method: 'Use of concussion with captive bolt for LA',
                    description: 'All infant large animals under 6 months. This may apply to calves, lambs, and piglets. This method has been proven to be the most humane way of killing infant livestock.'
                  });
                }
              })
              .then(() => {
                if (establishment.rehomes) {
                  return establishment.createAuthorisation({
                    type: 'rehomes',
                    method: `The ${establishment.name} is currently undertaking major research into the levels of fertility in livestock. During the course of this research, some surplus stock may be produced. We have come to an agreement with 3 local sheep farmers to re-integrate these animals into the national flock.`,
                    description: 'Only infant lambs between 3 and 6 months. Older animals and other species are not covered by this authorisation.'
                  });
                }
              });
          });

      });
  }

}

module.exports = Establishment;
