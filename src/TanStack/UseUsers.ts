import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiResponse, Category, CategoryPayload, UpdateCategoryPayload } from './Types'

const API_URL = 'https://to-dos-api.softclub.tj/api/categories'
export const categoriesQueryKey = ['categories'] as const

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`)
  if (response.status === 204) return undefined as T
  const body = await response.text()
  if (!body) return undefined as T
  return JSON.parse(body) as T
}

export async function getCategories(): Promise<Category[]> {
  const result = await request<ApiResponse<Category[]>>(API_URL)
  return result.data ?? []
}

export async function getCategory(id: number): Promise<Category> {
  const result = await request<ApiResponse<Category>>(`${API_URL}/${id}`)
  return result.data
}

export async function addCategory(payload: CategoryPayload): Promise<void> {
  await request(API_URL, { method: 'POST', body: JSON.stringify(payload) })
}

export async function editCategory(payload: UpdateCategoryPayload): Promise<void> {
  await request(API_URL, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteCategory(id: number): Promise<void> {
  await request(`${API_URL}?id=${id}`, { method: 'DELETE' })
}

export function useCategories() {
  return useQuery({ queryKey: categoriesQueryKey, queryFn: getCategories, staleTime: 60_000 })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: addCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }) })
}

export function useEditCategory() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: editCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }) })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: deleteCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }) })
}
