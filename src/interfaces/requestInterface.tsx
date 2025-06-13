export interface RequestItem {
  request_id: number;
  user_id: number;
  donation_id: number;
  requested_quantity: string;
  pickup_time: string;
  note: string;
  request_status: string;
  created_at: string;
}

export interface CreateRequestPayload {
  donation_id: number;
  requested_quantity: string;
  pickup_time: string;
  note: string;
}

export interface UpdateRequestPayload {
  request_status: string;
}
