const router = require('express').Router();
const { validate } = require('express-validation');
const valCheck = require('../../validation/validation');
const { PrismaClient } = require('@prisma/client');
const { user, role, userRole } = new PrismaClient();
const encrypt = require('../../middlewares/encrypt');
const jwtAuth = require('../../middlewares/jwtAuth');
const logger = require('../../middlewares/logger');

router.get(
  /*
    #swagger.auto = false
    #swagger.tags = ['Users']
    #swagger.path = '/api/users/active=active&keyWord=keyWord'
    #swagger.method = 'get'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.parameters['active'] = {
      in: 'path',
      description: 'Filter by property: active(true, false, null)',
      allowEmptyValue: true,
      default: '',
      type: 'boolean'
    }
    #swagger.parameters['keyWord'] = {
      in: 'path',
      description: 'Search by property: username',
      allowEmptyValue: true,
      default: '',
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Success'
    }
  */
  '/active=:active?&keyWord=:keyWord?',
  validate(valCheck.userGetVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('read-user'),
  getUsersByActive()
);

router.post(
  /*
    #swagger.auto = false
    #swagger.tags = ['Users']
    #swagger.path = '/api/users/'
    #swagger.parameters['username', 'password', 'active'] = {
      in: 'body',
      name: 'User body',
      required: true,
      schema: {
        $ref: '#/definitions/User'
      },
    }
    #swagger.responses[201] = {
      description: 'Resource created succesfully'
    }
  */
  '/',
  validate(valCheck.userPostVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('write-user'),
  addUser()
);

router.put(
  /*
    #swagger.auto = false
    #swagger.tags = ['Users']
    #swagger.path = '/api/users/{id}'
    #swagger.method = 'put'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the user',
      allowEmptyValue: false,
      default: 0,
      type: 'integer'
    }
    #swagger.parameters['username', 'password', 'active'] = {
        in: 'body',
        name: 'User body',
        required: true,
        schema: {
          $ref: '#/definitions/User'
        },
    }
    #swagger.responses[204] = {
      description: 'Resource updated successfully'
    }
  */
  '/:id',
  validate(valCheck.userPutVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('write-user'),
  updateUserById()
);

router.delete(
  /*
    #swagger.auto = false
    #swagger.tags = ['Users']
    #swagger.path = '/api/users/{id}'
    #swagger.method = 'delete'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the users',
      allowEmptyValue: false,
      default: 0,
      type: 'integer'
    }
    #swagger.responses[204] = {
      description: 'Resource deleted successfully'
    }
  */
  '/:id',
  validate(valCheck.userDelVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('delete-user'),
  deactivateUserById()
);

function getUsersByActive() {
  // szűrés: 'active' alapján (true, false, undefined(minden))
  // keresés: 'username' alapján (HA létezik 'keyWord' paraméter)
  // rendezés: sortBy: 'id', 'username', 'active' alapján (normál(nincs paraméter) / fordított('desc' paraméterrel))
  return async (req, res) => {
    const activeStatus = req.params.active === 'true';
    /*
    let elCount = 50;
    let skippedElCount;
    if (!req.params.page) {
      skippedElCount = 0;
    } else {
      skippedElCount = parseInt(req.params.page);
    }
    */
    const userList = await user
      .findMany({
        /* skip: skippedElCount,
        take: elCount, */
        where: {
          username: {
            contains:
              req.params.keyWord !== null ? req.params.keyWord : undefined,
          },
          active: req.params.active !== undefined ? activeStatus : undefined,
        },
        select: {
          id: true,
          username: true,
          password: true,
          active: true,
          created_at: true,
          updated_at: true,
        },
      })
      .catch((err) => {
        logger.error(`500 - GET users`);
        res.status(500).json({ error: `Error occured` });
      });

    let usersWithRoleName = [];
    for (let i = 0; i < userList.length; i++) {
      const currentRoleId = await userRole
        .findMany({
          where: {
            user_id: userList[i].id,
          },
          select: {
            role_id: true,
          },
        })
        .catch((err) => {
          logger.error(`500 - GET users`);
          res.status(500).json({ error: `Error occured` });
        });

      let userRoleList = [];
      for (let i = 0; i < currentRoleId.length; i++) {
        const currentRoleName = await role
          .findMany({
            where: {
              id: currentRoleId[i].role_id,
            },
            select: {
              name: true,
            },
          })
          .catch((err) => {
            logger.error(`500 - GET users`);
            res.status(500).json({ error: `Error occured` });
          });
        userRoleList.push(currentRoleName[0].name);
      }

      let userElement = {
        id: userList[i].id,
        username: userList[i].username,
        password: userList[i].password,
        active: userList[i].active,
        created_at: userList[i].created_at,
        updated_at: userList[i].updated_at,
        roles: userRoleList,
      };
      usersWithRoleName.push(userElement);
    }

    /*
    if (req.params.sortCol === 'username') {
      usersWithRoleName.sort(compareName);
    } else if (req.params.sortCol === 'active') {
      usersWithRoleName.sort(compareActive);
    }

    if (req.params.orderVal === 'desc') {
      usersWithRoleName.reverse();
    }
    */

    logger.info(`200 - GET users`);
    res.send(usersWithRoleName);
  };
}

function addUser() {
  return async (req, res) => {
    const roleList = req.body.roles;
    let roleMatchCount = 0;
    const roleListDb = await role.findMany({
      select: {
        name: true,
      },
    });
    for (let i = 0; i < roleListDb.length; i++) {
      for (let j = 0; j < roleList.length; j++) {
        if (roleListDb[i].name === roleList[j]) {
          roleMatchCount++;
        }
      }
    }
    if (roleMatchCount < roleList.length) {
      return res.json({ message: `The user's role(s) does not exists` });
    }

    const userExists = await user.findUnique({
      where: {
        username: req.body.username,
      },
    });
    if (userExists) {
      logger.error(`400 - POST users`);
      res.status(400).json({ message: `User already exists` });
    } else {
      const newPassword = await encrypt(req.body.password);
      await user
        .create({
          data: {
            username: req.body.username,
            password: newPassword,
            active: req.body.active,
          },
        })
        .catch((err) => {
          logger.error(`500 - POST users`);
          res.status(500).json({ error: `Error occured` });
        });

      const currentUser = await user.findUnique({
        where: {
          username: req.body.username,
        },
        select: {
          id: true,
        },
      });

      for (let i = 0; i < roleList.length; i++) {
        const currentRole = await role.findUnique({
          where: {
            name: roleList[i],
          },
          select: {
            id: true,
          },
        });

        await userRole.create({
          data: {
            user_id: currentUser.id,
            role_id: currentRole.id,
          },
        });
      }

      logger.info(`200 - POST users`);
      res.json({ message: `User has been added successfully` });
    }
  };
}

function updateUserById() {
  return async (req, res) => {
    const roleList = req.body.roles;
    let roleMatchCount = 0;
    const roleListDb = await role.findMany({
      select: {
        name: true,
      },
    });
    for (let i = 0; i < roleListDb.length; i++) {
      for (let j = 0; j < roleList.length; j++) {
        if (roleListDb[i].name === roleList[j]) {
          roleMatchCount++;
        }
      }
    }
    if (roleMatchCount < roleList.length) {
      return res.json({ message: `The user's role(s) does not exists` });
    }

    const userId = parseInt(req.params.id);
    const userExists = await user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });
    if (userExists) {
      const newPassword = await encrypt(req.body.password);
      await user
        .update({
          where: {
            id: userId,
          },
          data: {
            username: req.body.username,
            password: newPassword,
            active: req.body.active,
          },
        })
        .catch((err) => {
          logger.error(`500 - PUT users`);
          res.status(500).json({ error: `Error occured` });
        });

      const roleIdList = [];
      for (let i = 0; i < roleList.length; i++) {
        const roleIdEl = await role.findUnique({
          where: {
            name: roleList[i],
          },
          select: {
            id: true,
          },
        });
        roleIdList.push(roleIdEl.id);
      }

      for (let i = 0; i < roleIdList.length; i++) {}

      const currentUserId = await user.findUnique({
        where: {
          username: req.body.username,
        },
        select: {
          id: true,
        },
      });

      await userRole.deleteMany({
        where: {
          user_id: currentUserId.id,
        },
      });

      for (let i = 0; i < roleIdList.length; i++) {
        await userRole.create({
          data: {
            user_id: currentUserId.id,
            role_id: roleIdList[i],
          },
        });
      }

      logger.info(`200 - PUT users`);
      res.json({
        message: `User has been updated successfully with ID: ${req.params.id} | UserRoles table updated`,
      });
    } else {
      logger.error(`400 - PUT users`);
      return res
        .status(400)
        .json({ message: `Cannot find user with ID: ${req.params.id}` });
    }
  };
}

function deactivateUserById() {
  return async (req, res) => {
    const userId = parseInt(req.params.id);
    const userExists = await user.findUnique({
      where: {
        id: userId,
      },
    });
    if (userExists) {
      await user.update({
        data: {
          active: false,
        },
        where: {
          id: userId,
        },
      });
      logger.info(`200 - DELETE users`);
      res.json({
        message: `User has been deactivated successfully with ID: ${req.params.id}`,
      });
    } else {
      logger.error(`400 - DELETE users`);
      return res
        .status(400)
        .json({ message: `Cannot find user with ID:: ${req.params.id}` });
    }
  };
}

function compareName(user1, user2) {
  const userA = user1.username.toUpperCase();
  const userB = user2.username.toUpperCase();
  let comparison = 0;
  if (userA > userB) {
    comparison = 1;
  } else if (userA < userB) {
    comparison = -1;
  }
  return comparison;
}

function compareActive(user1, user2) {
  return user1 === user2 ? 0 : user1 ? 1 : -1;
}

module.exports = router;
