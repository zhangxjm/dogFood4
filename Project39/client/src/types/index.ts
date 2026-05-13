export interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  title: string;
  url: string;
  description: string;
  categoryId: Category | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookmarkDto {
  title: string;
  url: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

export interface UpdateBookmarkDto {
  title?: string;
  url?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}

export interface SearchParams {
  keyword?: string;
  categoryId?: string;
  isFavorite?: boolean;
}
