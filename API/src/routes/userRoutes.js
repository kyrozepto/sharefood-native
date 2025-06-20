const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const userController = require("../controllers/userController");
const multer = require("multer");

const upload = multer();

router.use((req, res, next) => {
  next();
});

router.get("/", userController.getUsers);
router.put("/reset-password", userController.resetPassword);
router.get("/:id", userController.getUserById);
router.post("/", upload.none(), userController.createUser);
router.put(
  "/:id",
  authenticateToken,
  upload.single("profile_picture"),
  userController.updateUser
);
router.post("/login", userController.loginUser);

module.exports = router;
