import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTasks() {
      try {
        const response = await fetch(API_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Không tải được danh sách công việc')
        }
        const data = await response.json()
        if (!controller.signal.aborted) setTasks(data)
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadTasks()
    return () => controller.abort()
  }, [])

  async function handleAddTask(event) {
    event.preventDefault()
    const title = newTask.trim()
    if (!title || saving) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) {
        throw new Error('Không thêm được công việc')
      }
      const createdTask = await response.json()
      setTasks((currentTasks) => [...currentTasks, createdTask])
      setNewTask('')
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <h1>Lịch trình cá nhân</h1>
      <p>Sắp xếp công việc và theo dõi tiến độ mỗi ngày.</p>

      <section>
        <h2>Công việc hôm nay</h2>

        <form onSubmit={handleAddTask}>
          <label htmlFor="new-task">Công việc mới</label>
          <input
            id="new-task"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="Ví dụ: 21:00 — Ôn JavaScript"
            disabled={loading || saving}
            required
          />
          <button
            type="submit"
            disabled={loading || saving || !newTask.trim()}
          >
            {saving ? 'Đang thêm...' : 'Thêm công việc'}
          </button>
        </form>

        {error && <p role="alert">{error}</p>}
        {loading ? (
          <p>Đang tải công việc...</p>
        ) : tasks.length === 0 ? (
          <p>Chưa có công việc nào. Bạn thêm công việc đầu tiên nhé.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                  />
                  {task.title}
                </label>
                {task.completed ? ' — Đã hoàn thành' : ''}
              </li>
                        ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
