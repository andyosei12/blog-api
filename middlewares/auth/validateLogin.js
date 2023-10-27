const Joi = require('joi');

const validateLogin = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    return res.status(422).json({
      message: err.message,
    });
  }
};

module.exports = validateLogin;
