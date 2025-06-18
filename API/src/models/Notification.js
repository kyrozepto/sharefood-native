const pool = require("../config/db");

class Notification {
  static getAll(callback) {
    const query = `SELECT * FROM notifications WHERE is_deleted = FALSE ORDER BY created_at DESC`;
    pool.query(query, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }

  static getById(notification_id, callback) {
    const query = `SELECT * FROM notifications WHERE notification_id = $1 AND is_deleted = FALSE`;
    pool.query(query, [notification_id], (err, results) => {
      if (err) return callback(err, null);
      if (results.rows.length === 0) return callback(null, null);
      return callback(null, results.rows[0]);
    });
  }

  static getByUserId(user_id, callback) {
    const query = `SELECT * FROM notifications WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC`;
    pool.query(query, [user_id], (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }

  static create(data, callback) {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, is_read, data)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.user_id,
      data.type,
      data.title,
      data.message,
      data.is_read ?? false,
      data.data || {},
    ];
    pool.query(query, values, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows[0]);
    });
  }

  static softDelete(notification_id, callback) {
    const query = `UPDATE notifications SET is_deleted = TRUE WHERE notification_id = $1`;
    pool.query(query, [notification_id], (err, result) => {
      if (err) return callback(err, null);

      if (result.rowCount === 0) {
        return callback(null, null);
      }

      return callback(null, { success: true });
    });
  }

  static updateIsRead(notification_id, is_read, callback) {
    const query = `UPDATE notifications SET is_read = $1 WHERE notification_id = $2 AND is_deleted = FALSE RETURNING *`;
    pool.query(query, [is_read, notification_id], (err, result) => {
      if (err) return callback(err, null);
      if (result.rows.length === 0) return callback(null, null);
      return callback(null, result.rows[0]);
    });
  }
}

module.exports = Notification;
