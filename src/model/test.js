import mongoose from '../config/DBhelper'

const Schema = mongoose.Schema

const TestSchema = new Schema({
    'name': String,
    'age': Number,
    'email': String
})

const TestModel = mongoose.model('users', TestSchema)

export default TestModel