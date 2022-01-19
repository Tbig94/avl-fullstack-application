const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissions = require('./seeds/permissions');
const roles = require('./seeds/roles');
const users = require('./seeds/users');
const permissionRoles = require('./seeds/permissionRoles');
const userRoles = require('./seeds/userRoles');

async function main() {
  await prisma.permission.createMany({
    data: permissions,
  });
  await prisma.role.createMany({
    data: roles,
  });
  await prisma.user.createMany({
    data: users,
  });
  await prisma.permissionRole.createMany({
    data: permissionRoles,
  });
  await prisma.userRole.createMany({
    data: userRoles,
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
