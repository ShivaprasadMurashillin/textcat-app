/**
 * Text Categorization API Client
 * Production-ready with error handling, retry logic, and monitoring
 * Backend: Flask + scikit-learn ML on Render.com
 */

// Configuration
const CONFIG = {
  // API URL - Render production backend
  API_BASE_URL: (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.protocol === 'file:')
    ? 'http://127.0.0.1:5000'  // Local development
    : 'https://textcat-app.onrender.com',  // Production backend
  
  ENDPOINTS: {
    PREDICT: '/predict',
    HEALTH: '/health'
  },
  
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000
};

// Example texts for each category
const EXAMPLE_TEXTS = {
  'Bug Report': [
    'The app crashes every time I click on submit.',
    'Images fail to load in the gallery section consistently.',
    'The backup feature doesn\'t work and I lost my data.',
    'Video playback stutters and stops randomly.',
    'The export function generates corrupted files.'
  ],
  'Feature Request': [
    'Please add an option to change themes or enable dark mode.',
    'Would love to see integration with Google Drive in the next version.',
    'Could you add multi-language support?',
    'Please add two-factor authentication for better security.',
    'Add keyboard shortcuts for power users.'
  ],
  'Pricing Complaint': [
    'The subscription cost is too high for the features offered.',
    'It\'s too expensive compared to competitors.',
    'The premium version isn\'t worth the price.',
    'The annual plan price is too steep for small businesses.',
    'No transparent pricing - hidden fees everywhere.'
  ],
  'Positive Feedback': [
    'Amazing experience! The app runs smoothly and looks great.',
    'Really love how fast the new version loads my dashboard!',
    'The update fixed all my issues. Great work by the team!',
    'Very satisfied with the quick response from support!',
    'Excellent customer support! They resolved my issue within minutes.'
  ],
  'Negative Experience': [
    'Customer service didn\'t respond even after two emails.',
    'The new UI feels confusing and slow.',
    'The payment failed even though my card was charged.',
    'App lags a lot when scrolling through product lists.',
    'The chat support agent was rude and unhelpful.'
  ]
};

// Category styling
const CATEGORY_STYLES = {
  'Bug Report': {
    icon: '??',
    color: '#e74c3c',
    bgColor: '#fadbd8'
  },
  'Feature Request': {
    icon: '??',
    color: '#9b59b6',
    bgColor: '#ebdef0'
  },
  'Pricing Complaint': {
    icon: '??',
    color: '#e67e22',
    bgColor: '#fdebd0'
  },
  'Positive Feedback': {
    icon: '?',
    color: '#27ae60',
    bgColor: '#d5f4e6'
  },
  'Negative Experience': {
    icon: '??',
    color: '#c0392b',
    bgColor: '#f2d7d5'
  }
};

// DOM Elements
let elements = {};

/**
 * Initialize application
 */
function init() {
  console.log('🚀 Initializing Text Categorization System...');
  
  // Cache DOM elements
  elements = {
    feedbackInput: document.getElementById('feedbackInput'),
    predictBtn: document.getElementById('predictBtn'),
    clearBtn: document.getElementById('clearBtn'),
    pasteExampleBtn: document.getElementById('pasteExampleBtn'),
    historyContainer: document.getElementById('historyContainer'),
    result: document.getElementById('result'),
    resultContent: document.getElementById('resultContent'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    apiStatus: document.getElementById('apiStatus')
  };
  
  // Verify critical elements
  if (!elements.feedbackInput || !elements.predictBtn) {
    console.error('❌ Critical elements missing!');
    return;
  }
  
  // Attach event listeners
  if (elements.predictBtn) elements.predictBtn.addEventListener('click', handlePredict);
  if (elements.clearBtn) elements.clearBtn.addEventListener('click', handleClear);
  if (elements.pasteExampleBtn) elements.pasteExampleBtn.addEventListener('click', useQuickExample);
  
  // Random example button
  const randomExampleBtn = document.getElementById('randomExample');
  if (randomExampleBtn) {
    console.log('✅ Random example button found');
    randomExampleBtn.addEventListener('click', () => {
      console.log('🎲 Random example clicked');
      loadRandomExample();
    });
  } else {
    console.warn('⚠️ Random example button not found');
  }
  
  if (elements.feedbackInput) {
    elements.feedbackInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handlePredict();
      }
    });
  }

  // Additional controls
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    console.log('✅ Dark mode toggle found');
    darkToggle.addEventListener('change', (e) => {
      console.log('🌙 Dark mode toggled:', e.target.checked);
      toggleDarkMode(e.target.checked);
    });
    // restore preference
    const saved = localStorage.getItem('ui:dark');
    if (saved === '1') {
      darkToggle.checked = true;
      toggleDarkMode(true);
    }
  } else {
    console.warn('⚠️ Dark mode toggle not found');
  }

  const copyBtn = document.getElementById('copyResultBtn');
  if (copyBtn) {
    console.log('✅ Copy button found');
    copyBtn.addEventListener('click', () => {
      console.log('📋 Copy button clicked');
      copyResultToClipboard();
    });
  } else {
    console.warn('⚠️ Copy button not found');
  }

  // Clear input button
  const clearInputBtn = document.getElementById('clearInput');
  if (clearInputBtn) {
    console.log('✅ Clear input button found');
    clearInputBtn.addEventListener('click', handleClear);
  }

  // Clear history button
  const clearHistoryBtn = document.getElementById('clearHistory');
  if (clearHistoryBtn) {
    console.log('✅ Clear history button found');
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all classification history?')) {
        localStorage.removeItem('tc:history:v1');
        renderHistory();
      }
    });
  }

  // Example chip buttons
  const exampleChips = document.querySelectorAll('.example-chip');
  console.log(`✅ Found ${exampleChips.length} example chips`);
  exampleChips.forEach((chip, index) => {
    chip.addEventListener('click', () => {
      const exampleText = chip.getAttribute('data-text');
      console.log(`📝 Example chip ${index + 1} clicked:`, exampleText);
      if (exampleText) {
        elements.feedbackInput.value = exampleText;
        elements.feedbackInput.focus();
        updateCharCount();
        hideResult();
        hideError();
      }
    });
  });

  // Character counter
  if (elements.feedbackInput) {
    elements.feedbackInput.addEventListener('input', updateCharCount);
    updateCharCount(); // Initialize
  }

  // Render saved history
  renderHistory();
  
  // Check API health
  if (elements.apiStatus) {
    checkAPIHealth();
  }
  
  // Initialize Batch Analysis feature
  initBatchAnalysis();
  
  console.log('✅ Text Categorization System initialized successfully');
}

