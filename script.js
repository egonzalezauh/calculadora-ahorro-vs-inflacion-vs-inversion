// =====================================================================
// Calculadora Fondo de Emergencia vs. Inflación — script.js
// =====================================================================

let countriesData = [];
let projectionChart = null;

// --- UI Elements ---
let formElements = {};

document.addEventListener('DOMContentLoaded', () => {
  formElements = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    leadForm: document.getElementById('lead-form'),
    leadMessage: document.getElementById('lead-message')
  };

  // Event Listeners
  document.getElementById('years').addEventListener('input', function () {
    const v = this.value;
    document.getElementById('years-display').textContent =
      v === '1' ? '1 año' : `${v} años`;
  });

  document.getElementById('country').addEventListener('change', updateRatesInfo);

  if (formElements.leadForm) {
    formElements.leadForm.addEventListener('submit', handleLeadFormSubmit);
  }

  const btnCalculate = document.getElementById('btn-calculate');
  if (btnCalculate) {
    btnCalculate.addEventListener('click', calculate);
  }

  // Allow Enter key on capital input to focus name (to continue flow)
  document.getElementById('capital').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (formElements.name) formElements.name.focus();
    }
  });

  loadCountries();
});

// ── Fetch country data from FastAPI on page load ──────────────────────
async function loadCountries() {
  try {
    const res = await fetch('/api/data');
    const json = await res.json();
    countriesData = json.countries;

    const select = document.getElementById('country');
    select.innerHTML = '';
    countriesData.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });

    updateRatesInfo();
  } catch (err) {
    console.error('Error cargando datos:', err);
    document.getElementById('country').innerHTML =
      '<option value="">Error cargando datos</option>';
  }
}

// ── Update the info box when country changes ──────────────────────────
function updateRatesInfo() {
  const selectedId = document.getElementById('country').value;
  const country = countriesData.find(c => c.id === selectedId);
  if (!country) return;

  document.getElementById('info-inflation').textContent =
    `${(country.inflation_rate * 100).toFixed(1)}% anual`;
  document.getElementById('info-instrument').textContent =
    country.safe_instrument;
  document.getElementById('info-rate').textContent =
    `${(country.safe_rate * 100).toFixed(1)}% anual`;
  document.getElementById('info-source').textContent =
    country.inflation_source;
  document.getElementById('currency-label').textContent =
    `(${country.currency})`;
  document.getElementById('currency-symbol').textContent =
    country.currency_symbol;

  document.getElementById('rates-info').classList.remove('hidden');
}

