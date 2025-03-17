import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,            
        required: true,
        unique: true
    },    
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage: {
        type: String,
        default: ""
    },
}, {
    timestamps: true
});

userSchema.pre("save", async (next) => {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// userSchema.methods.matchPassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// }

userSchema.methods.comparePassword = async (userPassword) => {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;
