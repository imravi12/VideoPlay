import mongoose, {Schema, trusted} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema( 
    {
        videoFile: {
            type: String,  //cloudinary url
            require: true,
        },
        thumbnail: {
            type: String, //cloudinary url
            require: true,
        },
        title: {
            type: String, // cloudinary url
            requiree: true,
        },
        description: {
            type: String, //cloudinary url
            require: true, 
        },
        duration: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },    
    {
        timestamps: true
    }
)



videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)