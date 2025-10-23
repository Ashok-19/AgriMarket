"""
Flask API Backend for Agricultural Market Dashboard
Provides REST API endpoints for market data, commodities, and price forecasts
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import sqlite3
from datetime import datetime
import os
import requests
from io import BytesIO
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global data storage
df = None
predictions_df = None
MODEL_COMMODITIES = []

# Get database URLs from environment variables (Dropbox links)
DATA_DB_URL = os.environ.get('DATABASE_URL', '')
PREDICTIONS_DB_URL = os.environ.get('PREDICTIONS_DATABASE_URL', '')

# Local fallback paths for development
DB_PATH = os.path.join(os.path.dirname(__file__), 'DB', 'data.db')
PREDICTIONS_DB_PATH = os.path.join(os.path.dirname(__file__), 'DB', 'predictions.db')


def get_data():
    """Load market data from SQLite database (Dropbox or local)"""
    try:
        if DATA_DB_URL:
            # Fetch from Dropbox URL
            print(f"Fetching market data from Dropbox: {DATA_DB_URL[:50]}...")
            # Convert Dropbox share link to direct download link
            download_url = DATA_DB_URL.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'dl=1')
            print(f"Converted URL: {download_url[:50]}...")
            
            response = requests.get(download_url, timeout=60)
            response.raise_for_status()
            print(f"Downloaded {len(response.content)} bytes")
            
            # Write to temporary file, then load into memory
            with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as tmp_file:
                tmp_file.write(response.content)
                tmp_path = tmp_file.name
            
            try:
                # Connect to temp file and copy to memory
                conn_memory = sqlite3.connect(':memory:')
                conn_disk = sqlite3.connect(tmp_path)
                conn_disk.backup(conn_memory)
                conn_disk.close()
                conn = conn_memory
                print("Database loaded into memory successfully")
            finally:
                # Clean up temp file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        else:
            # Use local database for development
            print(f"Using local database: {DB_PATH}")
            if not os.path.exists(DB_PATH):
                raise FileNotFoundError(f"Local database not found: {DB_PATH}")
            conn = sqlite3.connect(DB_PATH)
        
        query = """
        SELECT State, District, Market, Commodity, Variety, Grade, Arrival_Date,
               Min_Price, Max_Price, Modal_Price, Commodity_Code
        FROM market_data
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        print(f"Loaded {len(df)} records from market data")
        df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'])
        return df
    except Exception as e:
        print(f"Error loading market data: {e}")
        import traceback
        traceback.print_exc()
        raise


def get_predictions_data():
    """Load prediction data from SQLite database (Dropbox or local)"""
    try:
        if PREDICTIONS_DB_URL:
            # Fetch from Dropbox URL
            print(f"Fetching predictions data from Dropbox: {PREDICTIONS_DB_URL[:50]}...")
            # Convert Dropbox share link to direct download link
            download_url = PREDICTIONS_DB_URL.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'dl=1')
            print(f"Converted URL: {download_url[:50]}...")
            
            response = requests.get(download_url, timeout=60)
            response.raise_for_status()
            print(f"Downloaded {len(response.content)} bytes")
            
            # Write to temporary file, then load into memory
            with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as tmp_file:
                tmp_file.write(response.content)
                tmp_path = tmp_file.name
            
            try:
                # Connect to temp file and copy to memory
                conn_memory = sqlite3.connect(':memory:')
                conn_disk = sqlite3.connect(tmp_path)
                conn_disk.backup(conn_memory)
                conn_disk.close()
                conn = conn_memory
                print("Predictions database loaded into memory successfully")
            finally:
                # Clean up temp file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        else:
            # Use local database for development
            print(f"Using local database: {PREDICTIONS_DB_PATH}")
            if not os.path.exists(PREDICTIONS_DB_PATH):
                raise FileNotFoundError(f"Local database not found: {PREDICTIONS_DB_PATH}")
            conn = sqlite3.connect(PREDICTIONS_DB_PATH)
        
        query = "SELECT ds, Market, Commodity, Predicted_Price, trend, season_yearly, season_weekly FROM predicted_prices"
        df = pd.read_sql_query(query, conn)
        conn.close()
        print(f"Loaded {len(df)} records from predictions data")
        df['ds'] = pd.to_datetime(df['ds'])
        return df
    except Exception as e:
        print(f"Error loading predictions data: {e}")
        import traceback
        traceback.print_exc()
        raise


