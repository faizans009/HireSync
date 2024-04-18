import mongoose from "mongoose"
const testSchema= new mongoose.Schema({
    question:{
        type:String
    },
    options:
        [
            {  
                value:{
                   type: String
                },
                isAnswer:{
                    type:Boolean,
                    default:false
                }
            }
        ],
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job"
    }
})
export const Test = mongoose.model("Test", testSchema);