# 🚀 URL Shortener

A modern, full-stack URL shortener application built with React, Express, and SQLite.

![URL Shortener](https://img.shields.io/badge/React-18.2.0-blue)
![URL Shortener](https://img.shields.io/badge/Express-4.18.2-green)
![URL Shortener](https://img.shields.io/badge/SQLite-3.0-lightgrey)
![URL Shortener](https://img.shields.io/badge/Material--UI-5.11.10-purple)

## ✨ Features

- 🔗 **URL Shortening**: Convert long URLs to short, memorable links
- 🎯 **Custom Codes**: Option to create custom short codes
- 📊 **Statistics Dashboard**: Track clicks and view all shortened URLs
- 📋 **Copy to Clipboard**: One-click copying of shortened URLs
- 🎨 **Modern UI**: Beautiful gradient design with Material-UI
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🔒 **Secure**: Input validation and error handling
- 📈 **Analytics**: Click tracking and usage statistics

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Beautiful UI components
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server

### Backend
- **Express.js** - Node.js web framework
- **SQLite3** - Lightweight database
- **Nanoid** - Unique ID generation
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start the backend server (in one terminal)
   npm run server
   
   # Start the frontend development server (in another terminal)
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📖 Usage

### Shortening URLs

1. Navigate to the home page (http://localhost:3000)
2. Enter a long URL in the input field
3. Optionally, add a custom code
4. Click "Shorten URL"
5. Copy the generated short URL

### Viewing Statistics

1. Click "Statistics" in the navigation bar
2. View all shortened URLs with click counts
3. Copy any URL directly from the table

## 🔧 API Endpoints

### POST /api/shorten
Shorten a URL
```json
{
  "longUrl": "https://example.com/very-long-url",
  "customCode": "optional-custom-code"
}
```

### GET /:shortCode
Redirect to the original URL

### GET /api/stats
Get all shortened URLs with statistics

### POST /api/logs
Log events (used internally)

### GET /api/health
Health check endpoint

## 📁 Project Structure

```
url-shortener/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   │   ├── ShortenerPage.jsx
│   │   └── StatsPage.jsx
│   ├── services/           # API services
│   │   └── shortenUrl.js
│   ├── middleware/         # Middleware functions
│   │   └── logger.js
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── server/
│   └── index.js           # Express server
├── public/                # Static files
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database

The application uses SQLite for data storage. The database file (`urls.db`) is automatically created in the `server/` directory when you first run the application.

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your forked repository
   - Configure build settings:
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Deploy!

### Option 2: Netlify

1. **Fork this repository** to your GitHub account
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy!

### Option 3: Railway

1. **Fork this repository** to your GitHub account
2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Deploy!

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_PATH=./server/urls.db
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Material-UI](https://mui.com/) for the beautiful UI components
- [Vite](https://vitejs.dev/) for the fast build tool
- [Express.js](https://expressjs.com/) for the backend framework
- [SQLite](https://www.sqlite.org/) for the database

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/url-shortener/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact me at your-email@example.com

---

⭐ **Star this repository if you found it helpful!** 