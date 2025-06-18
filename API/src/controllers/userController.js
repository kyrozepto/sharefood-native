const User = require("../models/User");
const { imageUpload } = require("../utils/ImageKit.js");

async function getUsers(req, res) {
  try {
    User.getUsers((err, results) => {
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

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    User.getUserById(id, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching user", error: err });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { user_name, password, phone, email, user_type, profile_picture } =
      req.body;
    console.log("body: ", req.body);

    // Validation
    if (!user_name || user_name.length > 255) {
      return res.status(400).json({
        message: "Nama harus diisi dan maksimal 255 karakter",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password harus diisi dan minimal 8 karakter",
      });
    }

    const passwordRegex = /^(?=.*[A-Z]).+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password harus mengandung setidaknya satu huruf besar",
      });
    }

    if (phone && phone.length > 20) {
      return res.status(400).json({
        message: "No. Handphone tidak boleh lebih dari 20 karakter",
      });
    }

    if (!email || email.length > 100) {
      return res.status(400).json({
        message: "Email harus diisi dan maksimal 100 karakter",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    if (!user_type || (user_type !== "donor" && user_type !== "receiver")) {
      return res.status(400).json({
        message: "User type harus berupa 'donor' atau 'receiver'",
      });
    }

    // Build user data object (optional profile_picture)
    const userData = {
      user_name,
      password,
      phone,
      email,
      user_type,
    };

    if (profile_picture) {
      userData.profile_picture = profile_picture; // ✅ Only added if exists
    }

    // Insert user
    User.createUser(userData, (err, newUser) => {
      if (err) {
        console.error("CreateUser DB Error:", err);
        return res
          .status(500)
          .json({ message: "Error creating user", error: err });
      }
      res.status(201).json(newUser);
    });
  } catch (error) {
    console.error("Exception during createUser:", error);
    res.status(400).json({ message: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { user_name, password, phone, email, user_type } = req.body;

    let photoUrl = null;

    if (req.file) {
      try {
        console.log("Attempting to upload to ImageKit...");
        photoUrl = await imageUpload(req.file);
        console.log("ImageKit upload successful:", photoUrl);
      } catch (uploadError) {
        console.error("ImageKit upload failed:", uploadError);
        return res.status(400).json({
          message: "Failed to upload image",
          error: uploadError.message,
        });
      }
    } else {
      console.log("No file received in request");
    }

    console.log("ImageKit upload successful:", photoUrl);

    const updatedData = {};

    if (user_name !== undefined && user_name !== null) {
      updatedData.user_name = user_name;
    }
    if (phone !== undefined && phone !== null) {
      updatedData.phone = phone;
    }
    if (email !== undefined && email !== null) {
      updatedData.email = email;
    }
    if (user_type !== undefined && user_type !== null) {
      updatedData.user_type = user_type;
    }

    if (password && password !== "********" && password.trim() !== "") {
      console.log("Hashing new password...");
      const saltRounds = 10;
      updatedData.password = await bcrypt.hash(password, saltRounds);
    }

    if (photoUrl) {
      console.log("Adding profile picture URL to update data:", photoUrl);
      updatedData.profile_picture = photoUrl;
    }
    console.log("ImageKit upload successful:", photoUrl);

    console.log("Final update data:", updatedData);

    // Check if there's anything to update
    if (Object.keys(updatedData).length === 0) {
      console.log("No data to update");
      return res.status(400).json({ message: "No data provided to update" });
    }

    // Perform the update
    User.updateUser(id, updatedData, (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({
          message: "Error updating user",
          error: err.message || err,
        });
      }

      console.log("Database update result:", result);

      if (result.affectedRows === 0) {
        console.log("No rows affected - user not found");
        return res.status(404).json({ message: "User not found" });
      }

      console.log("User updated successfully");
      res.status(200).json({
        message: "User updated successfully",
        profile_picture: photoUrl,
        updated_fields: Object.keys(updatedData),
      });
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    console.log("BODY:", req.body);

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi" });
    }

    // Login
    User.login(email, password, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Terjadi kesalahan saat login", error: err });
      }
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }
      res.status(200).json({
        message: "Login berhasil",
        user: result.user,
        token: result.token,
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getCurrentUser(req, res) {
  try {
    const userId = req.user.user_id;

    User.getUserById(userId, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching user", error: err });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      delete user.password;

      res.status(200).json(user);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  loginUser,
  getCurrentUser,
};
