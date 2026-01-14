# TripFlow - Travel Planning PWA

A comprehensive, mobile-responsive travel planning Progressive Web App (PWA) with gamification, interactive maps, and advanced planning features.

![Summit Core Theme](https://img.shields.io/badge/Theme-Summit%20Core-1F7A5A)
![Vanilla Stack](https://img.shields.io/badge/Stack-Vanilla%20HTML%2FCSS%2FJS-orange)
![Status](https://img.shields.io/badge/Status-Active-success)

## ✨ Features

### 🎒 Trip Management
- **Full CRUD Operations**: Create, read, update, and delete trips
- **Trip Details**: Name, description, start/end dates
- **Visual Cards**: Beautiful glassmorphism-styled trip cards
- **Statistics**: Track destinations and expenses per trip

### 📍 Destination Management
- **Add Destinations**: Name and notes for each location
- **Visual List**: Clean, organized destination display
- **Edit & Delete**: Modify or remove destinations easily
- **Country Tracking**: Automatic unique country counter

### 🎮 Gamification System
- **XP & Levels**: Earn experience points for every action
- **12 Achievements**: Unlock achievements for milestones
- **Progress Tracking**: Visual XP bar in header
- **Level-Up Celebrations**: Animated notifications
- **Achievement Unlocks**: Full-screen celebration animations

**XP Rewards:**
- Create trip: +50 XP
- Add destination: +20 XP
- Set budget: +25 XP
- Add expense: +10 XP
- Complete packing list: +30 XP
- Upload document: +15 XP

**Achievements:**
- 🎒 First Adventure - Create first trip
- 🗺️ Explorer - Add 10 destinations
- 💰 Budget Master - Track 20+ expenses
- ✈️ Frequent Flyer - Create 5 trips
- 🌍 Globe Trotter - Visit 5+ countries
- 📝 Organized Traveler - Complete 3 packing lists
- 🎯 Completionist - Use all features
- 📄 Document Keeper - Upload 5+ documents

### 💰 Budget Tracking
- **Set Budget**: Total amount and currency selection
- **Add Expenses**: Amount, category, description, date
- **Progress Visualization**: Real-time spending percentage
- **Category Breakdown**: Visual expense organization
- **7 Categories**: Flights ✈️, Hotels 🏨, Food 🍽️, Activities 🎭, Shopping 🛍️, Transport 🚗, Other 📦

### 🗺️ Interactive Maps
- **Leaflet.js Integration**: Beautiful, interactive maps
- **Destination Markers**: Pin each location
- **Route Visualization**: Polyline connecting destinations
- **Marker Popups**: Click for destination details
- **Auto-Fit Bounds**: Perfect map zoom
- **20+ Pre-loaded Cities**: Major destinations worldwide

### 🎒 Packing Lists
- **5 Categories**: Documents 📄, Clothing 👕, Toiletries 🧴, Electronics 🔌, Other 📦
- **Smart Suggestions**: Auto-populate essential items
- **Progress Tracking**: Visual completion percentage
- **Checkbox System**: Mark items as packed
- **Add Custom Items**: Personalize your list

### 📄 Document Storage
- **File Upload**: PDF, JPG, PNG support (max 2MB)
- **5 Document Types**: Passport, Visa, Insurance, Ticket, Other
- **Base64 Encoding**: Secure localStorage storage
- **Download**: Retrieve documents anytime
- **Visual Icons**: Easy identification

### 🔍 Destination Search
- **REST Countries API**: Real-world country data
- **Search by Name**: Find any country
- **Rich Information**: Flag, capital, region, population
- **Add to Trip**: Direct integration
- **Beautiful Cards**: Visual country displays

### 🔗 Social Sharing
- **Web Share API**: Native sharing on supported devices
- **Clipboard Fallback**: Copy trip info
- **Share Button**: Quick access

## 🎨 Design - Summit Core Theme

### Color Palette
- **Background**: #F3F2EE (Stone/Beige)
- **Surface**: #1F1F1F (Graphite)
- **Primary**: #1F7A5A (Alpine Green)
- **Accent**: #B87333 (Copper)
- **Warning**: #D97706 (Amber)
- **Extended**: Forest, Mint, Bronze, Cream, Charcoal

### Typography
- **Display Font**: Outfit (Headings, 700-900 weight)
- **Body Font**: Inter (Body text, 400-600 weight)
- **Style**: Rounded, approachable, adventure-forward

### Design Principles
- **Vibrant & Dynamic**: Energy of exploration
- **Glassmorphism**: Modern card effects
- **Smooth Animations**: Hover effects, transitions
- **Mobile-First**: Responsive on all devices
- **Premium Feel**: High-quality aesthetics

## 🛠️ Technical Stack

- **HTML5**: Semantic structure
- **CSS3**: Vanilla CSS with custom properties
- **JavaScript**: ES6+ features
- **Leaflet.js**: Interactive maps
- **REST Countries API**: Country data
- **LocalStorage**: Client-side persistence
- **Web Share API**: Native sharing

## 🚀 Getting Started

1. **Clone or Download** the repository
2. **Open** `index.html` in a modern web browser
3. **Start Planning** your adventures!

No build process required - it's pure vanilla HTML/CSS/JS.

## 📁 File Structure

```
tripflow/
├── index.html      # Main application file
├── index.css       # Summit Core design system
├── app.js          # Complete application logic
└── README.md       # This file
```

## 💾 Data Storage

All data is stored locally in your browser using `localStorage`:

- **`tripflow_itineraries`**: All trip data
- **`tripflow_profile`**: User profile, XP, achievements

**Note**: Data persists across sessions but is browser-specific.

## 📱 Responsive Design

- **Desktop**: Full-featured experience (1024px+)
- **Tablet**: Optimized layout (768px-1024px)
- **Mobile**: Touch-friendly interface (320px-768px)

## 🎯 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 🔒 Security

- **XSS Prevention**: HTML sanitization
- **Input Validation**: Date, number, file size checks
- **2MB File Limit**: Document storage safety

## 🎓 How to Use

### Creating Your First Trip
1. Click "✨ Create New Trip"
2. Fill in trip details (name, dates, description)
3. Click "Create" - Earn your first achievement! 🎒

### Adding Destinations
1. View a trip and click "+ Add" in Destinations
2. Enter city name and optional notes
3. Switch to Map tab to see your route

### Setting Budget
1. Go to Budget tab
2. Click "Set Budget" and enter amount
3. Add expenses as you plan or travel

### Packing Smart
1. Navigate to Packing tab
2. Click "✨ Smart Suggestions" for essentials
3. Check off items as you pack

### Exploring Countries
1. Click "🔍 Explore" in navigation
2. Search for any country
3. Add interesting destinations to your trips

## 🏆 Achievement Guide

Track your progress and unlock all 8 achievements:

| Achievement | Requirement | XP |
|------------|-------------|-----|
| 🎒 First Adventure | Create 1 trip | 100 |
| 🗺️ Explorer | Add 10 destinations | 200 |
| 💰 Budget Master | Track 20 expenses | 150 |
| ✈️ Frequent Flyer | Create 5 trips | 250 |
| 🌍 Globe Trotter | Visit 5 countries | 500 |
| 📝 Organized Traveler | Complete 3 packing lists | 150 |
| 🎯 Completionist | Use all features | 300 |
| 📄 Document Keeper | Upload 5 documents | 200 |

## 🗺️ Supported Cities (Map Coordinates)

New York, Los Angeles, London, Paris, Tokyo, Bangkok, Dubai, Singapore, Rome, Barcelona, Amsterdam, Berlin, Sydney, Melbourne, Toronto, Vancouver, Miami, Chicago, San Francisco, Seattle, Boston, Madrid, Lisbon, Athens, Istanbul, Cairo, Mumbai, Delhi, Beijing, Shanghai, Hong Kong, Seoul

*More cities can be added by updating the CITY_COORDS object in app.js*

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

**Arun**

## 🙏 Acknowledgments

- Google Fonts (Outfit, Inter)
- Leaflet.js for maps
- REST Countries API for country data
- Summit Core design inspiration
