require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())

const Person = require('./models/person')

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(p => res.json(p))
    .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
  console.log('findbyid ', req.params.id)
  Person.findById(req.params.id)
    .then(p => {
      if (p) {
        console.log(`person found ${p}`)
        res.json(p)
      } else {
        console.log('person not found - in 404')
        res.status(404).end()
      }
    }).catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number
  }

  Person.findByIdAndUpdate(
    req.params.id,
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updated => {
      res.json(updated)
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  console.log('deleting by id ', req.params.id)
  Person.findByIdAndDelete(req.params.id)
    .then(result => res.status(204).end())
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })
  console.log(`new p ${person}`)

  person.save().then(savedPerson => {
    console.log(`saved person ${savedPerson}`)
    res.json(savedPerson)
  })
    .catch(err => next(err))
})

app.get('/info', (req, res) => {
  Person.find({}).then(phoneBook => {
    console.log(`info - phonebook found ${phoneBook}`)
    const d = new Date()
    res.send(`<div><p>Phonebook has info for ${phoneBook.length} people</p><p>${d}</p></div>`)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error('errorHandler ', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
