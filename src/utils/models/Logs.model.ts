import mongoose from "mongoose";

const logsSchema = new mongoose.Schema({
    
})

const Logs = mongoose.models.Logs || mongoose.model('Logs', logsSchema)

export default Logs