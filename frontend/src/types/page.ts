export type Page<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    total: number;
  };
};
