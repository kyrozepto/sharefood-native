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