# Initialize data on startup
try:
    df = get_data()
    print(f"✓ Market data loaded successfully: {len(df)} records")
except Exception as e:
    print(f"✗ ERROR loading market data: {e}")
    df = pd.DataFrame()

try:
    predictions_df = get_predictions_data()
    MODEL_COMMODITIES = sorted(predictions_df['Commodity'].unique().tolist())
    print(f"✓ Predictions loaded successfully: {len(MODEL_COMMODITIES)} commodities")
except Exception as e:
    print(f"✗ ERROR loading predictions: {e}")
    print("  Run predict_store.py to generate predictions")
    predictions_df = pd.DataFrame()
    MODEL_COMMODITIES = []


def apply_filters(data):
    """Apply filters from request parameters to dataframe"""
    filtered_df = data.copy()

    # Get filter parameters
    states = request.args.getlist('states')
    markets = request.args.getlist('markets')
    commodities = request.args.getlist('commodities')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Apply state filter
    if states and len(states) > 0:
        filtered_df = filtered_df[filtered_df['State'].isin(states)]

    # Apply market filter
    if markets and len(markets) > 0:
        filtered_df = filtered_df[filtered_df['Market'].isin(markets)]

    # Apply commodity filter
    if commodities and len(commodities) > 0:
        filtered_df = filtered_df[filtered_df['Commodity'].isin(commodities)]

    # Apply date range filter
    if start_date:
        start_dt = pd.to_datetime(start_date)
        filtered_df = filtered_df[filtered_df['Arrival_Date'] >= start_dt]

    if end_date:
        end_dt = pd.to_datetime(end_date)
        filtered_df = filtered_df[filtered_df['Arrival_Date'] <= end_dt]

    return filtered_df


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'data_loaded': not df.empty,
        'predictions_loaded': not predictions_df.empty,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/states', methods=['GET'])
def get_states():
    """Get list of all states"""
    if df.empty:
        return jsonify([])
    states = sorted(df['State'].dropna().unique().tolist())
    return jsonify(states)


@app.route('/api/commodities', methods=['GET'])
def get_commodities():
    """Get list of commodities, optionally filtered by market and/or state"""
    if df.empty:
        return jsonify([])
    
    filtered_df = apply_filters(df)
    
    # Additional filtering by market if specified
    market = request.args.get('market', '').strip()
    if market:
        filtered_df = filtered_df[filtered_df['Market'] == market]
    
    # Additional filtering by state if specified
    state = request.args.get('state', '').strip()
    if state:
        filtered_df = filtered_df[filtered_df['State'] == state]
    
    if filtered_df.empty:
        return jsonify([])
    
    commodities = sorted(filtered_df['Commodity'].dropna().unique().tolist())
    return jsonify(commodities)


@app.route('/api/markets', methods=['GET'])
def get_markets():
    """Get list of markets, optionally filtered by state"""
    if df.empty:
        return jsonify([])
    
    filtered_df = apply_filters(df)
    
    # Additional filtering by state if specified
    state = request.args.get('state', '').strip()
    if state:
        filtered_df = filtered_df[filtered_df['State'] == state]
    
    if filtered_df.empty:
        return jsonify([])
    
    markets = sorted(filtered_df['Market'].dropna().unique().tolist())
    return jsonify(markets)


@app.route('/api/model-commodities', methods=['GET'])
def get_model_commodities():
    """Get list of commodities with forecast models"""
    return jsonify(MODEL_COMMODITIES)


@app.route('/api/prediction-markets', methods=['GET'])
def get_prediction_markets():
    """Get list of markets available in predictions database"""
    if predictions_df.empty:
        return jsonify([])
    markets = sorted(predictions_df['Market'].dropna().unique().tolist())
    return jsonify(markets)


@app.route('/api/prediction-commodities', methods=['GET'])
def get_prediction_commodities():
    """Get list of commodities available in predictions database, optionally filtered by market"""
    if predictions_df.empty:
        return jsonify([])
    
    # Filter by market if specified
    market = request.args.get('market', '').strip()
    if market:
        filtered_df = predictions_df[predictions_df['Market'] == market]
    else:
        filtered_df = predictions_df
    
    if filtered_df.empty:
        return jsonify([])
    
    commodities = sorted(filtered_df['Commodity'].dropna().unique().tolist())
    return jsonify(commodities)


