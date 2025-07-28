# YouApp - Modern Profile App 🚀

A beautiful, responsive mobile-first profile application built with Next.js 14, TypeScript, and Tailwind CSS. Features include user authentication, profile management, interest matching, and zodiac compatibility.


## ✨ Features

- 🔐 **User Authentication** - Secure login/register system
- 👤 **Profile Management** - Complete profile creation and editing
- 📸 **Image Upload** - Profile picture with preview and modal view
- 🎯 **Interest Matching** - Add/remove interests with beautiful UI
- ⭐ **Zodiac Compatibility** - Automatic horoscope and zodiac calculation
- 📱 **Mobile-First Design** - Responsive across all devices
- 🎨 **Beautiful Gradients** - Modern UI with custom color schemes
- 📏 **Flexible Measurements** - Support for cm/ft+inches and decimal weights
- 🔄 **Real-time Updates** - Instant profile updates and data persistence

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context API
- **API Integration**: RESTful API with proxy routes
- **Authentication**: JWT Token-based

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone (https://github.com/Abdullahbadres/testyou.git)
cd youapp
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Using npm
npm install

# Or using yarn
yarn install
\`\`\`

### 3. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`bash
# Create environment file
touch .env.local
\`\`\`

(IMPORTANT) Add the following environment variable:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://techtest.youapp.ai
\`\`\`

> **Important**: This API endpoint is required for authentication and profile management features.

### 4. Run Development Server

\`\`\`bash
# Using npm
npm run dev

# Or using yarn
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📦 Dependencies

### Core Dependencies

\`\`\`json
{
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-slot": "^1.0.2",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "lucide-react": "^0.263.1",
  "next": "14.0.0",
  "react": "^18",
  "react-dom": "^18",
  "tailwind-merge": "^2.0.0",
  "tailwindcss-animate": "^1.0.7"
}
\`\`\`

### Development Dependencies

\`\`\`json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "autoprefixer": "^10.0.1",
  "eslint": "^8",
  "eslint-config-next": "14.0.0",
  "postcss": "^8",
  "tailwindcss": "^3.3.0",
  "typescript": "^5"
}
\`\`\`

## 🏗️ Project Structure

\`\`\`
youapp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (proxy)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── profile/           # Profile pages
│   │   │   └── interest/      # Interest editing page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                  # Utility functions
│   │   └── utils.ts          # Common utilities
│   ├── types/                # TypeScript definitions
│   │   └── index.ts          # Type definitions
│   └── api/                  # API service layer
│       └── index.js          # API client
├── public/                   # Static assets
├── .env.local               # Environment variables
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
\`\`\`

## 🎨 UI Components

The app uses **shadcn/ui** components for consistent design:

- **Button** - Multiple variants (default, gradient, outline)
- **Input** - Custom styled form inputs
- **Badge** - Interest tags and labels
- **Label** - Form field labels

### Custom Styling

- **Gradient Backgrounds** - Beautiful auth page gradients
- **Glass Morphism** - Translucent card effects
- **Custom Scrollbars** - Styled scrollbars for better UX
- **Responsive Typography** - Scalable text across devices

## 📱 Responsive Design

The application is built with a **mobile-first** approach:

| Device | Viewport | Scale |
|--------|----------|-------|
| Mobile | 320px-767px | 0.219 |
| Tablet | 768px-1023px | 0.219 |
| Laptop | 1024px-1279px | 0.277 |
| Desktop | 1600px+ | 0.3181 |

## 🔧 Configuration Files

### Tailwind CSS (`tailwind.config.ts`)

\`\`\`typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      animation: {
        // Custom animations
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
\`\`\`

### TypeScript (`tsconfig.json`)

\`\`\`json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
\`\`\`

## 🔐 Authentication Flow

1. **Registration** - Create new account with email/username
2. **Login** - Authenticate with credentials
3. **Token Storage** - JWT token stored in localStorage
4. **Protected Routes** - Automatic redirection for auth states
5. **Profile Access** - Authenticated users can manage profiles

## 📊 API Integration

The app integrates with the YouApp API through proxy routes:

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `GET /api/getProfile` - Fetch user profile
- `POST /api/createProfile` - Create new profile
- `PUT /api/updateProfile` - Update existing profile

## 🌟 Key Features Explained

### Profile Management
- **Personal Info** - Name, birthday, gender, height, weight
- **Automatic Zodiac** - Calculates horoscope and zodiac signs
- **Image Upload** - Profile picture with preview modal
- **Flexible Measurements** - Supports cm/ft+inches with decimals

### Interest System
- **Separate Page** - Dedicated interest editing interface
- **Tag Management** - Add/remove interests with visual feedback
- **Persistent Storage** - Interests saved to user profile

### Responsive Design
- **Mobile-First** - Optimized for mobile devices
- **Adaptive Layout** - Adjusts to different screen sizes
- **Touch-Friendly** - Proper touch targets and gestures

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   \`\`\`
   NEXT_PUBLIC_API_BASE_URL=http://techtest.youapp.ai
   \`\`\`
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify**
- **Railway**
- **Heroku**
- **AWS Amplify**

## 🛠️ Deploy Page
https://testyouapp.vercel.app/

### Available Scripts

\`\`\`bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

### Code Quality

- **ESLint** - Code linting and formatting
- **TypeScript** - Type safety and better DX
- **Prettier** - Code formatting (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Vercel** - For hosting and deployment
- **shadcn/ui** - For beautiful UI components
- **Tailwind CSS** - For utility-first styling
- **Lucide** - For beautiful icons

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/Abdullahbadres) page
2. Create a new issue if needed
3. Contact the maintainers by email to abdullahbadres@gmail.com

---

**Made with ❤️ by [Abdul]**

⭐ **Star this repo if you find it helpful!**
