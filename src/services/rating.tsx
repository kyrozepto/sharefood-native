import { RatingItem, CreateRatingPayload } from "../interfaces/ratingInterface";

const BASE_URL = "https://sharefood-api-b35u.onrender.com";

export const getRatings = async (): Promise<RatingItem[]> => {
  const response = await fetch(`${BASE_URL}/api/rating`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch ratings");
  }

  return response.json();
};

export const getRatingById = async (
  ratingId: number,
  token?: string
): Promise<RatingItem> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/rating/${ratingId}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch rating");
  }

  return response.json();
};

export const createRating = async (
  data: CreateRatingPayload,
  token: string
): Promise<RatingItem> => {
  const formData = new FormData();

  for (const key in data) {
    const value = data[key as keyof CreateRatingPayload];
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  }

  const response = await fetch(`${BASE_URL}/api/rating`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create rating");
  }

  return response.json();
};

import { ReceivedRating } from "../interfaces/ratingInterface";

export const getRatingsByDonorId = async (
  donorId: number | string,
  token?: string
): Promise<ReceivedRating[]> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/rating/donor/${donorId}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch donor ratings");
  }

  return response.json();
};
