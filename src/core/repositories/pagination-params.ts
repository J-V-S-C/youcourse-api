export interface PaginationParams {
  page: number;
  perPage: number;
  orderBy: 'recent' | 'popular' | 'bestSelling';
}
