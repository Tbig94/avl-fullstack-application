const router = require('express').Router();
const { validate } = require('express-validation');
const valCheck = require('../../validation/validation');
const { PrismaClient } = require('@prisma/client');
const { permission, role, user, permissionRole } = new PrismaClient();
const jwtAuth = require('../../middlewares/jwtAuth');
const logger = require('../../middlewares/logger');

router.post('/get', getCurrentUserPermissions());

function getCurrentUserPermissions() {
  return async (req, res) => {
    let roleList = [];
    roleList = req.body.roleList;
    let roleListId = [];
    let permissionList = [];

    for (let i = 0; i < roleList.length; i++) {
      let currentRole = await role
        .findUnique({
          where: {
            name: roleList[i],
          },
          select: {
            id: true,
          },
        })
        .catch((err) => {
          logger.error(`500 - GET permissions`);
          res.status(500).json({ error: `Error occured` });
        });
      roleListId.push(currentRole.id);
    }

    for (let i = 0; i < roleListId.length; i++) {
      let currentRolePermissionId = await permissionRole
        .findMany({
          where: {
            role_id: roleListId[i],
          },
          select: {
            permission_id: true,
          },
        })
        .catch((err) => {
          logger.error(`500 - GET permissions`);
          res.status(500).json({ error: `Error occured` });
        });

      for (let i = 0; i < currentRolePermissionId.length; i++) {
        let currentPermissionName = await permission
          .findUnique({
            where: {
              id: currentRolePermissionId[i].permission_id,
            },
            select: {
              name: true,
            },
          })
          .catch((err) => {
            logger.error(`500 - GET permissions`);
            res.status(500).json({ error: `Error occured` });
          });
        if (!permissionList.includes(currentPermissionName.name)) {
          permissionList.push(currentPermissionName.name);
        }
      }
    }
    res.send(permissionList);
  };
}

module.exports = router;
