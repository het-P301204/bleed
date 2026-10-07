'use strict';

// HARDENED: reads role and isAdmin only from own properties.
// Even if Object.prototype is polluted with role="admin", this check ignores it
// because it uses hasOwnProperty before reading any value.
function checkAuthorizationSafe(user) {
  const role = Object.prototype.hasOwnProperty.call(user, 'role')
    ? user['role']
    : undefined;
  const isAdmin = Object.prototype.hasOwnProperty.call(user, 'isAdmin')
    ? user['isAdmin']
    : undefined;

  return {
    authorized: role === 'admin' || isAdmin === true,
    role: role !== undefined ? role : null,
    isAdmin: isAdmin !== undefined ? isAdmin : null,
    blocked: true,
    protectionApplied: 'hasOwnProperty check prevented prototype inheritance',
    inherited: false,
  };
}

module.exports = { checkAuthorizationSafe };
