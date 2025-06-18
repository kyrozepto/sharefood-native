const Request = require("../models/Request");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const pool = require("../config/db");

async function getRequests(req, res) {
  try {
    Request.getRequests((err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching data", error: err });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    Request.getRequestById(id, (err, request) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error fetching request", error: err });
      if (!request)
        return res.status(404).json({ message: "Request not found" });
      res.status(200).json(request);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createRequest(req, res) {
  try {
    const requestData = Object.fromEntries(Object.entries(req.body));
    Request.createRequest(requestData, (err, createdRequest) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal membuat permintaan", error: err });

      Donation.getDonationById(createdRequest.donation_id, (err, donation) => {
        if (!err && donation) {
          const notif = {
            user_id: donation.user_id,
            type: "request",
            title: "Permintaan Donasi Baru",
            message: `Donasi '${donation.title}' telah diminta oleh pengguna.`,
            data: JSON.stringify({
              donation_id: donation.donation_id,
              request_id: createdRequest.request_id,
            }),
          };
          Notification.create(notif, () => {});
        }
      });

      res.status(201).json(createdRequest);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateRequest(req, res) {
  try {
    const { id } = req.params;
    const data = Object.fromEntries(Object.entries(req.body));

    Request.getRequestById(id, (getErr, existingRequest) => {
      if (getErr || !existingRequest) {
        return res.status(404).json({ message: "Permintaan tidak ditemukan" });
      }

      Request.updateRequest(id, data, (err, updatedRequest) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Gagal memperbarui permintaan", error: err });

        if (data.request_status === "approved") {
          Request.rejectOthersExcept(id, updatedRequest.donation_id, (err) => {
            if (err) console.error("Gagal menolak permintaan lainnya:", err);
          });
        }

        if (
          data.request_status === "canceled" &&
          existingRequest.request_status === "approved"
        ) {
          Donation.updateDonation(
            updatedRequest.donation_id,
            { donation_status: "available" },
            (err) => {
              if (err) console.error("Gagal mengubah status donasi:", err);
            }
          );
        }

        if (
          ["approved", "canceled", "rejected"].includes(data.request_status)
        ) {
          Donation.getDonationById(
            updatedRequest.donation_id,
            (err, donation) => {
              if (!err && donation) {
                const donorId = donation.user_id;
                const statusMap = {
                  approved: "Disetujui",
                  canceled: "Dibatalkan",
                  rejected: "Ditolak",
                };
                const statusText =
                  statusMap[data.request_status] || data.request_status;

                pool.query(
                  `SELECT user_name FROM users WHERE user_id = $1`,
                  [donorId],
                  (userErr, userRes) => {
                    const donorName =
                      !userErr && userRes.rows[0]
                        ? userRes.rows[0].user_name
                        : "donor";

                    const notif = {
                      user_id: updatedRequest.user_id,
                      type: "request_update",
                      title: `Permintaan Anda ${statusText}`,
                      message: `Permintaan untuk '${
                        donation.title
                      }' telah ${statusText.toLowerCase()} oleh ${donorName}.`,
                      data: JSON.stringify({
                        donation_id: donation.donation_id,
                        request_id: updatedRequest.request_id,
                      }),
                    };
                    Notification.create(notif, () => {});
                  }
                );
              }
            }
          );
        }

        res.status(200).json(updatedRequest);
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
};