/**
 * Check API health status
 */
async function checkAPIHealth() {
  try {
    const response = await fetchWithTimeout(
      `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.HEALTH}`,
      { method: 'GET' },
      5000
    );
    
    const data = await response.json();
    
    if (data.status === 'healthy') {
      elements.apiStatus.textContent = '🟢 Online';
      elements.apiStatus.style.color = '#27ae60';
    } else {
      elements.apiStatus.textContent = '🟡 Degraded';
      elements.apiStatus.style.color = '#f39c12';
    }
  } catch (error) {
    console.warn('Health check failed:', error);
    elements.apiStatus.textContent = '🔴 Offline';
    elements.apiStatus.style.color = '#e74c3c';
  }
}

/**
 * Handle predict button click
 */
async function handlePredict() {
  const feedback = elements.feedbackInput.value.trim();
  
  // Validate input
  if (!feedback) {
    showError('Please enter some feedback text.');
    elements.feedbackInput.focus();
    return;
  }
  
  if (feedback.length < 3) {
    showError('Feedback text is too short (minimum 3 characters).');
    return;
  }
  
  if (feedback.length > 5000) {
    showError('Feedback text is too long (maximum 5000 characters).');
    return;
  }
  
  // Show loading state
  showLoading();
  hideError();
  hideResult();
  
  try {
    // Make prediction request with retry logic
    const data = await makeRequestWithRetry(feedback);
    
    // Display result
    displayResult(data);
    
    // Log success
    console.log('Prediction successful:', data);
    
  } catch (error) {
    console.error('Prediction error:', error);
    showError(
      error.message || 'Failed to classify feedback. Please try again.'
    );
  } finally {
    hideLoading();
  }
}

/**
 * Make API request with retry logic
 */
async function makeRequestWithRetry(feedback, retries = CONFIG.MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.PREDICT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ feedback })
        },
        CONFIG.REQUEST_TIMEOUT_MS
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      if (!data.success && !data.prediction) {
        throw new Error(data.error || 'Invalid response from server');
      }
      
      return data;
      
    } catch (error) {
      // If it's the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying
      await sleep(CONFIG.RETRY_DELAY_MS * (attempt + 1));
      console.log(`Retrying... (${attempt + 1}/${retries})`);
    }
  }
}

/**
 * Fetch with timeout
 */
