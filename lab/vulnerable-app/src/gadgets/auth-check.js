'use strict';

// VULNERABLE: reads role/isAdmin without hasOwnProperty guard.
// If Object.prototype was polluted with role="admin" or isAdmin=true,
// any plain {} user object will appear to have admin privileges.
function checkAuthorization(user) {
  // VULNERABLE: property access traverses prototype chain
  const role = user['role'];
  const isAdmin = user['isAdmin'];

  const hadOwnRole = Object.prototype.hasOwnProperty.call(user, 'role');
  const hadOwnIsAdmin = Object.prototype.hasOwnProperty.call(user, 'isAdmin');

  const roleInherited = role !== undefined && !hadOwnRole;
  const isAdminInherited = isAdmin !== undefined && !hadOwnIsAdmin;

  return {
    authorized: role === 'admin' || isAdmin === true,
    role,
    isAdmin,
    hadOwnRole,
    hadOwnIsAdmin,
    inherited: roleInherited || isAdminInherited,
    roleInherited,
    isAdminInherited,
    userWasEmpty: Object.keys(user).length === 0,
  };
}

module.exports = { checkAuthorization };
