import express, { Request, Response } from 'express';
import { User } from '../models/User';

const router = express.Router();

// @desc    Get all students
// @route   GET /api/students
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { skills, location, page = 1, limit = 10 } = req.query;
    
    const query: any = {
      role: 'student'
    };
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const students = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Transform _id to id
    const transformedStudents = students.map(student => {
      const studentObj = student.toObject();
      const { _id, __v, ...rest } = studentObj;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedStudents,
        count: transformedStudents.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student'
    }).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Transform _id to id
    const studentObj = student.toObject();
    const { _id, __v, ...rest } = studentObj;
    const transformedStudent = {
      id: _id.toString(),
      ...rest
    };

    return res.json({
      success: true,
      data: {
        data: transformedStudent
      }
    });
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search students by skills
// @route   GET /api/students/search/skills
// @access  Public
router.get('/search/skills', async (req: Request, res: Response) => {
  try {
    const { skills, page = 1, limit = 10 } = req.query;
    
    if (!skills) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skills to search'
      });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills];
    
    const query = {
      role: 'student',
      skills: { $in: skillsArray }
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const students = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Transform _id to id
    const transformedStudents = students.map(student => {
      const studentObj = student.toObject();
      const { _id, __v, ...rest } = studentObj;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedStudents,
        count: transformedStudents.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Search students by skills error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

