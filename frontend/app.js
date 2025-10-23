// Configuration
const API_BASE_URL = 'http://localhost:5000'; // Flask backend URL
const USE_MOCK_DATA = false; // Set to true for testing without backend

// Mock Data (for testing)
const MOCK_DATA = {
    kpis: {
        totalMarkets: 27,
        avgModalPrice: 4494.08,
        selectedCommodities: 112
    },
    commoditiesByCount: [
        { name: 'Coconut', value: 45.93 },
        { name: 'Onion', value: 12.5 },
        { name: 'Tomato', value: 10.2 },
        { name: 'Potato', value: 8.5 },
        { name: 'Ginger', value: 6.3 },
        { name: 'Groundnut', value: 5.1 },
        { name: 'Garlic', value: 4.2 },
        { name: 'Sweet Corn', value: 3.8 },
        { name: 'Bengal Gram', value: 2.5 },
        { name: 'Other', value: 1.0 }
    ],
    priceByYear: [
        { year: '2002', price: 2100 },
        { year: '2006', price: 2300 },
        { year: '2010', price: 2800 },
        { year: '2015', price: 3200 },
        { year: '2020', price: 3800 },
        { year: '2021', price: 4200 }
    ],
    commoditiesByPrice: [
        { name: 'Gold Apple', price: 23.5 },
        { name: 'Apple', price: 20.2 },
        { name: 'Grapes', price: 18.5 },
        { name: 'Beetroot Greens', price: 16.8 },
        { name: 'Pear Marmalade', price: 15.2 },
        { name: 'Drumstick', price: 14.5 },
        { name: 'Amaranth Seeds', price: 12.8 },
        { name: 'Sheep Meat', price: 11.5 },
        { name: 'Mango', price: 10.2 },
        { name: 'Capsicum', price: 9.8 }
    ],
    forecast: {
        historical: [
            { date: 'Jul 2024', price: 1500 },
            { date: 'Oct 2024', price: 1400 },
            { date: 'Jan 2025', price: 5800 },
            { date: 'Apr 2025', price: 3200 },
            { date: 'Jul 2025', price: 3000 }
        ],
        predicted: [
            { date: 'Jul 2025', price: 3000 },
            { date: 'Oct 2025', price: 2600 },
            { date: 'Jan 2026', price: 2700 },
            { date: 'Apr 2026', price: 2850 },
            { date: 'Jul 2026', price: 2950 }
        ]
    }
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const body = document.body;

const showForecastBtn = document.getElementById('showForecastBtn');
const forecastModal = document.getElementById('forecastModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');

const stateFilter = document.getElementById('stateFilter');
const marketCheckboxContainer = document.getElementById('marketCheckboxContainer');
const marketSearch = document.getElementById('marketSearch');
const selectAllMarkets = document.getElementById('selectAllMarkets');
const clearAllMarkets = document.getElementById('clearAllMarkets');
const marketSelectedCount = document.getElementById('marketSelectedCount');
const commodityCheckboxContainer = document.getElementById('commodityCheckboxContainer');
const commoditySearch = document.getElementById('commoditySearch');
const selectAllCommodities = document.getElementById('selectAllCommodities');
const clearAllCommodities = document.getElementById('clearAllCommodities');
const selectedCount = document.getElementById('selectedCount');

const forecastMarket = document.getElementById('forecastMarket');
const forecastCommodity = document.getElementById('forecastCommodity');
const forecastDate = document.getElementById('forecastDate');
const forecastChartTitle = document.getElementById('forecastChartTitle');
const predictionValue = document.getElementById('predictionValue');

// Chart Info Modal Elements
const chartInfoModal = document.getElementById('chartInfoModal');
const chartInfoModalOverlay = document.getElementById('chartInfoModalOverlay');
const chartInfoModalClose = document.getElementById('closeChartInfoModal');
const chartInfoContent = document.getElementById('chartInfoContent');
const chartInfoSubtitle = document.getElementById('chartInfoSubtitle');

const analyticsMarketSelect = document.getElementById('analyticsMarketSelect');
const analyticsCommoditySelect = document.getElementById('analyticsCommoditySelect');

const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const dateRangeText = document.getElementById('dateRangeText');

// Cache for market-commodity mappings
const marketCommodities = {};

// Chart Information Data
const CHART_INFO = {
    'commodity-pie': {
        title: 'Top 10 Commodities by Count',
        subtitle: 'Understanding commodity distribution',
        content: `
            <h4>What is this chart?</h4>
            <p>This pie chart shows the top 10 commodities by the number of records in our database. It helps you understand which commodities are most frequently traded in the agricultural markets.</p>

            <h4>How to interpret it</h4>
            <p>Each slice represents a commodity and its size corresponds to the number of market records. Larger slices indicate commodities that are more commonly traded or have more data points available.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Use this chart to identify the most active commodities in the market. Commodities with larger slices may have more reliable price trends due to higher data volume.
            </div>

            <h4>Common use cases</h4>
            <ul>
                <li>Identify commodities with high trading volume</li>
                <li>Understand market diversity</li>
                <li>Prioritize commodities for forecasting</li>
            </ul>
        `
    },
    'price-line': {
        title: 'Average Modal Price by Year',
        subtitle: 'Understanding price trends over time',
        content: `
            <h4>What is this chart?</h4>
            <p>This line chart displays the average modal (most common) price for commodities across different years. It shows how prices have evolved over time.</p>

            <h4>How to interpret it</h4>
            <p>The Y-axis represents the average price in rupees per quintal, and the X-axis shows the years. The line connects the average prices for each year, making it easy to spot trends like increasing or decreasing prices over time.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Look for patterns like seasonal variations or long-term price increases. This helps in understanding market cycles and making informed decisions.
            </div>

            <h4>Common use cases</h4>
            <ul>
                <li>Identify long-term price trends</li>
                <li>Compare price stability across years</li>
                <li>Plan for future price movements</li>
            </ul>
        `
    },
    'price-bar': {
        title: 'Top 10 Commodities by Average Modal Price',
        subtitle: 'Understanding price distribution',
        content: `
            <h4>What is this chart?</h4>
            <p>This bar chart shows the top 10 commodities ranked by their average modal price. It helps you identify which commodities command the highest prices in the market.</p>

            <h4>How to interpret it</h4>
            <p>Bars are arranged from highest to lowest price. The height of each bar represents the average price in rupees per quintal. This makes it easy to compare relative values between commodities.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Higher-priced commodities might indicate premium quality, scarcity, or high demand. Consider market dynamics when interpreting these values.
            </div>

            <h4>Common use cases</h4>
            <ul>
                <li>Identify premium-priced commodities</li>
                <li>Compare value across different commodities</li>
                <li>Understand market positioning</li>
            </ul>
        `
    },
    'candlestick': {
        title: 'Price Volatility (Candlestick)',
        subtitle: 'Understanding price movements for selected commodities',
        content: `
            <h4>What is this chart?</h4>
            <p>This candlestick chart shows detailed price movements for a selected commodity in a specific market. Each "candle" represents a time period and shows open, high, low, and close prices.</p>

            <h4>How to interpret it</h4>
            <p><strong>Candlestick components:</strong></p>
            <ul>
                <li><strong>Body:</strong> The thick part shows open and close prices</li>
                <li><strong>Wicks:</strong> Thin lines show high and low prices</li>
                <li><strong>Green candles:</strong> Price increased (close > open)</li>
                <li><strong>Red candles:</strong> Price decreased (close < open)</li>
            </ul>

            <div class="tip">
                <strong>💡 Tip:</strong> Long wicks indicate high volatility, while short wicks suggest stable prices. Use this to assess price stability for trading decisions.
            </div>

            <h4>Common use cases</h4>
            <ul>
                <li>Analyze price volatility patterns</li>
                <li>Identify support and resistance levels</li>
                <li>Assess trading risk for specific commodities</li>
            </ul>
        `
    },
    'historical-calendar': {
        title: 'Historical Price Calendar',
        subtitle: 'Understanding seasonal price patterns',
        content: `
            <h4>What is this chart?</h4>
            <p>This calendar heatmap shows historical price data organized by month and day of the week. Darker colors typically indicate higher prices, while lighter colors show lower prices.</p>

            <h4>How to interpret it</h4>
            <p>Each square represents a specific day of the year. The color intensity corresponds to the price level for that day. This helps identify seasonal patterns and recurring price trends.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Look for patterns across years to identify seasonal trends. Darker months might indicate peak seasons with higher prices.
            </div>

            <h4>Common use cases</h4>
            <ul>
                <li>Identify seasonal price patterns</li>
                <li>Plan harvesting or purchasing timing</li>
                <li>Understand market cycles</li>
            </ul>
        `
    },
    'analytics-selection': {
        title: 'Market & Commodity Selection',
        subtitle: 'Interactive controls for historical analysis',
        content: `
            <h4>What are these controls?</h4>
            <p>These dropdown menus allow you to select specific markets and commodities for detailed historical analysis. The charts above will update automatically based on your selections.</p>

            <h4>How to use them</h4>
            <p><strong>Market Selection:</strong> Choose a specific market to focus on (e.g., Mumbai, Delhi, etc.)</p>
            <p><strong>Commodity Selection:</strong> Choose a commodity to analyze (options change based on selected market)</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Start with a market selection first, as this will filter the available commodities. Then select a commodity to see the detailed analysis charts.
            </div>

            <h4>Available options</h4>
            <ul>
                <li><strong>Markets:</strong> All major agricultural markets across India</li>
                <li><strong>Commodities:</strong> Varies by market - shows commodities traded in the selected market</li>
            </ul>
        `
    },
    'yoy-comparison': {
        title: 'Year-over-Year Price Comparison',
        subtitle: 'Compare prices across multiple years',
        content: `
            <h4>What is this chart?</h4>
            <p>This chart compares prices for the same commodity across different years, showing how prices vary month-by-month over multiple years.</p>

            <h4>How to interpret it</h4>
            <p>Each line represents a different year. By comparing the lines, you can identify seasonal patterns and see how prices have changed year-over-year.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Look for consistent patterns across years to identify reliable seasonal trends.
            </div>
        `
    },
    'volatility-heatmap': {
        title: 'Price Volatility Heatmap',
        subtitle: 'Visualize price stability across markets and commodities',
        content: `
            <h4>What is this chart?</h4>
            <p>This heatmap shows price volatility (standard deviation) for different commodity-market combinations. Darker red indicates higher volatility.</p>

            <h4>How to interpret it</h4>
            <p>Higher volatility means prices fluctuate more, indicating higher risk but potentially higher returns. Lower volatility suggests more stable prices.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Use this to assess trading risk and identify stable markets for specific commodities.
            </div>
        `
    },
    'seasonal-radar': {
        title: 'Seasonal Price Radar',
        subtitle: 'Circular view of seasonal patterns',
        content: `
            <h4>What is this chart?</h4>
            <p>This radar chart displays average prices for each month in a circular format, making seasonal patterns easy to spot.</p>

            <h4>How to interpret it</h4>
            <p>The distance from center represents price level. Peaks indicate months with higher prices, valleys show lower-price months.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Use this to plan optimal buying or selling times based on seasonal price patterns.
            </div>
        `
    },
    'violin-plot': {
        title: 'Price Distribution Analysis',
        subtitle: 'Statistical view of price ranges',
        content: `
            <h4>What is this chart?</h4>
            <p>Violin plots show the full distribution of prices for each commodity, revealing not just averages but the entire range and frequency of prices.</p>

            <h4>How to interpret it</h4>
            <p>Wider sections indicate price ranges that occur more frequently. The box inside shows the median and quartiles.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Use this to understand price variability and identify typical vs. outlier prices.
            </div>
        `
    },
    'multi-commodity': {
        title: 'Multi-Commodity Price Trends',
        subtitle: 'Compare up to 4 commodities',
        content: `
            <h4>What is this chart?</h4>
            <p>This chart allows you to compare price trends for multiple commodities simultaneously over time.</p>

            <h4>How to interpret it</h4>
            <p>Each line represents a different commodity. Use the "Small Multiples" toggle to view separate charts for each commodity.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Select commodities with similar price ranges for easier comparison, or use small multiples view for different scales.
            </div>
        `
    },
    'market-scorecard': {
        title: 'Market Performance Scorecard',
        subtitle: 'Ranked market metrics',
        content: `
            <h4>What is this table?</h4>
            <p>This scorecard ranks markets based on multiple performance metrics including average price, volatility, commodity diversity, and data freshness.</p>

            <h4>How to interpret it</h4>
            <p>Click column headers to sort by that metric. Green indicates good values, yellow is moderate, red indicates concerning values.</p>

            <div class="tip">
                <strong>💡 Tip:</strong> Use this to identify the most active and reliable markets for trading.
            </div>
        `
    }
};

// Chart Info Modal Functions
function showChartInfo(chartType) {
    const info = CHART_INFO[chartType];
    if (!info) {
        console.error('Chart info not found for:', chartType);
        return;
    }

    chartInfoContent.innerHTML = info.content;
    chartInfoSubtitle.textContent = info.subtitle;
    chartInfoModal.classList.add('active');

    // Track modal opening for analytics (optional)
    console.log('Chart info opened for:', chartType);
}

function closeChartInfoModal() {
    chartInfoModal.classList.remove('active');
}

// Add event listeners for chart info buttons
document.addEventListener('click', (e) => {
    if (e.target.matches('.chart-info-btn') || e.target.closest('.chart-info-btn')) {
        e.preventDefault();
        const button = e.target.matches('.chart-info-btn') ? e.target : e.target.closest('.chart-info-btn');
        const chartType = button.getAttribute('data-chart');
        if (chartType) {
            showChartInfo(chartType);
        }
    }
});

// Close modal when clicking overlay or close button
chartInfoModalOverlay?.addEventListener('click', closeChartInfoModal);
chartInfoModalClose?.addEventListener('click', closeChartInfoModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chartInfoModal.classList.contains('active')) {
        closeChartInfoModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initDates();
    await loadInitialData(); // Load dropdown options first (includes analytics dropdown)
    await loadData();
    setupEventListeners();
    // Don't auto-load charts - wait for user to select commodity
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Re-render all charts with new theme colors
    refreshChartsForTheme();
}

function applyTheme(theme) {
    const themeToggleBtn = document.getElementById('themeToggle');

    if (theme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        if (themeToggleBtn) {
            themeToggleBtn.classList.remove('theme-light');
            themeToggleBtn.classList.add('theme-dark');
        }
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if (themeToggleBtn) {
            themeToggleBtn.classList.remove('theme-dark');
            themeToggleBtn.classList.add('theme-light');
        }
    }
}

// Get theme-aware colors for charts
function getThemeColors() {
    const isDark = body.classList.contains('dark-mode');
    return {
        text: isDark ? '#f9fafb' : '#111827',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
        bgColor: isDark ? '#1e293b' : '#ffffff',
        paperBg: isDark ? 'transparent' : 'transparent',
        hoverBg: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        hoverBorder: isDark ? '#6366f1' : '#4f46e5',
        hoverText: isDark ? '#f9fafb' : '#111827',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif'
    };
}

// Get standard Plotly config with theme-aware hover styling
function getPlotlyConfig() {
    const colors = getThemeColors();
    return {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
}

// Get hover label styling for layouts
function getHoverLabelStyle() {
    const colors = getThemeColors();
    return {
        bgcolor: colors.hoverBg,
        bordercolor: colors.hoverBorder,
        font: {
            family: colors.fontFamily,
            size: 13,
            color: colors.hoverText
        }
    };
}

// Refresh all visible charts when theme changes
function refreshChartsForTheme() {
    console.log('Refreshing charts for theme change...');
    
    // Reload main dashboard data to refresh charts
    loadData();
    
    // If forecast modal is open, refresh those charts too
    if (forecastModal && forecastModal.classList.contains('active')) {
        const forecastCommodityElem = document.getElementById('forecastCommodity');
        const commodity = forecastCommodityElem ? forecastCommodityElem.value : null;
        
        loadForecastData();
        
        if (commodity) {
            loadPredictedAnalytics(commodity);
        }
    }
    
    // Reload analytics charts if they exist
    const market = analyticsMarketSelect?.value;
    const commodity = analyticsCommoditySelect?.value;
    if (market && commodity) {
        loadHistoricalAnalytics(market, commodity);
    }
}

// Date Initialization
function initDates() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    startDate.value = formatDate(oneYearAgo);
    endDate.value = formatDate(today);
    updateDateRangeDisplay();
    
    // Initialize forecast date
    forecastDate.value = formatDate(today);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function updateDateRangeDisplay() {
    const dateRangeTextElem = document.getElementById('dateRangeText');
    if (dateRangeTextElem && startDate.value && endDate.value) {
        const start = new Date(startDate.value).toLocaleDateString();
        const end = new Date(endDate.value).toLocaleDateString();
        dateRangeTextElem.textContent = `${start} → ${end}`;
    }
}

// Event Listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            sidebarToggle.classList.toggle('active');
            
            // Update button position on desktop
            if (window.innerWidth > 1024) {
                sidebarToggle.style.left = isCollapsed ? '20px' : '340px';
            }
        });
    }
    
    // KPI card click handlers
    document.getElementById('marketsKpiCard')?.addEventListener('click', () => openKpiDetailModal('markets'));
    document.getElementById('priceKpiCard')?.addEventListener('click', () => openKpiDetailModal('price'));
    document.getElementById('commoditiesKpiCard')?.addEventListener('click', () => openKpiDetailModal('commodities'));
    
    showForecastBtn.addEventListener('click', openForecastModal);
    closeModalBtn.addEventListener('click', closeForecastModal);
    modalOverlay.addEventListener('click', closeForecastModal);
    
    // Filter change events with cascading
    stateFilter.addEventListener('change', async () => {
        await updateMarketFilterByState();
        loadData();
    });

    // Market search
    marketSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = marketCheckboxContainer.querySelectorAll('.checkbox-item');

        items.forEach(item => {
            const label = item.querySelector('label');
            const text = label.textContent.toLowerCase();

            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Market multi-select buttons
    selectAllMarkets.addEventListener('click', () => {
        const checkboxes = marketCheckboxContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if (cb.parentElement.style.display !== 'none') {
                cb.checked = true;
                cb.parentElement.classList.add('checked');
            }
        });
        updateMarketSelectedCount();
        loadData();
    });

    clearAllMarkets.addEventListener('click', () => {
        const checkboxes = marketCheckboxContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if (cb.parentElement.style.display !== 'none') {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            }
        });
        updateMarketSelectedCount();
        loadData();
    });

    // Commodity search
    commoditySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = commodityCheckboxContainer.querySelectorAll('.checkbox-item');

        items.forEach(item => {
            const label = item.querySelector('label');
            const text = label.textContent.toLowerCase();

            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Commodity multi-select buttons
    selectAllCommodities.addEventListener('click', () => {
        const checkboxes = commodityCheckboxContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if (cb.parentElement.style.display !== 'none') {
                cb.checked = true;
                cb.parentElement.classList.add('checked');
            }
        });
        updateSelectedCount();
        loadData();
    });

    clearAllCommodities.addEventListener('click', () => {
        const checkboxes = commodityCheckboxContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if (cb.parentElement.style.display !== 'none') {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            }
        });
        updateSelectedCount();
        loadData();
    });

    startDate.addEventListener('change', () => {
        updateDateRangeDisplay();
        loadData();
    });
    endDate.addEventListener('change', () => {
        updateDateRangeDisplay();
        loadData();
    });

    // Forecast modal event listeners - use event delegation
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'forecastMarket') {
            updateForecastChart();
        }
        if (e.target && e.target.id === 'forecastCommodity') {
            updateForecastChart();
        }
        if (e.target && e.target.id === 'forecastDate') {
            updatePrediction();
        }
    });

    // Advanced analytics market and commodity selection
    if (analyticsMarketSelect) {
        analyticsMarketSelect.addEventListener('change', async () => {
            const market = analyticsMarketSelect.value;
            
            // Update commodity filter based on selected market
            await updateAnalyticsCommodityFilter(market);
            
            const commodity = analyticsCommoditySelect.value;
            if (market && commodity) {
                loadHistoricalAnalytics(market, commodity);
            }
        });
    }
    if (analyticsCommoditySelect) {
        analyticsCommoditySelect.addEventListener('change', () => {
            const market = analyticsMarketSelect.value;
            const commodity = analyticsCommoditySelect.value;
            if (market && commodity) {
                loadHistoricalAnalytics(market, commodity);
            }
        });
    }

    // Chart info modal event listeners
    document.addEventListener('click', (e) => {
        if (e.target.matches('.chart-info-btn') || e.target.closest('.chart-info-btn')) {
            e.preventDefault();
            const button = e.target.matches('.chart-info-btn') ? e.target : e.target.closest('.chart-info-btn');
            const chartType = button.getAttribute('data-chart');
            if (chartType) {
                showChartInfo(chartType);
            }
        }
    });

    // Close chart info modal when clicking overlay or close button
    if (chartInfoModalOverlay) {
        chartInfoModalOverlay.addEventListener('click', closeChartInfoModal);
    }
    if (chartInfoModalClose) {
        chartInfoModalClose.addEventListener('click', closeChartInfoModal);
    }

    // Close chart info modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chartInfoModal && chartInfoModal.classList.contains('active')) {
            closeChartInfoModal();
        }
    });

    // Theme toggle event listener
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

