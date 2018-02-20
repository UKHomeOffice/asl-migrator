const EntityMigrator = require('./entity-migrator');

const { CODES } = require('./type-mappings');

class Location extends EntityMigrator {

  get id() {
    return this.inbound.locations_id;
  }

  constructor(data, db, options) {
    super(data, db, options);
    this.model = db.Place;
  }

  transform(data) {
    return {
      establishmentId: data.locations_establishment_id,
      migrated_id: this.id,
      name: data.locations_area,
      site: data.locations_location,
      building: null,
      floor: null,
      suitability: CODES(data.locations_suit_codes),
      holding: CODES(data.locations_hold_codes),
      notes: this.mapNotes(data.locations_area_notes, data.locations_suit_codes, data.locations_hold_codes)
    }
  }

  mapNotes(notes, suitability, holding) {
    const result = [];
    if (notes) {
      result.push(notes);
    }
    suitability.split(',').forEach(code => {
      if (code.match(/\(.*\)/)) {
        result.push(code.trim());
      }
    });
    holding.split(',').forEach(code => {
      if (code.match(/\(.*\)/)) {
        result.push(code.trim());
      }
    });

    return result.join('\n');
  }

}

module.exports = Location;