function fetchWithTimeout(url, options, timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

/**
 * Display prediction result
 */
function displayResult(data) {
  const { prediction, confidence, all_probabilities, metadata, processing_time_ms } = data;
  
  const style = CATEGORY_STYLES[prediction] || {};
  
  let html = `
    <div class="result-card" style="border-left: 4px solid ${style.color}">
      <div class="category-badge" style="background-color: ${style.bgColor}; color: ${style.color}">
        <span class="category-icon">${style.icon}</span>
        <span class="category-name">${prediction}</span>
      </div>
      
      ${confidence ? `
        <div class="confidence-section">
          <div class="confidence-label">Confidence Score</div>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidence}%; background-color: ${style.color}"></div>
          </div>
          <div class="confidence-value">${confidence}%</div>
        </div>
      ` : ''}
      
      ${metadata && metadata.description ? `
        <p class="category-description">${metadata.description}</p>
      ` : ''}
      
      ${all_probabilities ? `
        <details class="probabilities-details">
          <summary>View All Category Probabilities</summary>
          <div class="probabilities-list">
            ${Object.entries(all_probabilities)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, prob]) => {
                const catStyle = CATEGORY_STYLES[cat] || {};
                return `
                  <div class="probability-item">
                    <span class="prob-icon">${catStyle.icon}</span>
                    <span class="prob-name">${cat}</span>
                    <span class="prob-value">${prob}%</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </details>
      ` : ''}
      
      <div class="result-meta">
        <span>⏱️ ${processing_time_ms}ms</span>
        ${data.firestore_id ? `<span>📝 ID: ${data.firestore_id.substring(0, 8)}...</span>` : ''}
      </div>
    </div>
  `;
  
  elements.resultContent.innerHTML = html;
  showResult();
  // save to history (localStorage)
  try { saveResultToHistory({ feedback: elements.feedbackInput.value.trim(), data, created_at: Date.now() }); } catch(e){}
}

/**
 * Save result to local history (localStorage)
 */
function saveResultToHistory(entry) {
  const key = 'tc:history:v1';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.unshift(entry);
  // keep up to 20
  localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
  renderHistory();
}

function renderHistory() {
  if (!elements.historyContainer) return;
  const key = 'tc:history:v1';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  if (list.length === 0) {
    elements.historyContainer.innerHTML = '<small class="history-empty">No recent classifications</small>';
    return;
  }
  elements.historyContainer.innerHTML = list.slice(0,6).map((item, idx) => {
    const txt = item.feedback.length > 80 ? item.feedback.substring(0,77) + '...' : item.feedback;
    const time = new Date(item.created_at).toLocaleString();
    return `<button class="history-item" data-idx="${idx}" title="${item.feedback}"><span class="history-text">${escapeHtml(txt)}</span><small class="history-time">${time}</small></button>`;
  }).join('');
  // attach handlers
  Array.from(elements.historyContainer.querySelectorAll('.history-item')).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(btn.getAttribute('data-idx'));
      const list = JSON.parse(localStorage.getItem('tc:history:v1') || '[]');
      if (list[idx]) {
        elements.feedbackInput.value = list[idx].feedback;
        elements.feedbackInput.focus();
      }
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]; });
}

function copyResultToClipboard() {
  console.log('📋 Copy function called');
  try {
    if (!elements.resultContent) {
      console.error('❌ Result content element not found');
      return showError('Result element not found');
    }
    
    // Get the current prediction data from the last result
    const resultCard = elements.resultContent.querySelector('.result-card');
    if (!resultCard) {
      console.warn('⚠️ No result card found');
      return showError('No result to copy');
    }
    
    // Extract data from the result card
    const categoryName = resultCard.querySelector('.category-name')?.textContent || 'Unknown';
    const confidenceValue = resultCard.querySelector('.confidence-value')?.textContent || '0%';
    const feedbackText = elements.feedbackInput.value.trim();
    
    // Get all probabilities
    const probItems = resultCard.querySelectorAll('.probability-item');
    let probabilities = [];
    probItems.forEach(item => {
      const name = item.querySelector('.prob-name')?.textContent || '';
      const value = item.querySelector('.prob-value')?.textContent || '';
      if (name && value) {
        probabilities.push(`- ${name}: ${value}`);
      }
    });
    
    // Format the text
    const formattedText = `📝 Classification Result
━━━━━━━━━━━━━━━━━━━━

Input: ${feedbackText}

Prediction: ${categoryName}
Confidence: ${confidenceValue}

