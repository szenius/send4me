const {isEqual, some, remove} = require("lodash");

const foundObjectInArray = (obj, arr) => {
  return some(arr, obj);
};

const removeObjectFromArray = (obj, arr) => {
  remove(arr, function(item) {
    return isEqual(item, obj);
  });
};

module.exports = {
  foundObjectInArray,
  removeObjectFromArray
};