@app.route('/api/kpis', methods=['GET'])
def get_kpis():
    """Get key performance indicators with optional filters"""
    if df.empty:
        return jsonify({
            'totalMarkets': 0,
            'avgModalPrice': 0.0,
            'selectedCommodities': 0
        })
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify({
            'totalMarkets': 0,
            'avgModalPrice': 0.0,
            'selectedCommodities': 0
        })
    
    total_markets = len(filtered_df['Market'].unique())
    avg_price = float(filtered_df['Modal_Price'].mean())
    total_commodities = len(filtered_df['Commodity'].unique())
    
    return jsonify({
        'totalMarkets': total_markets,
        'avgModalPrice': round(avg_price, 2),
        'selectedCommodities': total_commodities
    })


@app.route('/api/commodities-by-count', methods=['GET'])
def get_commodities_by_count():
    """Get top 10 commodities by count with optional filters"""
    if df.empty:
        return jsonify([])
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify([])
    
    commodity_counts = filtered_df['Commodity'].value_counts().head(10).reset_index()
    commodity_counts.columns = ['name', 'value']
    commodity_counts['count'] = commodity_counts['value']
    
    data = commodity_counts.to_dict('records')
    return jsonify(data)


@app.route('/api/price-by-year', methods=['GET'])
def get_price_by_year():
    """Get average modal price by year with optional filters"""
    if df.empty:
        return jsonify([])
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify([])
    
    df_copy = filtered_df.copy()
    df_copy['Year'] = df_copy['Arrival_Date'].dt.year
    yearly_avg = df_copy.groupby('Year')['Modal_Price'].mean().reset_index()
    yearly_avg.columns = ['year', 'price']
    yearly_avg['year'] = yearly_avg['year'].astype(str)
    yearly_avg['price'] = yearly_avg['price'].round(2)
    
    data = yearly_avg.to_dict('records')
    return jsonify(data)


@app.route('/api/commodities-by-price', methods=['GET'])
def get_commodities_by_price():
    """Get top 10 commodities by average modal price with optional filters"""
    if df.empty:
        return jsonify([])
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify([])
    
    avg_price_by_commodity = filtered_df.groupby('Commodity')['Modal_Price'].mean().reset_index()
    top_10 = avg_price_by_commodity.nlargest(10, 'Modal_Price')
    top_10.columns = ['name', 'price']
    top_10['price'] = top_10['price'].round(2)
    
    data = top_10.to_dict('records')
    return jsonify(data)


@app.route('/api/forecast-data/<commodity>', methods=['GET'])
def get_forecast_data(commodity):
    """Get historical and forecast data for a specific commodity"""
    if predictions_df.empty:
        return jsonify({'error': 'No prediction data available'}), 404

    # Get market parameter, default to Udumalpet for backward compatibility
    market = request.args.get('market', 'Udumalpet')

    # Get historical data for specified market
    hist_df = df[(df['Market'] == market) & (df['Commodity'] == commodity)].sort_values(by='Arrival_Date')

    # Get prediction data for specified market
    pred_df = predictions_df[(predictions_df['Market'] == market) & (predictions_df['Commodity'] == commodity)]

    if hist_df.empty and pred_df.empty:
        return jsonify({'error': f'No data available for commodity: {commodity} in market: {market}'}), 404

    # Format historical data
    historical = hist_df[['Arrival_Date', 'Modal_Price']].copy()
    historical.columns = ['date', 'price']
    historical['date'] = historical['date'].dt.strftime('%b %Y')
    historical['price'] = historical['price'].round(2)
    historical_data = historical.to_dict('records')

    # Format forecast data
    predicted = pred_df[['ds', 'Predicted_Price']].copy()
    predicted.columns = ['date', 'price']
    predicted['date'] = predicted['date'].dt.strftime('%b %Y')
    predicted['price'] = predicted['price'].round(2)
    forecast_data = predicted.to_dict('records')

    return jsonify({
        'commodity': commodity,
        'market': market,
        'historicalData': historical_data,
        'forecastData': forecast_data
    })


