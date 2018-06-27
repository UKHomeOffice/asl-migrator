const EntityMigrator = require('./entity-migrator');

const { HOLDING, SUITABILITY } = require('./type-mappings');
const HOLDING_CODES = require('./codes/holding');
const SUITABILITY_CODES = require('./codes/suitability');

class Location extends EntityMigrator {

  get id() {
    return this.inbound.locations_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Place;
  }

  static transform(data) {
    return {
      establishmentId: data.locations_establishment_id,
      migrated_id: data.locations_id,
      site: data.locations_location,
      area: data.locations_sublocation,
      name: data.locations_area,
      suitability: SUITABILITY(data.locations_suit_codes),
      holding: HOLDING(data.locations_hold_codes),
      notes: Location.generateRestrictions()
    }
  }

  static generateRestrictions() {
    if (Math.random() > 0.9) {
      return `* Perfusion under general anaesthetic & Schedule 1 killing
      * Monday to Thursday only`;
    }
    return null;
  }

  migrate() {
    return Promise.resolve()
      .then(() => {
        this.outbound.nacwoId = null;
        if (this.inbound.locations_nacwo) {
          return this.models.Role.findOne({ where: { migrated_id: this.inbound.locations_nacwo } })
            .then(model => {
              if (model) {
                this.outbound.nacwoId = model.id;
              }
            });
        }
      })
      .then(() => super.migrate());
  }

}

module.exports = Location;
