const Notification = require("../models/Notification");

function sendNotification({ user_id, type, title, message, data = {} }) {
  Notification.create(
    {
      user_id,
      type,
      title,
      message,
      data,
    },
    (err) => {
      if (err) console.error("Failed to send notification:", err);
    }
  );
}

module.exports = { sendNotification };