@app.route('/api/price-for-date/<commodity>', methods=['GET'])
def get_price_for_date(commodity):
    """Get price for a specific commodity on a specific date"""
    date_str = request.args.get('date')
    market = request.args.get('market', 'Udumalpet')  # Add market parameter

    if not date_str:
        return jsonify({'error': 'Date parameter is required'}), 400

    try:
        selected_date = pd.to_datetime(date_str)
    except:
        return jsonify({'error': 'Invalid date format'}), 400

    # Check historical data first for specified market
    hist_df = df[(df['Market'] == market) & (df['Commodity'] == commodity)]

    if not hist_df.empty:
        hist_min_date = hist_df['Arrival_Date'].min()
        hist_max_date = hist_df['Arrival_Date'].max()
    else:
        hist_min_date = None
        hist_max_date = None

    # Check prediction data for specified market
    if not predictions_df.empty:
        pred_df = predictions_df[(predictions_df['Market'] == market) & (predictions_df['Commodity'] == commodity)]
        if not pred_df.empty:
            pred_min_date = pred_df['ds'].min()
            pred_max_date = pred_df['ds'].max()
        else:
            pred_min_date = None
            pred_max_date = None
    else:
        pred_min_date = None
        pred_max_date = None

    # Scenario 1: Date is in historical range
    if hist_min_date and hist_max_date and hist_min_date <= selected_date <= hist_max_date:
        # Try to find exact or nearest date
        date_match = hist_df[hist_df['Arrival_Date'] == selected_date]

        if not date_match.empty:
            price = float(date_match.iloc[0]['Modal_Price'])
            return jsonify({
                'status': 'historical',
                'date': selected_date.strftime('%Y-%m-%d'),
                'price': round(price, 2),
                'message': f'Historical price for {commodity} in {market} on {selected_date.strftime("%b %d, %Y")}'
            })
        else:
            # Find nearest date
            hist_df_copy = hist_df.copy()
            hist_df_copy['date_diff'] = abs(hist_df_copy['Arrival_Date'] - selected_date)
            nearest = hist_df_copy.nsmallest(1, 'date_diff').iloc[0]
            return jsonify({
                'status': 'historical_nearest',
                'date': nearest['Arrival_Date'].strftime('%Y-%m-%d'),
                'price': round(float(nearest['Modal_Price']), 2),
                'message': f'No exact data for this date. Showing nearest available: {nearest["Arrival_Date"].strftime("%b %d, %Y")}'
            })

    # Scenario 2: Date is in prediction range
    if pred_min_date and pred_max_date and pred_min_date <= selected_date <= pred_max_date:
        # Find prediction for this date or nearest
        pred_match = pred_df[pred_df['ds'] == selected_date]

        if not pred_match.empty:
            price = float(pred_match.iloc[0]['Predicted_Price'])
            return jsonify({
                'status': 'predicted',
                'date': selected_date.strftime('%Y-%m-%d'),
                'price': round(price, 2),
                'message': f'Predicted price for {commodity} in {market} on {selected_date.strftime("%b %d, %Y")}'
            })
        else:
            # Find nearest prediction
            pred_df_copy = pred_df.copy()
            pred_df_copy['date_diff'] = abs(pred_df_copy['ds'] - selected_date)
            nearest = pred_df_copy.nsmallest(1, 'date_diff').iloc[0]
            return jsonify({
                'status': 'predicted_nearest',
                'date': nearest['ds'].strftime('%Y-%m-%d'),
                'price': round(float(nearest['Predicted_Price']), 2),
                'message': f'Predicted price (nearest date: {nearest["ds"].strftime("%b %d, %Y")})'
            })

    # Scenario 3: Date is before historical data
    if hist_min_date and selected_date < hist_min_date:
        return jsonify({
            'status': 'not_available',
            'message': f'No data available for {selected_date.strftime("%b %d, %Y")}. Data starts from {hist_min_date.strftime("%b %d, %Y")}'
        })

    # Scenario 4: Date is after prediction data (future)
    if pred_max_date and selected_date > pred_max_date:
        return jsonify({
            'status': 'future',
            'message': f'Prediction for {selected_date.strftime("%b %d, %Y")} will be available soon. Current predictions go up to {pred_max_date.strftime("%b %d, %Y")}'
        })

    # Scenario 5: No data available for this commodity
    return jsonify({
        'status': 'no_data',
        'message': f'No data or predictions available for {commodity} in {market}'
    })


# ============================================================
# ADVANCED ANALYTICS ENDPOINTS
# ============================================================

