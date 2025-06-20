import { User } from "../interfaces/userInterface";

const BASE_URL = "https://sharefood-api-b35u.onrender.com";

export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/api/users`);
  return response.json();
};

export const getUserById = async (
  userId: number,
  token: string
): Promise<User> => {
  const response = await fetch(`${BASE_URL}/api/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch user");
  }

  return response.json();
};

export const updateUser = async (
  userId: number,
  data: FormData,
  token: string
): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/api/user/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }

  return response.json();
};

export const resetPassword = async (
  email: string,
  new_password: string
): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/api/user/reset-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ email, new_password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
};
