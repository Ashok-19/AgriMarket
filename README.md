# 🌾 AgriMarket Analytics Dashboard

A comprehensive web-based analytics platform for agricultural commodity market data analysis, featuring real-time price tracking, historical analysis, AI-powered predictions, and interactive visualizations.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## ✨ Features

### 📊 Core Analytics
- **Real-time Market Overview**: Track prices, commodities, and market activity
- **Interactive Dashboards**: Multiple tabs for different analysis views
- **Advanced Filtering**: Filter by state, market, commodity, and date range
- **Dark/Light Mode**: Seamless theme switching

### 📈 Visualization Types
- **Price Trends**: Line charts showing historical price movements
- **Distribution Analysis**: Violin plots for price range analysis
- **Commodity Comparison**: Multi-commodity price comparison charts
- **Seasonal Patterns**: Radar charts for monthly price patterns
- **Volatility Heatmaps**: Market-commodity volatility visualization
- **Year-over-Year Comparison**: Historical price comparison across years

### 🔮 AI-Powered Predictions
- **Price Forecasting**: Prophet-based time series forecasting
- **Confidence Intervals**: Upper and lower bound predictions
- **Seasonality Analysis**: Trend and seasonal component decomposition
- **Interactive Forecast Calendar**: Visual representation of predicted prices

### 📉 Historical Analysis
- **Candlestick Charts**: OHLC price visualization
- **Calendar Heatmaps**: Daily price patterns
- **Market Scorecards**: Comprehensive market performance metrics

### 🔄 Comparisons
- **Multi-Commodity Comparison**: Compare up to 4 commodities simultaneously
- **Date Range Selection**: Flexible time period comparison
- **Interactive Charts**: Zoom, pan, and hover for detailed insights

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+**
- **Flask**: Web framework
- **Pandas**: Data manipulation and analysis
- **Prophet**: Time series forecasting
- **NumPy**: Numerical computations

### Frontend
- **HTML5/CSS3**: Modern responsive design
- **JavaScript (ES6+)**: Interactive functionality
- **Plotly.js**: Advanced charting library
- **Custom CSS**: Beautiful UI with dark mode support

### Data
- **CSV**: Market data storage
- **JSON**: Prediction data format

---

## 📁 Project Structure

```
eda-final/
├── web/
│   ├── api-server/          # Backend Flask API
│   │   ├── app.py           # Main Flask application
│   │   ├── requirements.txt # Python dependencies
│   │   ├── start-backend.sh # Backend startup script
│   │   └── venv/            # Python virtual environment
│   │
│   ├── frontend/            # Frontend application
│   │   ├── index.html       # Main HTML file
│   │   ├── app.js           # JavaScript application logic
│   │   ├── styles.css       # CSS styling
│   │   └── start-frontend.sh # Frontend startup script
│   │
│   └── data/                # Data directory
│       ├── market_data.csv  # Historical market data
│       └── predictions/     # Forecast data files
│
└── README.md                # This file
```

---

## 🚀 Installation

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone the Repository
```bash
cd ~/Desktop
# Assuming you already have the project at ~/Desktop/eda-final
cd eda-final
```

