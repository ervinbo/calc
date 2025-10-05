const calculator = document.querySelector('.calculator');
const displayExpression = document.querySelector('.calculator__expression');
const displayResult = document.querySelector('.calculator__result');
const buttons = document.querySelectorAll('.calculator__grid button');
const themeToggle = document.querySelector('.theme-toggle');

let currentValue = '0';
let expression = '';
let lastInputType = null;
let pendingOperator = null;
let storedValue = null;

function parseDisplayValue(value) {
  return parseFloat(value.toString().replace(/,/g, ''));
}

function formatNumber(value) {
  if (!isFinite(value)) {
    return 'Error';
  }

  const rounded = parseFloat(Number(value).toFixed(8));
  const [whole, decimal] = rounded.toString().split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal && Number(decimal) !== 0 ? `${formattedWhole}.${decimal.replace(/0+$/, '')}` : formattedWhole;
}

function updateDisplay() {
  displayExpression.textContent = expression;
  displayResult.textContent = currentValue;
}

function handleNumber(value) {
  if (currentValue === '0' || lastInputType === 'operator' || lastInputType === 'equals') {
    currentValue = value === '.' ? '0.' : value;
  } else if (value === '.' && currentValue.includes('.')) {
    return;
  } else {
    currentValue += value;
  }
  lastInputType = 'number';
  updateDisplay();
}

function applyPendingOperator() {
  if (pendingOperator && storedValue !== null) {
    const a = storedValue;
    const b = parseDisplayValue(currentValue);

    let result = b;

    switch (pendingOperator) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        result = b === 0 ? NaN : a / b;
        break;
      default:
        break;
    }

    if (!isFinite(result)) {
      currentValue = 'Error';
      storedValue = null;
    } else {
      storedValue = result;
      currentValue = formatNumber(result);
    }
  }
}

function handleOperator(operator) {
  if (currentValue === 'Error') {
    return;
  }

  if (lastInputType === 'operator') {
    pendingOperator = operator;
    expression = expression.slice(0, -1) + operator;
  } else {
    if (pendingOperator && storedValue !== null && lastInputType !== 'equals') {
      applyPendingOperator();
    }
    storedValue = parseDisplayValue(currentValue);
    pendingOperator = operator;
    expression = `${formatNumber(storedValue)} ${operator}`;
    currentValue = formatNumber(storedValue);
  }
  lastInputType = 'operator';
  updateDisplay();
}

function handleEquals() {
  if (!pendingOperator || storedValue === null || currentValue === 'Error') {
    return;
  }

  const previousExpression = `${formatNumber(storedValue)} ${pendingOperator} ${currentValue}`;
  applyPendingOperator();
  expression = previousExpression;
  pendingOperator = null;
  storedValue = null;
  lastInputType = 'equals';
  updateDisplay();
}

function handleClear() {
  currentValue = '0';
  expression = '';
  pendingOperator = null;
  storedValue = null;
  lastInputType = null;
  updateDisplay();
}

function handleSignToggle() {
  if (currentValue === '0' || currentValue === 'Error') return;
  if (currentValue.startsWith('-')) {
    currentValue = currentValue.slice(1);
  } else {
    currentValue = `-${currentValue}`;
  }
  updateDisplay();
}

function handlePercent() {
  if (currentValue === 'Error') return;
  const numericValue = parseDisplayValue(currentValue);
  if (isNaN(numericValue)) return;
  currentValue = formatNumber(numericValue / 100);
  lastInputType = 'percent';
  updateDisplay();
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const { action, value } = button.dataset;

    switch (action) {
      case 'clear':
        handleClear();
        break;
      case 'sign':
        handleSignToggle();
        break;
      case 'percent':
        handlePercent();
        break;
      case 'operator':
        handleOperator(value);
        break;
      case 'equals':
        handleEquals();
        break;
      default:
        handleNumber(value);
        break;
    }
  });
});

function toggleTheme() {
  calculator.classList.toggle('theme-light');
  calculator.classList.toggle('theme-dark');
  const icon = themeToggle.querySelector('.icon');
  icon.classList.toggle('icon--sun');
  icon.classList.toggle('icon--moon');
}

themeToggle.addEventListener('click', toggleTheme);

document.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    handleNumber(key);
  } else if (key === '.') {
    handleNumber(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleOperator(key);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleEquals();
  } else if (key === 'Escape') {
    handleClear();
  } else if (key === '%') {
    handlePercent();
  }
});

updateDisplay();
