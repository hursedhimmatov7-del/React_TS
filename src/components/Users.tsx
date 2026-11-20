import React, { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

type User = {
    id: number
    name: string
    status: boolean
}

type Form = {
    id: number | null
    name: string
    status: boolean
}

const url = 'https://6aaa5efdff4dd5698b4e7685.mockapi.io/panel'

const Users = () => {
    const queryClient = useQueryClient()

    const { data = [], isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axios.get<User[]>(url)
            return res.data
        }
    })

    const [form, setform] = useState<Form>({ id: null, name: '', status: false })
    const [infoUser, setInfoUser] = useState<User | null>(null)

    const modal = useRef<HTMLDialogElement>(null)
    const infoModal = useRef<HTMLDialogElement>(null)

    const addUser = useMutation({
        mutationFn: (user: Omit<User, 'id'>) => axios.post(url, user),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    })

    const dltUser = useMutation({
        mutationFn: (id: number) => axios.delete(`${url}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    })

    const editUser = useMutation({
        mutationFn: (user: User) => axios.put(`${url}/${user.id}`, user),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    })

    const chekFunc = useMutation({
        mutationFn: (user: User) => axios.put(`${url}/${user.id}`, user),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    })

    const handldeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const target = e.currentTarget

        const user = {
            name: target.name.value,
            status: form.status
        }

        form.id ? editUser.mutate({ ...user, id: form.id }) : addUser.mutate(user)

        modal.current?.close()
        setform({ id: null, name: '', status: false })
        target.reset()
    }

    const handleEdit = (elem: User) => {
        setform(elem)
        modal.current?.showModal()
    }

    const handleCheck = (elem: User) => {
        chekFunc.mutate({ ...elem, status: !elem.status })
    }

    const handleInfo = (elem: User) => {
        setInfoUser(elem)
        infoModal.current?.showModal()
    }

    if (isLoading) return <h1 className='text-center mt-20 text-xl'>Loading...</h1>

    return (
        <div className='min-h-screen bg-background text-foreground'>
            <div className='max-w-5xl mx-auto px-6 py-12 flex flex-col gap-8'>

                <div className='flex items-center justify-between border-b pb-6'>
                    <div>
                        <h1 className='text-2xl font-semibold tracking-tight'>Users</h1>
                    </div>

                    <button className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium' onClick={() => {
                        setform({ id: null, name: '', status: false })
                        modal.current?.showModal()
                    }}>+ Add User</button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {data.length === 0 && <p className='text-sm text-muted-foreground'>No users found.</p>}

                    {data.map((elem) => (
                        <div key={elem.id} className='border rounded-xl p-5 flex flex-col gap-5 bg-card'>
                            <div className='flex flex-col gap-4'>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>ID</span>
                                    <span>#{elem.id}</span>
                                </div>

                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Name</span>
                                    <span className='font-medium'>{elem.name}</span>
                                </div>

                                <div className='flex justify-between items-center text-sm'>
                                    <span className='text-muted-foreground'>Status</span>
                                    <div className='flex items-center gap-2'>
                                        <input className='accent-black w-4 h-4' checked={elem.status} onChange={() => handleCheck(elem)} type="checkbox" />
                                        <span className='text-muted-foreground'>{elem.status ? 'Online' : 'Offline'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex gap-2 border-t pt-4'>
                                <button className='flex-1 border rounded-md py-2 text-sm' onClick={() => dltUser.mutate(elem.id)}>Delete</button>
                                <button className='flex-1 border rounded-md py-2 text-sm' onClick={() => handleEdit(elem)}>Edit</button>
                                <button className='flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm' onClick={() => handleInfo(elem)}>Info</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <dialog className='m-auto w-[90%] max-w-md rounded-xl border bg-background text-foreground p-6 backdrop:bg-black/50' ref={modal}>
                <form className='flex flex-col gap-5' onSubmit={handldeSubmit}>
                    <div>
                        <h1 className='text-xl font-semibold'>{form.id ? 'Edit User' : 'Add User'}</h1>
                        <p className='text-sm text-muted-foreground mt-1'>Enter user information below.</p>
                    </div>

                    <input className='w-full border rounded-md px-3 py-2 text-sm outline-none' key={form.id ?? 'new'} defaultValue={form.name} type="text" placeholder='Enter name...' name='name' required />

                    <div className='flex justify-end gap-2'>
                        <button className='border rounded-md px-4 py-2 text-sm' type='button' onClick={() => modal.current?.close()}>Cancel</button>
                        <button className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm' type='submit'>{form.id ? 'Save Changes' : 'Add User'}</button>
                    </div>
                </form>
            </dialog>

            <dialog className='m-auto w-[90%] max-w-md rounded-xl border bg-background text-foreground p-6 backdrop:bg-black/50' ref={infoModal}>
                {infoUser && (
                    <div className='flex flex-col gap-5'>
                        <div>
                            <h1 className='text-xl font-semibold'>User Information</h1>
                            <p className='text-sm text-muted-foreground mt-1'>Details about this user.</p>
                        </div>

                        <div className='border rounded-lg divide-y'>
                            <div className='flex justify-between p-3 text-sm'>
                                <span className='text-muted-foreground'>ID</span>
                                <span>#{infoUser.id}</span>
                            </div>

                            <div className='flex justify-between p-3 text-sm'>
                                <span className='text-muted-foreground'>Name</span>
                                <span className='font-medium'>{infoUser.name}</span>
                            </div>

                            <div className='flex justify-between p-3 text-sm'>
                                <span className='text-muted-foreground'>Status</span>
                                <span>{infoUser.status ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>

                        <button className='bg-primary text-primary-foreground rounded-md py-2 text-sm' onClick={() => infoModal.current?.close()}>Close</button>
                    </div>
                )}
            </dialog>
        </div>
    )
}

export default Users