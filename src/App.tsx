import { useState, type FormEvent } from 'react'
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  useGetCategoriesQuery,
  type Category,
} from './store/categoryApi'

type Dialog = { type: 'form'; category?: Category } | { type: 'info'; category: Category } | null

function App() {
  const { data: categories = [], isLoading, isError, error } = useGetCategoriesQuery()
  const [addCategory, addState] = useAddCategoryMutation()
  const [editCategory, editState] = useEditCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  function openForm(category?: Category) {
    setName(category?.name ?? '')
    setMessage('')
    setDialog({ type: 'form', category })
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (dialog?.type !== 'form') return
    setMessage('')

    try {
      if (dialog.category) {
        await editCategory({ id: dialog.category.id, name: name.trim() }).unwrap()
      } else {
        await addCategory({ name: name.trim() }).unwrap()
      }
      setDialog(null)
    } catch {
      setMessage('Не удалось сохранить категорию. Попробуйте ещё раз.')
    }
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Удалить категорию «${category.name}»?`)) return
    setMessage('')
    try {
      await deleteCategory(category.id).unwrap()
    } catch {
      setMessage('Не удалось удалить категорию. Попробуйте ещё раз.')
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
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

        {message && <p role="alert" className="mb-4 rounded-md border border-destructive/30 px-4 py-3 text-sm text-destructive">{message}</p>}

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-medium">Все категории</h2>
            <p className="mt-1 text-sm text-muted-foreground">{categories.length} записей</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-muted/50 text-muted-foreground"><tr><th className="w-24 px-5 py-3 font-medium">ID</th><th className="px-5 py-3 font-medium">Название</th><th className="w-36 px-5 py-3 text-left font-medium">Действия</th></tr></thead>
              <tbody className="divide-y">
                {isLoading && <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">Загрузка категорий…</td></tr>}
                {isError && <tr><td colSpan={3} className="px-5 py-12 text-center text-destructive">{String('data' in (error ?? {}) ? error.data : 'Не удалось загрузить категории')}</td></tr>}
                {!isLoading && !isError && categories.length === 0 && <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">Категорий пока нет</td></tr>}
                {categories.map((category) => <tr key={category.id}>
                  <td className="px-5 py-4 text-muted-foreground">{category.id}</td>
                  <td className="px-5 py-4 font-medium">{category.name}</td>
                  <td className="px-5 py-3"><div className="flex justify-start gap-1">
                    <button title="Информация" aria-label={`Информация о ${category.name}`} onClick={() => setDialog({ type: 'info', category })} className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground"><Eye size={16} /></button>
                    <button title="Изменить" aria-label={`Изменить ${category.name}`} onClick={() => openForm(category)} className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground"><Pencil size={16} /></button>
                    <button title="Удалить" aria-label={`Удалить ${category.name}`} onClick={() => void removeCategory(category)} className="inline-flex size-9 items-center justify-center rounded-md text-destructive"><Trash2 size={16} /></button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {dialog && <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4 py-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null) }}>
        <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
          <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{dialog.type === 'info' ? 'Информация о категории' : dialog.category ? 'Изменить категорию' : 'Новая категория'}</h2><p className="mt-1 text-sm text-muted-foreground">{dialog.type === 'info' ? 'Данные выбранной категории.' : 'Введите название категории.'}</p></div><button aria-label="Закрыть" onClick={() => setDialog(null)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground"><X size={16} /></button></div>
          {dialog.type === 'info' ? <dl className="space-y-3 rounded-md border p-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">ID</dt><dd>{dialog.category.id}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Название</dt><dd className="font-medium">{dialog.category.name}</dd></div></dl> : <form onSubmit={(event) => void saveCategory(event)}>
            <label htmlFor="category-name" className="mb-2 block text-sm font-medium">Название</label><input id="category-name" autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Работа" className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            {message && <p role="alert" className="mt-2 text-sm text-destructive">{message}</p>}
            <div className="mt-6 flex justify-start gap-2"><button type="button" onClick={() => setDialog(null)} className="h-9 rounded-md border px-4 text-sm font-medium">Отмена</button><button disabled={addState.isLoading || editState.isLoading || !name.trim()} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">{addState.isLoading || editState.isLoading ? 'Сохранение…' : 'Сохранить'}</button></div>
          </form>}
          {dialog.type === 'info' && <div className="mt-5"><button onClick={() => setDialog(null)} className="h-9 rounded-md border px-4 text-sm font-medium">Закрыть</button></div>}
        </section>
      </div>}
    </main>
  )
}

export default App
