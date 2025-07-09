export type Listing = {
  id: string;
  title: string;
  location: string;
  price: number;
  createdAt: any;
  images?: string[];
  numericId: string;
  type: string;
  status: string;
  area: string;
  views: number;
  bedrooms: string;
  bathrooms: string;
  createdBy: string;
};