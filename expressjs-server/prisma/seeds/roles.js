const roles = [
  {
    name: 'user',
    description: 'Permissions: read-user, read-role',
    active: true,
  },
  {
    name: 'admin',
    description: 'Permissions: read-user, write-user, read-role, write-role',
    active: true,
  },
  {
    name: 'super-admin',
    description:
      'Permissions: read-user, write-user, delete-user, read-role, write-role, delete-role',
    active: true,
  },
];

module.exports = roles;
