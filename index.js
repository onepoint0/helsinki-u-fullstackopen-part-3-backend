const express = require('express')
const app = express()
app.use(express.json())

const morgan = require('morgan')
morgan.token('body',(req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors = require('cors') 
app.use(cors())

app.use(express.static('dist'))

let phoneBook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(req,res) => {
    return res.json(phoneBook)
})

app.get('/api/persons/:id',(req,res) => {
    const id = Number(req.params.id)

    const person = phoneBook.find( p => p.id === id )

    if (!person) return res.status(404).end()

    return res.json(person)
})

app.delete('/api/persons/:id',(req,res) => {
    const id = Number(req.params.id)

    phoneBook = phoneBook.filter( p => p.id !== id )

    return res.status(204).end()
})

app.post('/api/persons',(req,res) => {
    const body = req.body

    if (!body.name) return res.status(400).json({"error": "name must be provided"})

    if (!body.number) return res.status(400).json({"error": "number must be provided"})

    const duplicateName =  phoneBook.find( p => p.name === body.name)

    if ( duplicateName ) return res.status(400).json({"error": "name must be unique"})

    const duplicateNumber =  phoneBook.find( p => p.number === body.number)

    if ( duplicateNumber ) return res.status(400).json({"error": "number must be unique"})

    const person = {
      "id": Math.floor(Math.random() * 1000000),
      "name": body.name,
      "number": body.number
    }

    phoneBook = phoneBook.concat(person)

    return res.json(person)
})

app.get('/info',(req,res) => {
    let d = new Date()
    res.send(`<div><p>Phonebook has info for ${phoneBook.length} people</p><p>${d}</p></div>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})