// ── Currency formatter ───────
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('es-419', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Smart card formatter ───
function formatCardValue(amount, currency) {
  const sym = new Intl.NumberFormat('es-419', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).formatToParts(0).find(p => p.type === 'currency')?.value ?? currency;

  const abs = Math.abs(amount);
  let value, suffix;

  if (abs >= 1_000_000_000) {
    value = amount / 1_000_000_000;
    suffix = ' B';
  } else if (abs >= 1_000_000) {
    value = amount / 1_000_000;
    suffix = ' M';
  } else if (abs >= 10_000) {
    value = amount / 1_000;
    suffix = ' K';
  } else {
    const formatted = new Intl.NumberFormat('es-419', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${sym} ${formatted}`;
  }

  const formatted = new Intl.NumberFormat('es-419', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${sym} ${formatted}${suffix}`;
}

// ── Animated number counter ───────────────────────────────────────────
function animateCount(elementId, targetValue, currency, duration = 1800) {
  const el = document.getElementById(elementId);
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = start + (targetValue - start) * eased;
    el.textContent = formatCardValue(current, currency);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── API CALLS & LEAD CAPTURE ───────────────────────────────────────────

async function captureLeadData() {
    const name = formElements.name.value;
    const email = formElements.email.value;
    
    if (!name || !email) {
        showLeadMessage('Por favor, completa ambos campos para activar la simulación.', 'text-vintage-accentRed');
        return false;
    }

    try {
        showLoadingState(true);
        const response = await fetch('/api/lead-capture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email }),
        });

        if (!response.ok) {
            throw new Error('Error en el servidor al guardar datos.');
        }

        showLeadMessage('✅ Datos guardados. ¡Calculando tu impacto financiero!', 'text-vintage-accentGreen');
        return true;

    } catch (error) {
        console.error("Lead capture error:", error);
        showLeadMessage(`❌ Fallo al guardar datos: ${error.message}. Intenta más tarde.`, 'text-vintage-accentRed');
        return false;
    } finally {
        showLoadingState(false);
    }
}

function showLeadMessage(message, colorClass) {
  formElements.leadMessage.textContent = message;
  formElements.leadMessage.className = `text-sm text-center h-5 font-bold transition-colors ${colorClass}`;
}

function showLoadingState(isLoading) {
    const btn = document.getElementById('btn-save-lead');
    if (btn) {
        btn.disabled = isLoading;
        if (isLoading) {
             btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#F4EFE6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Procesando...`;
             btn.classList.add('opacity-80', 'cursor-not-allowed');
        } else {
             btn.innerHTML = `🔓 Desbloquear Ahora`;
             btn.classList.remove('opacity-80', 'cursor-not-allowed');
        }
    }
}

// ── Main calculation logic ──────────────────────────────────────────────
function calculate() {
  const capital = parseFloat(document.getElementById('capital').value);
  const selectedId = document.getElementById('country').value;
  const years = parseInt(document.getElementById('years').value, 10);
  const customRateStr = document.getElementById('custom-rate').value;
 
  if (!capital || capital <= 0) {
    alert('Por favor ingresa un capital válido mayor a 0.');
    return;
  }
  if (!selectedId) {
    alert('Por favor selecciona un país.');
    return;
  }
 
  const country = countriesData.find(c => c.id === selectedId);
 
  const customRate = parseFloat(customRateStr);
  const effectiveSafeRate = (!isNaN(customRate) && customRate >= 0) ? (customRate / 100) : country.safe_rate;
 
  const labels = [];
  const seriesBase = [];      
  const seriesInflation = []; 
  const seriesInvested = [];  
 
  for (let t = 0; t <= years; t++) {
    labels.push(t === 0 ? 'Hoy' : `Año ${t}`);
    seriesBase.push(capital);
    seriesInflation.push(capital / Math.pow(1 + country.inflation_rate, t));
    seriesInvested.push(capital * Math.pow(1 + effectiveSafeRate, t));
  }
 
  const finalInflation = seriesInflation[years];
  const finalInvested  = seriesInvested[years];
 
  const resultsSection = document.getElementById('results-section');
  resultsSection.classList.remove('hidden');
 
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
 
  animateCount('card-initial',  capital,         country.currency);
  animateCount('card-inflation', finalInflation,  country.currency);
  animateCount('card-invest',    finalInvested,   country.currency);
 
  const gainVsColchon = finalInvested - finalInflation;
  const lossFromInflation = capital - finalInflation;
  document.getElementById('gain-amount').textContent =
    formatCardValue(gainVsColchon, country.currency);
  document.getElementById('loss-amount').textContent =
    formatCardValue(lossFromInflation, country.currency);
 
  const ctx = document.getElementById('projection-chart').getContext('2d');
  const pRadius = years > 30 ? 1 : (years > 15 ? 2.5 : 4);
 
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Capital Inicial',
        data: seriesBase,
        borderColor: '#4A6984',
        backgroundColor: 'rgba(74, 105, 132, 0.08)',
        pointBackgroundColor: '#4A6984',
        borderWidth: 2.5,
        pointRadius: pRadius,
        pointHoverRadius: 7,
        fill: false,
        tension: 0.1,
        borderDash: [6, 4],
      },
      {
        label: 'Bajo el Colchón (inflación)',
        data: seriesInflation,
        borderColor: '#914541',
        backgroundColor: 'rgba(145, 69, 65, 0.08)',
        pointBackgroundColor: '#914541',
        borderWidth: 2.5,
        pointRadius: pRadius,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Invirtiendo Seguro',
        data: seriesInvested,
        borderColor: '#41704B',
        backgroundColor: 'rgba(65, 112, 75, 0.10)',
        pointBackgroundColor: '#41704B',
        borderWidth: 2.5,
        pointRadius: pRadius,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.35,
      },
    ]
  };
 
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(244, 239, 230, 0.95)',
        borderColor: 'rgba(204, 192, 176, 0.8)',
        borderWidth: 1,
        titleColor: '#2B231D',
        bodyColor: '#5C544C',
        padding: 12,
        callbacks: {
          label: function (context) {
            const val = formatCurrency(context.parsed.y, country.currency);
            return `  ${context.dataset.label}: ${val}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#5C544C', font: { size: 11, weight: 'bold' } },
        grid: { color: 'rgba(92, 84, 76, 0.15)' },
      },
      y: {
        ticks: {
          color: '#5C544C',
          font: { size: 11, weight: 'bold' },
          callback: function (value) {
            const sym = country.currency_symbol;
            const abs = Math.abs(value);
            if (abs >= 1_000_000_000) return `${sym}${(value/1e9).toFixed(1)}B`;
            if (abs >= 1_000_000)     return `${sym}${(value/1e6).toFixed(1)}M`;
            if (abs >= 1_000)         return `${sym}${(value/1e3).toFixed(1)}k`;
            return `${sym}${value}`;
          }
        },
        grid: { color: 'rgba(92, 84, 76, 0.15)' },
      }
    }
  };
 
  if (projectionChart) {
    projectionChart.data = chartData;
    projectionChart.options = chartOptions;
    projectionChart.update('active');
  } else {
    projectionChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });
  }
}

async function handleLeadFormSubmit(e) {
    e.preventDefault(); 
    const isSuccess = await captureLeadData();

    if (isSuccess) {
        unlockPremiumFeatures();
    }
}

function unlockPremiumFeatures() {
    const customRateInput = document.getElementById('custom-rate');
    if (customRateInput) {
        customRateInput.disabled = false;
        customRateInput.classList.remove('cursor-not-allowed', 'bg-black/5');
        customRateInput.placeholder = "Ej: 8.5";
    }
    
    const label = document.getElementById('custom-rate-label');
    if (label) {
        label.innerHTML = '🎯 Tasa de Rendimiento Anual (Personalizada)';
    }
    
    const desc = document.getElementById('custom-rate-desc');
    if (desc) {
        desc.textContent = 'Déjalo en blanco para usar la tasa de Banco/CETES del país.';
    }
    
    const container = document.getElementById('custom-rate-container');
    if (container) {
        container.classList.remove('opacity-70');
    }

    const premiumSection = document.getElementById('premium-unlock-section');
    if (premiumSection) {
        premiumSection.innerHTML = `
            <div class="text-center py-6 animate-fade-in">
                <span class="text-4xl mb-3 block">🎉</span>
                <h3 class="text-xl font-extrabold text-vintage-accentGreen mb-2">¡Funciones Desbloqueadas!</h3>
                <p class="text-base font-medium text-vintage-textSecondary">Ya puedes usar la tasa personalizada en la sección de datos.</p>
            </div>
        `;
    }

    if (customRateInput) {
        customRateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => customRateInput.focus(), 500);
    }
}
