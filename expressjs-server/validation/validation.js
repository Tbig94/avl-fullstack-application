const { Joi } = require('express-validation');

//#region User validation
const userGetVal = {
  params: Joi.object({
    active: Joi.boolean(),
    keyWord: Joi.string(),
    sortCol: Joi.string(),
    orderVal: Joi.string(),
    page: Joi.number(),
  }),
};

const userPostVal = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    active: Joi.boolean().required(),
    roles: Joi.array().required(),
  }),
};

const userPutVal = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    active: Joi.boolean().required(),
    roles: Joi.array().required(),
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const userDelVal = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
//#endregion

//#region Role validation
const roleGetVal = {
  params: Joi.object({
    active: Joi.boolean(),
    keyWord: Joi.string(),
    sortCol: Joi.string(),
    orderVal: Joi.string(),
    page: Joi.number(),
  }),
};

const rolePostVal = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    active: Joi.boolean().required(),
    permissions: Joi.array().required(),
  }),
};

const rolePutVal = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    active: Joi.boolean().required(),
    permissions: Joi.array().required(),
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const roleDelVal = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
//#endregion

module.exports = {
  userGetVal,
  userPostVal,
  userPutVal,
  userDelVal,
  roleGetVal,
  rolePostVal,
  rolePutVal,
  roleDelVal,
};
