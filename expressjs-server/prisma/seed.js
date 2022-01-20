const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissions = require('./seeds/permissions');
const roles = require('./seeds/roles');
const users = require('./seeds/users');
const permissionRoles = require('./seeds/permissionRoles');
const userRoles = require('./seeds/userRoles');
const productTypes = require('./seeds/productTypes');
const products = require('./seeds/products');

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
  /*
  await prisma.productType.createMany({
    data: productTypes,
  });
  await prisma.product.createMany({
    data: products,
  });
  */
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
