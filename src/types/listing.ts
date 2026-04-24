export type Listing = {
  id: string;
  title: string;
  description: string;
  storeName: string;
  city: string;
  price: number;
  originalPrice: number;
  pickupWindow: string;
  category: 'bakery' | 'restaurant' | 'supermarket' | 'cafe';
  ownerId: string;
};