### Step 2: Backend Setup
```bash
cd web/api-server

# Create virtual environment (if not exists)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Verify Data Files
Ensure the following data files exist:
- `web/data/market_data.csv` - Historical market data
- `web/data/predictions/*.json` - Prediction files for each commodity

---

## 🎯 Usage

### Starting the Application

#### Option 1: Using Startup Scripts (Recommended)

**Start Backend:**
```bash
cd web/api-server
bash start-backend.sh
```
Backend will be available at: `http://localhost:5000`

**Start Frontend (in a new terminal):**
```bash
cd web/frontend
bash start-frontend.sh
```
Frontend will be available at: `http://localhost:8000`

#### Option 2: Manual Start

**Backend:**
```bash
cd web/api-server
source venv/bin/activate
python app.py
```

**Frontend:**
```bash
cd web/frontend
python -m http.server 8000
```

### Accessing the Dashboard

1. Open your web browser
2. Navigate to `http://localhost:8000`
3. The dashboard will load with default filters applied

### Using the Dashboard

#### 1. **Overview Tab**
- View KPI cards (Markets, Avg Price, Commodities)
- See top traded commodities pie chart
- Analyze price trends over time
- Review highest priced commodities

#### 2. **Price Movement Tab**
- Candlestick chart for OHLC analysis
- Historical calendar heatmap
- Detailed price movement tracking

#### 3. **Historical Analysis Tab**
- Filter by state, market, commodity, and date
- Year-over-year price comparison
- Volatility heatmap
- Monthly price patterns (radar chart)
- Price range analysis (violin plot)

#### 4. **Predictions Tab**
- Click "Show Price Forecast" button
- Select market and commodity
- View AI-generated price predictions
- Analyze seasonality and trends
- See confidence intervals

#### 5. **Comparisons Tab**
- Select up to 4 commodities
- Set date range for comparison
- View multi-commodity price trends
- Analyze market scorecards

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns server status and data statistics.

#### Get States
```http
GET /api/states
```
Returns list of available states.

#### Get Commodities
```http
GET /api/commodities?market={market}&state={state}
```
Returns list of commodities, optionally filtered.

#### Get Comparison Commodities
```http
GET /api/comparison-commodities
```
Returns commodities with sufficient data for comparison (≥10 records).

#### Get Markets
```http
GET /api/markets?state={state}
```
Returns list of markets, optionally filtered by state.

#### Get Filtered Data
```http
GET /api/data?states={states}&markets={markets}&commodities={commodities}&start_date={date}&end_date={date}
```
Returns filtered market data.

#### Multi-Commodity Comparison
```http
GET /api/multi-commodity-comparison?commodities={comma-separated}&start_date={date}&end_date={date}
```
Returns time-series data for multiple commodities.

#### Price Distribution
```http
GET /api/price-distribution?commodities={comma-separated}&states={states}&markets={markets}&start_date={date}&end_date={date}
```
Returns price distribution data for violin plots.

#### Seasonal Patterns
```http
GET /api/seasonal-patterns?commodities={comma-separated}&states={states}&markets={markets}&start_date={date}&end_date={date}
```
Returns monthly seasonal patterns for radar charts.

#### Volatility Heatmap
```http
GET /api/volatility-heatmap?states={states}&markets={markets}&commodities={commodities}&start_date={date}&end_date={date}
```
Returns volatility data for heatmap visualization.

#### Year-over-Year Comparison
```http
GET /api/yoy-comparison?states={states}&markets={markets}&commodities={commodities}
```
Returns year-over-year price comparison data.

#### Predictions
```http
GET /api/predictions/{market}/{commodity}
```
Returns forecast data for specific market-commodity combination.

---

## 🎨 Features in Detail

### Filtering System
- **Cascading Filters**: Markets update based on selected state
- **Multi-Select**: Select multiple states, markets, and commodities
- **Search**: Quick search within filter dropdowns
- **Select All/Clear**: Bulk selection controls
- **Filter Chips**: Visual representation of active filters

### Dark Mode
- Automatic theme detection
- Manual toggle button
- All charts adapt to theme
- Persistent preference

### Responsive Design
- Mobile-friendly layout
- Adaptive charts
- Touch-friendly controls
- Optimized for all screen sizes

### Data Quality Indicator
- Real-time completeness percentage
- Record count display
- Date range information
- Missing data alerts

---

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

**Module not found errors:**
```bash
# Reinstall dependencies
cd web/api-server
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

**Data file not found:**
- Verify `web/data/market_data.csv` exists
- Check file permissions
- Ensure correct path in `app.py`

### Frontend Issues

**Port 8000 already in use:**
```bash
# Use a different port
python -m http.server 8001
```

**Charts not loading:**
- Check browser console for errors
- Verify backend is running
- Clear browser cache
- Check network tab for failed requests

**Filters not working:**
- Refresh the page
- Check backend logs
- Verify data is loaded

---

## 📊 Data Format

### Market Data CSV
Required columns:
- `State`: State name
- `Market`: Market name
- `Commodity`: Commodity name
- `Arrival_Date`: Date (YYYY-MM-DD)
- `Modal_Price`: Price in rupees
- `Min_Price`: Minimum price
- `Max_Price`: Maximum price

### Prediction JSON
```json
{
  "dates": ["2025-01-01", "2025-01-02", ...],
  "predictions": [1234.56, 1245.67, ...],
  "lower_bound": [1200.00, 1210.00, ...],
  "upper_bound": [1270.00, 1280.00, ...],
  "trend": [...],
  "yearly_seasonality": [...],
  "weekly_seasonality": [...]
}
```

---

## 🔒 Security Notes

- This is a development server - **DO NOT use in production**
- No authentication implemented
- CORS enabled for local development
- Use a production WSGI server (Gunicorn, uWSGI) for deployment

---

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Export data to CSV/Excel
- [ ] Email alerts for price thresholds
- [ ] Mobile app
- [ ] Real-time data updates via WebSocket
- [ ] Advanced ML models (LSTM, ARIMA)
- [ ] Multi-language support
- [ ] Custom dashboard builder

---

## 📝 License

This project is for educational and research purposes.

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoints

---

## 🙏 Acknowledgments

- **Plotly.js** for amazing charting capabilities
- **Flask** for the lightweight web framework
- **Prophet** for time series forecasting
- **Tamil Nadu Agricultural Marketing Department** for data

---

**Built with ❤️ for agricultural market analysis**