@app.route('/api/candlestick-data/<commodity>', methods=['GET'])
def get_candlestick_data(commodity):
    """
    Candlestick chart data for historical price volatility (data.db)
    Shows Min_Price, Max_Price, Modal_Price for each date
    """
    if df.empty:
        return jsonify({'error': 'No data available'}), 404
    
    market = request.args.get('market', 'Udumalpet')
    commodity_df = df[(df['Market'] == market) & (df['Commodity'] == commodity)].copy()
    
    if commodity_df.empty:
        return jsonify({'error': f'No data for commodity: {commodity}'}), 404
    
    # Parse dates and group by date
    commodity_df['Date'] = pd.to_datetime(commodity_df['Arrival_Date'], dayfirst=True).dt.date
    
    daily_data = commodity_df.groupby('Date').agg({
        'Min_Price': 'min',
        'Max_Price': 'max',
        'Modal_Price': 'mean'
    }).reset_index().sort_values('Date')
    
    data = []
    for _, row in daily_data.iterrows():
        data.append({
            'date': row['Date'].strftime('%Y-%m-%d'),
            'min': round(float(row['Min_Price']), 2),
            'max': round(float(row['Max_Price']), 2),
            'modal': round(float(row['Modal_Price']), 2)
        })
    
    return jsonify({
        'commodity': commodity,
        'market': market,
        'data': data
    })


@app.route('/api/historical-calendar/<commodity>', methods=['GET'])
def get_historical_calendar(commodity):
    """
    Calendar heatmap for historical prices (data.db)
    Shows actual market prices on a calendar view
    """
    if df.empty:
        return jsonify({'error': 'No data available'}), 404
    
    market = request.args.get('market', 'Udumalpet')
    commodity_df = df[(df['Market'] == market) & (df['Commodity'] == commodity)].copy()
    
    if commodity_df.empty:
        return jsonify({'error': f'No data for commodity: {commodity}'}), 404
    
    commodity_df['Date'] = pd.to_datetime(commodity_df['Arrival_Date'], dayfirst=True).dt.date
    daily_avg = commodity_df.groupby('Date')['Modal_Price'].mean().reset_index()
    
    data = []
    for _, row in daily_avg.iterrows():
        data.append({
            'date': row['Date'].strftime('%Y-%m-%d'),
            'price': round(float(row['Modal_Price']), 2)
        })
    
    return jsonify({
        'commodity': commodity,
        'market': market,
        'data': data
    })


@app.route('/api/seasonality-decomposition/<commodity>', methods=['GET'])
def get_seasonality_decomposition(commodity):
    """
    Seasonality & trend decomposition from predictions (predictions.db)
    Shows trend, yearly_seasonality, weekly_seasonality components
    """
    if predictions_df.empty:
        return jsonify({'error': 'No prediction data available'}), 404

    # Get market parameter, default to Udumalpet for backward compatibility
    market = request.args.get('market', 'Udumalpet')

    pred_commodity = predictions_df[(predictions_df['Commodity'] == commodity) & (predictions_df['Market'] == market)].copy()

    if pred_commodity.empty:
        return jsonify({'error': f'No predictions for commodity: {commodity} in market: {market}'}), 404

    pred_commodity = pred_commodity.sort_values('ds')

    data = []
    for _, row in pred_commodity.iterrows():
        item = {
            'date': row['ds'].strftime('%Y-%m-%d') if hasattr(row['ds'], 'strftime') else str(row['ds']),
            'trend': round(float(row['trend']), 2) if pd.notna(row.get('trend')) else None,
        }

        # Add seasonal components - use proper pandas column access
        try:
            if 'season_yearly' in pred_commodity.columns and pd.notna(row['season_yearly']):
                item['yearly_seasonality'] = round(float(row['season_yearly']), 2)
            if 'season_weekly' in pred_commodity.columns and pd.notna(row['season_weekly']):
                item['weekly_seasonality'] = round(float(row['season_weekly']), 2)
        except (KeyError, TypeError):
            pass

        data.append(item)

    return jsonify({
        'commodity': commodity,
        'market': market,
        'data': data
    })


@app.route('/api/forecast-uncertainty/<commodity>', methods=['GET'])
def get_forecast_uncertainty(commodity):
    """
    Forecast with confidence intervals (predictions.db)
    Shows predicted price with upper and lower bounds
    """
    if predictions_df.empty:
        return jsonify({'error': 'No prediction data available'}), 404

    # Get market parameter, default to Udumalpet for backward compatibility
    market = request.args.get('market', 'Udumalpet')

    pred_commodity = predictions_df[(predictions_df['Commodity'] == commodity) & (predictions_df['Market'] == market)].copy()

    if pred_commodity.empty:
        return jsonify({'error': f'No predictions for commodity: {commodity} in market: {market}'}), 404

    pred_commodity = pred_commodity.sort_values('ds')

    data = []
    for _, row in pred_commodity.iterrows():
        predicted_price = float(row['Predicted_Price'])
        # Calculate 10% confidence intervals if not available
        lower_bound = round(predicted_price * 0.9, 2)
        upper_bound = round(predicted_price * 1.1, 2)

        data.append({
            'date': row['ds'].strftime('%Y-%m-%d') if hasattr(row['ds'], 'strftime') else str(row['ds']),
            'predicted': round(predicted_price, 2),
            'lower': lower_bound,
            'upper': upper_bound
        })

    return jsonify({
        'commodity': commodity,
        'market': market,
        'data': data
    })


