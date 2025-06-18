import { RequestItem } from "../interfaces/requestInterface";
import { CreateRequestPayload } from "../interfaces/requestInterface";
import { UpdateRequestPayload } from "../interfaces/requestInterface";

const BASE_URL = "http://10.0.2.2:5000";

export const getRequests = async (): Promise<RequestItem[]> => {
  const response = await fetch(`${BASE_URL}/api/request`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch requests");
  }

  return response.json();
};

// services/request.ts
export const getRequestById = async (
  requestId: number,
  token: string
): Promise<RequestItem> => {
  const response = await fetch(`${BASE_URL}/api/request/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch request");
  }

  return response.json();
};

export const createRequest = async (
  data: CreateRequestPayload,
  token: string
): Promise<RequestItem> => {
  const formData = new FormData();

  for (const key in data) {
    const value = data[key as keyof CreateRequestPayload];
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  }

  const response = await fetch(`${BASE_URL}/api/request`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create request");
  }

  return response.json();
};

export const updateRequest = async (
  id: number,
  data: UpdateRequestPayload,
  token: string
): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append("request_status", data.request_status);

  const response = await fetch(`${BASE_URL}/api/request/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update request");
  }

  return response.json();
};
