// =====================================================================
// Calculadora Fondo de Emergencia vs. Inflación — script.js
// =====================================================================

let countriesData = [];
let projectionChart = null;

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

    // Trigger info box update on first load
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

// ── Currency formatter (full precision, for tooltips & banner) ───────
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('es-419', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Smart card formatter: abbreviates large numbers to fit in cards ───
// e.g. 999,999,999 → $ 1,000 M  |  1,500,000 → $ 1.5 M
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
    // Small enough — show cleanly without decimals
    const formatted = new Intl.NumberFormat('es-419', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${sym} ${formatted}`;
  }

  // Format the abbreviated number
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
    // Ease-out quart (más suave al final)
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = start + (targetValue - start) * eased;
    // Use abbreviated formatter for cards — prevents overflow
    el.textContent = formatCardValue(current, currency);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Main calculation logic ────────────────────────────────────────────
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

  // Si el usuario da una tasa personalizada, convertirla (e.g. 8.5 -> 0.085)
  const customRate = parseFloat(customRateStr);
  const effectiveSafeRate = (!isNaN(customRate) && customRate >= 0) ? (customRate / 100) : country.safe_rate;

  // Build year-by-year series (0 to years inclusive)
  const labels = [];
  const seriesBase = [];      // Blue — flat capital
  const seriesInflation = []; // Red  — eroded by inflation
  const seriesInvested = [];  // Green — compound interest

  for (let t = 0; t <= years; t++) {
    labels.push(t === 0 ? 'Hoy' : `Año ${t}`);
    seriesBase.push(capital);
    seriesInflation.push(capital / Math.pow(1 + country.inflation_rate, t));
    seriesInvested.push(capital * Math.pow(1 + effectiveSafeRate, t));
  }

  const finalInflation = seriesInflation[years];
  const finalInvested  = seriesInvested[years];

  // ── Update result cards ──────────────────────────────────────────
  const resultsSection = document.getElementById('results-section');
  resultsSection.classList.remove('hidden');

  // Scroll gently to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  animateCount('card-initial',  capital,         country.currency);
  animateCount('card-inflation', finalInflation,  country.currency);
  animateCount('card-invest',    finalInvested,   country.currency);

  // Summary banner
  const gainVsColchon = finalInvested - finalInflation;
  const lossFromInflation = capital - finalInflation;
  document.getElementById('gain-amount').textContent =
    formatCardValue(gainVsColchon, country.currency);
  document.getElementById('loss-amount').textContent =
    formatCardValue(lossFromInflation, country.currency);

  // ── Render / Update Chart ────────────────────────────────────────
  const ctx = document.getElementById('projection-chart').getContext('2d');

  // Dinamic point radius para evitar puntos gordos al seleccionar muchos años
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

// ── Event: slider update display ──────────────────────────────────────
document.getElementById('years').addEventListener('input', function () {
  const v = this.value;
  document.getElementById('years-display').textContent =
    v === '1' ? '1 año' : `${v} años`;
});

// ── Event: country change ─────────────────────────────────────────────
document.getElementById('country').addEventListener('change', updateRatesInfo);

// ── Event: calculate button ───────────────────────────────────────────
document.getElementById('btn-calculate').addEventListener('click', calculate);

// ── Also allow Enter key on capital input ─────────────────────────────
document.getElementById('capital').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') calculate();
});

// ── Init ──────────────────────────────────────────────────────────────
loadCountries();
