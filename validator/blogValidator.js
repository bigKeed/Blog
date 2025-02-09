const joi = require("joi");

exports.blogValidatorMiddleware = async (req, res, next) => {
  const blogPayload = req.body;
  try {
    await blogValidator.validateAsync(blogPayload);
    next();
  } catch (error) {
    res.status(406).send(error.details[0].message);
  }
};

const blogValidator = joi.object({
  title: joi.string()
  .min(3)
  .max(255)
  .required(),
  description: joi.string()
  .min(3)
  .max(255)
  .required(),
  author: joi.number()
  .integer,
  body: joi.string()
  .min(3)
  .max(255)
  .required(),
});
 