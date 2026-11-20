import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export type User = {
  id: number
  name: string ,
  status : boolean
}

 const useUsers = () => {
  const queryClient = useQueryClient()

  const users = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('https://6aaa5efdff4dd5698b4e7685.mockapi.io/panel')
      return res.data
    }
  })

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`https://6aaa5efdff4dd5698b4e7685.mockapi.io/panel/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return { ...users, deleteUser }
}
export default useUsers