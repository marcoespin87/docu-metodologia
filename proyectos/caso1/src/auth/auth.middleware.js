'use strict';

// Middlewares Express de la capacidad "auth": autenticación por token y
// autorización por rol (RBAC). Ver docs/specs/spec-auth.md.

const { usuarioPorToken } = require('./auth.service');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const usuario = usuarioPorToken(token);
  if (!usuario) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  req.usuario = usuario;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