// Modal Management
async function openForecastModal() {
    console.log('=== Opening Forecast Modal ===');
    forecastModal.classList.add('active');
    
    // Wait a bit for modal to be fully rendered in DOM
    setTimeout(async () => {
        console.log('Repopulating forecast modal dropdowns...');
        
        // Re-query elements to ensure they exist in DOM
        const forecastMarketElem = document.getElementById('forecastMarket');
        const forecastCommodityElem = document.getElementById('forecastCommodity');
        
        console.log('Modal elements found:', {
            market: forecastMarketElem ? 'YES' : 'NO',
            commodity: forecastCommodityElem ? 'YES' : 'NO'
        });
        
        if (predictionMarkets && predictionMarkets.length > 0) {
            populateForecastMarketFilter();
            console.log('✓ Forecast market dropdown populated with', predictionMarkets.length, 'prediction markets');
            
            // Add event listener for market change to update commodities and title
            forecastMarketElem.addEventListener('change', async () => {
                const selectedMarket = forecastMarketElem.value;
                
                // Update modal title dynamically
                const marketElement = document.getElementById('forecastModalMarket');
                if (marketElement) {
                    marketElement.textContent = selectedMarket || 'Market';
                }
                
                // Update commodity filter based on selected market
                await updateForecastCommodityFilter(selectedMarket);
            });
        } else {
            console.error('ERROR: predictionMarkets is empty when opening modal');
        }
        
        if (modelCommodities && modelCommodities.length > 0) {
            // Get the first market to filter commodities
            const initialMarket = forecastMarketElem ? forecastMarketElem.value : null;
            if (initialMarket) {
                await updateForecastCommodityFilter(initialMarket);
            } else {
                populateForecastCommodityFilter();
            }
            console.log('✓ Forecast commodity dropdown populated');
        } else if (availableCommodities && availableCommodities.length > 0) {
            populateForecastCommodityFilter();
            console.log('✓ Forecast commodity dropdown populated (fallback to all commodities)');
        } else {
            console.error('ERROR: No commodities available when opening modal');
        }
        
        // Update modal title with selected market
        const market = forecastMarketElem ? forecastMarketElem.value : 'Udumalpet';
        const marketElement = document.getElementById('forecastModalMarket');
        if (marketElement) {
            marketElement.textContent = market || 'Market';
        }
        
        // Load forecast chart
        loadForecastData();
        
        // Load predicted analytics charts
        const commodity = forecastCommodityElem ? forecastCommodityElem.value : null;
        console.log('Selected commodity for prediction:', commodity);
        
        if (commodity) {
            console.log('Loading predicted analytics for:', commodity);
            loadPredictedAnalytics(commodity);
        } else {
            console.warn('No commodity selected for prediction charts');
        }
    }, 100); // Small delay to ensure DOM is ready
}

