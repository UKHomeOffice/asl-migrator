const moment = require('moment');

module.exports = {
  BOOL: val => val === '1',
  DATE: str => str ? moment(str, 'DD/MM/YYYY').format('YYYY-MM-DD') : null
};
