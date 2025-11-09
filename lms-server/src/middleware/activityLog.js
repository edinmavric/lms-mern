const mongoose = require('mongoose');

/**
 * Log an activity
 * @param {Object} data - Activity data
 * @param {ObjectId} data.tenant - Tenant ID
 * @param {ObjectId} data.user - User who performed the action
 * @param {string} data.action - Action type (e.g., 'user.created')
 * @param {string} data.entityType - Model name (e.g., 'User')
 * @param {ObjectId} data.entityId - Entity ID
 * @param {Object} data.changes - Changes made (optional)
 * @param {Object} data.metadata - Additional context (optional)
 * @param {string} data.severity - Severity level (optional)
 * @param {Object} req - Express request object (optional)
 */
async function logActivity(data, req = null) {
  try {
    const ActivityLog = mongoose.model('ActivityLog');

    const logEntry = {
      tenant: data.tenant,
      user: data.user,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes || {},
      metadata: data.metadata || {},
      severity: data.severity || 'low',
    };

    if (req) {
      logEntry.ipAddress =
        req.ip ||
        req.connection?.remoteAddress ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      logEntry.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(logEntry);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Mongoose Plugin for automatic logging
 * @param {mongoose.Schema} schema - Mongoose schema
 * @param {Object} options - Plugin options
 * @param {string} options.entityType - Entity type name (e.g., 'User')
 */
function activityLogPlugin(schema, options = {}) {
  const { entityType } = options;

  if (!entityType) {
    console.warn('activityLogPlugin: entityType is required');
    return;
  }

  schema.pre('save', async function (next) {
    if (!this.isNew && this.isModified()) {
      try {
        const original = await this.constructor.findById(this._id).lean();
        this._originalDoc = original;
      } catch (error) {
        this._originalDoc = null;
      }
    }
    next();
  });

  schema.post('save', async function (doc) {
    try {
      if (!doc.tenant) {
        return;
      }

      const isNew = !doc._originalDoc;
      const action = isNew
        ? `${entityType.toLowerCase()}.created`
        : `${entityType.toLowerCase()}.updated`;

      const changes = {};
      if (!isNew && doc._originalDoc) {
        const modifiedPaths = doc.modifiedPaths ? doc.modifiedPaths() : [];
        modifiedPaths.forEach(path => {
          if (
            path.startsWith('_') ||
            path === 'updatedAt' ||
            path === 'createdAt'
          ) {
            return;
          }
          const oldValue = doc._originalDoc[path];
          const newValue = doc[path];
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes[path] = {
              old: oldValue,
              new: newValue,
            };
          }
        });
      }

      const userId = doc.updatedBy || doc.createdBy;
      if (!userId) {
        return;
      }

      await logActivity({
        tenant: doc.tenant,
        user: userId,
        action,
        entityType,
        entityId: doc._id,
        changes: Object.keys(changes).length > 0 ? changes : undefined,
        severity: action.includes('deleted') ? 'high' : 'low',
      });

      delete doc._originalDoc;
    } catch (error) {
      console.error('Activity log plugin error:', error);
    }
  });

  schema.post('findOneAndDelete', async function (doc) {
    if (doc) {
      try {
        if (!doc.tenant) {
          return;
        }

        const userId = doc.updatedBy || doc.createdBy;
        if (!userId) {
          return;
        }

        await logActivity({
          tenant: doc.tenant,
          user: userId,
          action: `${entityType.toLowerCase()}.deleted`,
          entityType,
          entityId: doc._id,
          severity: 'high',
        });
      } catch (error) {
        console.error('Activity log plugin error:', error);
      }
    }
  });

  schema.pre(['remove', 'deleteOne'], async function (next) {
    try {
      const doc = await this.model.findOne(this.getQuery());
      if (doc && doc.tenant) {
        const userId = doc.updatedBy || doc.createdBy;
        if (userId) {
          await logActivity({
            tenant: doc.tenant,
            user: userId,
            action: `${entityType.toLowerCase()}.deleted`,
            entityType,
            entityId: doc._id,
            severity: 'high',
          });
        }
      }
    } catch (error) {
      console.error('Activity log plugin error:', error);
    }
    next();
  });
}

module.exports = { logActivity, activityLogPlugin };
