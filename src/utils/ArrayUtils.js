const _ = require("lodash");

const foundObjectInArray = (obj, arr) => {
  return _.some(arr, obj);
};

const removeObjectFromArray = (obj, arr) => {
  _.remove(arr, function(item) {
    return _.isEqual(item, obj);
  });
};

module.exports = {
  foundObjectInArray,
  removeObjectFromArray
};
