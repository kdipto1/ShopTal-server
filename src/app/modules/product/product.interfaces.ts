// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IProductFilterRequest = {
  searchTerm?: string;
  name?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ProductCreateInput = {
  name: string;
  price: number;
  quantity: number;
  brandId: string;
  image: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features: any;
  categoryId: string;
  subcategoryId: string;
};
