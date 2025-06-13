const db = require("../config/db");
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

    db.query(query, callback);
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
      WHERE user_id = ?
    `;
    db.query(query, [user_id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, null);
      }
      return callback(null, results[0]);
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

      for (let key in data) {
        fields.push(key);
        values.push("?");
        params.push(data[key]);
      }

      const query = `INSERT INTO users (${fields.join(
        ", "
      )}) VALUES (${values.join(", ")})`;

      db.query(query, params, (err, result) => {
        if (err) return callback(err, null);
        const newData = { user_id: result.insertId, ...data };
        return callback(null, newData);
      });
    } catch (error) {
      return callback(error, null);
    }
  }

  static updateUser(user_id, data, callback) {
    const updates = [];
    const params = [];

    for (let key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        updates.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (updates.length === 0) {
      return callback(null, {
        affectedRows: 0,
        message: "No fields to update",
      });
    }

    params.push(user_id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return callback(err, null);
      }

      return callback(null, result);
    });
  }

  static login(email, password, callback) {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, { success: false, message: "User not found" });
      }

      console.log("Password: ", password);

      const user = results[0];
      console.log("Stored hash from DB:", user.password);
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return callback(null, { success: false, message: "Invalid password" });
      }

      console.log("Hash Password: ", isPasswordValid);

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET || "05052025", // Use env var or fallback
        { expiresIn: "5h" }
      );
      console.log("Token:", token);

      return callback(null, { success: true, user, token });
    });
  }
}

module.exports = User;
