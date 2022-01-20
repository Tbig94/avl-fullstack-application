const router = require('express').Router();
const encrypt = require('../../middlewares/encrypt');
const { PrismaClient } = require('@prisma/client');
const { user } = new PrismaClient();
const jwt = require('jsonwebtoken');

router.post(
  /*
    #swagger.auto = false
    #swagger.tags = ['Login']
    #swagger.path = '/login'
    #swagger.method = 'post'
    #swagger.parameters['username', 'password'] = {
      in: 'body',
      name: 'Login body',
      required: true,
      schema: {
        $ref: '#/definitions/Login'
      },
    },
    #swagger.responses[200] = {
      description: 'Success'
    }
  */
  '/',
  loginUser()
);

function loginUser() {
  return async (req, res) => {
    const expireTime = process.env.EXPIRE_TIME;
    const userData = {
      username: req.body.username,
      password: req.body.password,
    };

    const jwtPassword = await encrypt(req.body.password);
    const userExists = await user
      .findMany({
        where: {
          username: req.body.username,
          password: jwtPassword,
        },
        select: {
          username: true,
        },
      })
      .catch((err) => {
        logger.error(`500 - Login`);
        res.status(500).json({ error: `Error occured` });
      });

    if (userExists.length == 0) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: expireTime,
    });
    res.send(accessToken);
  };
}

module.exports = router;
