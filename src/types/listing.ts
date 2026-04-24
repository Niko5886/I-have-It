export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  created_at: string;
  updated_at: string;
};

export type ListingWithPhotos = Listing & {
  listing_photos: Array<{
    id: string;
    storage_path: string;
  }>;
};

export type ListingWithUser = Listing & {
  user_profiles: {
    id: string;
    name: string | null;
    email: string;
    phone_number: string | null;
  } | null;
  listing_photos: Array<{
    id: string;
    storage_path: string;
  }>;
};
