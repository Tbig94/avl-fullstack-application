const jwt = require('jsonwebtoken');
const encrypt = require('./encrypt');
const { PrismaClient } = require('@prisma/client');
const { user, role, userRole, permissionRole, permission } = new PrismaClient();
const logger = require('./logger');

const authToken = function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    logger.error(`401 - Login: missing token`);
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      logger.error(`403 - Login: unauthorized`);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const compare = async function cmp(req, res, next) {
  const jwtPassword = await encrypt(req.user.password);
  const users = await user.findMany({
    where: {
      username: req.user.username,
      password: jwtPassword,
    },
    select: {
      id: true,
      username: true,
      password: true,
      active: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
  if (users.length === 0) {
    logger.error(`401 - Login: unauthorized`);
    return res.sendStatus(401);
  }
  next();
};

const verifyRole = function getRoleFunc(permissionName) {
  return async (req, res, next) => {
    const permissionId = await permission
      .findUnique({
        where: {
          name: permissionName,
        },
        select: {
          id: true,
        },
      })
      .catch((err) => {
        logger.error(`500 - verifyRole - jwtAuth`);
        return res.status(500).json({ error: `Error occured` });
      });

    // roleId - több érték - (1, 2, 3, 4, 5)
    const roleId = await permissionRole
      .findMany({
        where: {
          permission_id: permissionId.id,
        },
        select: {
          role_id: true,
        },
      })
      .catch((err) => {
        logger.error(`500 - verifyRole - jwtAuth`);
        return res.status(500).json({ error: `Error occured` });
      });

    // roleIdList - több érték - [1, 2, 3, 4, 5]
    const roleIdList = [];
    roleId.forEach((roleIdEl) => {
      roleIdList.push(roleIdEl.role_id);
    });

    // userData(ID) - 1 érték - (8)
    const userData = await user
      .findUnique({
        where: {
          username: req.user.username,
        },
        select: {
          id: true,
        },
      })
      .catch((err) => {
        logger.error(`500 - verifyRole - jwtAuth`);
        return res.status(500).json({ error: `Error occured` });
      });

    let userRoleAccepted = false;
    // userRoleData - 1 darab érték - 2 VAGY 3
    for (let i = 0; i < roleIdList.length; i++) {
      const userRoleData = await userRole
        .findMany({
          where: {
            user_id: userData.id,
            role_id: roleIdList[i],
          },
          select: {
            id: true,
          },
        })
        .catch((err) => {
          logger.error(`500 - verifyRole - jwtAuth`);
          return res.status(500).send(err.stack || e);
        });

      if (userRoleData.length === 1) {
        userRoleAccepted = true;
        next();
        return;
      }
    }

    if (!userRoleAccepted) {
      logger.error(`401 - Login: unauthorized`);
      res.json({ message: `Unauthorized - Role does not match` });
    }
  };
};

module.exports = { compare, authToken, verifyRole };
