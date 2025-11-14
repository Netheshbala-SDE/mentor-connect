# MentorConnect - Engineering Collaboration Platform

A modern web application that connects software engineers with engineering students for mutual benefit - free project assistance in exchange for mentoring.

## 🚀 Overview

MentorConnect is a platform that creates a symbiotic relationship between experienced software engineers and engineering students:

- **Engineers** get free project assistance from students while providing valuable mentoring
- **Students** gain real-world experience and mentorship while working on interesting projects
- **Both parties** benefit from knowledge sharing and skill development

For a friendly, scenario-based walkthrough of how MentorConnect works (signup, finding mentors, creating projects, and mentoring flows), see `PROJECT_STORY.md`.

## ✨ Features

### For Engineers
- Post projects and find students to help with development
- Provide mentoring in exchange for project assistance
- Browse student profiles and skills
- Track project progress and collaboration

### For Students
- Browse available projects and apply for opportunities
- Connect with experienced engineers for mentorship
- Build portfolio with real-world projects
- Learn from industry professionals

### Platform Features
- **Modern UI/UX** - Beautiful, responsive design with smooth animations
- **User Authentication** - Secure login and registration system
- **Profile Management** - Comprehensive user profiles with skills and experience
- **Project Discovery** - Advanced search and filtering for projects
- **Mentor Matching** - Find mentors based on skills and expertise
- **Real-time Updates** - Live notifications and activity tracking

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom components
- **Framer Motion** for animations
- **Heroicons** for icons
- **React Router DOM** for routing
- **React Context API** for state management
- **Create React App** as build tool

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** and **Helmet** for security

## 📦 Installation

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentor-connect-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration (see backend/README.md for details)

4. **Start MongoDB** (if using local instance)
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

## 🏗️ Project Structure

```
mentor-connect-app/
├── public/                # Static frontend assets (index.html)
├── src/                   # Frontend source code
│   ├── components/        # Reusable UI components (Navbar, ErrorBoundary, etc.)
│   ├── contexts/          # React contexts (AuthContext)
│   ├── hooks/             # Custom React hooks (useApi)
│   ├── pages/             # Page components (Home, Login, Register, Projects, Mentors, Profile)
│   ├── services/          # API client and service layer (api.ts)
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # App entry point
│   └── index.css          # Global styles
├── backend/               # Backend API (TypeScript + Express)
│   ├── src/
│   │   ├── config/        # Database and config (database.ts)
│   │   ├── middleware/    # Error handling, auth middleware
│   │   ├── models/        # Mongoose models (User, Project, Feature, Testimonial, etc.)
│   │   ├── routes/        # API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── mentors.ts
│   │   │   ├── students.ts
│   │   │   ├── projects.ts
│   │   │   ├── profiles.ts
│   │   │   └── dashboard.ts
│   │   └── index.ts       # Server entry point
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── FEATURES.md            # API features & routes documentation
├── PROJECT_STORY.md       # Narrative walkthrough of app flows
├── package.json           # Frontend dependencies / scripts
└── README.md              # Project documentation (this file)
```

## 🎨 Design System

The application uses a consistent design system with:

- **Color Palette**: Primary blues and secondary greens
- **Typography**: Inter font family
- **Components**: Reusable button, card, and input components
- **Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

### TypeScript
TypeScript is configured for type safety. Configuration is in `tsconfig.json`.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Push your code to GitHub
2. Connect your repository to Netlify or Vercel
3. Deploy automatically on push

## 🔮 Future Enhancements

- **Real-time Chat** - In-app messaging between users
- **Video Calls** - Integrated video mentoring sessions
- **Project Management** - Task tracking and progress monitoring
- **Payment Integration** - Optional paid mentoring sessions
- **Mobile App** - React Native mobile application
- **AI Matching** - Smart mentor-student matching algorithm
- **Learning Paths** - Structured learning programs
- **Certification** - Skill verification and certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Heroicons for the beautiful icon set
- Framer Motion for smooth animations
- Unsplash for placeholder images

## 📞 Support

For support, email support@mentorconnect.com or create an issue in the repository.

---

**Built with ❤️ for the engineering community**
