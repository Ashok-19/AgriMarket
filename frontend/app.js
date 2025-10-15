// Configuration
// Auto-detect API URL: use relative path for production (Vercel), localhost for development
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : '';  // Production (Vercel) - use relative paths, backend is served from same domain

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
const forecastChartTitle = document.getElementById('forecastChartTitle');

const analyticsMarketSelect = document.getElementById('analyticsMarketSelect');
const analyticsCommoditySelect = document.getElementById('analyticsCommoditySelect');

const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const dateRangeText = document.getElementById('dateRangeText');

// Store fetched data
let availableStates = [];
let availableCommodities = [];
let availableMarkets = [];
let modelCommodities = [];
let predictionMarkets = []; // Markets available in predictions.db
let marketCommodities = {}; // Store commodities available per market

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initDates();
    await loadInitialData(); // Load dropdown options first (includes analytics dropdown)
    await loadData();
    setupEventListeners();
    // Don't auto-load charts - wait for user to select commodity
});

// Get theme-aware colors for charts
function getThemeColors() {
    const isDark = body.classList.contains('dark-mode');
    return {
        text: isDark ? '#f9fafb' : '#1f2937',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        bgColor: isDark ? '#1e293b' : '#ffffff',
        paperBg: isDark ? 'transparent' : 'transparent'
    };
}

// Date Initialization
function initDates() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    startDate.value = formatDate(oneYearAgo);
    endDate.value = formatDate(today);
    updateDateRangeDisplay();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function updateDateRangeDisplay() {
    if (startDate.value && endDate.value) {
        const start = new Date(startDate.value).toLocaleDateString();
        const end = new Date(endDate.value).toLocaleDateString();
        dateRangeText.textContent = `${start} → ${end}`;
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
    
    // Filter change events
    stateFilter.addEventListener('change', loadData);

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

function populateForecastCommodityFilter() {
    console.log('=== populateForecastCommodityFilter ===');
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    if (!forecastCommodityElem) {
        console.error('ERROR: forecastCommodity element not found in DOM');
        return;
    }
    
    const commoditiesToShow = modelCommodities.length > 0 ? modelCommodities : availableCommodities;
    
    if (!commoditiesToShow || commoditiesToShow.length === 0) {
        console.error('ERROR: No commodities available');
        forecastCommodityElem.innerHTML = '<option value="">No commodities available</option>';
        return;
    }
    
    console.log('Populating with', commoditiesToShow.length, 'commodities');
    forecastCommodityElem.innerHTML = '';
    commoditiesToShow.forEach((commodity, index) => {
        const option = document.createElement('option');
        option.value = commodity;
        option.textContent = commodity;
        if (index === 0) option.selected = true; // Select first one
        forecastCommodityElem.appendChild(option);
    });
    console.log('✓ Successfully populated forecast commodity dropdown with', forecastCommodityElem.options.length, 'options');
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
            family: 'Inter, system-ui, sans-serif'
        },
        hoverinfo: 'label+value+percent'
    }];
    
    const layout = {
        showlegend: false,
        margin: { l: 20, r: 20, t: 20, b: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 14,
            family: 'Inter, system-ui, sans-serif'
        }
    };
    
    const config = { responsive: true, displayModeBar: false };
    
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
        fillcolor: 'rgba(59, 130, 246, 0.2)'
    }];
    
    const layout = {
        xaxis: {
            title: {
                text: 'Year',
                font: { size: 14, color: colors.text, family: 'Inter, system-ui, sans-serif' }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        yaxis: {
            title: {
                text: 'Avg Modal Price',
                font: { size: 14, color: colors.text, family: 'Inter, system-ui, sans-serif' }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        margin: { l: 60, r: 20, t: 20, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 13,
            family: 'Inter, system-ui, sans-serif'
        }
    };
    
    const config = { responsive: true, displayModeBar: false };
    
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
        }
    }];
    
    const layout = {
        xaxis: {
            title: {
                text: 'Avg Modal Price',
                font: { size: 14, color: colors.text, family: 'Inter, system-ui, sans-serif' }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        yaxis: {
            automargin: true,
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        margin: { l: 120, r: 20, t: 20, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 13,
            family: 'Inter, system-ui, sans-serif'
        }
    };
    
    const config = { responsive: true, displayModeBar: false };
    
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
                font: { size: 14, color: colors.text, family: 'Inter, system-ui, sans-serif' }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        yaxis: {
            title: {
                text: 'Modal Price (₹)',
                font: { size: 14, color: colors.text, family: 'Inter, system-ui, sans-serif' }
            },
            gridcolor: colors.gridColor,
            tickfont: { size: 12, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        legend: {
            x: 0,
            y: 1,
            orientation: 'h',
            font: { size: 13, color: colors.text, family: 'Inter, system-ui, sans-serif' }
        },
        margin: { l: 60, r: 20, t: 20, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: colors.text,
            size: 13,
            family: 'Inter, system-ui, sans-serif'
        }
    };
    
    const config = { responsive: true, displayModeBar: false };
    
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
    
    if (!market) {
        // If no market selected, show all model commodities
        populateForecastCommodityFilter();
        return;
    }
    
    const forecastCommodityElem = document.getElementById('forecastCommodity');
    if (!forecastCommodityElem) return;
    
    // Check if we have cached data
    if (!marketCommodities[market]) {
        forecastCommodityElem.innerHTML = '<option value="">Loading...</option>';
        marketCommodities[market] = await fetchCommoditiesForMarket(market);
    }
    
    const commodities = marketCommodities[market];
    
    // Filter to only show commodities that have models (intersection with modelCommodities)
    const availableModelCommodities = commodities.filter(c => modelCommodities.includes(c));
    
    // Repopulate with filtered commodities
    forecastCommodityElem.innerHTML = '<option value="">Select a commodity...</option>';
    
    if (availableModelCommodities.length > 0) {
        availableModelCommodities.forEach(commodity => {
            const option = document.createElement('option');
            option.value = commodity;
            option.textContent = commodity;
            forecastCommodityElem.appendChild(option);
        });
    } else {
        // If no model commodities available for this market, show a message
        forecastCommodityElem.innerHTML = '<option value="">No forecast models available for this market</option>';
    }
    
    console.log(`✓ Populated ${availableModelCommodities.length} forecast commodities for market ${market}`);
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
                decreasing: { line: { color: '#ef4444' } }
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
                font: { family: 'Inter, system-ui, sans-serif', size: 13, color: colors.text }
            };
            
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
                }
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
                font: { family: 'Inter, system-ui, sans-serif', size: 13, color: colors.text }
            };
            
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
                font: { family: 'Inter, system-ui, sans-serif', size: 13, color: colors.text },
                showlegend: true,
                legend: { x: 0.5, xanchor: 'center', y: 1.1, orientation: 'h', font: { color: colors.text } }
            };
            
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
                font: { family: 'Inter, system-ui, sans-serif', size: 13, color: colors.text },
                showlegend: true,
                legend: { x: 0.5, xanchor: 'center', y: 1.1, orientation: 'h', font: { color: colors.text } }
            };
            
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
                font: { family: 'Inter, system-ui, sans-serif', size: 13, color: colors.text },
                height: 400
            };
            
            Plotly.newPlot('forecastCalendarChart', [trace], layout, { responsive: true });
        } else {
            document.getElementById('forecastCalendarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No prediction data available</div>';
        }
    } catch (error) {
        console.error('Error loading forecast calendar:', error);
        document.getElementById('forecastCalendarChart').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading chart</div>';
    }
}

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
}
