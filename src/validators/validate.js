const joi = require("joi");

exports.registerValidate = (data) => {
  const schema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
};

exports.loginValidate = (data) => {
  const schema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().required(),
  });
  return schema.validate(data);
};

exports.billingValidate = (data) => {
  const schema = joi.object({
    name: joi.string().required().min(3),
    email: joi.string().required().email(),
    phone: joi
      .string()
      .regex(/(^(01){1}[3456789]{1}(\d){8})$/)
      .messages({ "string.pattern.base": `Invalid phone Number !` })
      .required(),
    payableAmount: joi.number().required(),
  });
  return schema.validate(data);
};
