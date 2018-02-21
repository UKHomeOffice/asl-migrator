const assert = require('assert');
const RoleMapper = require('../lib/role');

describe('Role', () => {

  describe('transformRole', () => {

    it('correctly maps roles names to codes', () => {
      const inputs = {
        'nvs': [
          'Named Veterinary Surgeon (NVS)',
          'Named Veterinary Surgeon'
        ],
        'nio': 'Named Information Officer',
        'nacwo': [
          'Named Person Responsible For Day To Day Care Of Animals (NACWO)',
          'Named Person Responsible For Day To Day Care Of Animals'
        ],
        'ntco': 'Named Training And Competence Officer'
      };

      Object.keys(inputs).forEach(key => {
        if (!Array.isArray(inputs[key])) {
          inputs[key] = [inputs[key]];
        }
        inputs[key].forEach(str => {
          assert.equal(RoleMapper.transformRole(str), key);
        })
      });
    });

  });

});