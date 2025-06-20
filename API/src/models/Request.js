const pool = require("../config/db");

class Request {
  static getRequests(callback) {
    const query = `SELECT * FROM requests`;
    pool.query(query, (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result.rows);
    });
  }

  static getRequestById(request_id, callback) {
    const query = `SELECT * FROM requests WHERE request_id = $1`;
    pool.query(query, [request_id], (err, result) => {
      if (err) return callback(err, null);
      if (result.rows.length === 0) return callback(null, null);
      return callback(null, result.rows[0]);
    });
  }

  static createRequest(data, callback) {
    // Validate that data is not empty
    if (!data || Object.keys(data).length === 0) {
      return callback(new Error("No data provided for request creation"), null);
    }

    const fields = [];
    const values = [];
    const params = [];

    let index = 1;
    for (let key in data) {
      if (data.hasOwnProperty(key) && data[key] !== undefined) {
        fields.push(key);
        values.push(`$${index}`);
        params.push(data[key]);
        index++;
      }
    }

    if (fields.length === 0) {
      return callback(
        new Error("No valid fields provided for request creation"),
        null
      );
    }

    const query = `
      INSERT INTO requests (${fields.join(", ")})
      VALUES (${values.join(", ")})
      RETURNING *
    `;

    console.log("Generated query:", query);
    console.log("Parameters:", params);

    pool.query(query, params, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return callback(err, null);
      }
      return callback(null, result.rows[0]);
    });
  }

  static rejectOthersExcept(request_id, donation_id, callback) {
    const query = `
      UPDATE requests
      SET request_status = 'rejected'
      WHERE donation_id = $1 AND request_id != $2 AND request_status = 'waiting'
    `;
    pool.query(query, [donation_id, request_id], callback);
  }

  static updateRequest(request_id, data, callback) {
    if (!data || Object.keys(data).length === 0) {
      return callback(new Error("No data provided for request update"), null);
    }

    const updates = [];
    const params = [];
    let index = 1;

    for (let key in data) {
      if (data.hasOwnProperty(key) && data[key] !== undefined) {
        updates.push(`${key} = $${index}`);
        params.push(data[key]);
        index++;
      }
    }

    if (updates.length === 0) {
      return callback(
        new Error("No valid fields provided for request update"),
        null
      );
    }

    const selectQuery = `SELECT * FROM requests WHERE request_id = $1`;
    pool.query(selectQuery, [request_id], (selectErr, selectRes) => {
      if (selectErr || selectRes.rows.length === 0) {
        console.error("Failed to fetch request:", selectErr);
        return callback(selectErr || new Error("Request not found"), null);
      }

      const currentRequest = selectRes.rows[0];
      const oldStatus = currentRequest.request_status;
      const donationId = currentRequest.donation_id;

      params.push(request_id);
      const updateQuery = `
        UPDATE requests 
        SET ${updates.join(", ")} 
        WHERE request_id = $${index}
        RETURNING *
      `;

      pool.query(updateQuery, params, (updateErr, updateRes) => {
        if (updateErr) {
          console.error("Error updating request:", updateErr);
          return callback(updateErr, null);
        }

        const updatedRequest = updateRes.rows[0];

        if (data.request_status === "approved" && donationId) {
          const confirmDonationQuery = `
            UPDATE donations 
            SET donation_status = 'confirmed' 
            WHERE donation_id = $1
          `;
          pool.query(confirmDonationQuery, [donationId], (err) => {
            if (err) {
              console.error("Failed to confirm donation:", err);
              return callback(err, null);
            }
            return callback(null, updatedRequest);
          });
        } else if (
          oldStatus === "approved" &&
          data.request_status === "completed" &&
          donationId
        ) {
          const completeDonationQuery = `
            UPDATE donations 
            SET donation_status = 'completed' 
            WHERE donation_id = $1
          `;
          pool.query(completeDonationQuery, [donationId], (err) => {
            if (err) {
              console.error("Failed to complete donation:", err);
              return callback(err, null);
            }
            return callback(null, updatedRequest);
          });
        } else {
          return callback(null, updatedRequest);
        }
      });
    });
  }
}

module.exports = Request;
