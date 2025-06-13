const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const userController = require("../controllers/userController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log("Multer file filter - File details:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

router.use((req, res, next) => {
  next();
});

router.get("/me", authenticateToken, userController.getCurrentUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", upload.none(), userController.createUser);

router.put(
  "/:id",
  authenticateToken,
  (req, res, next) => {
    next();
  },
  upload.single("profile_picture"),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        message: "Upload error",
        error: err.message,
      });
    }
    next();
  },
  userController.updateUser
);

router.post("/login", userController.loginUser);

module.exports = router;
