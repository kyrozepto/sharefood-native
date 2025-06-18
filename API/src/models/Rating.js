const pool = require("../config/db");

class Rating {
  static getRatings(callback) {
    const query = `
      SELECT 
        rating_id,
        donation_id,
        user_id,
        rate,
        review,
        created_at
      FROM ratings
    `;

    pool.query(query, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }

  static getRatingById(rating_id, callback) {
    const query = `
      SELECT 
        rating_id,
        donation_id,
        user_id,
        rate,
        review,
        created_at
      FROM ratings
      WHERE rating_id = $1
    `;

    pool.query(query, [rating_id], (err, result) => {
      if (err) return callback(err, null);
      if (result.rows.length === 0) return callback(null, null);
      return callback(null, result.rows[0]);
    });
  }

  static createRating(data, callback) {
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
      INSERT INTO ratings (${fields.join(", ")})
      VALUES (${values.join(", ")})
      RETURNING *
    `;

    pool.query(query, params, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows[0]);
    });
  }

  static getRatingsByDonorId(donor_id, callback) {
    const query = `
      SELECT
        r.rating_id,
        r.rate,
        r.review,
        d.donation_id,
        d.title AS donation_title,
        d.donation_picture,
        u.user_name AS rater_name,
        u.profile_picture AS rater_picture
      FROM ratings r
      JOIN donations d ON r.donation_id = d.donation_id
      JOIN users u ON r.user_id = u.user_id
      WHERE d.user_id = $1
    `;

    pool.query(query, [donor_id], (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }
}

module.exports = Rating;
