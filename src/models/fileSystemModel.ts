import mongoose from "mongoose";

const fileSystemSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    current: {
        fileSystem: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
    },
    versions: [
        {
            fileSystem: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            message: {
                type: String,
                default: ""
            },
        }
    ]
});


// Use mongoose.models to prevent model overwrite errors in dev
const FileSystemVersionModel = mongoose.models.fileStructures || mongoose.model("fileStructures", fileSystemSchema);

export default FileSystemVersionModel;
