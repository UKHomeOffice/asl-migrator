const EntityMigrator = require('./entity-migrator');

const { DATE } = require('./type-mappings');

class Role extends EntityMigrator {

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Profile;
    this.outbound.migrated_id = this.id;
  }

  get id() {
    const {
      named_individuals_establishment_id,
      named_individuals_forename,
      named_individuals_surname,
      named_individuals_date_of_birth
    } = this.inbound;
    return `${named_individuals_establishment_id}-${named_individuals_forename}-${named_individuals_surname}-${DATE(named_individuals_date_of_birth)}`;
  }


  static transform(data) {
    return {
      establishmentId: data.named_individuals_establishment_id,
      migrated_id: data.named_individuals_id,
      title: data.named_individuals_title,
      firstName: data.named_individuals_forename,
      lastName: data.named_individuals_surname,
      dob: DATE(data.named_individuals_date_of_birth),
      qualifications: data.named_individuals_qualifications,
      certifications: data.named_individuals_course_year,
      address: data.named_individuals_address,
      postcode: data.named_individuals_postcode,
      email: data.named_individuals_email,
      telephone: data.named_individuals_phone_no,
      notes: data.named_individuals_facilities
    }
  }

  static transformRole(role) {
    role = role.toLowerCase();

    const roles = [
      'nacwo',
      'ntco',
      'nio',
      'nvs'
    ];

    const matched = roles.reduce((found, r) => {
      return found || (role.includes(r) ? r : null);
    }, null);

    if (matched) {
      return matched;
    }
    if (role.includes('information officer')) {
      return 'nio';
    }
    if (role.includes('training')) {
      return 'ntco';
    }
    if (role.includes('care')) {
      return 'nacwo';
    }
    if (role.includes('surgeon')) {
      return 'nvs';
    }
  }

  migrate() {
    return super.migrate()
      .then(profile => {

        const role = this.inbound.named_individuals_role;
        const type = Role.transformRole(role);

        if (type) {
          const input = {
            type,
            migrated_id: this.inbound.named_individuals_id,
            establishmentId: profile.establishmentId,
            profileId: profile.id
          };
          this.log(`Creating role: ${JSON.stringify(input, null, '  ')}`);
          return this.models.Role.destroy({ where: { migrated_id: input.migrated_id } })
            .then(this.models.Role.create(input));
        }
      });
  }

}

module.exports = Role;