@app.route('/api/forecast-calendar/<commodity>', methods=['GET'])
def get_forecast_calendar(commodity):
    """
    Calendar heatmap for predicted prices (predictions.db)
    Shows future forecasted prices on a calendar view
    """
    if predictions_df.empty:
        return jsonify({'error': 'No prediction data available'}), 404

    # Get market parameter, default to Udumalpet for backward compatibility
    market = request.args.get('market', 'Udumalpet')

    pred_commodity = predictions_df[(predictions_df['Commodity'] == commodity) & (predictions_df['Market'] == market)].copy()

    if pred_commodity.empty:
        return jsonify({'error': f'No predictions for commodity: {commodity} in market: {market}'}), 404

    data = []
    for _, row in pred_commodity.iterrows():
        data.append({
            'date': row['ds'].strftime('%Y-%m-%d') if hasattr(row['ds'], 'strftime') else str(row['ds']),
            'price': round(float(row['Predicted_Price']), 2)
        })

    return jsonify({
        'commodity': commodity,
        'market': market,
        'data': data
    })


@app.route('/api/market-commodities/<string:market>', methods=['GET'])
def get_market_commodities(market):
    """Get list of commodities available for a specific market"""
    if df.empty:
        return jsonify({'market': market, 'commodities': []})
    
    market_df = df[df['Market'] == market]
    commodities = sorted(market_df['Commodity'].dropna().unique().tolist())
    
    return jsonify({
        'market': market,
        'commodities': commodities
    })


@app.route('/api/price-details', methods=['GET'])
def get_price_details():
    """Get detailed price breakdown by commodity and market with optional filters"""
    if df.empty:
        return jsonify([])
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify([])
    
    # Group by commodity and market to get average prices
    price_details = filtered_df.groupby(['Commodity', 'Market'])['Modal_Price'].mean().reset_index()
    price_details.columns = ['commodity', 'market', 'avg_price']
    price_details = price_details.sort_values('avg_price', ascending=False)
    
    data = price_details.to_dict('records')
    return jsonify(data)


# ============================================
# NEW API ENDPOINTS - PLAN0 IMPLEMENTATION
# ============================================

@app.route('/api/year-over-year/<commodity>', methods=['GET'])
def get_year_over_year(commodity):
    """Get year-over-year price comparison by month"""
    if df.empty:
        return jsonify({'years': []})
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify({'years': []})
    
    # Filter by commodity
    commodity_df = filtered_df[filtered_df['Commodity'] == commodity].copy()
    
    if commodity_df.empty:
        return jsonify({'years': []})
    
    # Extract year and month
    commodity_df['Year'] = commodity_df['Arrival_Date'].dt.year
    commodity_df['Month'] = commodity_df['Arrival_Date'].dt.month
    
    # Group by year and month
    yoy_data = commodity_df.groupby(['Year', 'Month'])['Modal_Price'].mean().reset_index()
    
    # Month names
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    # Organize by year
    years_data = []
    for year in sorted(yoy_data['Year'].unique()):
        year_df = yoy_data[yoy_data['Year'] == year]
        # Sort by month to ensure correct order
        year_df = year_df.sort_values('Month')
        
        # Create a dict for quick lookup
        month_price_map = {int(row['Month']): round(float(row['Modal_Price']), 2) for _, row in year_df.iterrows()}
        
        # Pad with all 12 months
        months = []
        for month_num in range(1, 13):
            months.append({
                'month': month_names[month_num - 1],
                'price': month_price_map.get(month_num, None)  # None for missing months
            })
        
        years_data.append({
            'year': str(year),
            'months': months
        })
    
    return jsonify({'years': years_data})


