export interface Donation {
  donation_id: number;
  user_id: number;
  title: string;
  description: string;
  quantity_value: number;
  quantity_unit: string;
  expiry_date: string;
  location: string;
  category: string;
  donation_status: string;
  donation_picture?: string;
  created_at: string;
}

export interface CreateDonationPayload {
  title: string;
  description: string;
  location: string;
  quantity_value: number;
  quantity_unit: string;
  expiry_date: string;
  category: string;
  donation_picture?: string;
}

export interface UpdateDonationPayload {
  donation_status: string;
}
