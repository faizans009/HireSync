import {Test} from '../models/testPortalModel.js'
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Application } from '../models/applicationSchema.js';

// export const createTest= catchAsyncErrors(async (req, res, next) => {
//     const job = req.params.job;
//     const {question,options} = req.body
//     console.table(req.body)
//     const test = new Test({
//         question: question,
//         options: options,
//         job:job
//     })
//     await test.save()

//     res.status(200).json({
//         success: true,
//         message: "Test created Successfully!",
//         test
//       });
// })

export const createTest = catchAsyncErrors(async (req, res, next) => {
    const job = req.params.job;
    const { questions } = req.body;
    console.table(req.body);

    const tests = [];

    for (const q of questions) {
        const { question, options } = q;
        const test = new Test({
            question: question,
            options: options,
            job: job
        });
        await test.save();
        tests.push(test);
    }

    res.status(200).json({
        success: true,
        message: "Tests created Successfully!",
        tests
    });
});

export const getTest = catchAsyncErrors(async(req,res,next)=>{
    const job = req.params.job;
    const test = await Test.find({job:job})
    res.status(200).json({
        success: true,
        test
      });
})

export const submitTest = catchAsyncErrors(async (req, res, next) => {
    const job = req.params.job;
    const application=req.params.application
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty answers array' });
    }

    const questions = await Test.find({ job });
    const applications= await Application.findById(application)

    let correctCount = 0;
    let incorrectCount = 0;
    let results = [];

    answers.forEach((userAnswer) => {
        const question = questions.find((q) => q._id.toString() === userAnswer.id);

        if (!question) {
            incorrectCount++;
            results.push({ id: userAnswer.id, status: 'incorrect' });
        } else {
            const correctOption = question.options.find((opt) => opt.isAnswer);
            if (!correctOption || !userAnswer.answer) {
                incorrectCount++;
                results.push({ id: userAnswer.id, status: 'incorrect' });
            } else {
                const userAnswerLower = userAnswer.answer.toLowerCase();
                const correctAnswerLower = correctOption.value.toLowerCase();

                if (userAnswerLower === correctAnswerLower) {
                    correctCount++;
                    results.push({ id: userAnswer.id, status: 'correct' });
                } else {
                    incorrectCount++;
                    results.push({ id: userAnswer.id, status: 'incorrect' });
                }
            }
        }
    });

    const totalMarks = questions.length;
    const obtainedMarks = correctCount; 

    applications.totalMarks=totalMarks
    applications.obtainedMarks=obtainedMarks
    await applications.save();


    res.status(200).json({ totalMarks, obtainedMarks, results });
});


// export const submitTest = catchAsyncErrors(async (req, res, next) => {
//     const job = req.params.job;
//     const { answers } = req.body;

//     if (!Array.isArray(answers) || answers.length === 0) {
//         return res.status(400).json({ success: false, message: 'Invalid or empty answers array' });
//     }

//     const questions = await Test.find({ job });
//     console.log(questions)

//     let correctCount = 0;
//     let incorrectCount = 0;
//     let results = [];

//     answers.forEach((userAnswer) => {
//         const question = questions.find((q) => q._id.toString() === userAnswer.id);

//         if (!question) {
//             incorrectCount++;
//             results.push({ id: userAnswer.id, status: 'incorrect' });
//         } else {
//             const correctOption = question.options.find((opt) => opt.isAnswer);
//             if (!correctOption || !userAnswer.answer) {
//                 incorrectCount++;
//                 results.push({ id: userAnswer.id, status: 'incorrect' });
//             } else {
//                 const userAnswerLower = userAnswer.answer.toLowerCase();
//                 const correctAnswerLower = correctOption.value.toLowerCase();

//                 if (userAnswerLower === correctAnswerLower) {
//                     correctCount++;
//                     results.push({ id: userAnswer.id, status: 'correct' });
//                 } else {
//                     incorrectCount++;
//                     results.push({ id: userAnswer.id, status: 'incorrect' });
//                 }
//             }
//         }
//     });

//     res.status(200).json({ correctCount, incorrectCount, results });
// });
// JSON
/*{
  "answers": [
    {
      "id": "660983181ac0e9465a77f5ce",
      "answer": "10000"
    },
    {
      "id":"660984cf1ac0e9465a77f5d4",
      "answer":"O(n^2)"
    }
  ]
}
 */