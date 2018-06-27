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

    });

  });

});