function closeForecastModal() {
    forecastModal.classList.remove('active');
}

// Load initial dropdown options from backend
async function loadInitialData() {
    console.log('=== Loading Initial Data ===');
    try {
        console.log('Fetching data from backend...');
        const [statesRes, commoditiesRes, marketsRes, modelCommoditiesRes, predictionMarketsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/states`),
            fetch(`${API_BASE_URL}/api/commodities`),
            fetch(`${API_BASE_URL}/api/markets`),
            fetch(`${API_BASE_URL}/api/model-commodities`),
            fetch(`${API_BASE_URL}/api/prediction-markets`)
        ]);
        
        console.log('API responses received, parsing JSON...');
        availableStates = await statesRes.json();
        availableCommodities = await commoditiesRes.json();
        availableMarkets = await marketsRes.json();
        modelCommodities = await modelCommoditiesRes.json();
        predictionMarkets = await predictionMarketsRes.json();
        
        console.log('Loaded from backend:', {
            states: availableStates.length,
            commodities: availableCommodities.length,
            markets: availableMarkets.length,
            modelCommodities: modelCommodities.length,
            predictionMarkets: predictionMarkets.length
        });
        
        // Populate dropdowns
        console.log('Populating all dropdowns...');
        populateStateFilter();
        populateMarketFilter();
        populateCommodityFilter();
        populateForecastMarketFilter();
        populateForecastCommodityFilter();
        populateAnalyticsMarketDropdown();
        populateAnalyticsCommodityDropdown();
        
        console.log('✓ All dropdowns populated successfully');
        console.log('=== Finished Loading Initial Data ===\n');
    } catch (error) {
        console.error('ERROR loading initial data:', error);
        console.error('Error details:', error.message, error.stack);
        // Keep hardcoded options as fallback
    }
}

function populateStateFilter() {
    stateFilter.innerHTML = '<option value="">All States</option>';
    availableStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateFilter.appendChild(option);
    });
}

async function updateMarketFilterByState() {
    const selectedState = stateFilter?.value || '';
    
    if (!selectedState) {
        // No state selected, show all markets
        populateMarketFilter();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/markets?state=${encodeURIComponent(selectedState)}`);
        const markets = await response.json();
        
        // Repopulate market checkboxes
        marketCheckboxContainer.innerHTML = '';
        
        markets.forEach(market => {
            const item = document.createElement('div');
            item.className = 'checkbox-item checked';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `market_${market.replace(/[^a-zA-Z0-9]/g, '_')}`;
            checkbox.value = market;
            checkbox.checked = true;
            checkbox.dataset.market = market;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = market;
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    item.classList.add('checked');
                } else {
                    item.classList.remove('checked');
                }
                updateMarketSelectedCount();
                updateCommodityFilterByMarkets();
                loadData();
            });
            
            item.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            item.appendChild(checkbox);
            item.appendChild(label);
            marketCheckboxContainer.appendChild(item);
        });
        
        updateMarketSelectedCount();
        
        // Update commodities based on new markets
        await updateCommodityFilterByMarkets();
    } catch (error) {
        console.error('Error updating market filter:', error);
        populateMarketFilter(); // Fallback
    }
}

async function updateCommodityFilterByMarkets() {
    // Get selected markets
    const selectedMarkets = Array.from(marketCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    
    if (selectedMarkets.length === 0) {
        // No markets selected, show all commodities
        populateCommodityFilter();
        return;
    }
    
    try {
        // Fetch commodities available for selected markets
        const commoditiesSet = new Set();
        
        for (const market of selectedMarkets) {
            const response = await fetch(`${API_BASE_URL}/api/commodities?market=${encodeURIComponent(market)}`);
            const commodities = await response.json();
            commodities.forEach(c => commoditiesSet.add(c));
        }
        
        const filteredCommodities = Array.from(commoditiesSet).sort();
        
        // Repopulate commodity checkboxes with filtered list
        commodityCheckboxContainer.innerHTML = '';
        
        filteredCommodities.forEach(commodity => {
            const item = document.createElement('div');
            item.className = 'checkbox-item checked';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `commodity_${commodity.replace(/[^a-zA-Z0-9]/g, '_')}`;
            checkbox.value = commodity;
            checkbox.checked = true;
            checkbox.dataset.commodity = commodity;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = commodity;
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    item.classList.add('checked');
                } else {
                    item.classList.remove('checked');
                }
                updateSelectedCount();
                loadData();
            });
            
            item.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            item.appendChild(checkbox);
            item.appendChild(label);
            commodityCheckboxContainer.appendChild(item);
        });
        
        updateSelectedCount();
    } catch (error) {
        console.error('Error updating commodity filter:', error);
        populateCommodityFilter(); // Fallback to all commodities
    }
}

function populateCommodityFilter() {
    commodityCheckboxContainer.innerHTML = '';
    
    availableCommodities.forEach(commodity => {
        const item = document.createElement('div');
        item.className = 'checkbox-item checked';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `commodity_${commodity.replace(/[^a-zA-Z0-9]/g, '_')}`;
        checkbox.value = commodity;
        checkbox.checked = true; // Select all by default
        checkbox.dataset.commodity = commodity;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = commodity;
        
        // Toggle on checkbox change
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                item.classList.add('checked');
            } else {
                item.classList.remove('checked');
            }
            updateSelectedCount();
            loadData();
        });
        
        // Toggle on item click
        item.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        item.appendChild(checkbox);
        item.appendChild(label);
        commodityCheckboxContainer.appendChild(item);
    });
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const checkboxes = commodityCheckboxContainer.querySelectorAll('input[type="checkbox"]');
    const selected = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    selectedCount.textContent = `${selected} of ${total} selected`;
}

function populateMarketFilter() {
    marketCheckboxContainer.innerHTML = '';

    availableMarkets.forEach(market => {
        const item = document.createElement('div');
        item.className = 'checkbox-item checked';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `market_${market.replace(/[^a-zA-Z0-9]/g, '_')}`;
        checkbox.value = market;
        checkbox.checked = true; // Select all by default
        checkbox.dataset.market = market;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = market;

        // Toggle on checkbox change
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                item.classList.add('checked');
            } else {
                item.classList.remove('checked');
            }
            updateMarketSelectedCount();
            updateCommodityFilterByMarkets(); // Update commodities based on selected markets
            loadData();
        });

        // Toggle on item click
        item.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        item.appendChild(checkbox);
        item.appendChild(label);
        marketCheckboxContainer.appendChild(item);
    });

    updateMarketSelectedCount();
}

function updateMarketSelectedCount() {
    const checkboxes = marketCheckboxContainer.querySelectorAll('input[type="checkbox"]');
    const selected = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    marketSelectedCount.textContent = `${selected} of ${total} selected`;
}

function populateForecastMarketFilter() {
    console.log('=== populateForecastMarketFilter ===');
    const forecastMarketElem = document.getElementById('forecastMarket');
    if (!forecastMarketElem) {
        console.error('ERROR: forecastMarket element not found in DOM');
        return;
    }
    
    if (!predictionMarkets || predictionMarkets.length === 0) {
        console.error('ERROR: predictionMarkets is empty');
        forecastMarketElem.innerHTML = '<option value="">No prediction markets available</option>';
        return;
    }
    
    console.log('Populating with', predictionMarkets.length, 'prediction markets');
    forecastMarketElem.innerHTML = '';
    predictionMarkets.forEach((market, index) => {
        const option = document.createElement('option');
        option.value = market;
        option.textContent = market;
        if (index === 0) option.selected = true; // Select first one
        forecastMarketElem.appendChild(option);
    });
    console.log('✓ Successfully populated forecast market dropdown with', forecastMarketElem.options.length, 'options');
}

async function populateForecastCommodityFilter() {
    console.log('=== populateForecastCommodityFilter ===');
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    const forecastMarketElem = document.getElementById('forecastMarket');
    
    if (!forecastCommodityElem) {
        console.error('ERROR: forecastCommodity element not found in DOM');
        return;
    }
    
    // Get selected market
    const selectedMarket = forecastMarketElem?.value || '';
    
    try {
        // Fetch commodities filtered by selected market from prediction database
        const url = selectedMarket 
            ? `${API_BASE_URL}/api/prediction-commodities?market=${encodeURIComponent(selectedMarket)}`
            : `${API_BASE_URL}/api/prediction-commodities`;
        
        const response = await fetch(url);
        const commodities = await response.json();
        
        if (!commodities || commodities.length === 0) {
            console.error('ERROR: No commodities available for selected market');
            forecastCommodityElem.innerHTML = '<option value="">No commodities available</option>';
            return;
        }
        
        console.log('Populating with', commodities.length, 'commodities for market:', selectedMarket || 'All');
        forecastCommodityElem.innerHTML = '';
        commodities.forEach((commodity, index) => {
            const option = document.createElement('option');
            option.value = commodity;
            option.textContent = commodity;
            if (index === 0) option.selected = true; // Select first one
            forecastCommodityElem.appendChild(option);
        });
        console.log('✓ Successfully populated forecast commodity dropdown with', forecastCommodityElem.options.length, 'options');
    } catch (error) {
        console.error('Error populating forecast commodities:', error);
        forecastCommodityElem.innerHTML = '<option value="">Error loading commodities</option>';
    }
}

function populateAnalyticsCommodityDropdown() {
    console.log('=== Starting populateAnalyticsCommodityDropdown ===');
    const analyticsCommoditySelect = document.getElementById('analyticsCommoditySelect');

    if (!analyticsCommoditySelect) {
        console.error('ERROR: Analytics commodity select element NOT FOUND in DOM!');
        return;
    }

    console.log('✓ Found analyticsCommoditySelect element');
    console.log('✓ Available commodities array length:', availableCommodities.length);

    if (!availableCommodities || availableCommodities.length === 0) {
        console.error('ERROR: availableCommodities is empty!');
        return;
    }

    // Clear and repopulate
    analyticsCommoditySelect.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a commodity...';
    analyticsCommoditySelect.appendChild(defaultOption);

    // Add all commodities
    let addedCount = 0;
    availableCommodities.forEach((commodity, index) => {
        const option = document.createElement('option');
        option.value = commodity;
        option.textContent = commodity;
        analyticsCommoditySelect.appendChild(option);
        addedCount++;
        if (index < 5) {
            console.log(`  Added commodity ${index + 1}: ${commodity}`);
        }
    });

    console.log(`✓ Successfully added ${addedCount} commodities to dropdown`);
    console.log(`✓ Total options in dropdown: ${analyticsCommoditySelect.options.length}`);
    console.log('=== Finished populateAnalyticsCommodityDropdown ===\n');
}

