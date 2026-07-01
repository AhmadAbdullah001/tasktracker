const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const mongoURL=process.env.MONGO_URL;
const connectDB=async()=>{
    try{
        await mongoose.connect(mongoURL)
        console.log('MongoDB connected successfully');
    }
    catch(err){
        console.error('Error connecting to MongoDB:', err);
    }
}
module.exports=connectDB;