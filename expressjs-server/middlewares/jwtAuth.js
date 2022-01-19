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
    //  permissionName paraméter permissionId-je (egy rekord)
    // permissionName: 'read-user'
    // permissionId: 1
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
        logger.error(`500 - GET users`);
        return res.status(500).json({ error: `Error occured` });
      });

    // permissionId-hez tartozó roleId-k (több rekord)
    // roleId list: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
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
        logger.error(`500 - GET users`);
        return res.status(500).json({ error: `Error occured` });
      });

    // roleId-k mentése listába
    // roleId list: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    const roleIdList = [];
    roleId.forEach((roleIdEl) => {
      roleIdList.push(roleIdEl.role_id);
    });

    // adott user ID-ja (egy rekord)
    // username: 'user_7', id: 7
    // userData.id: 7
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
        logger.error(`500 - GET users`);
        return res.status(500).json({ error: `Error occured` });
      });

    // végigmegy a roleIdList-en
    // role_id list: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    // user_id: 7
    // user_id: 7, role_id: 1 MATCH
    let userRoleAccepted = false;
    for (let i = 0; i < roleIdList.length; i++) {
      //console.log(`\n for - ${i}`);
      //console.log(`user_id: ${userData.id}`);
      //console.log(`role_id: ${roleIdList[i]}`);
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
          //console.log(`userRoleData - await userRole.findUnique(...)`);
          //console.log(err);
          logger.error(`403 - Login unauthorized `);
          return res.status(403).json({ error: `Error occured` });
        });

      /**
       * FOLYT KÖV...
       */
      //console.log(`userRoleData[0].id: ${userRoleData[0].id}`);
      //if (userRoleData[0].id > 0) {
      if (userRoleData.length > 0) {
        //console.log(`userRoleAccepted`);
        userRoleAccepted = true;
        next();
      }
    }

    if (!userRoleAccepted) {
      logger.error(`401 - Login: unauthorized`);
      res.json({ message: `Unauthorized - Role does not match` });
    }
  };
};

module.exports = { compare, authToken, verifyRole };