function populateAnalyticsMarketDropdown() {
    console.log('=== Starting populateAnalyticsMarketDropdown ===');
    const analyticsMarketSelect = document.getElementById('analyticsMarketSelect');

    if (!analyticsMarketSelect) {
        console.error('ERROR: Analytics market select element NOT FOUND in DOM!');
        return;
    }

    console.log('✓ Found analyticsMarketSelect element');
    console.log('✓ Available markets array length:', availableMarkets.length);

    if (!availableMarkets || availableMarkets.length === 0) {
        console.error('ERROR: availableMarkets is empty!');
        return;
    }

    // Clear and repopulate
    analyticsMarketSelect.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a market...';
    analyticsMarketSelect.appendChild(defaultOption);

    // Add all markets
    let addedCount = 0;
    availableMarkets.forEach((market, index) => {
        const option = document.createElement('option');
        option.value = market;
        option.textContent = market;
        analyticsMarketSelect.appendChild(option);
        addedCount++;
        if (index < 5) {
            console.log(`  Added market ${index + 1}: ${market}`);
        }
    });

    console.log(`✓ Successfully added ${addedCount} markets to dropdown`);
    console.log(`✓ Total options in dropdown: ${analyticsMarketSelect.options.length}`);
    console.log('=== Finished populateAnalyticsMarketDropdown ===\n');
}

// Build filter query string
function buildFilterQuery() {
    const params = new URLSearchParams();

    // Get selected states
    const selectedStates = Array.from(stateFilter.selectedOptions).map(opt => opt.value).filter(v => v);
    selectedStates.forEach(state => params.append('states', state));

    // Get selected markets
    const selectedMarkets = Array.from(marketCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    selectedMarkets.forEach(market => params.append('markets', market));

    // Get selected commodities
    const selectedCommodities = Array.from(commodityCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    selectedCommodities.forEach(commodity => params.append('commodities', commodity));

    // Get date range
    if (startDate.value) {
        params.append('start_date', startDate.value);
    }
    if (endDate.value) {
        params.append('end_date', endDate.value);
    }

    return params.toString();
}

// Data Loading Functions
async function loadData() {
    if (USE_MOCK_DATA) {
        updateKPIs(MOCK_DATA.kpis);
        renderPieChart(MOCK_DATA.commoditiesByCount);
        renderLineChart(MOCK_DATA.priceByYear);
        renderBarChart(MOCK_DATA.commoditiesByPrice);
    } else {
        try {
            // Build filter query string
            const filterQuery = buildFilterQuery();
            const queryString = filterQuery ? `?${filterQuery}` : '';
            
            // Fetch from backend with filters
            const [kpis, countData, yearData, priceData] = await Promise.all([
                fetch(`${API_BASE_URL}/api/kpis${queryString}`).then(r => r.json()),
                fetch(`${API_BASE_URL}/api/commodities-by-count${queryString}`).then(r => r.json()),
                fetch(`${API_BASE_URL}/api/price-by-year${queryString}`).then(r => r.json()),
                fetch(`${API_BASE_URL}/api/commodities-by-price${queryString}`).then(r => r.json())
            ]);
            
            updateKPIs(kpis);
            renderPieChart(countData);
            renderLineChart(yearData);
            renderBarChart(priceData);
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to mock data
            updateKPIs(MOCK_DATA.kpis);
            renderPieChart(MOCK_DATA.commoditiesByCount);
            renderLineChart(MOCK_DATA.priceByYear);
            renderBarChart(MOCK_DATA.commoditiesByPrice);
        }
    }
}

function updateKPIs(data) {
    document.getElementById('totalMarkets').textContent = data.totalMarkets;
    document.getElementById('avgPrice').textContent = `₹${data.avgModalPrice.toFixed(2)}`;
    document.getElementById('totalCommodities').textContent = data.selectedCommodities;
}

// Chart Rendering Functions using Plotly
function renderPieChart(data) {
    const values = data.map(d => d.value);
    const labels = data.map(d => d.name);
    const colors = getThemeColors();
    
    const chartData = [{
        values: values,
        labels: labels,
        type: 'pie',
        marker: {
            colors: [
                '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
                '#10b981', '#06b6d4', '#3b82f6', '#14b8a6', '#84cc16'
            ]
        },
        textposition: 'inside',
        textinfo: 'label+percent',
        textfont: {
            color: '#ffffff',
            size: 14,
            family: colors.fontFamily
        },
        hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>'
    }];
    
    const layout = {
        showlegend: false,
        margin: { l: 20, r: 20, t: 20, b: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 14,
            family: colors.fontFamily
        }
    };
    
    const config = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
    
    document.getElementById('commodityPieChart').innerHTML = '';
    Plotly.newPlot('commodityPieChart', chartData, layout, config);
}

function renderLineChart(data) {
    const years = data.map(d => d.year);
    const prices = data.map(d => d.price);
    const colors = getThemeColors();
    
    const chartData = [{
        x: years,
        y: prices,
        type: 'scatter',
        mode: 'lines+markers',
        line: {
            color: '#3b82f6',
            width: 3
        },
        marker: {
            color: '#3b82f6',
            size: 8
        },
        fill: 'tozeroy',
        fillcolor: 'rgba(59, 130, 246, 0.2)',
        hovertemplate: '<b>Year %{x}</b><br>Average Price: ₹%{y:.2f}<extra></extra>'
    }];
    
    const layout = {
        xaxis: {
            title: {
                text: 'Year',
                font: { size: 14, color: colors.text, family: colors.fontFamily }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: colors.fontFamily }
        },
        yaxis: {
            title: {
                text: 'Avg Modal Price',
                font: { size: 14, color: colors.text, family: colors.fontFamily }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: colors.fontFamily }
        },
        margin: { l: 60, r: 20, t: 20, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 13,
            family: colors.fontFamily
        }
    };
    
    const config = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
    
    document.getElementById('priceLineChart').innerHTML = '';
    Plotly.newPlot('priceLineChart', chartData, layout, config);
}

function renderBarChart(data) {
    const names = data.map(d => d.name);
    const prices = data.map(d => d.price);
    const colors = getThemeColors();
    
    const chartData = [{
        y: names,
        x: prices,
        type: 'bar',
        orientation: 'h',
        marker: {
            color: prices.map((_, i) => {
                const colorPalette = ['#8b5cf6', '#9333ea', '#a855f7', '#b377f8', '#c084f9', 
                               '#cd91fa', '#da9efb', '#e7abfc', '#f3b8fd', '#ffc5fe'];
                return colorPalette[i % colorPalette.length];
            })
        },
        hovertemplate: '<b>%{y}</b><br>Average Price: ₹%{x:.2f}<extra></extra>'
    }];
    
    const layout = {
        xaxis: {
            title: {
                text: 'Avg Modal Price',
                font: { size: 14, color: colors.text, family: colors.fontFamily }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: colors.fontFamily }
        },
        yaxis: {
            automargin: true,
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: colors.fontFamily }
        },
        margin: { l: 120, r: 20, t: 20, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 13,
            family: colors.fontFamily
        }
    };
    
    const config = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
    
    document.getElementById('priceBarChart').innerHTML = '';
    Plotly.newPlot('priceBarChart', chartData, layout, config);
}

// Forecast Functions
async function loadForecastData() {
    // Query elements at runtime to ensure they exist
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    const forecastMarketElem = document.getElementById('forecastMarket');
    const forecastChartTitleElem = document.getElementById('forecastChartTitle');
    
    if (!forecastCommodityElem || !forecastMarketElem) {
        console.error('ERROR: Forecast dropdown elements not found');
        return;
    }
    
    const commodity = forecastCommodityElem.value;
    const market = forecastMarketElem.value;
    
    if (forecastChartTitleElem) {
        forecastChartTitleElem.textContent = `Price Forecast vs. History for ${commodity} in ${market}`;
    }
    
    if (USE_MOCK_DATA) {
        renderForecastChart(MOCK_DATA.forecast);
        updatePrediction();
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/api/forecast-data/${encodeURIComponent(commodity)}?market=${encodeURIComponent(market)}`);
            const data = await response.json();
            renderForecastChart({
                historical: data.historicalData,
                predicted: data.forecastData
            });
            updatePrediction();
        } catch (error) {
            console.error('Error loading forecast data:', error);
            renderForecastChart(MOCK_DATA.forecast);
        }
    }
}

function renderForecastChart(data) {
    const colors = getThemeColors();
    
    const historical = {
        x: data.historical.map(d => d.date),
        y: data.historical.map(d => d.price),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Historical Price',
        line: {
            color: '#3b82f6',
            width: 3
        },
        marker: {
            color: '#3b82f6',
            size: 8
        }
    };
    
    const predicted = {
        x: data.predicted.map(d => d.date),
        y: data.predicted.map(d => d.price),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Predicted Price',
        line: {
            color: '#ef4444',
            width: 3,
            dash: 'dash'
        },
        marker: {
            color: '#ef4444',
            size: 8
        }
    };
    
    const chartData = [historical, predicted];
    
    const layout = {
        xaxis: {
            title: {
                text: 'Date',
                font: { size: 14, color: colors.text, family: colors.fontFamily }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: colors.fontFamily }
        },
        yaxis: {
            title: {
                text: 'Modal Price (₹)',
                font: { size: 14, color: colors.text, family: colors.fontFamily }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: colors.fontFamily }
        },
        legend: {
            x: 0,
            y: 1,
            orientation: 'h',
            font: { size: 13, color: colors.text, family: colors.fontFamily }
        },
        margin: { l: 60, r: 20, t: 20, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 13,
            family: colors.fontFamily
        }
    };
    
    const config = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
    
    document.getElementById('forecastChart').innerHTML = '';
    Plotly.newPlot('forecastChart', chartData, layout, config);
}

function updateForecastChart() {
    loadForecastData();
    // Also reload predicted charts when commodity changes
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    const commodity = forecastCommodityElem ? forecastCommodityElem.value : null;
    if (commodity) {
        loadPredictedAnalytics(commodity);
    }
}

async function updatePrediction() {
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    const forecastDateElem = document.getElementById('forecastDate');
    const forecastMarketElem = document.getElementById('forecastMarket');
    const predictionValueElem = document.getElementById('predictionValue');
    
    if (!forecastCommodityElem || !forecastDateElem || !forecastMarketElem || !predictionValueElem) {
        console.error('ERROR: Required prediction elements not found');
        return;
    }
    
    const commodity = forecastCommodityElem.value;
    const date = forecastDateElem.value;
    const market = forecastMarketElem.value;
    
    if (!commodity || !date) {
        predictionValueElem.textContent = 'Select a commodity and date';
        return;
    }
    
    if (USE_MOCK_DATA) {
        const selectedDate = new Date(date);
        const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const prediction = MOCK_DATA.forecast.predicted.find(d => d.date === monthYear);
        if (prediction) {
            predictionValueElem.innerHTML = `
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">₹${prediction.price.toFixed(2)}</div>
                <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">Predicted price for ${commodity} in ${market}</div>
            `;
        } else {
            predictionValueElem.textContent = 'No prediction for this date';
        }
    } else {
        try {
            predictionValueElem.textContent = 'Loading...';
            
            // Fetch price for specific date and market
            const response = await fetch(`${API_BASE_URL}/api/price-for-date/${encodeURIComponent(commodity)}?date=${date}&market=${encodeURIComponent(market)}`);
            const data = await response.json();
            
            if (response.ok) {
                // Display price with appropriate message
                if (data.status === 'historical') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">₹${data.price}</div>
                        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">${data.message}</div>
                    `;
                } else if (data.status === 'historical_nearest') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">₹${data.price}</div>
                        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">${data.message}</div>
                    `;
                } else if (data.status === 'predicted') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 24px; font-weight: bold; color: #10b981;">₹${data.price}</div>
                        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">${data.message}</div>
                    `;
                } else if (data.status === 'predicted_nearest') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 24px; font-weight: bold; color: #10b981;">₹${data.price}</div>
                        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">${data.message}</div>
                    `;
                } else if (data.status === 'not_available') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 14px; color: #f59e0b;">⚠️ ${data.message}</div>
                    `;
                } else if (data.status === 'future') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 14px; color: #8b5cf6;">🔮 ${data.message}</div>
                    `;
                } else if (data.status === 'no_data') {
                    predictionValueElem.innerHTML = `
                        <div style="font-size: 14px; color: #ef4444;">❌ ${data.message}</div>
                    `;
                }
            } else {
                predictionValueElem.textContent = data.error || 'Error loading prediction';
            }
        } catch (error) {
            console.error('Error fetching prediction:', error);
            predictionValueElem.textContent = 'Error loading prediction';
        }
    }
}

// Handle window resize for responsive charts
window.addEventListener('resize', () => {
    Plotly.Plots.resize('commodityPieChart');
    Plotly.Plots.resize('priceLineChart');
    Plotly.Plots.resize('priceBarChart');
    Plotly.Plots.resize('candlestickChart');
    Plotly.Plots.resize('historicalCalendarChart');
    if (forecastModal.classList.contains('active')) {
        Plotly.Plots.resize('forecastChart');
        Plotly.Plots.resize('seasonalityChart');
        Plotly.Plots.resize('uncertaintyChart');
        Plotly.Plots.resize('forecastCalendarChart');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (forecastModal && forecastModal.classList.contains('active')) {
            closeForecastModal();
        }
        // Close KPI detail modals
        closeKpiDetailModal();
    }
});

// KPI Detail Modal Functions
function openKpiDetailModal(type) {
    console.log('Opening KPI detail modal:', type);
    
    if (type === 'markets') {
        showMarketsDetail();
    } else if (type === 'price') {
        showPriceDetail();
    } else if (type === 'commodities') {
        showCommoditiesDetail();
    }
}

function closeKpiDetailModal() {
    document.querySelectorAll('.kpi-detail-modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Make closeKpiDetailModal available globally for onclick handlers
window.closeKpiDetailModal = closeKpiDetailModal;

async function showMarketsDetail() {
    const modal = document.getElementById('marketsDetailModal');
    const content = document.getElementById('marketsDetailContent');
    
    // Get selected markets from checkboxes
    const checkboxes = marketCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked');
    const selectedMarkets = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedMarkets.length === 0) {
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No markets selected</div>';
    } else {
        content.innerHTML = selectedMarkets.map(market => `
            <div class="detail-list-item">
                <span class="detail-list-item-name">${market}</span>
                <span class="detail-list-item-badge">Selected</span>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

