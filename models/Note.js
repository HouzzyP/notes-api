const {Schema,model} = require('mongoose')

const noteSchema = new Schema({
	content : String,
	date: Date,
	important: Boolean
})

noteSchema.set('toJSON', {
	transform: (document, returnedObject) =>{
		returnedObject.id = returnedObject._id
		delete returnedObject._id
		delete returnedObject.__v 
	}
})

const Note = model('Note',noteSchema)

module.exports = Note


// Note.find({}).then(result =>{
// 	console.log(result)
// 	mongoose.connection.close()
// })


// const note = new Note({
// 	content: 'MongoDB es increible',
// 	date : new Date(),
// 	important: true
// })


// note.save()
// 	.then(result =>{
// 		console.log(result)
// 		mongoose.connection.close()
// 	}).catch(err => {
// 		console.log(err)
// 	})

