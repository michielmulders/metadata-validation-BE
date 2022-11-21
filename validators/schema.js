const { getSchema } = require("../schemas");

const Validator = require("jsonschema").Validator;
const validator = new Validator();

/*
 * @desc: schema validator -> verifies instance against JSON schema HIP412@1.0.0
 */
const schemaValidator = (instance, schema) => {
  const errors = [];
  let result = validator.validate(instance, schema);

  result.errors.forEach((error) => {
    errors.push({
      type: "schema",
      msg: error.message,
    });
  });

  return errors;
};

module.exports = {
  schemaValidator,
};
