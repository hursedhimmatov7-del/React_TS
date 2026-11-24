import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Category = {
  id: number
  name: string
}

type ApiResponse<T> = {
  data: T
  errors: string[]
  statusCode: number
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://to-dos-api.softclub.tj/api/' }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
      transformResponse: (response: ApiResponse<Category[]>) => response.data ?? [],
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation<void, { name: string }>({
      query: (body) => ({ url: 'categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    editCategory: builder.mutation<void, Category>({
      query: (body) => ({ url: 'categories', method: 'PUT', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `categories?id=${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi
