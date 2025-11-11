import mongoose from "mongoose";

const SettingsShema = new mongoose.Schema({
    enableAi: {
        type: Boolean,
        default: true
    }
})

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsShema);

export default Settings