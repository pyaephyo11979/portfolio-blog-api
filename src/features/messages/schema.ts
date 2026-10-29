import joi from 'joi';
export const createMessageSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  message: joi.string().required(),
});
