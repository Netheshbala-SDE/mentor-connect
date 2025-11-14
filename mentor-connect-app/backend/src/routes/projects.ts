import express,{Request,Response} from 'express';
import { body, validationResult } from 'express-validator';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// Helper function to transform project with populated fields
function transformProject(project: any) {
  const projObj = project.toObject ? project.toObject() : project;
  const { _id, __v, owner, student, applications, ...rest } = projObj;
  
  const transformedOwner = owner ? {
    id: owner._id?.toString() || owner.toString(),
    name: owner.name || '',
    avatar: owner.avatar || '',
    role: owner.role || ''
  } : null;
  
  const transformedStudent = student ? {
    id: student._id?.toString() || student.toString(),
    name: student.name || '',
    avatar: student.avatar || '',
    role: student.role || ''
  } : null;
  
  // Transform applications with populated student data
  const transformedApplications = applications ? applications.map((app: any) => ({
    id: app._id?.toString() || app._id,
    student: app.student && typeof app.student === 'object' ? {
      id: app.student._id?.toString() || app.student._id,
      name: app.student.name || '',
      avatar: app.student.avatar || '',
      email: app.student.email || '',
      skills: app.student.skills || [],
      experience: app.student.experience || ''
    } : app.student,
    message: app.message || '',
    status: app.status || 'pending',
    appliedAt: app.appliedAt || app.createdAt
  })) : [];
  
  return {
    id: _id?.toString() || _id,
    ...rest,
    owner: transformedOwner,
    student: transformedStudent,
    applications: transformedApplications
  };
}

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', async (req:Request, res:Response) => {
  try {
    const { status, difficulty, skills, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query)
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .populate('applications.student', 'name avatar email skills experience')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    // Transform projects with populated fields
    const transformedProjects = projects.map(transformProject);

    return res.json({
      success: true,
      data: {
        data: transformedProjects,
        count: transformedProjects.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', async (req:Request, res:Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar bio location role')
      .populate('student', 'name avatar bio location role')
      .populate('applications.student', 'name avatar email skills experience bio location');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const transformedProject = transformProject(project);

    return res.json({
      success: true,
      data: {
        data: transformedProject
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('Please provide at least one skill'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Please specify project duration'),
  body('budget')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/)
    .withMessage('Please add a valid GitHub repository URL'),
  body('liveUrl')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage('Please add a valid live URL')
], async (req:Request, res:Response) => {
  try {
    // Clean up request body - remove empty strings for optional fields
    if (req.body.githubUrl === '') delete req.body.githubUrl;
    if (req.body.liveUrl === '') delete req.body.liveUrl;
    if (req.body.budget === '' || req.body.budget === null || req.body.budget === undefined) {
      delete req.body.budget;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.create({
      ...req.body,
      owner: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .populate('applications.student', 'name avatar email skills experience');

    const transformedProject = transformProject(populatedProject);

    return res.status(201).json({
      success: true,
      data: {
        data: transformedProject
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Please provide at least one skill'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('githubUrl')
    .optional()
    .matches(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/)
    .withMessage('Please add a valid GitHub repository URL'),
  body('liveUrl')
    .optional()
    .matches(/^https?:\/\/.+/)
    .withMessage('Please add a valid live URL')
], async (req:Request, res:Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .populate('applications.student', 'name avatar email skills experience');

    const transformedProject = transformProject(updatedProject);

    return res.json({
      success: true,
      data: {
        data: transformedProject
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Apply to project (Student)
// @route   POST /api/projects/:id/apply
// @access  Private
router.post('/:id/apply', protect, [
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters')
], async (req:Request, res:Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can apply to projects'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is open
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Project is not open for applications'
      });
    }

    // Check if student already applied
    const existingApplication = project.applications.find(
      (app: any) => app.student.toString() === req.user._id.toString()
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this project'
      });
    }

    // Add application
    project.applications.push({
      student: req.user._id,
      message: req.body.message || '',
      status: 'pending',
      appliedAt: new Date()
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .populate('applications.student', 'name avatar email skills experience');

    const transformedProject = transformProject(populatedProject);

    return res.status(201).json({
      success: true,
      data: {
        data: transformedProject
      },
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply to project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get project applications (Project Owner)
// @route   GET /api/projects/:id/applications
// @access  Private
router.get('/:id/applications', protect, async (req:Request, res:Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('applications.student', 'name avatar email skills experience bio location');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this project'
      });
    }

    const transformedProject = transformProject(project);

    return res.json({
      success: true,
      data: {
        data: transformedProject.applications || []
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Accept/Reject application (Project Owner)
// @route   PUT /api/projects/:id/applications/:applicationId
// @access  Private
router.put('/:id/applications/:applicationId', protect, [
  body('action')
    .isIn(['accept', 'reject'])
    .withMessage('Action must be either accept or reject')
], async (req:Request, res:Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { action } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage applications for this project'
      });
    }

    // Find the application
    const application = project.applications.find(
      (app: any) => app._id.toString() === req.params.applicationId
    );
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (action === 'accept') {
      // Check if project already has a student assigned
      if (project.student) {
        return res.status(400).json({
          success: false,
          message: 'Project already has a student assigned'
        });
      }

      // Accept application and assign student
      application.status = 'accepted';
      project.student = application.student;
      project.status = 'in-progress';

      // Reject all other pending applications
      project.applications.forEach((app: any) => {
        if (app._id.toString() !== req.params.applicationId && app.status === 'pending') {
          app.status = 'rejected';
        }
      });
    } else {
      // Reject application
      application.status = 'rejected';
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .populate('applications.student', 'name avatar email skills experience');

    const transformedProject = transformProject(populatedProject);

    return res.json({
      success: true,
      data: {
        data: transformedProject
      },
      message: `Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Assign student to project (Legacy support - now uses accept application)
// @route   PUT /api/projects/:id/assign-student
// @access  Private
router.put('/:id/assign-student', protect, [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
], async (req:Request, res:Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { studentId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign student to this project'
      });
    }

    // Check if student exists
    const student = await User.findOne({
      _id: studentId,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update project with student and status
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        student: studentId,
        status: 'in-progress'
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .populate('applications.student', 'name avatar email skills experience');

    const transformedProject = transformProject(updatedProject);

    return res.json({
      success: true,
      data: {
        data: transformedProject
      }
    });
  } catch (error) {
    console.error('Assign student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', protect, async (req:Request, res:Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      data: {
        message: 'Project deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
