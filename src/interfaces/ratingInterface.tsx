export interface RatingItem {
  rating_id: number;
  donation_id: number;
  user_id: number;
  rate: number;
  review: string;
  created_at: string;
}

export interface CreateRatingPayload {
  donation_id: number;
  rate: number;
  review?: string;
}

export interface ReceivedRating {
  rating_id: number;
  donation_title: string;
  donation_picture?: string;
  rate: string;
  review: string;
  rater_name: string;
  rater_picture?: string;
}
