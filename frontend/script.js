/**
 * Firebase Cloud Functions Client
 * Production-ready with error handling, retry logic, and monitoring
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
    icon: '🐛',
    color: '#e74c3c',
    bgColor: '#fadbd8'
  },
  'Feature Request': {
    icon: '💡',
    color: '#9b59b6',
    bgColor: '#ebdef0'
  },
  'Pricing Complaint': {
    icon: '💰',
    color: '#e67e22',
    bgColor: '#fdebd0'
  },
  'Positive Feedback': {
    icon: '✅',
    color: '#27ae60',
    bgColor: '#d5f4e6'
  },
  'Negative Experience': {
    icon: '😞',
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
    
    const text = elements.resultContent.innerText || elements.resultContent.textContent;
    console.log('📄 Text to copy:', text.substring(0, 50) + '...');
    
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ No result text to copy');
      return showError('No result to copy');
    }
    
    if (!navigator.clipboard) {
      console.error('❌ Clipboard API not available');
      return showError('Clipboard not supported in this browser');
    }
    
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Text copied successfully');
      if (elements.apiStatus) {
        const oldText = elements.apiStatus.textContent;
        elements.apiStatus.textContent = '✅ Result copied!';
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
