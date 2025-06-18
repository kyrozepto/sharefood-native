const Notification = require("../models/Notification");

async function getAllNotifications(req, res) {
  try {
    Notification.getAll((err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Gagal mengambil data", error: err });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getNotificationById(req, res) {
  try {
    const { id } = req.params;

    Notification.getById(id, (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengambil notifikasi", error: err });
      if (!result)
        return res.status(404).json({ message: "Notifikasi tidak ditemukan" });

      res.status(200).json(result);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getNotificationsByUserId(req, res) {
  try {
    const { user_id } = req.params;

    Notification.getByUserId(user_id, (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengambil notifikasi", error: err });
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createNotification(req, res) {
  try {
    const { user_id, type, title, message, data } = req.body;

    if (!user_id || !type || !title || !message) {
      return res.status(400).json({ message: "Field wajib tidak lengkap" });
    }

    const notificationData = {
      user_id,
      type,
      title,
      message,
      data: data || null,
    };

    Notification.create(notificationData, (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal membuat notifikasi", error: err });
      res.status(201).json(result);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    Notification.softDelete(id, (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal menghapus notifikasi", error: err });
      if (!result)
        return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
      res.status(200).json({ message: "Notifikasi berhasil dihapus" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateIsRead(req, res) {
  try {
    const { id } = req.params;
    const { is_read } = req.body;

    if (typeof is_read !== "boolean") {
      return res
        .status(400)
        .json({ message: "is_read harus bernilai true/false" });
    }

    Notification.updateIsRead(id, is_read, (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengubah status baca", error: err });
      if (!result)
        return res.status(404).json({ message: "Notifikasi tidak ditemukan" });

      res
        .status(200)
        .json({ message: "Status baca diperbarui", notification: result });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  getNotificationsByUserId,
  createNotification,
  deleteNotification,
  updateIsRead,
};
