import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
    },
    password: {
        type: String, 
        required: [true, "Please provide a password"],
    },
});

/* Checks if a model named "users" already exists in mongoose.models.
If it does, it uses the existing model.
If not, it creates a new model called "users" using the userSchema. */

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;