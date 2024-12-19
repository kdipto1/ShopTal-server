// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IProductFilterRequest = {
  searchTerm?: string;
  name?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  random?: boolean;
  description?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ProductCreateInput = {
  name: string;
  price: number;
  quantity: number;
  brandId: string;
  image: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features?: any;
  categoryId: string;
  subcategoryId?: string;
  description: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ProductUpdateInput = {
  name: string;
  price: number;
  quantity: number;
  brandId: string;
  image: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features?: any;
  categoryId: string;
  subcategoryId?: string;
  description: string;
};