All Probabilities:
${probabilities.join('\\n')}`;
    
    console.log('📄 Text to copy:', formattedText.substring(0, 100) + '...');
    
    if (!navigator.clipboard) {
      console.error('❌ Clipboard API not available');
      return showError('Clipboard not supported in this browser');
    }
    
    navigator.clipboard.writeText(formattedText).then(() => {
      console.log('✅ Text copied successfully');
      if (elements.apiStatus) {
        const oldText = elements.apiStatus.textContent;
        elements.apiStatus.textContent = '✅ Copied!';
        setTimeout(() => {
          elements.apiStatus.textContent = oldText;
        }, 2000);
      }
      // Show success message
      const copyBtn = document.getElementById('copyResultBtn');
      if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✅</span>';
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
        }, 2000);
      }
    }).catch((e) => {
      console.error('❌ Copy failed:', e);
      showError('Copy failed: ' + e.message);
    });
  } catch(e) {
    console.error('❌ Copy error:', e);
    showError('Copy not supported');
  }
}

function useQuickExample() {
  const examples = [
    'The app crashes when I try to upload photos',
    'Please add dark mode to the app',
    'Why did I get charged extra this month?'
  ];
  elements.feedbackInput.value = examples[Math.floor(Math.random()*examples.length)];
  elements.feedbackInput.focus();
}

/**
 * Handle clear button
 */
function handleClear() {
  elements.feedbackInput.value = '';
  hideResult();
  hideError();
  elements.feedbackInput.focus();
}

/**
 * Load a random example text
 */
function loadRandomExample() {
  console.log('🎲 Loading random example...');
  
  // Get all categories
  const categories = Object.keys(EXAMPLE_TEXTS);
  console.log('📚 Available categories:', categories);
  
  // Pick a random category
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  console.log('🎯 Selected category:', randomCategory);
  
  // Pick a random example from that category
  const examples = EXAMPLE_TEXTS[randomCategory];
  const randomExample = examples[Math.floor(Math.random() * examples.length)];
  console.log('📝 Selected example:', randomExample);
  
  // Set the text
  if (elements.feedbackInput) {
    elements.feedbackInput.value = randomExample;
    elements.feedbackInput.focus();
    
    // Update character count
    updateCharCount();
    
    // Clear any existing results/errors
    hideResult();
    hideError();
    
    console.log('✅ Random example loaded successfully');
  } else {
    console.error('❌ Feedback input element not found');
  }
}

/**
 * Update character count display
 */
function updateCharCount() {
  const charCountEl = document.getElementById('charCount');
  if (charCountEl && elements.feedbackInput) {
    const length = elements.feedbackInput.value.length;
    charCountEl.textContent = `${length} / 5000 characters`;
    
    // Change color if approaching limit
    if (length > 4500) {
      charCountEl.style.color = '#e74c3c';
    } else if (length > 4000) {
      charCountEl.style.color = '#f39c12';
    } else {
      charCountEl.style.color = '';
    }
  }
}

/**
 * Show/hide UI elements
 */
function showLoading() {
  elements.loading.style.display = 'flex';
  elements.predictBtn.disabled = true;
}

function hideLoading() {
  elements.loading.style.display = 'none';
  elements.predictBtn.disabled = false;
}

function showResult() {
  elements.result.style.display = 'block';
  elements.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResult() {
  elements.result.style.display = 'none';
}

function showError(message) {
  elements.error.textContent = `❌ ${message}`;
  elements.error.style.display = 'block';
  elements.error.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Toggle dark mode and persist
 */
function toggleDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('ui:dark','1');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('ui:dark');
  }
}

function hideError() {
  elements.error.style.display = 'none';
}

/**
 * Utility: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
// ========================================
// BATCH ANALYSIS FEATURE - APPEND TO script.js
// ========================================

// Batch Analysis State
let batchState = {
  currentMode: 'single',
  batchResults: [],
  batchStats: null,
  isProcessing: false
};

// Initialize Batch Analysis (call from init())
function initBatchAnalysis() {
  const singleModeBtn = document.getElementById('singleModeBtn');
  const batchModeBtn = document.getElementById('batchModeBtn');
  const batchFeedbackInput = document.getElementById('batchFeedbackInput');
  const analyzeBatchBtn = document.getElementById('analyzeBatchBtn');
  const clearBatch = document.getElementById('clearBatch');
  const loadBatchExample = document.getElementById('loadBatchExample');

  // Mode Toggle Handlers
  if (singleModeBtn) {
    singleModeBtn.addEventListener('click', () => switchMode('single'));
  }
  if (batchModeBtn) {
    batchModeBtn.addEventListener('click', () => switchMode('batch'));
  }

  // Batch Input Handlers
  if (batchFeedbackInput) {
    batchFeedbackInput.addEventListener('input', updateBatchCount);
    updateBatchCount();
  }

  if (analyzeBatchBtn) {
    analyzeBatchBtn.addEventListener('click', handleBatchAnalysis);
  }

  if (clearBatch) {
    clearBatch.addEventListener('click', () => {
      if (batchFeedbackInput) batchFeedbackInput.value = '';
      updateBatchCount();
      hideBatchProgress();
      hideBatchResults();
    });
  }

  if (loadBatchExample) {
    loadBatchExample.addEventListener('click', loadBatchExampleData);
  }

  // CSV Upload Handlers
  const uploadCSVBtn = document.getElementById('uploadCSVBtn');
  const csvFileInput = document.getElementById('csvFileInput');
  if (uploadCSVBtn && csvFileInput) {
    uploadCSVBtn.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', handleCSVUpload);
  }

  // Download/Export Handlers
  const downloadCSV = document.getElementById('downloadCSV');
  const downloadJSON = document.getElementById('downloadJSON');
  const copySummary = document.getElementById('copySummary');
  const copyAllResults = document.getElementById('copyAllResults');

  if (downloadCSV) downloadCSV.addEventListener('click', () => exportBatchResults('csv'));
  if (downloadJSON) downloadJSON.addEventListener('click', () => exportBatchResults('json'));
  if (copySummary) copySummary.addEventListener('click', copyBatchSummary);
  if (copyAllResults) copyAllResults.addEventListener('click', copyAllBatchResults);

  console.log('âœ… Batch Analysis feature initialized');
}

// Switch between Single and Batch modes
function switchMode(mode) {
  console.log(`ðŸ”„ Switching to ${mode} mode`);
  batchState.currentMode = mode;

  const singleModeBtn = document.getElementById('singleModeBtn');
  const batchModeBtn = document.getElementById('batchModeBtn');
  const singleInput = document.getElementById('singleInput');
  const batchInput = document.getElementById('batchInput');
  const singleExamples = document.getElementById('singleExamples');
  const batchExamples = document.getElementById('batchExamples');
  const result = document.getElementById('result');
  const batchProgress = document.getElementById('batchProgress');
  const batchResults = document.getElementById('batchResults');

  if (mode === 'single') {
    singleModeBtn.classList.add('active');
    batchModeBtn.classList.remove('active');
    if (singleInput) singleInput.style.display = 'block';
    if (batchInput) batchInput.style.display = 'none';
    if (singleExamples) singleExamples.style.display = 'block';
    if (batchExamples) batchExamples.style.display = 'none';
    if (batchProgress) batchProgress.style.display = 'none';
    if (batchResults) batchResults.style.display = 'none';
  } else {
    singleModeBtn.classList.remove('active');
    batchModeBtn.classList.add('active');
    if (singleInput) singleInput.style.display = 'none';
    if (batchInput) batchInput.style.display = 'block';
    if (singleExamples) singleExamples.style.display = 'none';
    if (batchExamples) batchExamples.style.display = 'block';
    if (result) result.style.display = 'none';
    if (batchProgress) batchProgress.style.display = 'none';
  }
}

// Update batch feedback count
function updateBatchCount() {
  const batchFeedbackInput = document.getElementById('batchFeedbackInput');
  const batchCount = document.getElementById('batchCount');
  
  if (!batchFeedbackInput || !batchCount) return;

  const text = batchFeedbackInput.value.trim();
  const lines = text ? text.split('\n').filter(line => line.trim().length > 0) : [];
  const count = lines.length;

  batchCount.textContent = `${count} feedbacks detected (max 100)`;
  
  if (count > 100) {
    batchCount.style.color = '#e74c3c';
  } else if (count > 50) {
    batchCount.style.color = '#f39c12';
  } else {
    batchCount.style.color = '';
  }
}

// Load batch example data
function loadBatchExampleData() {
  const batchFeedbackInput = document.getElementById('batchFeedbackInput');
  if (!batchFeedbackInput) return;

  const exampleBatch = `Fantastic user experience from start to finish!
