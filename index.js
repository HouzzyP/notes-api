require('dotenv').config()
require('./mongo.js')

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const Note = require('./models/Note')
const express = require('express')
const app = express()
const cors = require('cors')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
const { Mongoose } = require('mongoose')





app.use(express.json())
app.use(cors())
app.use('/images', express.static('images'))

Sentry.init({
	dsn: 'https://c95c73f3b685490aa0ecb9f540f6cf1e@o1078093.ingest.sentry.io/6081624',
	integrations: [
		//enable HTTP calls tracing
	  	new Sentry.Integrations.Http({ tracing: true }),
	  	//enable Express.js middleware tracing
	  	new Tracing.Integrations.Express({ app }),
	],
  
	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
})

//   const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
//   })

app.get('/', (request,response) =>{
	response.send('<h1>hello world</h1>')
})


app.get('/api/notes',(request,response) =>{
	Note.find({}).then(notes =>{
		response.json(notes)	
	})
	
})

app.get('/api/notes/:id',(request,response,next) =>{
	const {id} = request.params

	Note.findById(id).then(note =>{
		if(note) return response.json(note)
		response.status(404).end()
		
	}).catch(err =>{
		next(err)
	})
	
})

app.put('/api/notes/:id', (request,response,next)=>{
	const id = request.params.id
	const note = request.body


	const newNoteInfo = {
		content: note.content,
		important: note.important
	}
	
	Note.findByIdAndUpdate(id, newNoteInfo, {new:true})
		.then(result =>{
			response.json(result)
		})
		.catch(err => next(err))

})

app.delete('/api/notes/:id', (request,response,next)=>{
	const id = request.params.id
	
	Note.findByIdAndDelete(id)
		.then(() =>response.status(204).end())
		.catch(error => next(error))

})

app.post('/api/notes',(request,response, next) =>{
	const note = request.body

	if(!note.content){
		return response.status(400).json({
			error:'note.content is missing'
		})
	}

	const newNote = new Note({
		content: note.content,
		date: new Date(),
		important: note.important || false
	})

	newNote.save().then( savedNote =>{
		response.json(savedNote)
	})
		.catch(err => next(err))


})

//Middlewares
app.use(notFound)

app.use(Sentry.Handlers.errorHandler())

app.use(handleErrors)

const PORT = process.env.PORT


app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

