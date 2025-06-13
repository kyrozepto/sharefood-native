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