The live chat feature never connects to an agent.
The export function generates corrupted files.
Please add dark mode to the interface.
The subscription cost is too high for the features offered.
This is the best app I've ever used! Love it!
The app crashes when I try to upload photos.
Would love to see integration with Google Drive.
Why is the pricing so expensive compared to competitors?
Customer support is amazing and very helpful!`;

  batchFeedbackInput.value = exampleBatch;
  updateBatchCount();
  console.log('ðŸ“ Loaded batch example data');
}

// Handle Batch Analysis
async function handleBatchAnalysis() {
  console.log('ðŸš€ Starting batch analysis...');
  
  const batchFeedbackInput = document.getElementById('batchFeedbackInput');
  if (!batchFeedbackInput) return;

  const text = batchFeedbackInput.value.trim();
  if (!text) {
    showError('Please enter at least one feedback text');
    return;
  }

  const feedbacks = text.split('\n').filter(line => line.trim().length > 0);
  
  if (feedbacks.length === 0) {
    showError('No valid feedback texts found');
    return;
  }

  if (feedbacks.length > 100) {
    showError('Maximum 100 feedbacks allowed. Please reduce the number of feedbacks.');
    return;
  }

  // Show warning for large batches
  if (feedbacks.length > 50 && !confirm(`You are about to analyze ${feedbacks.length} feedbacks. This may take a few minutes. Continue?`)) {
    return;
  }

  batchState.isProcessing = true;
  batchState.batchResults = [];
  
  hideError();
  hideBatchResults();
  showBatchProgress();

  const startTime = Date.now();
  const total = feedbacks.length;

  for (let i = 0; i < feedbacks.length; i++) {
    const feedback = feedbacks[i].trim();
    updateBatchProgress(i + 1, total, feedback);

    try {
      const result = await makeRequestWithRetry(feedback);
      batchState.batchResults.push({
        index: i + 1,
        feedback: feedback,
        prediction: result.prediction,
        confidence: result.confidence,
        all_probabilities: result.all_probabilities,
        success: true
      });
    } catch (error) {
      console.error(`Error analyzing feedback ${i + 1}:`, error);
      batchState.batchResults.push({
        index: i + 1,
        feedback: feedback,
        error: error.message,
        success: false
      });
    }

    // Small delay to prevent overwhelming the API
    if (i < feedbacks.length - 1) {
      await sleep(100);
    }
  }

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(1);

  // Calculate statistics
  batchState.batchStats = calculateBatchStatistics(batchState.batchResults, processingTime);

  hideBatchProgress();
  displayBatchResults();

  batchState.isProcessing = false;
  console.log('âœ… Batch analysis complete!', batchState.batchStats);
}

// Update batch progress display
function updateBatchProgress(current, total, feedback) {
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const currentFeedback = document.getElementById('currentFeedback');
  const estimatedTime = document.getElementById('estimatedTime');

  const percentage = Math.round((current / total) * 100);

  if (progressText) progressText.textContent = `Analyzing feedback ${current}/${total}...`;
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
  }
  if (currentFeedback) {
    const truncated = feedback.length > 60 ? feedback.substring(0, 57) + '...' : feedback;
    currentFeedback.textContent = `"${truncated}"`;
  }
  if (estimatedTime) {
    const remaining = total - current;
    const estSeconds = Math.ceil(remaining * 0.5); // Estimate 0.5s per feedback
    estimatedTime.textContent = `Estimated: ~${estSeconds}s remaining`;
  }
}

// Show batch progress section
function showBatchProgress() {
  const batchProgress = document.getElementById('batchProgress');
  if (batchProgress) batchProgress.style.display = 'block';
}

// Hide batch progress section
function hideBatchProgress() {
  const batchProgress = document.getElementById('batchProgress');
  if (batchProgress) batchProgress.style.display = 'none';
}

// Hide batch results section
function hideBatchResults() {
  const batchResults = document.getElementById('batchResults');
  if (batchResults) batchResults.style.display = 'none';
}

// Calculate batch statistics
function calculateBatchStatistics(results, processingTime) {
  const successfulResults = results.filter(r => r.success);
  const total = successfulResults.length;

  // Category distribution
  const categoryCount = {};
  successfulResults.forEach(r => {
    categoryCount[r.prediction] = (categoryCount[r.prediction] || 0) + 1;
  });

  // Find most common category
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  // Average confidence
  const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / total;

  // Confidence distribution
  const highConfidence = successfulResults.filter(r => r.confidence > 80).length;
  const mediumConfidence = successfulResults.filter(r => r.confidence >= 50 && r.confidence <= 80).length;
  const lowConfidence = successfulResults.filter(r => r.confidence < 50).length;

  // Sentiment split
  const positive = (categoryCount['Positive Feedback'] || 0);
  const negative = (categoryCount['Negative Experience'] || 0) + (categoryCount['Bug Report'] || 0) + (categoryCount['Pricing Complaint'] || 0);

  return {
    total,
    topCategory: topCategory ? topCategory[0] : 'N/A',
    topCategoryCount: topCategory ? topCategory[1] : 0,
    avgConfidence: avgConfidence.toFixed(2),
    processingTime,
    categoryCount,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    positive,
    negative,
    errors: results.length - total
  };
}

// Display batch results
function displayBatchResults() {
  const batchResults = document.getElementById('batchResults');
  if (!batchResults) return;

  const stats = batchState.batchStats;

  // Update metrics
  document.getElementById('totalAnalyzed').textContent = stats.total;
  document.getElementById('topCategory').textContent = stats.topCategory;
  document.getElementById('avgConfidence').textContent = stats.avgConfidence + '%';
  document.getElementById('processingTime').textContent = stats.processingTime + 's';

  // Update top category icon
  const topCategoryIcon = document.getElementById('topCategoryIcon');
  if (topCategoryIcon && CATEGORY_STYLES[stats.topCategory]) {
    topCategoryIcon.textContent = CATEGORY_STYLES[stats.topCategory].icon;
  }

  // Update confidence badges
  document.getElementById('highConfidence').textContent = stats.highConfidence;
  document.getElementById('mediumConfidence').textContent = stats.mediumConfidence;
  document.getElementById('lowConfidence').textContent = stats.lowConfidence;

  // Render category chart
  renderCategoryChart(stats.categoryCount, stats.total);

  // Render insights
  renderInsights(stats);

  // Render individual results
  renderIndividualResults(batchState.batchResults);

  batchResults.style.display = 'block';
  batchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render category distribution chart
function renderCategoryChart(categoryCount, total) {
  const chartContainer = document.getElementById('categoryChart');
  if (!chartContainer) return;

  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

  let chartHTML = '';
  sortedCategories.forEach(([category, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    const style = CATEGORY_STYLES[category] || {};
    
    chartHTML += `
      <div class="chart-bar">
        <div class="chart-label">
          <span>${style.icon || '&#128202;'}</span>
          <span>${category}</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: ${percentage}%; background: ${style.color || '#3498db'};">
            ${percentage}%
          </div>
        </div>
        <div class="chart-value">${count} (${percentage}%)</div>
      </div>
    `;
  });

  chartContainer.innerHTML = chartHTML;

  // Animate bars
  setTimeout(() => {
    const bars = chartContainer.querySelectorAll('.chart-bar-fill');
    bars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }, 100);
}

// Render key insights
function renderInsights(stats) {
  const insightsList = document.getElementById('insightsList');
  if (!insightsList) return;

  const insights = [];

  // Top category insight
  const topPercent = ((stats.topCategoryCount / stats.total) * 100).toFixed(1);
  insights.push(`${topPercent}% of feedback is categorized as "${stats.topCategory}"`);

  // Confidence insight
  if (stats.avgConfidence > 80) {
    insights.push(`High model confidence with an average of ${stats.avgConfidence}%`);
  } else if (stats.avgConfidence > 60) {
    insights.push(`Moderate model confidence with an average of ${stats.avgConfidence}%`);
  } else {
    insights.push(`Lower confidence scores - consider reviewing ${stats.avgConfidence}% average`);
  }

  // Sentiment insight
  if (stats.positive > stats.negative) {
    const ratio = ((stats.positive / stats.total) * 100).toFixed(1);
    insights.push(`Positive sentiment dominates with ${ratio}% positive feedback`);
  } else if (stats.negative > stats.positive) {
    const ratio = ((stats.negative / stats.total) * 100).toFixed(1);
    insights.push(`${ratio}% of feedback indicates issues or concerns`);
  }

  // Speed insight
  const feedbackPerSecond = (stats.total / parseFloat(stats.processingTime)).toFixed(1);
  insights.push(`Processed ${feedbackPerSecond} feedbacks per second`);

  // Render insights
  insightsList.innerHTML = insights.map(insight => `
    <div class="insight-item">${insight}</div>
  `).join('');
}

// Render individual results list
function renderIndividualResults(results) {
  const resultsList = document.getElementById('individualResultsList');
  if (!resultsList) return;

  const successfulResults = results.filter(r => r.success);

  let resultsHTML = '';
  successfulResults.forEach(result => {
    const style = CATEGORY_STYLES[result.prediction] || {};
    const truncatedFeedback = result.feedback.length > 150 
      ? result.feedback.substring(0, 147) + '...' 
      : result.feedback;

    resultsHTML += `
      <div class="result-item" style="border-left-color: ${style.color || '#3498db'}">
        <div class="result-number">#${result.index}</div>
        <div class="result-feedback">"${truncatedFeedback}"</div>
        <div class="result-prediction">
          <span class="result-arrow">&rarr;</span>
          <div class="result-category">
            <span>${style.icon || '&#128202;'}</span>
            <span>${result.prediction}</span>
          </div>
          <span class="result-confidence">${result.confidence}%</span>
        </div>
      </div>
    `;
  });

  resultsList.innerHTML = resultsHTML;
}

// Export batch results as CSV
function exportBatchResults(format) {
  const results = batchState.batchResults.filter(r => r.success);
  
  if (format === 'csv') {
    let csv = 'Index,Feedback,Prediction,Confidence\n';
    results.forEach(r => {
      const feedback = '"' + r.feedback.replace(/"/g, '""') + '"';
      csv += `${r.index},${feedback},${r.prediction},${r.confidence}%\n`;
    });

    downloadFile(csv, 'batch-analysis-results.csv', 'text/csv');
    showSuccess('CSV downloaded successfully!');
  } else if (format === 'json') {
    const json = JSON.stringify({
      metadata: {
        total: batchState.batchStats.total,
        avgConfidence: batchState.batchStats.avgConfidence,
        processingTime: batchState.batchStats.processingTime,
        timestamp: new Date().toISOString()
      },
      statistics: batchState.batchStats,
      results: results
    }, null, 2);

    downloadFile(json, 'batch-analysis-results.json', 'application/json');
    showSuccess('JSON downloaded successfully!');
  }
}

// Copy batch summary to clipboard
function copyBatchSummary() {
  console.log('copyBatchSummary called', { hasBatchStats: !!batchState.batchStats });
  
  // Check if batch results exist
  if (!batchState.batchStats) {
    showError('No batch results available. Please run batch analysis first.');
    return;
  }
  
  // Check clipboard API availability
  if (!navigator.clipboard) {
    showError('Clipboard not supported in this browser');
    return;
  }
  
  const stats = batchState.batchStats;
  
  let summary = `📊 Batch Analysis Summary\n`;
  summary += `${'='.repeat(50)}\n\n`;
  summary += `Total Analyzed: ${stats.total} feedbacks\n`;
  summary += `Most Common: ${stats.topCategory} (${stats.topCategoryCount} feedbacks)\n`;
  summary += `Avg Confidence: ${stats.avgConfidence}%\n`;
  summary += `Processing Time: ${stats.processingTime}s\n\n`;
  
  summary += `Category Distribution:\n`;
  Object.entries(stats.categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    const percent = ((count / stats.total) * 100).toFixed(1);
    summary += `  - ${cat}: ${count} (${percent}%)\n`;
  });
  
  summary += `\nConfidence Levels:\n`;
  summary += `  - High (>80%): ${stats.highConfidence}\n`;
  summary += `  - Medium (50-80%): ${stats.mediumConfidence}\n`;
  summary += `  - Low (<50%): ${stats.lowConfidence}\n`;

  navigator.clipboard.writeText(summary).then(() => {
    console.log('Summary copied successfully');
    showSuccess('Summary copied to clipboard!');
  }).catch((error) => {
    console.error('Failed to copy summary:', error);
    showError('Failed to copy summary');
  });
}

// Copy all batch results to clipboard
function copyAllBatchResults() {
  console.log('copyAllBatchResults called', { resultsCount: batchState.batchResults.length });
  
  // Check if batch results exist
  if (!batchState.batchResults || batchState.batchResults.length === 0) {
    showError('No batch results available. Please run batch analysis first.');
    return;
  }
  
  // Check clipboard API availability
  if (!navigator.clipboard) {
    showError('Clipboard not supported in this browser');
    return;
  }
  
  const results = batchState.batchResults.filter(r => r.success);
  
  if (results.length === 0) {
    showError('No successful results to copy');
    return;
  }
  
  let text = `📝 Complete Batch Analysis Results\n`;
  text += `${'='.repeat(70)}\n\n`;
  
  results.forEach(r => {
    const style = CATEGORY_STYLES[r.prediction] || {};
    text += `${r.index}. "${r.feedback}"\n`;
    text += `   → ${style.icon || '&#128202;'} ${r.prediction} (${r.confidence}%)\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    console.log('All results copied successfully');
    showSuccess('All results copied to clipboard!');
  }).catch((error) => {
    console.error('Failed to copy results:', error);
    showError('Failed to copy results');
  });
}

