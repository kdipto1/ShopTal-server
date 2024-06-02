export type IProductFilterRequest = {
  searchTerm?: string;
  name?: string;
};

export type ProductCreateInput = {
  name: string;
  price: number;
  quantity: number;
  brandName: string;
  image: string;
  features: any;
  categoryId: string;
  subcategoryId: string;
};
