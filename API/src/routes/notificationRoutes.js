const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.getAllNotifications);
router.patch("/:id/read", notificationController.updateIsRead);
router.get("/:id", notificationController.getNotificationById);
router.get("/user/:user_id", notificationController.getNotificationsByUserId);
router.post("/", notificationController.createNotification);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
