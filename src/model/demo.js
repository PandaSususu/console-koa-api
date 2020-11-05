import User from './user'

const userInfo = {
    name: '王五',
    age: 22,
    email: '999999@qq.com'
}

// 增
const addMethods = async () => {
    const data = new User(userInfo)
    const result = await data.save()
    console.log(result)
}

// 删
const deleteMethods = async () => {
    const result = await User.deleteOne({ name: 'Syngle' })
    console.log(result)
}

// 改
const updateMethods = async () => {
    const result = await User.updateOne({ name: '王五' }, { email: '333333@qq.com' })
    console.log(result)
}

// 查
const findMethods = async () => {
    const result = await User.find()
    console.log(result)
}