const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class User {
  static getUsers(callback) {
    const query = `
      SELECT 
        user_id,
        user_name,
        password,
        user_type,
        phone,
        email,
        created_at,
        profile_picture
      FROM users
    `;

    pool.query(query, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }

  static getUserById(user_id, callback) {
    const query = `
      SELECT 
        user_id,
        user_name,
        password,
        user_type,
        phone,
        email,
        created_at,
        profile_picture
      FROM users
      WHERE user_id = $1
    `;

    pool.query(query, [user_id], (err, result) => {
      if (err) return callback(err, null);
      if (result.rows.length === 0) return callback(null, null);
      return callback(null, result.rows[0]);
    });
  }

  static async createUser(data, callback) {
    try {
      if (data.password) {
        const saltRounds = 10;
        data.password = await bcrypt.hash(data.password, saltRounds);
      }

      const fields = [];
      const values = [];
      const params = [];
      let index = 1;

      for (let key in data) {
        fields.push(key);
        values.push(`$${index}`);
        params.push(data[key]);
        index++;
      }

      const query = `
        INSERT INTO users (${fields.join(", ")})
        VALUES (${values.join(", ")})
        RETURNING *
      `;

      pool.query(query, params, (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result.rows[0]);
      });
    } catch (error) {
      return callback(error, null);
    }
  }

  static updateUser(user_id, data, callback) {
    const updates = [];
    const params = [];
    let index = 1;

    for (let key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        updates.push(`${key} = $${index}`);
        params.push(data[key]);
        index++;
      }
    }

    if (updates.length === 0) {
      return callback(null, {
        affectedRows: 0,
        message: "No fields to update",
      });
    }

    params.push(user_id);
    const query = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE user_id = $${index}
      RETURNING *
    `;

    pool.query(query, params, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows[0]);
    });
  }

  static login(email, password, callback) {
    const query = "SELECT * FROM users WHERE email = $1";
    pool.query(query, [email], async (err, result) => {
      if (err) return callback(err, null);
      if (result.rows.length === 0) {
        return callback(null, { success: false, message: "User not found" });
      }

      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return callback(null, { success: false, message: "Invalid password" });
      }

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET || "05052025",
        { expiresIn: "5h" }
      );

      return callback(null, { success: true, user, token });
    });
  }
}

module.exports = User;
