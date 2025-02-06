const joi = require('joi');

exports.validateNewUserMiddleware = async (req, res, next) => {
  // const NewUserPayload = req.body;
  console.log(JSON.stringify(req.body, null, 2))
  try {
    await validateNewUser.validateAsync(req.body)
    next;
  } catch (err) {
    res.status(406).send(err.details[0].message);
  }
};

exports.validateUserMiddleware = async (req,res,next) => {
  const userPayload = req.body ;
  console.log(`validating : ${userPayload}`)
  try {
   await validateUser.validateAsync(userPayload)
    next;
  } catch (err) {
    res.status(406).send(err.details[0].message);
  }

}

const validateNewUser = joi.object({
  firstname: joi.string()
  .min(3)
  .max(30)
  .required(),
  lastname: joi.string()
  .min(3)
  .max(30)
  .required(),
  username: joi.string()
  .alphanum()
  .min(3)
  .max(30)
  .required(),
  email: joi.string()
  .email(),
  password: joi.string()
  .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});
 
const validateUser = joi.object({
  email: joi.string()
  .email(),
  password: joi.string()
  .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

