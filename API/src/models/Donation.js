const pool = require("../config/db");

class Donation {
  static getDonations(callback) {
    const query = `
      SELECT 
        donation_id,
        user_id,
        title,
        description,
        quantity_value,
        quantity_unit,
        expiry_date,
        location,
        category,
        donation_status,
        donation_picture,
        created_at
      FROM donations
    `;
    pool.query(query, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }

  static getDonationById(donation_id, callback) {
    const query = `
      SELECT 
        donation_id,
        user_id,
        title,
        description,
        quantity_value,
        quantity_unit,
        expiry_date,
        location,
        category,
        donation_status,
        donation_picture,
        created_at
      FROM donations
      WHERE donation_id = $1
    `;
    pool.query(query, [donation_id], (err, result) => {
      if (err) return callback(err, null);
      if (result.rows.length === 0) return callback(null, null);
      return callback(null, result.rows[0]);
    });
  }

  static createDonation(data, callback) {
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
      INSERT INTO donations (${fields.join(", ")})
      VALUES (${values.join(", ")})
      RETURNING *
    `;

    pool.query(query, params, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows[0]);
    });
  }

  static updateDonation(donation_id, data, callback) {
    const updates = [];
    const params = [];
    let index = 1;

    for (let key in data) {
      updates.push(`${key} = $${index}`);
      params.push(data[key]);
      index++;
    }

    params.push(donation_id);

    const query = `
      UPDATE donations 
      SET ${updates.join(", ")} 
      WHERE donation_id = $${index}
      RETURNING *
    `;

    pool.query(query, params, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows[0]);
    });
  }
}

module.exports = Donation;
