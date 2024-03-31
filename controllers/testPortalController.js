import {Test} from '../models/testPortalModel.js'
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";

export const createTest= catchAsyncErrors(async (req, res, next) => {
    const job = req.params.job;
    const {question,options} = req.body
    const test = new Test({
        question: question,
        options: options,
        job:job
    })
    await test.save()
    res.status(200).json({
        success: true,
        message: "Test created Successfully!",
        test
      });
})

export const getTest = catchAsyncErrors(async(req,res,next)=>{
    const job = req.params.job;
    const test = await Test.find({job:job})
    res.status(200).json({
        success: true,
        test
      });
})

export const submitTest = catchAsyncErrors(async(req,res,next)=>{
    const job = req.params.job;
    // const {testId,answers} = req.body
    
        const { answers } = req.body; 
        const questions = await Test.find(job); 
        let correctAnswersCount = 0;

        questions.forEach((question, index) => {
            if (question.options.find(option => option._id === answers[index])) {
                correctAnswersCount++;
            }
        });

        res.json({ correctAnswersCount });
     
})