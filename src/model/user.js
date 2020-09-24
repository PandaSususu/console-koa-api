import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const UserSchema = new Schema({
    'userName': String,
    'password': String,
})

const UseModel = mongoose.model('users', UserSchema)

export default UseModel