const assert = require('assert');
const LocationMapper = require('../lib/location');

describe('Location', () => {

  describe('transform', () => {

    describe('holding codes', () => {

      it('correctly splits holding codes separated by spaces', () => {
        const input = {
          locations_suit_codes: '',
          locations_hold_codes: 'STH LTH'
        }
        const output = LocationMapper.transform(input);
        assert.deepEqual(output.holding, ['STH', 'LTH']);
      });

      it('correctly splits holding codes separated by commas', () => {
        const input = {
          locations_suit_codes: '',
          locations_hold_codes: 'STH, LTH'
        }
        const output = LocationMapper.transform(input);
        assert.deepEqual(output.holding, ['STH', 'LTH']);
      });

      it('correctly splits holding codes separated by a mixture of spaces and commas', () => {
        const input = {
          locations_suit_codes: '',
          locations_hold_codes: 'STH, LTH NSEP'
        }
        const output = LocationMapper.transform(input);
        assert.deepEqual(output.holding, ['STH', 'LTH', 'NSEP']);
      });

      it('adds the holding codes to the notes if it contains a "not code"', () => {
        const input = {
          locations_suit_codes: '',
          locations_hold_codes: 'STH, LTH (Ferrets)'
        }
        const output = LocationMapper.transform(input);
        assert.equal(output.notes, 'STH, LTH (Ferrets)');
      });

      it('preserves any existing notes when appending holding code notes', () => {
        const input = {
          locations_suit_codes: '',
          locations_hold_codes: 'STH, LTH (Ferrets)',
          locations_area_notes: 'Some other note'
        }
        const output = LocationMapper.transform(input);
        assert.equal(output.notes, 'Some other note\nSTH, LTH (Ferrets)');
      });

    });


    describe('suitability codes', () => {

      it('correctly splits suitability codes separated by spaces', () => {
        const input = {
          locations_suit_codes: 'LA NHP',
          locations_hold_codes: ''
        }
        const output = LocationMapper.transform(input);
        assert.deepEqual(output.suitability, ['LA', 'NHP']);
      });

      it('correctly splits suitability codes separated by commas', () => {
        const input = {
          locations_suit_codes: 'LA, NHP',
          locations_hold_codes: ''
        }
        const output = LocationMapper.transform(input);
        assert.deepEqual(output.suitability, ['LA', 'NHP']);
      });

      it('correctly splits suitability codes separated by a mixture of spaces and commas', () => {
        const input = {
          locations_suit_codes: 'LA, NHP EQ',
          locations_hold_codes: ''
        }
        const output = LocationMapper.transform(input);
        assert.deepEqual(output.suitability, ['LA', 'EQ', 'NHP']);
      });

      it('does not migrate notes if everything in the suitability codes is a code', () => {
        const input = {
          locations_suit_codes: 'SA, LA',
          locations_hold_codes: ''
        }
        const output = LocationMapper.transform(input);
        assert.equal(output.notes, '');
      });

      it('adds the suitability codes to the notes if it contains a "not code"', () => {
        const input = {
          locations_suit_codes: 'SA Ferret',
          locations_hold_codes: ''
        }
        const output = LocationMapper.transform(input);
        assert.equal(output.notes, 'SA Ferret');
      });

      it('preserves any existing notes when appending suitability code notes', () => {
        const input = {
          locations_suit_codes: 'SA Ferret',
          locations_hold_codes: '',
          locations_area_notes: 'Some other note'
        }
        const output = LocationMapper.transform(input);
        assert.equal(output.notes, 'Some other note\nSA Ferret');
      });

    });

  });

});