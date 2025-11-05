module.exports = function tenant(req, res, next) {
  const headerTenantId = req.header('x-tenant-id');
  const userTenantId = req.user && req.user.tenant ? String(req.user.tenant) : undefined;
  const tenantId = headerTenantId || userTenantId;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID is required (x-tenant-id header or user.tenant).' });
  }

  req.tenantId = String(tenantId);

  if (req.body && typeof req.body === 'object') {
    if ('tenant' in req.body && String(req.body.tenant) !== req.tenantId) {
      return res.status(400).json({ message: 'Body.tenant must match the current tenant.' });
    }
    if (!('tenant' in req.body)) {
      req.body.tenant = req.tenantId;
    }
  }

  req.applyTenantFilter = function applyTenantFilter(criteria) {
    const base = criteria && typeof criteria === 'object' ? criteria : {};
    return { ...base, tenant: req.tenantId };
  };

  next();
};
