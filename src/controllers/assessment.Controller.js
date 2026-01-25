import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';
import 'dotenv/config'
import AssessmentModel from "../models/Assessment.Model.js";
import AssessmentModuleModel from "../models/AssessmentModule.Model.js";
import QnaModel from '../models/Qna.Model.js';
import AssessmentReportModel from "../models/AssessmentReport.Model.js";
import mongoose from 'mongoose';

export async function createAssessment(req, res) {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID is missing' });
        }

        const {
            assessment_id,
            assessmentName,
            assessmentDesc,
            maxMarks,
            startDate,
            endDate,
            timelimit,
            shuffleQuestions,
            negativeMarking,
            passingPercentage,
            isProtected,
            isVisible,
            ProctoringFor,
            Assessmentmodules,
        } = req.body;

        let populatedModules = [];

        // Check if Assessmentmodules is provided and not empty
        if (Assessmentmodules && Assessmentmodules.length > 0) {
            populatedModules = await Promise.all(
                Assessmentmodules.map(async (module) => {
                    const newModule = new AssessmentModuleModel({
                        module_id: module.module_id,
                        moduleName: module.moduleName,
                        timelimit: module.timelimit,
                        noOfQuestions: module.noOfQuestions,
                    });

                    await newModule.save();
                    return { module: newModule._id };
                })
            );
        }

        // Create the Assessment document
        const Assessment = new AssessmentModel({
            createdBy: userId,
            assessment_id,
            assessmentName,
            assessmentDesc,
            maxMarks,
            startDate,
            endDate,
            timelimit,
            shuffleQuestions,
            negativeMarking,
            passingPercentage,
            isProtected,
            isVisible,
            ProctoringFor,
            Assessmentmodules: populatedModules,
        });

        // Save the Assessment document to the database
        await Assessment.save();

        return res.status(201).json({ success: true, data: Assessment });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({ success: false, error: 'Internal server error' })
    }
}

// Ensure the uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Define upload directory using absolute path
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Define filename (timestamp + original extension)
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV or Excel files are allowed'), false);
    }
};

export function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

export const upload = multer({ storage: storage, fileFilter: fileFilter }).single('questions');

export async function addQuestionsToAssessment(req, res) {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: true, message: 'File upload error', error: err.message });
        } else if (err) {
            return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
        }

        const { moduleId, assessmentid } = req.body;

        if (!moduleId || !assessmentid) {
            return res.status(400).json({ success: false, message: 'Module ID and Assessment ID are required' });
        }

        try {
            const assessment = await AssessmentModel.findById(assessmentid);
            if (!assessment) {
                return res.status(404).json({ success: false, message: 'Assessment not found' });
            }

            const isModuleInAssessment = assessment.Assessmentmodules.some(
                (module) => module.module.toString() === moduleId
            );
            if (!isModuleInAssessment) {
                return res.status(404).json({ success: false, message: 'Module is not associated with the given Assessment' });
            }

            const AssessmentModule = await AssessmentModuleModel.findById(moduleId);
            if (!AssessmentModule) {
                return res.status(404).json({ success: false, message: 'Invalid module ID' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            let jsonArray = [];
            try {
                if (req.file.mimetype === 'application/vnd.ms-excel' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    const workbook = xlsx.readFile(req.file.path);
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    jsonArray = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
                } else if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/csv') {
                    jsonArray = await parseCSV(req.file.path);
                } else {
                    return res.status(400).json({ success: false, message: 'Unsupported file type' });
                }
            } catch (error) {
                return res.status(400).json({ success: false, message: 'Error parsing file', error: error.message });
            }

            if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid file content' });
            }

            const headers = Array.isArray(jsonArray[0]) ? jsonArray[0] : Object.keys(jsonArray[0]);
            const results = [];

            for (let i = 1; i < jsonArray.length; i++) {
                const row = jsonArray[i];

                // Check if the question contains "STOP"
                if (row[headers.indexOf('question')] === 'STOP') {
                    break; // Stop processing further questions
                }

                const questionData = {
                    question: row[headers.indexOf('question')],
                    opt_1: row[headers.indexOf('opt_1')],
                    opt_2: row[headers.indexOf('opt_2')],
                    opt_3: row[headers.indexOf('opt_3')],
                    opt_4: row[headers.indexOf('opt_4')],
                    answer: row[headers.indexOf('answer')],
                    maxMarks: row[headers.indexOf('maxMarks')],
                    negativeMarks: row[headers.indexOf('negativeMarks')],
                };

                if (!questionData.question || !questionData.opt_1 || !questionData.opt_2 || !questionData.opt_3 || !questionData.opt_4 || !questionData.maxMarks) {
                    return res.status(404).json({ success: false, message: 'Invalid question data missing fields.' });
                }

                try {
                    const newQuestion = new QnaModel({
                        question: questionData.question,
                        options: {
                            opt_1: questionData.opt_1,
                            opt_2: questionData.opt_2,
                            opt_3: questionData.opt_3,
                            opt_4: questionData.opt_4
                        },
                        answer: questionData.answer,
                        maxMarks: questionData.maxMarks,
                        negativeMarks: questionData.negativeMarks,
                    });

                    await newQuestion.save();
                    AssessmentModule.questions.push(newQuestion._id);

                    results.push({ success: true, message: 'Question added successfully', data: newQuestion });
                } catch (error) {
                    console.error('Error adding question:', error);
                    return res.status(500).json({ success: false, message: 'Error adding question', error: error.message, questionAt: i + 1 });
                }
            }

            AssessmentModule.noOfQuestions = AssessmentModule.questions.length;
            await AssessmentModule.save();
            return res.status(201).json({ success: true, results });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        } finally {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
        }
    });
}

