var CommonValidator = function () {};

CommonValidator.prototype.validateString = function (value, regExp = /\S+/) {
  return typeof value === 'string' && regExp.test(value);
};

CommonValidator.prototype.validateEmail = function (email) {
  var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return this.validateString(email, regex);
};

module.exports = CommonValidator;