@app.route('/api/volatility-heatmap', methods=['GET'])
def get_volatility_heatmap():
    """Get price volatility (std dev) grouped by commodity and market"""
    if df.empty:
        return jsonify({'commodities': [], 'markets': [], 'volatility': []})
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify({'commodities': [], 'markets': [], 'volatility': []})
    
    # Calculate volatility (standard deviation) by commodity and market
    volatility = filtered_df.groupby(['Commodity', 'Market'])['Modal_Price'].std().reset_index()
    volatility.columns = ['Commodity', 'Market', 'Volatility']
    volatility['Volatility'] = volatility['Volatility'].fillna(0)
    
    # Get top commodities and markets
    top_commodities = volatility.groupby('Commodity')['Volatility'].mean().nlargest(10).index.tolist()
    top_markets = volatility.groupby('Market')['Volatility'].mean().nlargest(10).index.tolist()
    
    # Filter to top items
    volatility = volatility[volatility['Commodity'].isin(top_commodities) & volatility['Market'].isin(top_markets)]
    
    # Pivot to create matrix
    volatility_matrix = volatility.pivot(index='Market', columns='Commodity', values='Volatility')
    volatility_matrix = volatility_matrix.fillna(0)
    
    return jsonify({
        'commodities': volatility_matrix.columns.tolist(),
        'markets': volatility_matrix.index.tolist(),
        'volatility': [[round(float(v), 2) for v in row] for row in volatility_matrix.values]
    })


@app.route('/api/seasonal-pattern/<commodity>', methods=['GET'])
def get_seasonal_pattern(commodity):
    """Get seasonal price pattern by month for one or more commodities"""
    if df.empty:
        return jsonify({'commodities': []})
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify({'commodities': []})
    
    # Check for multi-commodity query param
    commodities_param = request.args.get('commodities', '')
    if commodities_param:
        commodities_list = [c.strip() for c in commodities_param.split(',')]
    else:
        # Single commodity from path (backward compatible)
        commodities_list = [commodity]
    
    result = []
    for comm in commodities_list:
        commodity_df = filtered_df[filtered_df['Commodity'] == comm].copy()
        
        if not commodity_df.empty:
            # Extract month
            commodity_df['Month'] = commodity_df['Arrival_Date'].dt.month
            
            # Group by month and calculate average price
            seasonal_data = commodity_df.groupby('Month')['Modal_Price'].mean().reset_index()
            seasonal_data = seasonal_data.sort_values('Month')
            
            result.append({
                'name': comm,
                'months': seasonal_data['Month'].tolist(),
                'prices': [round(float(p), 2) for p in seasonal_data['Modal_Price'].tolist()]
            })
    
    # Backward compatibility: if single commodity, return old format
    if len(commodities_list) == 1 and not commodities_param:
        if result:
            return jsonify({
                'months': result[0]['months'],
                'prices': result[0]['prices']
            })
        else:
            return jsonify({'months': [], 'prices': []})
    
    return jsonify({'commodities': result})


@app.route('/api/price-distribution', methods=['GET'])
def get_price_distribution():
    """Get price distribution for violin plot"""
    if df.empty:
        return jsonify({'commodities': []})
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify({'commodities': []})
    
    # Get commodities from query parameter
    commodities_param = request.args.get('commodities', '')
    if commodities_param:
        commodities_list = [c.strip() for c in commodities_param.split(',')]
    else:
        # Default to top 3 commodities
        commodities_list = filtered_df['Commodity'].value_counts().head(3).index.tolist()
    
    # Get price arrays for each commodity
    result = []
    for commodity in commodities_list:
        commodity_df = filtered_df[filtered_df['Commodity'] == commodity]
        if not commodity_df.empty:
            prices = commodity_df['Modal_Price'].dropna().tolist()
            if prices:
                result.append({
                    'name': commodity,
                    'prices': [round(float(p), 2) for p in prices]
                })
    
    return jsonify({'commodities': result})


@app.route('/api/market-performance', methods=['GET'])
def get_market_performance():
    """Get market performance metrics"""
    if df.empty:
        return jsonify([])
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify([])
    
    # Calculate metrics for each market
    performance = []
    for market in filtered_df['Market'].unique():
        market_df = filtered_df[filtered_df['Market'] == market]
        
        # Calculate metrics
        avg_price = market_df['Modal_Price'].mean()
        volatility = market_df['Modal_Price'].std()
        commodities_count = market_df['Commodity'].nunique()
        records_count = len(market_df)
        
        # Data freshness (days since last record)
        latest_date = market_df['Arrival_Date'].max()
        freshness = (pd.Timestamp.now() - latest_date).days
        
        performance.append({
            'market': market,
            'avg_price': round(float(avg_price), 2),
            'volatility': round(float(volatility if pd.notna(volatility) else 0), 2),
            'commodities': int(commodities_count),
            'records': int(records_count),
            'freshness': int(freshness)
        })
    
    # Sort by a composite score (lower volatility, more commodities, fresher data)
    performance.sort(key=lambda x: (-x['commodities'], -x['avg_price'], x['volatility']), reverse=False)
    
    return jsonify(performance)


