import mongoose from 'mongoose';

const Connection = async () => {
    // Use the connection string from environment variables
    const URL = process.env.DATABASE_URL || process.env.DB;
    
    if (!URL) {
        console.error('DATABASE_URL environment variable is not set');
        return;
    }
    
    try {
        await mongoose.connect(URL, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error while connecting to the database:', error);
    }
};

export default Connection;