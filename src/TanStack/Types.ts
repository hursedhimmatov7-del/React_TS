export interface Category {
  id: number
  name: string
}

export interface ApiResponse<T> {
  data: T
  errors: string[]
  statusCode: number
}

export interface CategoryPayload {
  name: string
}

export interface UpdateCategoryPayload extends CategoryPayload {
  id: number
}
