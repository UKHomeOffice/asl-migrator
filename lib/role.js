const EntityMigrator = require('./entity-migrator');

const { DATE } = require('./type-mappings');

class Role extends EntityMigrator {

  get id() {
    return this.inbound.named_individuals_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Profile;
  }

  transform(data) {
    return {
      establishmentId: data.named_individuals_establishment_id,
      migrated_id: this.id,
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

  transformRole() {
    const roles = [
      'nacwo',
      'ntco',
      'nio',
      'nvs'
    ];
    const data = this.inbound;
    const role = data.named_individuals_role.toLowerCase();

    const matched = roles.reduce((found, r) => {
      return found || role.includes(r) ? r : null;
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
        const type = this.transformRole();
        if (type) {
          const input = {
            type,
            migrated_id: this.id,
            establishmentId: profile.establishmentId,
            profileId: profile.id
          };
          this.log(`Creating role: ${JSON.stringify(input, null, '  ')}`);
          return this.models.Role.destroy({ where: { migrated_id: this.id } })
            .then(this.models.Role.create(input));
        }
      });
  }

}

module.exports = Role;
