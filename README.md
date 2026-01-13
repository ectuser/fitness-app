# 💪 Fitness Tracker

A modern, mobile-first fitness workout tracking application built with React and TypeScript. Track your workouts, manage exercises, and monitor your progress - all stored locally in your browser.

## ✨ Features

### 🏋️ Workout Management
- **Create & Edit Workouts** - Build custom workout routines with multiple exercises
- **Active Workout Sessions** - Real-time tracking during your workout with progress indicators
- **Complete & Archive** - Mark workouts as complete and view your history
- **Duplicate Workouts** - Quickly copy existing workouts for recurring routines

### 💪 Exercise Library
- **15 Pre-configured Exercises** - Popular exercises ready to use
- **Custom Exercises** - Create your own exercises with custom muscle groups
- **Inline Creation** - Add new exercises on-the-fly without losing your workout progress
- **Exercise Statistics** - Track max weight, total sets, and performance history

### 📊 Progress Tracking
- **Real-time Session Tracking** - See completion percentage and sets completed
- **Exercise History** - View all past workouts for each exercise
- **Performance Stats** - Monitor max weight lifted and total volume
- **Smart Dashboard** - Quick stats and upcoming workouts at a glance

### 📱 Mobile-First Design
- **Responsive UI** - Optimized for gym use on mobile devices
- **Bottom Navigation** - Easy thumb-friendly navigation
- **Touch-optimized Inputs** - Large tap targets and numeric keyboards
- **Offline Support** - All data stored locally with localStorage

## 🛠️ Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite 6** - Lightning-fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling with latest CSS features
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router v7** - Client-side routing
- **Lucide React** - Modern icon library
- **localStorage API** - Client-side data persistence

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ivanmenshchikov/fitness-app.git
cd fitness-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

## 📝 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components (nav, header)
│   ├── workout/        # Workout-related components
│   └── exercise/       # Exercise-related components
├── pages/              # Page components (routes)
├── context/            # React Context (DataContext)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
│   ├── storage.ts      # localStorage utilities
│   ├── seed-data.ts    # Pre-configured exercises
│   └── utils.ts        # General utilities
└── types/              # TypeScript type definitions
```

## 🎯 Key Features Explained

### Active Workout Sessions
The app includes a dedicated workout session mode where you can:
- Track progress in real-time with a progress bar
- Add/remove exercises on the fly
- Modify sets during your workout
- Auto-save changes as you go
- Mark workout as complete when finished

### Exercise Statistics
Statistics are calculated only from **completed workouts**, ensuring accurate tracking:
- Maximum weight lifted with reps
- Total number of sets performed
- Complete workout history
- Last performed date

### Inline Exercise Creation
Create new exercises without interrupting your workflow:
- Click "Add Exercise" during workout creation
- Select "Create New" from the exercise picker
- Define name, muscle groups, and notes
- Exercise is immediately added to your workout

## 🌐 Deployment

The app is configured for GitHub Pages deployment with GitHub Actions.

### Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Under "Source", select **GitHub Actions**
4. The app will automatically deploy on every push to `main`

Your app will be live at: `https://yourusername.github.io/fitness-app/`

### Manual Build

```bash
npm run build
# Output will be in the `dist/` directory
```

## 💾 Data Persistence

All data is stored locally in your browser using localStorage:
- **Exercises** - Custom and pre-configured exercises
- **Workouts** - All workout data including sets and completion status
- **Settings** - User preferences (default weight unit)

**Note:** Data is stored per-browser. Clearing browser data will delete all workouts.

## 🎨 Design Philosophy

This app follows a mobile-first design approach:
- Clean, minimal interface optimized for quick access
- Large touch targets for gym use
- Bottom navigation for easy thumb reach
- Numeric keyboards for weight/reps entry
- No unnecessary features - focused on core functionality

## 📱 Browser Support

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔮 Future Enhancements

Potential features for future versions:
- Progressive Web App (PWA) support for offline use
- Rest timer between sets
- Exercise photos/videos
- Progress charts and visualizations
- Export/import workout data
- Workout templates
- Dark mode

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎉 About This Project

This app was **100% vibe coded** - built entirely through natural conversation and iterative development without traditional planning documents or specifications. The entire codebase, from initial setup to deployment configuration, was created through an intuitive, exploratory development process.

The result is a fully-functional, production-ready fitness tracking app with:
- ✅ Complete CRUD operations
- ✅ Real-time workout sessions
- ✅ Data persistence
- ✅ Mobile-responsive design
- ✅ Type-safe codebase
- ✅ Production build & deployment

**Tech Stack Highlights:**
- Latest React 19 with TypeScript
- Tailwind CSS v4 (latest major version)
- Vite 6 for optimal performance
- Modern shadcn/ui components
- GitHub Actions CI/CD

---

**Built with ❤️ for fitness enthusiasts**
