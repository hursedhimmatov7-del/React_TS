import { useState, type FormEvent } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Category } from './TanStack/Types'
import { useAddCategory, useCategories, useDeleteCategory, useEditCategory } from './TanStack/UseUsers'

const queryClient = new QueryClient()

type DialogState = { type: 'form'; category?: Category } | { type: 'info'; category: Category } | null

function CategoriesPage() {
  const { data: categories = [], isLoading, isError, error } = useCategories()
  const addMutation = useAddCategory()
  const editMutation = useEditCategory()
  const deleteMutation = useDeleteCategory()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [name, setName] = useState('')
  const [actionError, setActionError] = useState('')
  const busy = addMutation.isPending || editMutation.isPending

  function openForm(category?: Category) {
    setName(category?.name ?? '')
    setActionError('')
    setDialog({ type: 'form', category })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionError('')
    try {
      if (dialog?.type !== 'form') return
      if (dialog.category) await editMutation.mutateAsync({ id: dialog.category.id, name: name.trim() })
      else await addMutation.mutateAsync({ name: name.trim() })
      setDialog(null)
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Не удалось сохранить категорию')
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Удалить категорию «${category.name}»?`)) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(category.id)
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Не удалось удалить категорию')
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <section className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Управление</p>
            <h1 className="text-3xl font-semibold tracking-tight">Категории</h1>
            <p className="mt-2 text-sm text-muted-foreground">Создавайте и редактируйте категории задач.</p>
          </div>
          <button onClick={() => openForm()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Plus size={16} /> Добавить категорию
          </button>
        </header>

        {actionError && <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{actionError}</p>}

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div><h2 className="text-sm font-medium">Все категории</h2><p className="mt-1 text-sm text-muted-foreground">{categories.length} записей</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground"><tr><th className="w-24 px-5 py-3 font-medium">ID</th><th className="px-5 py-3 font-medium">Название</th><th className="w-36 px-5 py-3 text-right font-medium">Действия</th></tr></thead>
              <tbody className="divide-y">
                {isLoading && <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">Загрузка категорий…</td></tr>}
                {isError && <tr><td colSpan={3} className="px-5 py-12 text-center text-destructive">{error instanceof Error ? error.message : 'Не удалось загрузить категории'}</td></tr>}
                {!isLoading && !isError && categories.length === 0 && <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">Категорий пока нет</td></tr>}
                {categories.map((category) => <tr key={category.id}>
                  <td className="px-5 py-4 text-muted-foreground">{category.id}</td><td className="px-5 py-4 font-medium">{category.name}</td>
                  <td className="px-5 py-3"><div className="flex justify-end gap-1">
                    <button aria-label={`Информация о ${category.name}`} title="Информация" onClick={() => setDialog({ type: 'info', category })} className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground"><Eye size={16} /></button>
                    <button aria-label={`Редактировать ${category.name}`} title="Изменить" onClick={() => openForm(category)} className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground"><Pencil size={16} /></button>
                    <button aria-label={`Удалить ${category.name}`} title="Удалить" disabled={deleteMutation.isPending} onClick={() => void handleDelete(category)} className="inline-flex size-9 items-center justify-center rounded-md text-destructive disabled:opacity-50"><Trash2 size={16} /></button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {dialog && <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4 py-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null) }}>
        <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
          <div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-semibold">{dialog.type === 'info' ? 'Информация о категории' : dialog.category ? 'Редактировать категорию' : 'Новая категория'}</h2><p className="mt-1 text-sm text-muted-foreground">{dialog.type === 'info' ? 'Данные выбранной категории.' : 'Укажите название категории.'}</p></div><button aria-label="Закрыть" onClick={() => setDialog(null)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground"><X size={16} /></button></div>
          {dialog.type === 'info' ? <dl className="space-y-3 rounded-md border p-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">ID</dt><dd>{dialog.category.id}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Название</dt><dd className="font-medium">{dialog.category.name}</dd></div></dl> : <form onSubmit={(event) => void handleSubmit(event)}>
            <label htmlFor="category-name" className="mb-2 block text-sm font-medium">Название</label><input id="category-name" autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Работа" className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            {actionError && <p role="alert" className="mt-2 text-sm text-destructive">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="h-9 rounded-md border px-4 text-sm font-medium">Отмена</button><button disabled={busy || !name.trim()} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? 'Сохранение…' : 'Сохранить'}</button></div>
          </form>}
          {dialog.type === 'info' && <div className="mt-5 flex justify-end"><button onClick={() => setDialog(null)} className="h-9 rounded-md border px-4 text-sm font-medium">Закрыть</button></div>}
        </section>
      </div>}
    </main>
  )
}

function App() {
  return <QueryClientProvider client={queryClient}><CategoriesPage /></QueryClientProvider>
}

export default App
