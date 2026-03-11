const pgService = require('../Service/postgres_service');

class AlertController {
  // Get all alert configurations
  async getAllAlerts(req, res) {
    try {
      const result = await pgService.query(`
        SELECT
          a.alert_id,
          a.device_id,
          d.device_name,
          d.device_number,
          d.device_label,
          a.field_name,
          a.min_threshold,
          a.max_threshold,
          a.enabled,
          a.created_at,
          a.updated_at
        FROM alerts a
        LEFT JOIN devices d ON a.device_id = d.device_id
        ORDER BY a.created_at DESC
      `);

      res.json({
        success: true,
        count: result.length,
        alerts: result
      });
    } catch (err) {
      console.error('Error fetching alerts:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get alerts for a specific device
  async getDeviceAlerts(req, res) {
    try {
      const { device_id } = req.params;

      const result = await pgService.query(`
        SELECT
          a.alert_id,
          a.field_name,
          a.min_threshold,
          a.max_threshold,
          a.enabled,
          a.created_at,
          a.updated_at
        FROM alerts a
        WHERE a.device_id = $1
        ORDER BY a.field_name
      `, [device_id]);

      res.json({
        success: true,
        device_id,
        count: result.length,
        alerts: result
      });
    } catch (err) {
      console.error('Error fetching device alerts:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Create new alert configuration
  async createAlert(req, res) {
    try {
      const { device_id, field_name, min_threshold, max_threshold, enabled = true } = req.body;

      if (!device_id || !field_name) {
        return res.status(400).json({ success: false, error: 'device_id and field_name required' });
      }

      const result = await pgService.query(`
        INSERT INTO alerts (device_id, field_name, min_threshold, max_threshold, enabled)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [device_id, field_name, min_threshold, max_threshold, enabled]);

      res.status(201).json({
        success: true,
        alert: result[0]
      });
    } catch (err) {
      console.error('Error creating alert:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Update alert configuration
  async updateAlert(req, res) {
    try {
      const { alert_id } = req.params;
      const { min_threshold, max_threshold, enabled } = req.body;

      const result = await pgService.query(`
        UPDATE alerts
        SET
          min_threshold = COALESCE($2, min_threshold),
          max_threshold = COALESCE($3, max_threshold),
          enabled = COALESCE($4, enabled),
          updated_at = NOW()
        WHERE alert_id = $1
        RETURNING *
      `, [alert_id, min_threshold, max_threshold, enabled]);

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
      }

      res.json({
        success: true,
        alert: result[0]
      });
    } catch (err) {
      console.error('Error updating alert:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Delete alert configuration
  async deleteAlert(req, res) {
    try {
      const { alert_id } = req.params;

      const result = await pgService.query(`
        DELETE FROM alerts WHERE alert_id = $1 RETURNING alert_id
      `, [alert_id]);

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
      }

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting alert:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get alert history/logs
  async getAlertHistory(req, res) {
    try {
      const { device_id, from, to, limit = 100 } = req.query;

      let query = `
        SELECT
          ah.log_id,
          ah.alert_id,
          ah.device_id,
          d.device_label,
          ah.field_name,
          ah.value,
          ah.threshold_type,
          ah.threshold_value,
          ah.triggered_at
        FROM alert_history ah
        LEFT JOIN devices d ON ah.device_id = d.device_id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (device_id) {
        query += ` AND ah.device_id = $${paramIndex++}`;
        params.push(device_id);
      }
      if (from) {
        query += ` AND ah.triggered_at >= $${paramIndex++}`;
        params.push(new Date(from));
      }
      if (to) {
        query += ` AND ah.triggered_at <= $${paramIndex++}`;
        params.push(new Date(to));
      }

      query += ` ORDER BY ah.triggered_at DESC LIMIT $${paramIndex}`;
      params.push(Math.min(Number(limit), 1000));

      const result = await pgService.query(query, params);

      res.json({
        success: true,
        count: result.length,
        history: result
      });
    } catch (err) {
      console.error('Error fetching alert history:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Check value against thresholds (used by MQTT service)
  async checkThresholds(deviceId, fieldName, value) {
    try {
      const alerts = await pgService.query(`
        SELECT * FROM alerts
        WHERE device_id = $1 AND field_name = $2 AND enabled = true
      `, [deviceId, fieldName]);

      const violations = [];

      for (const alert of alerts) {
        if (alert.min_threshold !== null && value < alert.min_threshold) {
          violations.push({
            type: 'min',
            field: fieldName,
            value,
            threshold: alert.min_threshold,
            alert_id: alert.alert_id
          });
        }
        if (alert.max_threshold !== null && value > alert.max_threshold) {
          violations.push({
            type: 'max',
            field: fieldName,
            value,
            threshold: alert.max_threshold,
            alert_id: alert.alert_id
          });
        }
      }

      return violations;
    } catch (err) {
      console.error('Error checking thresholds:', err);
      return [];
    }
  }

  // Log alert violation
  async logAlertViolation(deviceId, alertId, fieldName, value, thresholdType, thresholdValue) {
    try {
      await pgService.query(`
        INSERT INTO alert_history (alert_id, device_id, field_name, value, threshold_type, threshold_value)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [alertId, deviceId, fieldName, value, thresholdType, thresholdValue]);
    } catch (err) {
      console.error('Error logging alert violation:', err);
    }
  }
}

module.exports = new AlertController();
