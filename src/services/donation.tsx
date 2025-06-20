import { Donation } from "../interfaces/donationInterface";
import { CreateDonationPayload } from "../interfaces/donationInterface";
import { UpdateDonationPayload } from "../interfaces/donationInterface";

const BASE_URL = "https://sharefood-api-b35u.onrender.com";

export const getDonations = async (): Promise<Donation[]> => {
  const response = await fetch(`${BASE_URL}/api/donation`);

  if (!response.ok) {
    const error = await response.json();
    console.log(error.message);
    throw new Error(error.message || "Failed to fetch donations");
  }

  return response.json();
};

export const getDonationById = async (id: number): Promise<Donation> => {
  const response = await fetch(`${BASE_URL}/api/donation/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch donation");
  }

  return response.json();
};

export const createDonation = async (
  data: FormData,
  token: string
): Promise<Donation> => {
  console.log("data: ", data);
  const response = await fetch(`${BASE_URL}/api/donation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create donation");
  }

  return response.json();
};

export const updateDonation = async (
  id: number,
  data: UpdateDonationPayload,
  token: string
): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/api/donation/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("data: ", data);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update donation");
  }

  return response.json();
};
