import { randomUUID } from 'node:crypto'
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search, 
        description: search 
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end(JSON.stringify({ message: 'To create a new task, add a title and a description' }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      if(!database.checkIfIdExists('tasks', id)) {
        return res.writeHead(404).end(JSON.stringify({ message: 'ID not found' }))
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      if(!database.checkIfIdExists('tasks', id)) {
        return res.writeHead(404).end(JSON.stringify({ message: 'ID not found' }))
      }

      const { title, description } = req.body

      if (!title && !description) {
        return res.writeHead(400).end(JSON.stringify({ message: 'To create a new task, add a title and/or a description' }))
      }

      const newData = {
        updated_at: new Date(),
      }

      if(title) {
        Object.assign(newData, { title })
      }

      if(description) {
        Object.assign(newData, { description })
      }

      database.update('tasks', id, newData)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      if(!database.checkIfIdExists('tasks', id)) {
        return res.writeHead(404).end(JSON.stringify({ message: 'ID not found' }))
      }

      database.update('tasks', id, {
        completed_at: new Date(),
      })

      return res.writeHead(204).end()
    }
  }
]