@app.route('/api/data-quality', methods=['GET'])
def get_data_quality():
    """Get data quality statistics"""
    if df.empty:
        return jsonify({
            'total_records': 0,
            'date_range': {'min': None, 'max': None},
            'completeness': 0,
            'missing_days': 0
        })
    
    # Apply filters
    filtered_df = apply_filters(df)
    
    if filtered_df.empty:
        return jsonify({
            'total_records': 0,
            'date_range': {'min': None, 'max': None},
            'completeness': 0,
            'missing_days': 0
        })
    
    # Calculate statistics
    total_records = len(filtered_df)
    min_date = filtered_df['Arrival_Date'].min()
    max_date = filtered_df['Arrival_Date'].max()
    
    # Calculate completeness (days with data / total days in range)
    total_days = (max_date - min_date).days + 1
    unique_days = filtered_df['Arrival_Date'].dt.date.nunique()
    completeness = (unique_days / total_days * 100) if total_days > 0 else 0
    missing_days = total_days - unique_days
    
    return jsonify({
        'total_records': int(total_records),
        'date_range': {
            'min': min_date.strftime('%Y-%m-%d'),
            'max': max_date.strftime('%Y-%m-%d')
        },
        'completeness': round(float(completeness), 2),
        'missing_days': int(missing_days)
    })


@app.route('/api/comparison-commodities', methods=['GET'])
def get_comparison_commodities():
    """Get list of commodities that have sufficient data for comparison"""
    if df.empty:
        return jsonify([])
    
    # Get commodities with at least 10 records for meaningful comparison
    commodity_counts = df['Commodity'].value_counts()
    available_commodities = commodity_counts[commodity_counts >= 10].index.tolist()
    
    return jsonify(sorted(available_commodities))


@app.route('/api/multi-commodity-comparison', methods=['GET'])
def get_multi_commodity_comparison():
    """Get time-series data for multiple commodities"""
    if df.empty:
        return jsonify({'commodities': []})
    
    # Start with full dataset (don't apply global commodity filters for comparison tab)
    filtered_df = df.copy()
    
    # Only apply date filters if provided
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_dt = pd.to_datetime(start_date)
        filtered_df = filtered_df[filtered_df['Arrival_Date'] >= start_dt]
    
    if end_date:
        end_dt = pd.to_datetime(end_date)
        filtered_df = filtered_df[filtered_df['Arrival_Date'] <= end_dt]
    
    if filtered_df.empty:
        return jsonify({'commodities': []})
    
    # Get commodities from query parameter
    commodities_param = request.args.get('commodities', '')
    if commodities_param:
        commodities_list = [c.strip() for c in commodities_param.split(',')][:4]  # Max 4
    else:
        commodities_list = filtered_df['Commodity'].value_counts().head(4).index.tolist()
    
    # Get time-series data for each commodity
    result = []
    for commodity in commodities_list:
        commodity_df = filtered_df[filtered_df['Commodity'] == commodity].copy()
        if not commodity_df.empty:
            # Group by month for cleaner visualization
            commodity_df['YearMonth'] = commodity_df['Arrival_Date'].dt.to_period('M')
            monthly_data = commodity_df.groupby('YearMonth')['Modal_Price'].mean().reset_index()
            monthly_data['YearMonth'] = monthly_data['YearMonth'].dt.to_timestamp()
            
            data_points = []
            for _, row in monthly_data.iterrows():
                data_points.append({
                    'date': row['YearMonth'].strftime('%Y-%m'),
                    'price': round(float(row['Modal_Price']), 2)
                })
            
            if data_points:
                result.append({
                    'name': commodity,
                    'data': data_points
                })
    
    return jsonify({'commodities': result})


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌾 Agricultural Market Dashboard API Server")
    print("="*60)
    print(f"📊 Market records loaded: {len(df)}")
    print(f"🔮 Forecast commodities: {len(MODEL_COMMODITIES)}")
    print("="*60)
    print("🚀 Starting server on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
