const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({
  origin: 'http://localhost:5173',
}))
app.use(express.json())

const tasksFile = path.join(__dirname, 'tasks.json')

const tasks = fs.existsSync(tasksFile)
  ? JSON.parse(fs.readFileSync(tasksFile, 'utf8'))
  : [
      { id: 1, title: 'Học React', completed: false },
      { id: 2, title: 'Học backend', completed: false },
      { id: 3, title: 'Ôn JavaScript', completed: false },
    ]
app.get('/', (req, res) => {
  res.send('Backend lịch trình đang chạy!')
})

app.get('/tasks', (req, res) => {
  res.json(tasks)
})
let nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1

function saveTasks() {
  const json = JSON.stringify(tasks, null, 2)
  fs.writeFileSync(tasksFile, json, 'utf8')
}

app.post('/tasks', (req, res) => {
  const title = req.body?.title

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: 'Bạn cần nhập tên công việc',
    })
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
  }

  tasks.push(newTask)
  saveTasks()

  res.status(201).json(newTask)
})
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id)

  const index = tasks.findIndex((task) => task.id === id)

  if (index === -1) {
    return res.status(404).json({
      message: 'Không tìm thấy công việc',
    })
  }

  const deletedTask = tasks.splice(index, 1)[0]
  saveTasks()

  res.json({
    message: 'Đã xóa công việc',
    task: deletedTask,
  })
})
app.patch('/tasks/:id', (req, res) => {
  const id = Number(req.params.id)
  const task = tasks.find((task) => task.id === id)

  if (!task) {
    return res.status(404).json({
      message: 'Không tìm thấy công việc',
    })
  }

  const completed = req.body?.completed

  if (typeof completed !== 'boolean') {
    return res.status(400).json({
      message: 'completed phải là true hoặc false',
    })
  }

  task.completed = completed
  saveTasks()

  res.json(task)
})
app.listen(3000, () => {
  console.log('Backend chạy tại http://localhost:3000')
})
