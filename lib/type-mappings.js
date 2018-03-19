const moment = require('moment');

const holdingCodes = require('./codes/holding');
const suitabilityCodes = require('./codes/suitability');

const filterCodes = (str, codes) => {
  return codes.reduce((list, code) => {
    return str.match(new RegExp(`(^| |,)${code}( |,|$)`)) ? list.concat(code) : list;
  }, []);
}

module.exports = {
  BOOL: val => val === '1',
  DATE: str => str ? moment(str, 'DD/MM/YYYY').format('YYYY-MM-DD') : null,
  HOLDING: str => filterCodes(str, holdingCodes),
  SUITABILITY: str => filterCodes(str, suitabilityCodes)
};
