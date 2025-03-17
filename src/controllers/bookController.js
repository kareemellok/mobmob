import Book from "../models/bookModel.js";
import cloudinary from "../lib/cloudinary.js";

export const createBook = async (req, res) => {
    try {

        const { title, caption, image, rating } = req.body;
        if (!title || !caption || !image || !rating) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
        }
        const uploadResponse = await cloudinary.uploader.upload(image, { resource_type: "image" });
        const imageUrl = uploadResponse.secure_url;
        const book = new Book({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id,
        });
        await book.save();
        res.status(201).json({
            success: true,
            book,
        });
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({    
            success: false,
            message: error.message,
        });
    }
}

export const getBooks = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;
        
        const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user",  "username profileImage");
        const totalBooks = await Book.countDocuments();
        res.status(200).json({
            success: true,
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.log("Error getting books", error);
        res.status(500).json({    
            success: false,
            message: error.message,
        });
    }
}

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        // delete the image from cloudinary as well
        if (book.image && book.image.includes("cloudinary")) {
            try {
                
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);

        await book.deleteOne();
        res.status(200).json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({    
            success: false,
            message: error.message,
        });
    }
}

export const userBooks = async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, books });
    } catch (error) {
        console.log("Error getting user books", error);
        res.status(500).json({    
            success: false,
            message: error.message,
        });
    }
}