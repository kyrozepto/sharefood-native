const BASE_URL = "https://sharefood-api-b35u.onrender.com";

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const res = await fetch(`${BASE_URL}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
};

export const registerUser = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const res = await fetch(`${BASE_URL}/api/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    console.log("res: ", error.message);
    throw new Error(error.message || "Registration failed");
  }

  return res.json();
};
