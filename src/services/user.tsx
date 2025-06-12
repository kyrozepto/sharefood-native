export interface User {
  user_id: number;
  user_name: string;
  email: string;
  phone: string;
  user_type: string;
  profile_picture?: string;
}

export interface UpdateUserPayload {
  user_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  user_type?: string;
  profile_picture?: string;
}

const BASE_URL = "http://10.0.2.2:5000";

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