export async function getAllAssessmentForAdmin(req, res) {
    try {
        const moduleAssessments = await AssessmentModel.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'Assessmentmodules.module',
                // populate: {
                //     path: 'questions',
                //     model: 'Qna'
                // }
            });

        const total = await AssessmentModel.countDocuments();
        const totalSubmission = await AssessmentReportModel.countDocuments();

        if (!moduleAssessments || moduleAssessments.length === 0) {
            return res.status(200).json({ success: true, message: 'No Assessments Found' });
        }
        return res.status(200).json({
            success: true,
            data: moduleAssessments,
            total,
            totalSubmission
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function getAssessmentById(req, res) {
    const { assessmentId } = req.params;

    if (!assessmentId) {
        return res.status(400).json({ success: false, message: 'Assessment ID is required' });
    }

    try {
        // Find the Assessment by ID
        const assessment = await AssessmentModel.findById(assessmentId)
            .populate({
                path: 'Assessmentmodules.module',
                populate: {
                    path: 'questions',
                    model: 'Qna',
                    select: '-answer'
                }
            });

        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        return res.status(200).json({ success: true, data: assessment });
    } catch (error) {
        console.error('Error fetching Assessment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function editAssessment(req, res) {
    const { assessmentid } = req.params;
    const updates = req.body;

    if (!assessmentid) {
        return res.status(400).json({ success: false, message: 'Assessment ID is required' });
    }

    try {
        // Find the existing Assessment
        const existingAssessment = await AssessmentModel.findById(assessmentid)
            .populate('Assessmentmodules.module');

        if (!existingAssessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        // Extract existing module IDs
        const existingModuleIds = existingAssessment.Assessmentmodules.map(mod => mod.module._id.toString());

        // Arrays to hold the valid, new, and invalid modules
        const validModules = [];
        const newModules = [];
        const invalidModules = [];

        // Loop through each updated module
        for (const mod of updates.Assessmentmodules) {
            if (mod.module && mod.module?._id) {
                const moduleId = mod.module._id.toString();
                if (existingModuleIds.includes(moduleId)) {
                    // Update the existing module data in the database
                    await AssessmentModuleModel.findByIdAndUpdate(
                        moduleId,
                        { ...mod.module },
                        { new: true, runValidators: true }
                    );
                    validModules.push(mod);
                } else {
                    invalidModules.push(mod);
                }
            } else {
                newModules.push(mod);
            }
        }

        if (invalidModules.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some modules are not valid for update',
                invalidModules
            });
        }

        // Handle the new modules: create them in the database first
        for (let newModule of newModules) {
            const createdModule = await AssessmentModuleModel.create(newModule.module);
            validModules.push({ module: createdModule._id });
        }

        // Proceed with the update by setting the updated Assessmentmodules
        updates.Assessmentmodules = validModules;

        const updatedAssessment = await AssessmentModel.findByIdAndUpdate(
            assessmentid,
            { ...updates },
            { new: true, runValidators: true }
        ).populate({
            path: 'Assessmentmodules.module',
        });

        return res.status(200).json({ success: true, data: updatedAssessment });
    } catch (error) {
        console.error('Error updating Assessment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function deleteModuleFromAssessment(req, res) {
    const { assessmentid, moduleid } = req.params;

    if (!assessmentid || !moduleid) {
        return res.status(400).json({ success: false, message: 'Assessment ID and Module ID are required' });
    }

    try {
        // Find the existing Assessment
        const existingAssessment = await AssessmentModel.findById(assessmentid);

        if (!existingAssessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        // Filter out the module to be deleted
        const updatedModules = existingAssessment.Assessmentmodules.filter(
            mod => mod.module._id.toString() !== moduleid
        );

        if (updatedModules.length === existingAssessment.Assessmentmodules.length) {
            return res.status(404).json({ success: false, message: 'Module not found in this assessment' });
        }

        // Update the Assessment with the remaining modules
        existingAssessment.Assessmentmodules = updatedModules;

        await existingAssessment.save();

        // Delete the module from the AssessmentModuleModel
        const deletedModule = await AssessmentModuleModel.findByIdAndDelete(moduleid);

        if (!deletedModule) {
            return res.status(404).json({ success: false, message: 'Module not found in AssessmentModule collection' });
        }

        return res.status(200).json({ success: true, message: 'Module deleted successfully', data: existingAssessment });
    } catch (error) {
        console.error('Error deleting module from Assessment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function deleteAssessment(req, res) {
    try {
        const { assessmentid } = req.params;

        console.log(assessmentid);

        if (!assessmentid) {
            return res.status(400).json({ success: false, message: 'Assessment ID is required' });
        }

        const assessment = await AssessmentModel.findByIdAndDelete(assessmentid);

        if (!assessment) {
            return res.status(404).send({ success: true, message: 'Assessment Not Found' });
        }

        return res.status(200).json({ success: true, message: 'Assessment Deleted Successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export const getVisibleAssessments = async (req, res) => {
    try {
        const { userId } = req.user;

        const assessments = await AssessmentModel.find({ isVisible: true })
            .select("-__v -updatedAt")
            .populate("Assessmentmodules.module", "moduleName noOfQuestions")
            .sort({ startDate: -1 });

        if (!assessments || assessments.length === 0) {
            return res.status(404).json({ success: false, message: "No visible assessments found" });
        }

        // ✅ Fetch report for each assessment for this user
        const results = await Promise.all(
            assessments.map(async (assessment) => {
                const report = await AssessmentReportModel.findOne({
                    user: userId,
                    assessment: assessment._id
                });

                return {
                    ...assessment.toObject(),
                    userReport: report || null
                };
            })
        );

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error("Error fetching visible assessments:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching visible assessments",
        });
    }
};

export const startAssessment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId } = req.user; // assuming you store logged-in user in req.user
        const { assessmentId } = req.body;

        if (!assessmentId) {
            return res.status(400).json({ success: false, message: "assessmentId is required" });
        }

        // ✅ get assessment
        const assessment = await AssessmentModel.findById(assessmentId).populate({
            path: "Assessmentmodules.module",
            model: "AssessmentModule",
            populate: { path: "questions", model: "Qna" }
        });

        if (!assessment || !assessment.isVisible) {
            return res.status(404).json({ success: false, message: "Assessment not found or not visible" });
        }

        // ✅ check if report already exists
        let existingReport = await AssessmentReportModel.findOne({
            user: userId,
            assessment: assessmentId
        });

        if (existingReport && (!existingReport.isAssessmentCompleted && !existingReport.isAssessmentSuspended)) {
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Assessment already started",
                report: existingReport
            });
        }

        // ✅ generate modules with question sets
        const generatedModules = assessment.Assessmentmodules.map(am => {
            let questions = am.module.questions;

            if (assessment.shuffleQuestions) {
                questions = [...questions].sort(() => 0.5 - Math.random()); // shuffle
            }

            return {
                module: {
                    moduleInfo: am.module._id,
                    generatedQustionSet: questions.map(q => ({
                        question: q._id,
                        isSubmitted: false,
                        isVisited: false,
                        markForReview: false,
                        submittedAnswer: null
                    }))
                }
            };
        });

        // ✅ create new report
        const [report] = await AssessmentReportModel.create(
            [
                {
                    user: userId,
                    assessment: assessmentId,
                    generatedModules,
                    remarks: "Assessment started",
                    isAssessmentCompleted: false
                }
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Assessment started successfully",
            report
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error starting assessment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export async function getAssesmentQuestion(req, res) {
    try {
        const { userId } = req.user;
        const { assessmentId } = req.params;

        let { index } = req.query;

        if (!index) {
            return res.status(400).json({ success: false, message: "Index is required" });
        }

        index = parseInt(index) - 1; // 1-based to 0-based

        // ✅ Find User Assessment Report
        const userAssessmentReport = await AssessmentReportModel.findOne({
            user: userId,
            assessment: assessmentId
        });

        const assessment = await AssessmentModel.findById(assessmentId).populate({
            path: "Assessmentmodules.module",
            model: "AssessmentModule",
            select: "-questions"
        })

        if (!userAssessmentReport) {
            return res.status(404).json({ success: false, message: "User Assessment not found" });
        }

        if (userAssessmentReport.isAssessmentCompleted) {
            return res.status(403).json({
                success: false,
                message: "Assessment is already completed, cannot fetch questions"
            });
        }

        // ✅ Calculate total questions
        const totalQuestions = userAssessmentReport.generatedModules.reduce((total, module) => {
            return total + module.module.generatedQustionSet.length;
        }, 0);

        if (index < 0 || index >= totalQuestions) {
            return res.status(400).json({ success: false, message: "Invalid question index" });
        }

        // ✅ Locate module by cumulative index
        let cumulativeIndex = 0;
        let moduleReport = null;
        let moduleIndex = 0;

        for (let i = 0; i < userAssessmentReport.generatedModules.length; i++) {
            const module = userAssessmentReport.generatedModules[i];
            const questionSetLength = module.module.generatedQustionSet.length;

            if (index < cumulativeIndex + questionSetLength) {
                moduleReport = module;
                moduleIndex = index - cumulativeIndex;
                break;
            }

            cumulativeIndex += questionSetLength;
        }

        if (!moduleReport) {
            return res.status(404).json({ success: false, message: "Question not found in modules" });
        }

        // ✅ Get question entry
        const questionEntry = moduleReport.module.generatedQustionSet[moduleIndex];
        if (!questionEntry) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // ✅ Fetch question details (hide answer)
        const question = await QnaModel.findById(questionEntry.question, "question options maxMarks");

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found in DB" });
        }

        // ✅ Mark question as visited
        questionEntry.isVisited = true;
        userAssessmentReport.markModified("generatedModules");
        await userAssessmentReport.save();

        return res.status(200).json({
            success: true,
            message: "Question retrieved successfully",
            assessment,
            question: {
                _id: question._id,
                question: question.question,
                options: question.options,
                maxMarks: question.maxMarks
            },
            totalQuestions,
            index: index + 1, // return as 1-based for frontend
            isSubmitted: questionEntry.isSubmitted,
            isVisited: questionEntry.isVisited,
            submittedAnswer: questionEntry.submittedAnswer || null,
            markForReview: questionEntry.markForReview || false
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function getAssesmentAllQuestions(req, res) {
    try {
        const { userId } = req.user;
        const { assessmentId } = req.params;

        if (!assessmentId) {
            return res.status(400).json({ success: false, message: "Assessment ID is required" });
        }

        // Find the UserAssessmentReport for this user and module assessment
        const userAssessmentReport = await AssessmentReportModel.findOne({
            user: userId,
            assessment: assessmentId
        });

        const Assessment = await AssessmentModel.findById(assessmentId).populate({
            path: "Assessmentmodules.module",
            model: "AssessmentModule",
            select: "-questions"
        })

        if (!Assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        if (!userAssessmentReport) {
            return res.status(404).json({ success: false, message: 'User Assessment not found' });
        }

        if (userAssessmentReport.isAssessmentCompleted) {
            return res.status(404).json({ success: false, message: 'Questions can\'t be provided as the assessment is already completed' });
        }

        // Iterate over all modules and collect all questions
        const allQuestions = [];
        for (const module of userAssessmentReport.generatedModules) {
            for (const questionEntry of module.module.generatedQustionSet) {
                const question = await QnaModel.findById(questionEntry.question._id, 'question options maxMarks');

                if (question) {
                    allQuestions.push({
                        _id: question._id,
                        question: question.question,
                        options: question.options,
                        maxMarks: question.maxMarks,
                        isSubmitted: questionEntry.isSubmitted,
                        isVisited: questionEntry.isVisited,
                        markForReview: questionEntry.markForReview,
                        submittedAnswer: questionEntry.submittedAnswer
                    });
                }
            }
        }

        if (allQuestions.length === 0) {
            return res.status(404).json({ success: false, message: 'No questions found in the user assessment' });
        }

        // Calculate the total number of questions
        const totalQuestions = allQuestions.length;

        // Return all questions
        return res.status(200).json({
            success: true,
            message: 'All questions retrieved successfully',
            Assessment,
            lastIndex: userAssessmentReport.lastIndex,
            questions: allQuestions,
            totalQuestions
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function submitAnswerForAssessment(req, res) {
    try {
        const { userId } = req.user;
        const { assessmentId } = req.params;
        let { index, answer } = req.body;

        if (!index || !answer) {
            return res.status(400).json({ success: false, message: "Index and Answer is required" });
        }
        index--;

        if (!assessmentId) {
            return res.status(400).json({ success: false, message: "Assessment ID is required" });
        }

        // Find the UserAssessmentReport for this user and module assessment
        const userAssessmentReport = await AssessmentReportModel.findOne({
            user: userId,
            assessment: assessmentId
        });


        if (!userAssessmentReport) {
            return res.status(404).json({ success: false, message: 'Assessment report not found' });
        }

        if (userAssessmentReport.isAssessmentCompleted) {
            return res.status(404).json({ success: false, message: 'Answer can\'t be submitted as the assessment is already completed' });
        }

        // Iterate through each module to find the question by index
        let questionReport;
        let questionModule;
        let totalQuestions = 0;

        for (const module of userAssessmentReport.generatedModules) {
            const questionSet = module.module.generatedQustionSet;

            if (totalQuestions + questionSet.length > index) {
                questionReport = questionSet[index - totalQuestions];
                questionModule = module;
                break;
            }

            totalQuestions += questionSet.length;
        }

        if (!questionReport) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Update the submitted answer
        questionReport.submittedAnswer = answer;
        questionReport.isSubmitted = true;

        // Save the updated report
        await userAssessmentReport.save();

        return res.status(200).json({ success: true, message: 'Answer submitted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function finishAssessment(req, res) {
    try {
        const { userId } = req.user;
        const { assessmentId } = req.params;
        const { isSuspended, ProctoringScore, remarks, submissionTime, answers, lastIndex } = req.body;

        if (!assessmentId) {
            return res.status(400).send({ success: false, message: 'Invalid assessmentId provided.' });
        }

        const assessment = await AssessmentModel.findById(assessmentId);
        if (!assessment) {
            return res.status(404).send({ success: false, message: 'Assessment not found.' });
        }

        const userReport = await AssessmentReportModel.findOne({
            user: userId,
            assessment: assessmentId
        }).populate("generatedModules.module.moduleInfo generatedModules.module.generatedQustionSet.question");

        if (!userReport) {
            return res.status(404).send({ success: false, message: 'User Assessment not found.' });
        }

        if (userReport.isAssessmentCompleted) {
            return res.status(400).send({ success: false, message: 'Assessment has already been submitted.' });
        }

        const userScreenshots = req.files ? req.files.map(file => file.location) : [];

        let parsedProctoringScore = ProctoringScore;
        // if (typeof ProctoringScore === "string") {
        //     try {
        //         parsedProctoringScore = JSON.parse(ProctoringScore);
        //     } catch {
        //         return res.status(400).json({ success: false, message: "Invalid ProctoringScore format" });
        //     }
        // }

        if (typeof parsedProctoringScore !== "object") {
            return res.status(400).json({ success: false, message: "ProctoringScore should be an object" });
        }

        const parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;
        if (!Array.isArray(parsedAnswers)) {
            return res.status(400).json({ success: false, message: "Invalid answers format" });
        }

        // ✅ Save submitted answers
        for (const submitted of parsedAnswers) {
            const { index, answer } = submitted;
            const currentIndex = index - 1;
            let questionReport;
            let totalQuestions = 0;

            for (const module of userReport.generatedModules) {
                const questionSet = module.module.generatedQustionSet;

                if (totalQuestions + questionSet.length > currentIndex) {
                    questionReport = questionSet[currentIndex - totalQuestions];
                    break;
                }

                totalQuestions += questionSet.length;
            }

            if (questionReport) {
                // overwrite with the latest submitted answer
                questionReport.submittedAnswer = answer;
                questionReport.isSubmitted = true;
            }
        }

        // ✅ Calculate total score
        let totalScore = 0;
        for (const module of userReport.generatedModules) {
            for (const q of module.module.generatedQustionSet) {
                const originalQ = q.question;
                const ans = q.submittedAnswer;

                if (originalQ && ans) {
                    if (ans === originalQ.answer) {
                        totalScore += originalQ.maxMarks || 1;
                    } else if (assessment.negativeMarking) {
                        totalScore -= originalQ.negativeMarks || 0;
                    }
                }
            }
        }

        // ✅ Update AssessmentReport directly
        userReport.isAssessmentSuspended = isSuspended || false;
        userReport.assessmentSubmissionTime = submissionTime;
        userReport.assessmentScreenshots = userScreenshots;
        userReport.proctoringViolations = parsedProctoringScore;
        userReport.remarks = remarks || "Assessment completed";
        userReport.lastIndex = lastIndex || 1;
        userReport.isAssessmentCompleted = true;
        userReport.score = totalScore; // 🔥 save score in report

        await userReport.save();

        return res.status(200).send({
            success: true,
            message: "Assessment submitted successfully.",
            score: totalScore
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export async function getAllUsersResultForAssessment(req, res) {
    try {
        const { assessmentId } = req.params;

        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID is required"
            });
        }

        // ✅ Fetch all reports for this assessment
        const userReports = await AssessmentReportModel.find({ assessment: assessmentId })
            .populate("user", "username email"); // only basic user info

        if (!userReports.length) {
            return res.status(404).json({
                success: false,
                message: "No users found for this assessment"
            });
        }

        // ✅ Format response
        const results = userReports.map(report => ({
            userId: report.user?._id,
            name: report.user?.username,
            email: report.user?.email,
            score: report.score,
            remarks: report.remarks,
            isAssessmentCompleted: report.isAssessmentCompleted,
            isAssessmentSuspended: report.isAssessmentSuspended,
            assessmentSubmissionTime: report.assessmentSubmissionTime,
            proctoringViolations: report.proctoringViolations,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
        }));

        return res.status(200).json({
            success: true,
            total: results.length,
            results
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}


export async function getUserResultForAssessment(req, res) {
    try {
        const { assessmentId, userId } = req.params;

        if (!assessmentId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID and User ID are required"
            });
        }

        // ✅ Fetch the user's report with full details
        const userReport = await AssessmentReportModel.findOne({
            user: userId,
            assessment: assessmentId
        })
            .populate("user", "username email")
            .populate("generatedModules.module.generatedQustionSet.question");

        if (!userReport) {
            return res.status(404).json({
                success: false,
                message: "Assessment report not found"
            });
        }

        // Prepare question breakdown (no recalculation of marks here)
        const questions = [];
        for (const mod of userReport.generatedModules) {
            for (const q of mod.module.generatedQustionSet) {
                if (!q.question) continue;

                questions.push({
                    questionId: q.question._id,
                    question: q.question.question,
                    options: q.question.options,
                    submittedAnswer: q.submittedAnswer,
                    correctAnswer: q.question.answer,
                    isCorrect: q.submittedAnswer === q.question.answer,
                    maxMarks: q.question.maxMarks,
                    negativeMarks: q.question.negativeMarks,
                    isSubmitted: q.isSubmitted,
                    isVisited: q.isVisited,
                    markForReview: q.markForReview
                });
            }
        }

        return res.status(200).json({
            success: true,
            userId: userReport.user?._id,
            name: userReport.user?.username,
            email: userReport.user?.email,
            assessmentId,
            score: userReport.score, // ✅ stored score in report
            remarks: userReport.remarks,
            isAssessmentCompleted: userReport.isAssessmentCompleted,
            isAssessmentSuspended: userReport.isAssessmentSuspended,
            assessmentSubmissionTime: userReport.assessmentSubmissionTime,
            proctoringViolations: userReport.proctoringViolations,
            createdAt: userReport.createdAt,
            updatedAt: userReport.updatedAt,
            questions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
