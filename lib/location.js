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
      name: data.locations_area,
      site: data.locations_location,
      building: null,
      floor: null,
      suitability: SUITABILITY(data.locations_suit_codes),
      holding: HOLDING(data.locations_hold_codes),
      notes: Location.mapNotes(data.locations_area_notes, data.locations_suit_codes, data.locations_hold_codes)
    }
  }

  static mapNotes(notes, suitability, holding) {
    const result = [];
    const hasForeign = (str, codes) => {
      return str.split(/(,| )/).filter(code => code && !codes.includes(code)).length > 0;
    }
    if (notes) {
      result.push(notes);
    }
    if (hasForeign(suitability, SUITABILITY_CODES)) {
      result.push(suitability);
    }
    if (hasForeign(holding, HOLDING_CODES)) {
      result.push(holding);
    }
    return result.join('\n');
  }

  migrate() {
    return Promise.resolve()
      .then(() => {
        this.outbound.nacwoId = null;
        if (this.inbound.locations_nacwo) {
          return this.models.Role.findOne({ where: { migrated_id: this.inbound.locations_nacwo } })
            .then(model => {
              this.outbound.nacwoId = model.id;
            });
        }
      })
      .then(() => super.migrate());
  }

}

module.exports = Location;
