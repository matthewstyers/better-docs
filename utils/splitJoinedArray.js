const _ = require('lodash');
module.exports = function splitJoinedArray(string, delimiter, limit) {
  /* return a list that's already an array */
  if (_.isArray(string)) return string;

  let sep = delimiter;
  switch (true) {
  /* if delimiter is explicitly declared, use that */
  case !_.isEmpty(delimiter): break;
  case _.includes(string, ', '): sep = ', '; break;
  case _.includes(string, ','): sep = ','; break;
  case _.includes(string, ' | '): sep = ' | '; break;
  case _.includes(string, '|'): sep = '|'; break;
  default: sep = ' '; break;
  }
  return _.split(string, sep, limit);
};
