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

  // Check if user already unlocked premium features
  if (localStorage.getItem('leadCaptured') === 'true') {
    unlockPremiumFeatures(true);
  }
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
  document.getElementById('monthly-currency-label').textContent =
    `(${country.currency})`;
  document.getElementById('monthly-currency-symbol').textContent =
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
        showLeadMessage('Completa ambos campos para activar la simulación.', 'text-sello');
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

        showLeadMessage('Datos guardados. Calculando tu impacto financiero.', 'text-oro');
        return true;

    } catch (error) {
        console.error("Lead capture error:", error);
        showLeadMessage(`Fallo al guardar datos: ${error.message}. Intenta más tarde.`, 'text-sello');
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
              btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-billete-deep" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Procesando...`;
              btn.classList.add('opacity-80', 'cursor-not-allowed');
        } else {
             btn.innerHTML = `Desbloquear ahora`;
             btn.classList.remove('opacity-80', 'cursor-not-allowed');
        }
    }
}

// ── Main calculation logic ──────────────────────────────────────────────
function calculate() {
  const capital = parseFloat(document.getElementById('capital').value);
  const monthly = parseFloat(document.getElementById('monthly-contribution').value) || 0;
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

  let balanceInvested = capital;
  // Convertimos tasa anual a tasa mensual equivalente
  const monthlyRate = Math.pow(1 + effectiveSafeRate, 1/12) - 1;

  labels.push('Hoy');
  seriesBase.push(capital);
  seriesInflation.push(capital);
  seriesInvested.push(capital);

  for (let t = 1; t <= years; t++) {
    labels.push(`Año ${t}`);
    
    // Inversión: capitalización mensual con aportes
    for (let m = 0; m < 12; m++) {
      balanceInvested = balanceInvested * (1 + monthlyRate) + monthly;
    }
    seriesInvested.push(balanceInvested);
    
    // Dinero base (colchón nominal acumulado)
    const currentBase = capital + monthly * 12 * t;
    seriesBase.push(currentBase);
    
    // Inflación: poder adquisitivo del dinero base en términos de valor presente
    const currentInflation = currentBase / Math.pow(1 + country.inflation_rate, t);
    seriesInflation.push(currentInflation);
  }

  const finalBase      = seriesBase[years];
  const finalInflation = seriesInflation[years];
  const finalInvested  = seriesInvested[years];

  const resultsSection = document.getElementById('results-section');
  resultsSection.classList.remove('hidden');

  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  animateCount('card-initial',   finalBase,       country.currency);
  animateCount('card-inflation', finalInflation,  country.currency);
  animateCount('card-invest',    finalInvested,   country.currency);

  const gainVsColchon = finalInvested - finalBase;
  const lossFromInflation = finalBase - finalInflation;
  document.getElementById('gain-amount').textContent =
    formatCardValue(gainVsColchon, country.currency);
  document.getElementById('loss-amount').textContent =
    formatCardValue(lossFromInflation, country.currency);

  // Línea de erosión: % de poder de compra conservado frente al colchón
  const keptPct = finalBase > 0 ? (finalInflation / finalBase) * 100 : 0;
  document.getElementById('erosion-bar').style.width = `${Math.max(0, Math.min(100, keptPct))}%`;
  document.getElementById('erosion-pct').textContent = `${keptPct.toFixed(0)}%`;

  const ctx = document.getElementById('projection-chart').getContext('2d');
  const pRadius = years > 30 ? 1 : (years > 15 ? 2.5 : 4);
 
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Capital Inicial',
        data: seriesBase,
        borderColor: '#EFE9D8',
        backgroundColor: 'rgba(239, 233, 216, 0.06)',
        pointBackgroundColor: '#EFE9D8',
        borderWidth: 2,
        pointRadius: pRadius,
        pointHoverRadius: 7,
        fill: false,
        tension: 0.1,
        borderDash: [6, 4],
      },
      {
        label: 'Bajo el Colchón (inflación)',
        data: seriesInflation,
        borderColor: '#D26A5C',
        backgroundColor: 'rgba(210, 106, 92, 0.12)',
        pointBackgroundColor: '#D26A5C',
        borderWidth: 2.5,
        pointRadius: pRadius,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Invirtiendo Seguro',
        data: seriesInvested,
        borderColor: '#CBA349',
        backgroundColor: 'rgba(203, 163, 73, 0.14)',
        pointBackgroundColor: '#CBA349',
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
        backgroundColor: 'rgba(10, 39, 30, 0.95)',
        borderColor: 'rgba(203, 163, 73, 0.4)',
        borderWidth: 1,
        titleColor: '#EFE9D8',
        titleFont: { family: "'Fraunces', serif", weight: 'bold' },
        bodyColor: '#9DB8AC',
        bodyFont: { family: "'Spline Sans Mono', monospace" },
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
        ticks: { color: '#9DB8AC', font: { size: 11, family: "'Spline Sans Mono', monospace", weight: 'bold' } },
        grid: { color: 'rgba(239, 233, 216, 0.08)' },
      },
      y: {
        ticks: {
          color: '#9DB8AC',
          font: { size: 11, family: "'Spline Sans Mono', monospace", weight: 'bold' },
          callback: function (value) {
            const sym = country.currency_symbol;
            const abs = Math.abs(value);
            if (abs >= 1_000_000_000) return `${sym}${(value/1e9).toFixed(1)}B`;
            if (abs >= 1_000_000)     return `${sym}${(value/1e6).toFixed(1)}M`;
            if (abs >= 1_000)         return `${sym}${(value/1e3).toFixed(1)}k`;
            return `${sym}${value}`;
          }
        },
        grid: { color: 'rgba(239, 233, 216, 0.08)' },
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

function unlockPremiumFeatures(isInitialLoad = false) {
    localStorage.setItem('leadCaptured', 'true');

    const customRateInput = document.getElementById('custom-rate');
    if (customRateInput) {
        customRateInput.disabled = false;
        customRateInput.classList.remove('cursor-not-allowed', 'bg-black/5');
        customRateInput.placeholder = "Ej: 8.5";
    }
    
    const label = document.getElementById('custom-rate-label');
    if (label) {
        label.textContent = 'Tasa de rendimiento anual — Personalizada';
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
                <span class="font-display text-4xl mb-3 block text-oro" aria-hidden="true">&#10022;</span>
                <h3 class="text-xl font-bold text-oro mb-2">Funciones desbloqueadas</h3>
                <p class="text-base font-medium text-grabado-muted">Ya puedes usar la tasa personalizada en la sección de datos.</p>
            </div>
        `;
    }

    if (customRateInput && !isInitialLoad) {
        customRateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => customRateInput.focus(), 500);
    }
}
