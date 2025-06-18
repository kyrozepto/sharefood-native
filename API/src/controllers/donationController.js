const Donation = require("../models/Donation");
const { imageUpload } = require("../utils/ImageKit.js");
const { sendNotification } = require("../utils/sendNotification.js");

async function getDonations(req, res) {
  try {
    Donation.getDonations((err, results) => {
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

async function getDonationById(req, res) {
  try {
    const { id } = req.params;

    Donation.getDonationById(id, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching user", error: err });
      }
      if (!user) {
        return res.status(404).json({ message: "Donation not found" });
      }
      res.status(200).json(user);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createDonation(req, res) {
  try {
    const {
      title,
      description,
      location,
      quantity_value,
      quantity_unit,
      expiry_date,
      category,
    } = req.body;
    const user_id = req.user.user_id;

    if (!title || title.length > 255)
      return res.status(400).json({ message: "Judul wajib diisi." });
    if (!description || description.length > 1000)
      return res.status(400).json({ message: "Deskripsi wajib diisi." });
    if (!location)
      return res.status(400).json({ message: "Lokasi wajib diisi." });
    if (!quantity_value || isNaN(quantity_value))
      return res.status(400).json({ message: "Jumlah wajib diisi." });
    if (!["kg", "g", "liter", "ml"].includes(quantity_unit))
      return res.status(400).json({ message: "Satuan tidak valid." });
    if (
      ![
        "vegetables",
        "fruits",
        "bakery",
        "dairy",
        "meat",
        "non-perishable",
        "prepared-food",
      ].includes(category)
    )
      return res.status(400).json({ message: "Kategori tidak valid." });
    if (!expiry_date)
      return res
        .status(400)
        .json({ message: "Tanggal kadaluarsa wajib diisi." });

    const photoUrl = req.file ? await imageUpload(req.file) : null;

    let quantityInKg;

    switch (quantity_unit) {
      case "kg":
        quantityInKg = parseFloat(quantity_value);
        break;
      case "g":
        quantityInKg = parseFloat(quantity_value) / 1000;
        break;
      case "liter":
        quantityInKg = parseFloat(quantity_value);
        break;
      case "ml":
        quantityInKg = parseFloat(quantity_value) / 1000;
        break;
      default:
        return res.status(400).json({ message: "Satuan tidak valid." });
    }

    if (isNaN(quantityInKg) || quantityInKg <= 0)
      return res.status(400).json({ message: "Jumlah tidak valid." });

    const donationData = {
      user_id,
      title,
      description,
      location,
      quantity_value: quantityInKg,
      quantity_unit: "kg",
      expiry_date,
      category,
      donation_picture: photoUrl || null,
      donation_status: "available",
    };

    Donation.createDonation(donationData, (err, newDonation) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal membuat donasi", error: err });

      sendNotification({
        user_id,
        type: "donation_created",
        title: "Donation Created",
        message: `Your donation "${title}" has been successfully created.`,
        data: { donation_id: newDonation.donation_id },
      });

      res.status(201).json(newDonation);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan", error: error.message });
  }
}

async function updateDonation(req, res) {
  try {
    const { id } = req.params;
    const { donation_status } = req.body;

    Donation.getDonationById(id, async (err, donation) => {
      if (err || !donation)
        return res.status(404).json({ message: "Donasi tidak ditemukan" });

      const statusToUpdate =
        donation.quantity_value === 0 ? "completed" : donation_status;

      const updatedFields = {};

      if (donation.quantity_value === 0 || donation_status) {
        updatedFields.donation_status = statusToUpdate;
      }

      if (req.file) {
        const uploadedUrl = await imageUpload(req.file);
        updatedFields.donation_picture = uploadedUrl;
      }

      if (Object.keys(updatedFields).length === 0) {
        return res
          .status(400)
          .json({ message: "Tidak ada data untuk diperbarui" });
      }

      Donation.updateDonation(id, updatedFields, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Gagal update donasi", error: err });

        if (statusToUpdate === "completed") {
          sendNotification({
            user_id: donation.user_id,
            type: "donation_completed",
            title: "Donation Marked as Completed",
            message: `Your donation "${donation.title}" has been marked as completed.`,
            data: { donation_id: donation.donation_id },
          });
        }

        res.status(200).json({ message: "Donasi berhasil diperbarui" });
      });

      console.log("Uploaded file:", req.file);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
};