// Helper: Download file
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper: Show success message
function showSuccess(message) {
  const apiStatus = document.getElementById('apiStatus');
  if (apiStatus) {
    const oldText = apiStatus.textContent;
    apiStatus.textContent = 'âœ… ' + message;
    apiStatus.style.color = '#27ae60';
    setTimeout(() => {
      apiStatus.textContent = oldText;
      checkAPIHealth();
    }, 3000);
  }
}

console.log('ðŸ“Š Batch Analysis module loaded');



// CSV Upload Handler
async function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  console.log(' CSV file selected:', file.name);

  try {
    const text = await file.text();
    const feedbacks = parseCSV(text);
    
    if (feedbacks.length === 0) {
      showError('No valid feedbacks found in CSV file');
      return;
    }

    if (feedbacks.length > 100) {
      showError(`CSV contains ${feedbacks.length} feedbacks (max 100). First 100 will be loaded.`);
      feedbacks = feedbacks.slice(0, 100);
    }

    const batchFeedbackInput = document.getElementById('batchFeedbackInput');
    if (batchFeedbackInput) {
      batchFeedbackInput.value = feedbacks.join('\n');
      updateBatchCount();
      showSuccess(`Loaded ${feedbacks.length} feedbacks from CSV`);
    }

    // Reset file input
    event.target.value = '';
  } catch (error) {
    console.error('CSV upload error:', error);
    showError('Failed to read CSV file: ' + error.message);
  }
}

