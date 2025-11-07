import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', ()=>console.log('Database connect'))
        await mongoose.connect(`${process.env.MONGODB_URL}/sociofy`)
    } catch (error){
      console.log(error.message)
    }
}

export default connectDB