async function showPriceDetail() {
    const modal = document.getElementById('priceDetailModal');
    const content = document.getElementById('priceDetailContent');
    
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading price details...</div>';
    modal.classList.add('active');
    
    try {
        const filterQuery = buildFilterQuery();
        const queryString = filterQuery ? `?${filterQuery}` : '';
        const response = await fetch(`${API_BASE_URL}/api/price-details${queryString}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            content.innerHTML = `
                <div class="detail-grid">
                    ${data.slice(0, 20).map(item => `
                        <div class="detail-item">
                            <div class="detail-item-title">${item.commodity} - ${item.market}</div>
                            <div class="detail-item-value">₹${item.avg_price.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No price data available</div>';
        }
    } catch (error) {
        console.error('Error loading price details:', error);
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading price details</div>';
    }
}

async function showCommoditiesDetail() {
    const modal = document.getElementById('commoditiesDetailModal');
    const content = document.getElementById('commoditiesDetailContent');
    
    // Get selected commodities from checkboxes
    const checkboxes = commodityCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked');
    const selectedCommodities = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedCommodities.length === 0) {
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No commodities selected</div>';
    } else {
        content.innerHTML = selectedCommodities.map(commodity => `
            <div class="detail-list-item">
                <span class="detail-list-item-name">${commodity}</span>
                <span class="detail-list-item-badge">Selected</span>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

// Dynamic Commodity Filtering Based on Market
async function fetchCommoditiesForMarket(market) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/market-commodities/${encodeURIComponent(market)}`);
        const data = await response.json();
        return data.commodities || [];
    } catch (error) {
        console.error(`Error fetching commodities for market ${market}:`, error);
        return [];
    }
}

async function updateAnalyticsCommodityFilter(market) {
    console.log('Updating analytics commodity filter for market:', market);
    
    if (!market) {
        // If no market selected, show all commodities
        populateAnalyticsCommodityDropdown();
        return;
    }
    
    const analyticsCommoditySelect = document.getElementById('analyticsCommoditySelect');
    if (!analyticsCommoditySelect) return;
    
    // Check if we have cached data
    if (!marketCommodities[market]) {
        analyticsCommoditySelect.innerHTML = '<option value="">Loading...</option>';
        marketCommodities[market] = await fetchCommoditiesForMarket(market);
    }
    
    const commodities = marketCommodities[market];
    
    // Repopulate with filtered commodities
    analyticsCommoditySelect.innerHTML = '<option value="">Select a commodity...</option>';
    commodities.forEach(commodity => {
        const option = document.createElement('option');
        option.value = commodity;
        option.textContent = commodity;
        analyticsCommoditySelect.appendChild(option);
    });
    
    console.log(`✓ Populated ${commodities.length} commodities for market ${market}`);
}

async function updateForecastCommodityFilter(market) {
    console.log('Updating forecast commodity filter for market:', market);
    
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    if (!forecastCommodityElem) return;
    
    try {
        forecastCommodityElem.innerHTML = '<option value="">Loading...</option>';
        
        // Fetch commodities from prediction database filtered by market
        const url = market 
            ? `${API_BASE_URL}/api/prediction-commodities?market=${encodeURIComponent(market)}`
            : `${API_BASE_URL}/api/prediction-commodities`;
        
        const response = await fetch(url);
        const commodities = await response.json();
        
        // Repopulate with filtered commodities
        forecastCommodityElem.innerHTML = '';
        
        if (commodities && commodities.length > 0) {
            commodities.forEach((commodity, index) => {
                const option = document.createElement('option');
                option.value = commodity;
                option.textContent = commodity;
                if (index === 0) option.selected = true;
                forecastCommodityElem.appendChild(option);
            });
            console.log(`✓ Populated ${commodities.length} forecast commodities for market ${market || 'All'}`);
        } else {
            forecastCommodityElem.innerHTML = '<option value="">No predictions available for this market</option>';
            console.log('No commodities available for market:', market);
        }
    } catch (error) {
        console.error('Error updating forecast commodity filter:', error);
        forecastCommodityElem.innerHTML = '<option value="">Error loading commodities</option>';
    }
}

// Load historical analytics charts for selected market and commodity (main dashboard)
async function loadHistoricalAnalytics(market, commodity) {
    console.log('Loading historical analytics for:', market, commodity);

    // Show loading state
    const chartIds = ['candlestickChart', 'historicalCalendarChart'];
    chartIds.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading...</div>';
        }
    });

    // Load historical charts
    await Promise.all([
        loadCandlestickChart(commodity, market),
        loadHistoricalCalendar(commodity, market)
    ]);
}

// Load predicted analytics charts for selected commodity (forecast modal)
async function loadPredictedAnalytics(commodity) {
    console.log('=== Loading Predicted Analytics ===');
    console.log('Commodity:', commodity);
    
    // Verify modal is open
    if (!forecastModal.classList.contains('active')) {
        console.warn('WARNING: Modal is not open!');
    }
    
    // Show loading state
    const chartIds = ['seasonalityChart', 'uncertaintyChart', 'forecastCalendarChart'];
    chartIds.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            console.log(`  Found element: ${id}`);
            elem.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading...</div>';
        } else {
            console.error(`  ERROR: Element not found: ${id}`);
        }
    });
    
    console.log('Starting parallel chart loading...');
    
    // Load predicted charts
    try {
        await Promise.all([
            loadSeasonalityChart(commodity),
            loadUncertaintyChart(commodity),
            loadForecastCalendar(commodity)
        ]);
        console.log('✓ All predicted charts loaded successfully');
    } catch (error) {
        console.error('ERROR loading predicted charts:', error);
    }
    
    console.log('=== Finished Loading Predicted Analytics ===\n');
}

// Load all analytics charts for selected commodity (legacy function - now split)
async function loadAdvancedAnalytics(commodity) {
    await Promise.all([
        loadHistoricalAnalytics(commodity),
        loadPredictedAnalytics(commodity)
    ]);
}

// 1. Candlestick Chart (Historical Price Volatility)
async function loadCandlestickChart(commodity, market = 'Udumalpet') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/candlestick-data/${encodeURIComponent(commodity)}?market=${encodeURIComponent(market)}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const trace = {
                x: result.data.map(d => d.date),
                close: result.data.map(d => d.modal),
                high: result.data.map(d => d.max),
                low: result.data.map(d => d.min),
                open: result.data.map(d => d.modal),
                type: 'candlestick',
                name: 'Price',
                increasing: { line: { color: '#10b981' } },
                decreasing: { line: { color: '#ef4444' } },
                hovertemplate: '<b>%{x}</b><br>High: ₹%{high:.2f}<br>Low: ₹%{low:.2f}<br>Price: ₹%{close:.2f}<extra></extra>'
            };
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Date', font: { size: 14, color: colors.text } },
                    rangeslider: { visible: false },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 50, r: 30, t: 30, b: 50 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text }
            };
            
            document.getElementById('candlestickChart').innerHTML = '';
            Plotly.newPlot('candlestickChart', [trace], layout, { responsive: true });
        } else {
            document.getElementById('candlestickChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No data available</div>';
        }
    } catch (error) {
        console.error('Error loading candlestick chart:', error);
        document.getElementById('candlestickChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// 2. Historical Calendar Heatmap
async function loadHistoricalCalendar(commodity, market = 'Udumalpet') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/historical-calendar/${encodeURIComponent(commodity)}?market=${encodeURIComponent(market)}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const dates = result.data.map(d => d.date);
            const prices = result.data.map(d => d.price);
            
            // Group by year and day of year for calendar view
            const trace = {
                x: dates,
                y: prices,
                type: 'scatter',
                mode: 'markers',
                marker: {
                    size: 8,
                    color: prices,
                    colorscale: 'Viridis',
                    showscale: true,
                    colorbar: { title: 'Price (₹)' }
                },
                hovertemplate: '<b>%{x}</b><br>Price: ₹%{y:.2f}<extra></extra>'
            };
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Date', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 50, r: 30, t: 30, b: 50 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text }
            };
            
            document.getElementById('historicalCalendarChart').innerHTML = '';
            Plotly.newPlot('historicalCalendarChart', [trace], layout, { responsive: true });
        } else {
            document.getElementById('historicalCalendarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No data available</div>';
        }
    } catch (error) {
        console.error('Error loading historical calendar:', error);
        document.getElementById('historicalCalendarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// 3. Seasonality & Trend Decomposition
async function loadSeasonalityChart(commodity) {
    const forecastMarketElem = document.getElementById('forecastMarket');
    const market = forecastMarketElem ? forecastMarketElem.value : 'Udumalpet';
    try {
        const response = await fetch(`${API_BASE_URL}/api/seasonality-decomposition/${encodeURIComponent(commodity)}?market=${encodeURIComponent(market)}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const dates = result.data.map(d => d.date);
            
            const traces = [];
            
            // Trend
            if (result.data[0].trend !== undefined) {
                traces.push({
                    x: dates,
                    y: result.data.map(d => d.trend),
                    type: 'scatter',
                    name: 'Trend',
                    line: { color: '#3b82f6', width: 2 }
                });
            }
            
            // Yearly Seasonality
            if (result.data[0].yearly_seasonality !== undefined) {
                traces.push({
                    x: dates,
                    y: result.data.map(d => d.yearly_seasonality),
                    type: 'scatter',
                    name: 'Yearly Seasonality',
                    line: { color: '#10b981', width: 2 }
                });
            }
            
            // Weekly Seasonality
            if (result.data[0].weekly_seasonality !== undefined) {
                traces.push({
                    x: dates,
                    y: result.data.map(d => d.weekly_seasonality),
                    type: 'scatter',
                    name: 'Weekly Seasonality',
                    line: { color: '#f59e0b', width: 2 }
                });
            }
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Date', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Value', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 50, r: 30, t: 30, b: 50 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                showlegend: true,
                legend: { x: 0.5, xanchor: 'center', y: 1.1, orientation: 'h', font: { color: colors.text } }
            };
            
            document.getElementById('seasonalityChart').innerHTML = '';
            Plotly.newPlot('seasonalityChart', traces, layout, { responsive: true });
        } else {
            document.getElementById('seasonalityChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No prediction data available</div>';
        }
    } catch (error) {
        console.error('Error loading seasonality chart:', error);
        document.getElementById('seasonalityChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// 4. Forecast with Confidence Intervals
async function loadUncertaintyChart(commodity) {
    const forecastMarketElem = document.getElementById('forecastMarket');
    const market = forecastMarketElem ? forecastMarketElem.value : 'Udumalpet';
    try {
        const response = await fetch(`${API_BASE_URL}/api/forecast-uncertainty/${encodeURIComponent(commodity)}?market=${encodeURIComponent(market)}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const dates = result.data.map(d => d.date);
            const predicted = result.data.map(d => d.predicted);
            const lower = result.data.map(d => d.lower);
            const upper = result.data.map(d => d.upper);
            
            const traces = [
                {
                    x: dates,
                    y: upper,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Upper Bound',
                    line: { width: 0 },
                    showlegend: false,
                    hoverinfo: 'skip'
                },
                {
                    x: dates,
                    y: lower,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Lower Bound',
                    fill: 'tonexty',
                    fillcolor: 'rgba(59, 130, 246, 0.2)',
                    line: { width: 0 },
                    showlegend: false,
                    hoverinfo: 'skip'
                },
                {
                    x: dates,
                    y: predicted,
                    type: 'scatter',
                    name: 'Predicted Price',
                    line: { color: '#3b82f6', width: 2 }
                }
            ];
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Date', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 50, r: 30, t: 30, b: 50 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                showlegend: true,
                legend: { x: 0.5, xanchor: 'center', y: 1.1, orientation: 'h', font: { color: colors.text } }
            };
            
            document.getElementById('uncertaintyChart').innerHTML = '';
            Plotly.newPlot('uncertaintyChart', traces, layout, { responsive: true });
        } else {
            document.getElementById('uncertaintyChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No prediction data available</div>';
        }
    } catch (error) {
        console.error('Error loading uncertainty chart:', error);
        document.getElementById('uncertaintyChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// 5. Forecast Calendar Heatmap
async function loadForecastCalendar(commodity) {
    const forecastMarketElem = document.getElementById('forecastMarket');
    const market = forecastMarketElem ? forecastMarketElem.value : 'Udumalpet';
    try {
        const response = await fetch(`${API_BASE_URL}/api/forecast-calendar/${encodeURIComponent(commodity)}?market=${encodeURIComponent(market)}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const dates = result.data.map(d => d.date);
            const prices = result.data.map(d => d.price);
            
            const trace = {
                x: dates,
                y: prices,
                type: 'scatter',
                mode: 'markers',
                marker: {
                    size: 8,
                    color: prices,
                    colorscale: 'RdYlGn',
                    showscale: true,
                    colorbar: { title: 'Predicted Price (₹)' }
                },
                text: prices.map(p => `₹${p}`),
                hovertemplate: '%{x}<br>₹%{y:.2f}<extra></extra>'
            };
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Date', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Predicted Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 50, r: 30, t: 30, b: 50 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                height: 400
            };
            
            document.getElementById('forecastCalendarChart').innerHTML = '';
            Plotly.newPlot('forecastCalendarChart', [trace], layout, { responsive: true });
        } else {
            document.getElementById('forecastCalendarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No prediction data available</div>';
        }
    } catch (error) {
        console.error('Error loading forecast calendar:', error);
        document.getElementById('forecastCalendarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// ============================================
// NEW FEATURES - PLAN0 IMPLEMENTATION
// ============================================

// Current active tab
let currentTab = 'overview';

// Tab Navigation Functions
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update panel visibility
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`)?.classList.add('active');
    
    // Load data for the active tab
    loadTabData(tabName);
}

async function loadTabData(tabName) {
    try {
        switch(tabName) {
            case 'historical':
                await initializeHistoricalFilters();
                await loadHistoricalAnalysisData();
                break;
            case 'comparisons':
                await loadComparisonsData();
                break;
            case 'predictions':
                // Auto-open forecast modal when Predictions tab is clicked
                setTimeout(() => {
                    const showForecastBtn = document.getElementById('showForecastBtn');
                    if (showForecastBtn) {
                        showForecastBtn.click();
                    }
                }, 300);
                break;
            case 'overview':
            default:
                // Overview data is already loaded
                break;
        }
    } catch (error) {
        console.error(`Error loading ${tabName} tab data:`, error);
    }
}

// Filter Chips Management
function renderFilterChips() {
    const container = document.getElementById('filterChipsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const chips = [];
    
    // State filter
    const stateSelect = document.getElementById('stateFilter');
    if (stateSelect && stateSelect.value && stateSelect.value !== 'All') {
        chips.push(createFilterChip('State', stateSelect.value, 'state'));
    }
    
    // Market filters
    const marketCheckboxes = document.querySelectorAll('#marketCheckboxContainer input[type="checkbox"]:checked');
    if (marketCheckboxes.length > 0 && marketCheckboxes.length < document.querySelectorAll('#marketCheckboxContainer input[type="checkbox"]').length) {
        const marketNames = Array.from(marketCheckboxes).map(cb => cb.value);
        if (marketNames.length <= 3) {
            marketNames.forEach(name => {
                chips.push(createFilterChip('Market', name, 'market', name));
            });
        } else {
            chips.push(createFilterChip('Markets', `${marketNames.length} selected`, 'markets'));
        }
    }
    
    // Commodity filters
    const commodityCheckboxes = document.querySelectorAll('#commodityCheckboxContainer input[type="checkbox"]:checked');
    if (commodityCheckboxes.length > 0 && commodityCheckboxes.length < document.querySelectorAll('#commodityCheckboxContainer input[type="checkbox"]').length) {
        const commodityNames = Array.from(commodityCheckboxes).map(cb => cb.value);
        if (commodityNames.length <= 3) {
            commodityNames.forEach(name => {
                chips.push(createFilterChip('Commodity', name, 'commodity', name));
            });
        } else {
            chips.push(createFilterChip('Commodities', `${commodityNames.length} selected`, 'commodities'));
        }
    }
    
    // Date range filters
    const startDateElem = document.getElementById('startDate');
    const endDateElem = document.getElementById('endDate');
    if (startDateElem && startDateElem.value) {
        chips.push(createFilterChip('Start Date', startDateElem.value, 'startDate'));
    }
    if (endDateElem && endDateElem.value) {
        chips.push(createFilterChip('End Date', endDateElem.value, 'endDate'));
    }
    
    chips.forEach(chip => container.appendChild(chip));
}

function createFilterChip(type, value, filterType, specificValue = null) {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    
    const label = document.createElement('span');
    label.className = 'filter-chip-label';
    label.textContent = `${type}: ${value}`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'filter-chip-remove';
    removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    removeBtn.onclick = () => removeFilterChip(filterType, specificValue);
    
    chip.appendChild(label);
    chip.appendChild(removeBtn);
    
    return chip;
}

function removeFilterChip(filterType, specificValue) {
    switch(filterType) {
        case 'state':
            document.getElementById('stateFilter').value = 'All';
            break;
        case 'market':
            const marketCheckbox = document.querySelector(`#marketCheckboxContainer input[value="${specificValue}"]`);
            if (marketCheckbox) {
                marketCheckbox.checked = false;
                marketCheckbox.closest('.checkbox-item')?.classList.remove('checked');
            }
            updateMarketSelectedCount();
            break;
        case 'markets':
            document.getElementById('clearAllMarkets')?.click();
            break;
        case 'commodity':
            const commodityCheckbox = document.querySelector(`#commodityCheckboxContainer input[value="${specificValue}"]`);
            if (commodityCheckbox) {
                commodityCheckbox.checked = false;
                commodityCheckbox.closest('.checkbox-item')?.classList.remove('checked');
            }
            updateSelectedCount();
            break;
        case 'commodities':
            document.getElementById('clearAllCommodities')?.click();
            break;
        case 'startDate':
            document.getElementById('startDate').value = '';
            break;
        case 'endDate':
            document.getElementById('endDate').value = '';
            break;
    }
    
    renderFilterChips();
    loadData();
}

// Data Quality Indicator
async function updateDataQualityIndicator() {
    try {
        const queryParams = buildFilterQuery();
        const response = await fetch(`${API_BASE_URL}/api/data-quality?${queryParams}`);
        const data = await response.json();
        
        const qualityBar = document.getElementById('qualityBar');
        const qualityPercentage = document.getElementById('qualityPercentage');
        const qualityDetails = document.getElementById('qualityDetails');
        
        if (data && data.completeness !== undefined) {
            const completeness = Math.round(data.completeness);
            
            qualityBar.style.width = `${completeness}%`;
            qualityPercentage.textContent = `${completeness}% Complete`;
            
            // Set color based on completeness
            qualityBar.className = 'quality-bar';
            if (completeness >= 90) {
                qualityBar.classList.add('quality-high');
            } else if (completeness >= 70) {
                qualityBar.classList.add('quality-medium');
            } else {
                qualityBar.classList.add('quality-low');
            }
            
            if (data.date_range) {
                qualityDetails.textContent = `${data.total_records.toLocaleString()} records from ${data.date_range.min} to ${data.date_range.max}`;
            }
        }
    } catch (error) {
        console.error('Error updating data quality:', error);
        document.getElementById('qualityPercentage').textContent = 'N/A';
    }
}
// NEW CHART RENDERING FUNCTIONS - Part 2
// This file contains additional functions to be appended to app.js

// Historical Analysis Filters
let historicalFilters = {
    state: '',
    market: '',
    commodity: '',
    startDate: '',
    endDate: ''
};

async function updateHistoricalMarkets() {
    const stateSelect = document.getElementById('historicalStateFilter');
    const marketSelect = document.getElementById('historicalMarketFilter');
    if (!marketSelect) return;
    
    const selectedState = stateSelect?.value || '';
    const url = selectedState 
        ? `${API_BASE_URL}/api/markets?state=${encodeURIComponent(selectedState)}`
        : `${API_BASE_URL}/api/markets`;
    
    try {
        const response = await fetch(url);
        const markets = await response.json();
        
        marketSelect.innerHTML = '<option value="">All Markets</option>';
        markets.forEach(market => {
            const option = document.createElement('option');
            option.value = market;
            option.textContent = market;
            marketSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error updating historical markets:', error);
    }
}

async function updateHistoricalCommodities() {
    const stateSelect = document.getElementById('historicalStateFilter');
    const marketSelect = document.getElementById('historicalMarketFilter');
    const commoditySelect = document.getElementById('historicalCommodityFilter');
    if (!commoditySelect) return;
    
    const selectedState = stateSelect?.value || '';
    const selectedMarket = marketSelect?.value || '';
    
    let url = `${API_BASE_URL}/api/commodities?`;
    if (selectedState) url += `state=${encodeURIComponent(selectedState)}&`;
    if (selectedMarket) url += `market=${encodeURIComponent(selectedMarket)}&`;
    
    try {
        const response = await fetch(url);
        const commodities = await response.json();
        
        commoditySelect.innerHTML = '<option value="">All Commodities</option>';
        commodities.forEach(commodity => {
            const option = document.createElement('option');
            option.value = commodity;
            option.textContent = commodity;
            commoditySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error updating historical commodities:', error);
    }
}

async function initializeHistoricalFilters() {
    try {
        // Populate state filter
        const statesResponse = await fetch(`${API_BASE_URL}/api/states`);
        const states = await statesResponse.json();
        const stateSelect = document.getElementById('historicalStateFilter');
        if (stateSelect) {
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        }

        // Populate market and commodity filters
        await updateHistoricalMarkets();
        await updateHistoricalCommodities();

        // Set default dates (last year)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        
        const historicalStartDate = document.getElementById('historicalStartDate');
        const historicalEndDate = document.getElementById('historicalEndDate');
        if (historicalStartDate) historicalStartDate.value = startDate.toISOString().split('T')[0];
        if (historicalEndDate) historicalEndDate.value = endDate.toISOString().split('T')[0];

        // Add cascading filter listeners
        document.getElementById('historicalStateFilter')?.addEventListener('change', async () => {
            await updateHistoricalMarkets();
            await updateHistoricalCommodities();
        });
        
        document.getElementById('historicalMarketFilter')?.addEventListener('change', async () => {
            await updateHistoricalCommodities();
        });

        // Add event listeners
        document.getElementById('historicalApplyBtn')?.addEventListener('click', applyHistoricalFilters);
        document.getElementById('historicalResetBtn')?.addEventListener('click', resetHistoricalFilters);
    } catch (error) {
        console.error('Error initializing historical filters:', error);
    }
}

function applyHistoricalFilters() {
    historicalFilters.state = document.getElementById('historicalStateFilter')?.value || '';
    historicalFilters.market = document.getElementById('historicalMarketFilter')?.value || '';
    historicalFilters.commodity = document.getElementById('historicalCommodityFilter')?.value || '';
    historicalFilters.startDate = document.getElementById('historicalStartDate')?.value || '';
    historicalFilters.endDate = document.getElementById('historicalEndDate')?.value || '';
    
    loadHistoricalAnalysisData();
}

async function resetHistoricalFilters() {
    document.getElementById('historicalStateFilter').value = '';
    document.getElementById('historicalMarketFilter').value = '';
    document.getElementById('historicalCommodityFilter').value = '';
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    document.getElementById('historicalStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('historicalEndDate').value = endDate.toISOString().split('T')[0];
    
    historicalFilters = { state: '', market: '', commodity: '', startDate: '', endDate: '' };
    
    // Reset cascading filters
    await updateHistoricalMarkets();
    await updateHistoricalCommodities();
    
    loadHistoricalAnalysisData();
}

function buildHistoricalFilterQuery() {
    const params = new URLSearchParams();
    
    if (historicalFilters.state) params.append('states', historicalFilters.state);
    if (historicalFilters.market) params.append('markets', historicalFilters.market);
    if (historicalFilters.commodity) params.append('commodities', historicalFilters.commodity);
    if (historicalFilters.startDate) params.append('start_date', historicalFilters.startDate);
    if (historicalFilters.endDate) params.append('end_date', historicalFilters.endDate);
    
    return params.toString();
}

// Historical Analysis Data Loading
async function loadHistoricalAnalysisData() {
    try {
        await Promise.all([
            renderYoYComparisonChart(),
            renderVolatilityHeatmap(),
            renderSeasonalRadarChart(),
            renderViolinPlot()
        ]);
    } catch (error) {
        console.error('Error loading historical analysis data:', error);
    }
}

// Year-over-Year Comparison Chart
async function renderYoYComparisonChart() {
    try {
        const queryParams = buildHistoricalFilterQuery();
        
        // Use selected commodity or default to Onion
        const commodity = historicalFilters.commodity || 'Onion';
        
        const response = await fetch(`${API_BASE_URL}/api/year-over-year/${encodeURIComponent(commodity)}?${queryParams}`);
        const data = await response.json();
        
        if (data && data.years && data.years.length > 0) {
            const traces = data.years.map(yearData => ({
                x: yearData.months.map(m => m.month),
                y: yearData.months.map(m => m.price), // Can contain null values
                type: 'scatter',
                mode: 'lines+markers',
                name: yearData.year,
                line: { width: 2 },
                marker: { size: 6 },
                connectgaps: false // Don't connect across missing months
            }));
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Month', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Average Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 60, r: 30, t: 30, b: 60 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                showlegend: true,
                legend: { x: 1, xanchor: 'right', y: 1, font: { color: colors.text } },
                hovermode: 'x unified'
            };
            
            document.getElementById('yoyComparisonChart').innerHTML = '';
            Plotly.newPlot('yoyComparisonChart', traces, layout, { responsive: true });
        } else {
            document.getElementById('yoyComparisonChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No data available for year-over-year comparison</div>';
        }
    } catch (error) {
        console.error('Error rendering YoY chart:', error);
        document.getElementById('yoyComparisonChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// Price Volatility Heatmap
async function renderVolatilityHeatmap() {
    try {
        const queryParams = buildHistoricalFilterQuery();
        const response = await fetch(`${API_BASE_URL}/api/volatility-heatmap?${queryParams}`);
        const data = await response.json();
        
        if (data && data.commodities && data.markets && data.volatility) {
            const trace = {
                x: data.commodities,
                y: data.markets,
                z: data.volatility,
                type: 'heatmap',
                colorscale: 'RdYlGn',
                reversescale: true,
                hovertemplate: 'Commodity: %{x}<br>Market: %{y}<br>Volatility: ₹%{z:.2f}<extra></extra>',
                colorbar: {
                    title: 'Volatility (₹)',
                    titlefont: { color: getThemeColors().text }
                }
            };
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Commodity', font: { size: 14, color: colors.text } },
                    tickfont: { size: 10, color: colors.text },
                    tickangle: -45
                },
                yaxis: { 
                    title: { text: 'Market', font: { size: 14, color: colors.text } },
                    tickfont: { size: 10, color: colors.text }
                },
                margin: { l: 100, r: 80, t: 30, b: 100 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                hoverlabel: getHoverLabelStyle()
            };
            
            document.getElementById('volatilityHeatmapChart').innerHTML = '';
            Plotly.newPlot('volatilityHeatmapChart', [trace], layout, { responsive: true });
        } else {
            document.getElementById('volatilityHeatmapChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No volatility data available</div>';
        }
    } catch (error) {
        console.error('Error rendering volatility heatmap:', error);
        document.getElementById('volatilityHeatmapChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// Seasonal Radar Chart
async function renderSeasonalRadarChart() {
    try {
        const queryParams = buildHistoricalFilterQuery();
        
        // Use selected commodity or defaults
        let commoditiesParam;
        let firstCommodity;
        
        if (historicalFilters.commodity) {
            // If commodity is selected, use it
            commoditiesParam = historicalFilters.commodity;
            firstCommodity = historicalFilters.commodity;
        } else {
            // Use top commodities as defaults
            const defaultCommodities = ['Onion', 'Tomato', 'Potato', 'Coconut'];
            commoditiesParam = defaultCommodities.join(',');
            firstCommodity = defaultCommodities[0];
        }
        
        const url = `${API_BASE_URL}/api/seasonal-pattern/${encodeURIComponent(firstCommodity)}?commodities=${encodeURIComponent(commoditiesParam)}&${queryParams}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const colors = getThemeColors();
        let traces = [];
        
        // Handle multi-commodity response
        if (data.commodities && Array.isArray(data.commodities)) {
            traces = data.commodities.map((item, idx) => {
                const colorPalette = ['rgba(99, 102, 241, 0.6)', 'rgba(139, 92, 246, 0.6)', 'rgba(236, 72, 153, 0.6)', 'rgba(244, 63, 94, 0.6)'];
                return {
                    type: 'scatterpolar',
                    r: item.prices,
                    theta: item.months.map(m => monthNames[m - 1]),
                    fill: 'toself',
                    name: item.name,
                    line: { width: 2 },
                    marker: { size: 6 },
                    fillcolor: colorPalette[idx % colorPalette.length]
                };
            });
        } 
        // Handle single commodity response (backward compatible)
        else if (data.months && data.prices) {
            traces = [{
                type: 'scatterpolar',
                r: data.prices,
                theta: data.months.map(m => monthNames[m - 1]),
                fill: 'toself',
                name: firstCommodity,
                line: { color: '#6366f1', width: 2 },
                marker: { size: 8 },
                fillcolor: 'rgba(99, 102, 241, 0.4)'
            }];
        }
        
        if (traces.length > 0) {
            const layout = {
                polar: {
                    bgcolor: colors.bgColor,
                    radialaxis: {
                        visible: true,
                        gridcolor: colors.gridColor,
                        tickfont: { color: colors.text }
                    },
                    angularaxis: {
                        gridcolor: colors.gridColor,
                        tickfont: { color: colors.text }
                    }
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                showlegend: traces.length > 1,
                legend: traces.length > 1 ? { x: 0.5, xanchor: 'center', y: -0.1, orientation: 'h', font: { color: colors.text } } : undefined,
                margin: { l: 60, r: 60, t: 40, b: traces.length > 1 ? 80 : 40 }
            };
            
            document.getElementById('seasonalRadarChart').innerHTML = '';
            Plotly.newPlot('seasonalRadarChart', traces, layout, { responsive: true });
        } else {
            document.getElementById('seasonalRadarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No seasonal data available</div>';
        }
    } catch (error) {
        console.error('Error rendering seasonal radar:', error);
        document.getElementById('seasonalRadarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// Price Distribution Violin Plot
async function renderViolinPlot() {
    try {
        const queryParams = buildHistoricalFilterQuery();
        
        // Use selected commodity or defaults
        let commoditiesParam;
        if (historicalFilters.commodity) {
            commoditiesParam = historicalFilters.commodity;
        } else {
            const defaultCommodities = ['Onion', 'Tomato', 'Potato', 'Coconut', 'Banana'];
            commoditiesParam = defaultCommodities.join(',');
        }
        
        const response = await fetch(`${API_BASE_URL}/api/price-distribution?commodities=${encodeURIComponent(commoditiesParam)}&${queryParams}`);
        const data = await response.json();
        
        if (data && data.commodities && data.commodities.length > 0) {
            const traces = data.commodities.map(item => ({
                type: 'violin',
                y: item.prices,
                name: item.name,
                box: { visible: true, width: 0.1 },
                meanline: { visible: true },
                points: false,
                hoverinfo: 'y+name',
                hovertemplate: '<b>%{fullData.name}</b><br>Price: ₹%{y:,.2f}<extra></extra>'
            }));
            
            const colors = getThemeColors();
            const layout = {
                title: '',
                yaxis: { 
                    title: { text: 'Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                xaxis: {
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 60, r: 30, t: 30, b: 80 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                showlegend: false,
                hoverlabel: getHoverLabelStyle()
            };
            
            document.getElementById('violinPlotChart').innerHTML = '';
            Plotly.newPlot('violinPlotChart', traces, layout, { responsive: true });
        } else {
            document.getElementById('violinPlotChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No distribution data available</div>';
        }
    } catch (error) {
        console.error('Error rendering violin plot:', error);
        document.getElementById('violinPlotChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// Comparisons Data Loading
async function loadComparisonsData() {
    try {
        // Initialize comparison date filters
        initializeComparisonDateFilters();
        
        await Promise.all([
            populateComparisonCommoditySelector(),
            renderMarketScorecard()
        ]);
    } catch (error) {
        console.error('Error loading comparisons data:', error);
    }
}

// Initialize comparison date filters
function initializeComparisonDateFilters() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const comparisonStartDate = document.getElementById('comparisonStartDate');
    const comparisonEndDate = document.getElementById('comparisonEndDate');
    
    if (comparisonStartDate) comparisonStartDate.value = startDate.toISOString().split('T')[0];
    if (comparisonEndDate) comparisonEndDate.value = endDate.toISOString().split('T')[0];
    
    // Add event listeners
    document.getElementById('comparisonApplyBtn')?.addEventListener('click', applyComparisonDateFilter);
    document.getElementById('comparisonResetBtn')?.addEventListener('click', resetComparisonDateFilter);
}

function applyComparisonDateFilter() {
    // Re-render the comparison chart with new date range
    renderMultiCommodityComparison();
}

function resetComparisonDateFilter() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    document.getElementById('comparisonStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('comparisonEndDate').value = endDate.toISOString().split('T')[0];
    
    // Re-render the comparison chart
    renderMultiCommodityComparison();
}

// Populate Commodity Selector for Comparison (only commodities with sufficient data)
async function populateComparisonCommoditySelector() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/comparison-commodities`);
        const data = await response.json();
        
        const container = document.getElementById('comparisonCommoditySelector');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (data && Array.isArray(data) && data.length > 0) {
            data.forEach(commodity => {
                const item = document.createElement('div');
                item.className = 'checkbox-item';
                
                const safeId = `comp-${commodity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = safeId;
                checkbox.value = commodity;
                checkbox.addEventListener('change', handleComparisonCommodityChange);
                
                const label = document.createElement('label');
                label.htmlFor = safeId;
                label.textContent = commodity;
                
                item.appendChild(checkbox);
                item.appendChild(label);
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No commodities available for comparison</div>';
        }
    } catch (error) {
        console.error('Error populating comparison selector:', error);
        const container = document.getElementById('comparisonCommoditySelector');
        if (container) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #ef4444;">Error loading commodities</div>';
        }
    }
}

function handleComparisonCommodityChange(e) {
    const checked = document.querySelectorAll('#comparisonCommoditySelector input:checked');
    
    // Limit to 4 commodities
    if (checked.length > 4) {
        e.target.checked = false;
        alert('You can compare up to 4 commodities at a time.');
        return;
    }
    
    // Update checkbox item styling
    const item = e.target.closest('.checkbox-item');
    if (e.target.checked) {
        item.classList.add('checked');
    } else {
        item.classList.remove('checked');
    }
    
    // Render comparison chart
    renderMultiCommodityComparison();
}

// Multi-Commodity Comparison Chart
async function renderMultiCommodityComparison() {
    try {
        const selected = Array.from(document.querySelectorAll('#comparisonCommoditySelector input:checked')).map(cb => cb.value);
        
        if (selected.length === 0) {
            document.getElementById('multiCommodityChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Select up to 4 commodities to compare</div>';
            return;
        }
        
        // Build query params with comparison date filter
        const params = new URLSearchParams();
        const startDate = document.getElementById('comparisonStartDate')?.value;
        const endDate = document.getElementById('comparisonEndDate')?.value;
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const commoditiesParam = selected.join(',');
        const response = await fetch(`${API_BASE_URL}/api/multi-commodity-comparison?commodities=${encodeURIComponent(commoditiesParam)}&${params.toString()}`);
        const data = await response.json();
        
        if (data && data.commodities && data.commodities.length > 0) {
            const colors = getThemeColors();
            
            // Combined chart: all commodities on one axis
            const traces = data.commodities.map(item => ({
                x: item.data.map(d => d.date),
                y: item.data.map(d => d.price),
                type: 'scatter',
                mode: 'lines',
                name: item.name,
                line: { width: 2 },
                hovertemplate: '<b>%{fullData.name}</b><br>%{x}<br>Price: ₹%{y:.2f}<extra></extra>'
            }));
            
            const layout = {
                title: '',
                xaxis: { 
                    title: { text: 'Date', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                yaxis: { 
                    title: { text: 'Price (₹)', font: { size: 14, color: colors.text } },
                    gridcolor: colors.gridColor,
                    tickfont: { size: 12, color: colors.text }
                },
                margin: { l: 60, r: 30, t: 30, b: 60 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { family: colors.fontFamily, size: 13, color: colors.text },
                showlegend: true,
                legend: { x: 0.5, xanchor: 'center', y: 1.1, orientation: 'h', font: { color: colors.text } },
                hovermode: 'x unified',
                hoverlabel: getHoverLabelStyle()
            };
            
            document.getElementById('multiCommodityChart').innerHTML = '';
            Plotly.newPlot('multiCommodityChart', traces, layout, { responsive: true });
        } else {
            document.getElementById('multiCommodityChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No comparison data available</div>';
        }
    } catch (error) {
        console.error('Error rendering multi-commodity comparison:', error);
        document.getElementById('multiCommodityChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

// Market Performance Scorecard
let scorecardData = [];
let scorecardSortKey = null;
let scorecardSortAsc = true;

async function renderMarketScorecard() {
    try {
        const queryParams = buildFilterQuery();
        const response = await fetch(`${API_BASE_URL}/api/market-performance?${queryParams}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            scorecardData = data;
            renderScorecardTable();
        } else {
            document.getElementById('marketScorecard').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No market performance data available</div>';
        }
    } catch (error) {
        console.error('Error rendering market scorecard:', error);
        document.getElementById('marketScorecard').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading scorecard</div>';
    }
}

function renderScorecardTable() {
    let sortedData = [...scorecardData];
    
    // Apply sorting if a key is selected
    if (scorecardSortKey) {
        sortedData.sort((a, b) => {
            let valA = a[scorecardSortKey];
            let valB = b[scorecardSortKey];
            
            // Handle string comparison for market names
            if (typeof valA === 'string') {
                return scorecardSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            
            // Numeric comparison
            return scorecardSortAsc ? valA - valB : valB - valA;
        });
    }
    
    let html = '<div class="scorecard-table-container"><table class="scorecard-table">';
    html += '<thead><tr>';
    
    const columns = [
        { key: null, label: 'Rank', sortable: false },
        { key: 'market', label: 'Market', sortable: true },
        { key: 'avg_price', label: 'Avg Price (₹)', sortable: true },
        { key: 'volatility', label: 'Volatility', sortable: true },
        { key: 'commodities', label: 'Commodities', sortable: true },
        { key: 'records', label: 'Records', sortable: true },
        { key: 'freshness', label: 'Freshness (days)', sortable: true }
    ];
    
    columns.forEach(col => {
        const sortIndicator = col.sortable && scorecardSortKey === col.key 
            ? (scorecardSortAsc ? ' ▲' : ' ▼') 
            : '';
        const clickAttr = col.sortable ? `onclick="sortScorecard('${col.key}')" style="cursor: pointer;"` : '';
        html += `<th ${clickAttr}>${col.label}${sortIndicator}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    sortedData.forEach((market, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
        
        const volatilityClass = market.volatility < 500 ? 'metric-good' : market.volatility < 1000 ? 'metric-medium' : 'metric-bad';
        const freshnessClass = market.freshness < 7 ? 'metric-good' : market.freshness < 30 ? 'metric-medium' : 'metric-bad';
        
        html += '<tr class="scorecard-row">';
        html += `<td><span class="scorecard-rank ${rankClass}">${rank}</span></td>`;
        html += `<td><strong>${market.market}</strong></td>`;
        html += `<td>₹${market.avg_price.toFixed(2)}</td>`;
        html += `<td class="scorecard-metric ${volatilityClass}">₹${market.volatility.toFixed(2)}</td>`;
        html += `<td>${market.commodities}</td>`;
        html += `<td>${market.records.toLocaleString()}</td>`;
        html += `<td class="scorecard-metric ${freshnessClass}">${market.freshness}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    document.getElementById('marketScorecard').innerHTML = html;
}

function sortScorecard(key) {
    if (scorecardSortKey === key) {
        scorecardSortAsc = !scorecardSortAsc;
    } else {
        scorecardSortKey = key;
        scorecardSortAsc = true;
    }
    renderScorecardTable();
}


// Helper function to get selected commodities
function getSelectedCommodities() {
    const checkboxes = document.querySelectorAll('#commodityCheckboxContainer input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Update existing loadData to include new features
const originalLoadData = window.loadData;
window.loadData = async function() {
    if (originalLoadData) {
        await originalLoadData();
    }
    renderFilterChips();
    updateDataQualityIndicator();
};

// Initialize new features on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    
    
    // Update filter chips on filter changes
    // Note: State filter cascading is handled in the main initialization above
    // This listener is for filter chips only
    const stateFilterForChips = document.getElementById('stateFilter');
    if (stateFilterForChips) {
        stateFilterForChips.addEventListener('change', () => {
            renderFilterChips();
            updateDataQualityIndicator();
        });
    }
    
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) {
        startDate.addEventListener('change', () => {
            renderFilterChips();
            updateDataQualityIndicator();
        });
    }
    if (endDate) {
        endDate.addEventListener('change', () => {
            renderFilterChips();
            updateDataQualityIndicator();
        });
    }
    
    // Debounced data quality update for checkbox changes
    let dataQualityDebounce;
    function debounceDataQuality() {
        clearTimeout(dataQualityDebounce);
        dataQualityDebounce = setTimeout(() => {
            updateDataQualityIndicator();
        }, 300);
    }
    
    // Add listeners to market checkboxes
    const marketContainer = document.getElementById('marketCheckboxContainer');
    if (marketContainer) {
        marketContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                renderFilterChips();
                debounceDataQuality();
            }
        });
    }
    
    // Add listeners to commodity checkboxes
    const commodityContainer = document.getElementById('commodityCheckboxContainer');
    if (commodityContainer) {
        commodityContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                renderFilterChips();
                debounceDataQuality();
            }
        });
    }
    
    // Small multiples toggle listener
    const smallMultiplesToggle = document.getElementById('smallMultiplesToggle');
    if (smallMultiplesToggle) {
        smallMultiplesToggle.addEventListener('change', () => {
            renderMultiCommodityComparison();
        });
    }
});
