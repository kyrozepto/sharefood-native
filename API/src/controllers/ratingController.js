const Rating = require("../models/Rating");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const pool = require("../config/db");

async function getRatings(req, res) {
  try {
    Rating.getRatings((err, results) => {
      if (err) {
        res.status(500).json({ message: "Error fetching data", error: err });
        return;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getRatingById(req, res) {
  try {
    const { id } = req.params;

    Rating.getRatingById(id, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching user", error: err });
      }
      if (!user) {
        return res.status(404).json({ message: "Rating not found" });
      }
      res.status(200).json(user);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createRating(req, res) {
  try {
    const user = req.user;
    const ratingData = {
      ...req.body,
      user_id: user.user_id,
    };

    Rating.createRating(ratingData, (err, createdRating) => {
      if (err) {
        console.error("Error creating rating:", err);
        return res
          .status(500)
          .json({ message: "Gagal membuat rating", error: err });
      }

      Donation.getDonationById(
        createdRating.donation_id,
        (donationErr, donation) => {
          if (donationErr || !donation) {
            console.error("Failed to fetch donation for rating:", donationErr);
            return res.status(201).json(createdRating);
          }

          pool.query(
            `SELECT user_name FROM users WHERE user_id = $1`,
            [createdRating.user_id],
            (userErr, userRes) => {
              if (userErr || !userRes.rows.length) {
                console.error("Failed to fetch rater info:", userErr);
                return res.status(201).json(createdRating);
              }

              const raterName = userRes.rows[0].user_name;

              const notif = {
                user_id: donation.user_id,
                type: "rating",
                title: "Rating Baru Diterima",
                message: `Donasi '${donation.title}' telah diberi rating oleh ${raterName}.`,
                data: JSON.stringify({
                  donation_id: donation.donation_id,
                  rating_id: createdRating.rating_id,
                }),
              };

              Notification.create(notif, (notifErr) => {
                if (notifErr) {
                  console.error(
                    "Failed to create notification for rating:",
                    notifErr
                  );
                }
                res.status(201).json(createdRating);
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      message: "Gagal membuat rating (catch block)",
      error: error.message,
    });
  }
}

async function getRatingsByDonorId(req, res) {
  try {
    const { donorId } = req.params;

    Rating.getRatingsByDonorId(donorId, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengambil data rating berdasarkan donor",
          error: err,
        });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan",
      error: error.message,
    });
  }
}

module.exports = {
  getRatings,
  getRatingById,
  createRating,
  getRatingsByDonorId,
};
