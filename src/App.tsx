import { useQuery } from '@tanstack/react-query'

type User = {
  id: number
  name: string
}

function App() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/users')
      if (!res.ok) throw new Error('Request failed')
      return res.json()
    }
  })

  if (isPending) return <h1>Loading...</h1>
  if (isError) return <h1>Error</h1>

  return (
    <div>
{data.map((user: User) => <p key={user.id}>{user.name}</p>)}
    </div>
  )
}
export default App