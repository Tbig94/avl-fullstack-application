const router = require('express').Router();
const { validate } = require('express-validation');
const valCheck = require('../../validation/validation');
const { PrismaClient } = require('@prisma/client');
const { role, permission, permissionRole } = new PrismaClient();
const jwtAuth = require('../../middlewares/jwtAuth');
const logger = require('../../middlewares/logger');

router.get(
  /*
    #swagger.auto = false
    #swagger.tags = ['Roles']
    #swagger.path = '/api/roles/active=active&keyWord=keyWord'
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
      description: 'Search by property: name',
      allowEmptyValue: true,
      default: '',
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Success'
    }
  */
  /* '/active=:active?&keyWord=:keyWord?&sortBy=:sortCol?&order=:orderVal?&page=:page?', */
  '/active=:active?&keyWord=:keyWord?',
  validate(valCheck.roleGetVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('read-role'),
  getRolesByActive()
);

router.post(
  /*
      #swagger.auto = false
      #swagger.tags = ['Roles']
      #swagger.path = '/api/roles/'
      #swagger.parameters['name', 'description', 'active'] = {
        in: 'body',
        name: 'Role body',
        required: true,
        schema: {
          $ref: '#/definitions/Role'
        },
      }
      #swagger.responses[201] = {
      description: 'Resource created succesfully'
    }
    */
  '/',
  validate(valCheck.rolePostVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('write-role'),
  addRole()
);

router.put(
  /*
    #swagger.auto = false
    #swagger.tags = ['Roles']
    #swagger.path = '/api/roles/{id}'
    #swagger.method = 'put'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID of the role',
      allowEmptyValue: false,
      default: 0,
      type: 'integer'
    }
    #swagger.parameters['name', 'description', 'active'] = {
        in: 'body',
        name: 'Role body',
        required: true,
        schema: {
          $ref: '#/definitions/Role'
        },
    }
    #swagger.responses[204] = {
      description: 'Resource updated successfully'
    }
  */
  '/:id',
  validate(valCheck.rolePutVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('write-role'),
  updateRoleById()
);

router.delete(
  /*
    #swagger.auto = false
    #swagger.tags = ['Roles']
    #swagger.path = '/api/roles/{id}'
    #swagger.method = 'delete'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.responses[204] = {
      description: 'Resource deleted successfully'
    }
  */
  '/:id',
  validate(valCheck.roleDelVal, {}, {}),
  jwtAuth.authToken,
  jwtAuth.compare,
  jwtAuth.verifyRole('delete-role'),
  deactivateRoleById()
);

function getRolesByActive() {
  // szűrés: 'active' alapján (true, false, undefined(minden))
  // keresés: 'name' alapján (HA létezik 'keyWord' paraméter)
  // rendezés: 'id', 'name', 'active' alapján (normál(nincs paraméter) / fordított('desc' paraméterrel))
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
    const roleList = await role
      .findMany({
        /* skip: skippedElCount,
        take: elCount, */
        where: {
          name: {
            contains:
              req.params.keyWord !== null ? req.params.keyWord : undefined,
          },
          active: req.params.active !== undefined ? activeStatus : undefined,
        },
        select: {
          id: true,
          name: true,
          description: true,
          active: true,
          created_at: true,
          updated_at: true,
        },
      })
      .catch((err) => {
        logger.error(`500 - GET roles`);
        res.status(500).json({ error: `Error occured` });
      });

    let rolesWithPermissionName = [];
    for (let i = 0; i < roleList.length; i++) {
      const currentPermissionId = await permissionRole.findMany({
        where: {
          role_id: roleList[i].id,
        },
        select: {
          permission_id: true,
        },
      });

      let rolePermissionList = [];
      for (let i = 0; i < currentPermissionId.length; i++) {
        const currentPermissionName = await permission.findMany({
          where: {
            id: currentPermissionId[i].permission_id,
          },
          select: {
            name: true,
          },
        });
        rolePermissionList.push(currentPermissionName[0].name);
      }

      let roleElement = {
        id: roleList[i].id,
        name: roleList[i].name,
        description: roleList[i].description,
        active: roleList[i].active,
        created_at: roleList[i].created_at,
        updated_at: roleList[i].updated_at,
        permissions: rolePermissionList,
      };
      rolesWithPermissionName.push(roleElement);
    }

    /*
    if (req.params.sortCol === 'name') {
      rolesWithPermissionName.sort(compareName);
    } else if (req.params.sortCol === 'active') {
      rolesWithPermissionName.sort(compareActive);
    }
    if (req.params.orderVal === 'desc') {
      rolesWithPermissionName.reverse();
    }
    */

    logger.info(`200 - GET roles`);
    res.send(rolesWithPermissionName);
  };
}

function addRole() {
  return async (req, res) => {
    const permissionList = req.body.permissions;
    let permissionMatchCount = 0;
    const permissionListDb = await permission.findMany({
      select: {
        name: true,
      },
    });
    for (let i = 0; i < permissionListDb.length; i++) {
      for (let j = 0; j < permissionList.length; j++) {
        if (permissionListDb[i].name === permissionList[j]) {
          permissionMatchCount++;
        }
      }
    }
    if (permissionMatchCount < permissionList.length) {
      return res.json({ message: `The role's permission(s) does not exists` });
    }

    const roleExists = await role.findUnique({
      where: {
        name: req.body.name,
      },
    });
    if (roleExists) {
      logger.error(`400 - POST roles`);
      res.status(400).json({ message: `Role already exists` });
    } else {
      await role
        .create({
          data: {
            name: req.body.name,
            description: req.body.description,
            active: req.body.active,
          },
        })
        .catch((err) => {
          logger.error(`500 - POST roles`);
          res.status(500).json({ error: `Error occured` });
        });

      const currentRole = await role.findUnique({
        where: {
          name: req.body.name,
        },
        select: {
          id: true,
        },
      });

      for (let i = 0; i < permissionList.length; i++) {
        const currentPermission = await permission.findUnique({
          where: {
            name: permissionList[i],
          },
          select: {
            id: true,
          },
        });
        await permissionRole.create({
          data: {
            permission_id: currentPermission.id,
            role_id: currentRole.id,
          },
        });
      }

      logger.info(`200 - POST roles`);
      res.json({ message: `Role has been added successfully` });
    }
  };
}

function updateRoleById() {
  return async (req, res) => {
    const permissionList = req.body.permissions;
    let permissionMatchCount = 0;
    const permissionListDb = await permission.findMany({
      select: {
        name: true,
      },
    });
    for (let i = 0; i < permissionListDb.length; i++) {
      for (let j = 0; j < permissionList.length; j++) {
        if (permissionListDb[i].name === permissionList[j]) {
          permissionMatchCount++;
        }
      }
    }
    if (permissionMatchCount < permissionList.length) {
      return res.json({ message: `The roles's permission(s) does not exists` });
    }

    const roleId = parseInt(req.params.id);
    const roleExists = await role.findUnique({
      where: {
        id: parseInt(roleId),
      },
    });
    if (roleExists) {
      await role
        .update({
          data: {
            name: req.body.name,
            description: req.body.description,
            active: req.body.active,
          },
          where: {
            id: roleId,
          },
        })
        .catch((err) => {
          logger.error(`500 - PUT roles`);
          res.status(500).json({ error: `Error occured` });
        });

      const permissionIdList = [];
      for (let i = 0; i < permissionList.length; i++) {
        const permissionIdEl = await permission.findUnique({
          where: {
            name: permissionList[i],
          },
          select: {
            id: true,
          },
        });
        permissionIdList.push(permissionIdEl.id);
      }

      for (let i = 0; i < permissionIdList.length; i++) {}

      /**
       * FOLYT KÖV
       */
      const currentRoleId = await role.findUnique({
        where: {
          name: req.body.name,
        },
        select: {
          id: true,
        },
      });

      await permissionRole.deleteMany({
        where: {
          role_id: currentRoleId.id,
        },
      });

      for (let i = 0; i < permissionIdList.length; i++) {
        await permissionRole.create({
          data: {
            role_id: currentRoleId.id,
            permission_id: permissionIdList[i],
          },
        });
      }

      logger.info(`200 - PUT roles`);
      res.json({
        message: `Role has been updated successfully with ID: ${req.params.id}`,
      });
    } else {
      logger.error(`400 - PUT roles`);
      return res
        .status(400)
        .json({ message: `Cannot find role with ID: ${req.params.id}` });
    }
  };
}

function deactivateRoleById() {
  return async (req, res) => {
    const roleId = parseInt(req.params.id);
    const roleExists = await role.findUnique({
      where: {
        id: roleId,
      },
    });
    if (roleExists) {
      await role.update({
        data: {
          active: false,
        },
        where: {
          id: roleId,
        },
      });
      logger.info(`200 - DELETE roles`);
      res.json({
        message: `Role has been deactivated successfully with ID: ${req.params.id}`,
      });
    } else {
      logger.error(`400 - DELETE roles`);
      return res
        .status(400)
        .json({ message: `Cannot find role with ID:: ${req.params.id}` });
    }
  };
}

function compareName(role1, role2) {
  const roleA = role1.name.toUpperCase();
  const roleB = role2.name.toUpperCase();
  let comparison = 0;
  if (roleA > roleB) {
    comparison = 1;
  } else if (roleA < roleB) {
    comparison = -1;
  }
  return comparison;
}

function compareActive(role1, role2) {
  return role1 === role2 ? 0 : role1 ? 1 : -1;
}

module.exports = router;
