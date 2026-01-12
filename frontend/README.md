# Yoga RAG Frontend

React-based web interface for the Yoga Wellness RAG application.

## 🎨 Features

- **Clean, Modern UI**: Beautiful gradient design with smooth animations
- **Real-time Query Processing**: Instant feedback with loading states
- **Safety Warnings**: Prominent display of safety notices for health conditions
- **Source Citations**: Transparent display of information sources
- **User Feedback**: Thumbs up/down feedback mechanism
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Example Questions**: Quick-start suggestions for users

## 🚀 Installation

```bash
npm install
```

## 💻 Development

```bash
npm start
```

Runs the app in development mode at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── QueryInput.jsx      # Search input component
│   │   ├── QueryInput.css
│   │   ├── ResponseDisplay.jsx # Answer display
│   │   ├── ResponseDisplay.css
│   │   ├── SafetyWarning.jsx   # Safety alert component
│   │   ├── SafetyWarning.css
│   │   ├── SourcesList.jsx     # Sources display
│   │   └── SourcesList.css
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── App.jsx             # Main app component
│   ├── App.css
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
└── package.json
```

## 🎨 Design System

### Colors

- **Primary**: Purple gradient (#667eea to #764ba2)
- **Success**: Green (#10b981)
- **Warning**: Yellow/Amber (#f59e0b)
- **Error**: Red (#ef4444)
- **Text**: Gray scale (#1f2937 to #9ca3af)

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components

- **Cards**: White background, rounded corners, subtle shadows
- **Buttons**: Gradient or solid with hover effects
- **Inputs**: Clean borders with focus states
- **Animations**: Smooth fade-in and slide effects

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:5000`.

### Environment Variables

Create `.env` file (optional):

```env
REACT_APP_API_URL=http://localhost:5000
```

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: > 768px

## ✨ Key Features Explained

### Query Input

- Character counter (500 max)
- Example questions for quick start
- Disabled state during loading
- Auto-focus on mount

### Response Display

- Formatted answer with metadata
- Response time and model display
- Feedback buttons (thumbs up/down)
- New query button

### Safety Warning

- Prominent yellow warning banner
- Detected conditions tags
- Safer alternatives list
- Professional disclaimer

### Sources List

- Numbered source cards
- Relevance scores
- Source metadata (title, page, publication)
- Citation information

## 🎯 User Experience

1. **Landing**: User sees clean input with example questions
2. **Query**: User types or clicks example
3. **Loading**: Spinner with estimated time
4. **Response**: Answer appears with sources and safety warnings (if applicable)
5. **Feedback**: User can rate the response
6. **New Query**: Button to start over

## 📝 License

Educational project for assignment purposes.