// Parse CSV and extract feedback column
function parseCSV(text) {
  console.log(' Parsing CSV...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length === 0) return [];

  // Try to detect delimiter (comma or semicolon)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  
  console.log(`Detected delimiter: "${delimiter}"`);

  // Parse first line as headers
  const headers = parseCSVLine(lines[0], delimiter).map(h => h.toLowerCase().trim());
  console.log('Headers:', headers);

  // Find feedback column (can be "feedback", "feedbacks", "text", "comment", etc.)
  let feedbackIndex = headers.findIndex(h => 
    h.includes('feedback') || h.includes('text') || h.includes('comment') || h.includes('review')
  );

  // If no header match found, try second column by default (common pattern: Index, Feedback)
  if (feedbackIndex === -1 && headers.length >= 2) {
    console.log('No "feedback" header found, using column 2 by default');
    feedbackIndex = 1;
  }

  // If still no column found, use first column
  if (feedbackIndex === -1) {
    console.log('Using first column as feedback');
    feedbackIndex = 0;
  }

  console.log(`Using column ${feedbackIndex} (${headers[feedbackIndex] || 'unnamed'}) for feedbacks`);

  // Parse data rows
  const feedbacks = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], delimiter);
    if (row.length > feedbackIndex && row[feedbackIndex].trim()) {
      feedbacks.push(row[feedbackIndex].trim());
    }
  }

  console.log(`? Extracted ${feedbacks.length} feedbacks from CSV`);
  return feedbacks;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current); // Add last field
  return result;
}

