import mongoose from '../config/mongoDBConfig'

const Schema = mongoose.Schema

const UserSchema = new Schema({
    'email': String,
    'name': String,
    'password': String,
    'created': String,
    'pic': String
})

const UseModel = mongoose.model('users', UserSchema)

export default UseModel