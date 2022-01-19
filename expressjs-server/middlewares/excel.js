const XLSX = require('xlsx');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { role, user, permission } = new PrismaClient();

const convertJsonToExcel = async function writeToExcel(next) {
  let dir = './data';
  if (!fs.existsSync(dir)) {
    console.log(`data dir NOT exists`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`data dir exists`);
  }

  const permissionJSON = await getPermissionData();
  const roleJSON = await getPermissionData();
  const userJSON = await getUserData();

  const wsPermission = XLSX.utils.json_to_sheet(permissionJSON);
  const wsRole = XLSX.utils.json_to_sheet(roleJSON);
  const wsUser = XLSX.utils.json_to_sheet(userJSON);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, wsPermission, 'Permissions');
  XLSX.utils.book_append_sheet(wb, wsRole, 'Roles');
  XLSX.utils.book_append_sheet(wb, wsUser, 'Users');

  // Generate buffer
  XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  // Binary string
  XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  XLSX.writeFile(wb, 'data/Data.xlsx');
};

async function getPermissionData() {
  return await permission.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
}

async function getPermissionData() {
  return await role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
}

async function getUserData() {
  return await user.findMany({
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
}

module.exports = convertJsonToExcel;
