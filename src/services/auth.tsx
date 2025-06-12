interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    user_id: number;
    email: string;
    user_name: string;
    user_type: string;
  };
  token: string;
  message?: string;
}

interface RegisterPayload {
  user_name: string;
  email: string;
  phone: string;
  password: string;
  user_type: "donor" | "recipient";
}

interface RegisterResponse {
  message: string;
  user: {
    user_id: number;
    user_name: string;
    email: string;
    phone: string;
    user_type: string;
  };
  token: string;
}

const BASE_URL = "http://10.0.2.2:5000";

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

  console.log("login: ", payload);

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
    throw new Error(error.message || "Registration failed");
  }

  console.log("register: ", payload);

  return res.json();
};
