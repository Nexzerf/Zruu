// script.js

// ค่าตัวแปร
let expenseData = [];

const monthlyBudgetInput = document.getElementById('monthlyBudget');
const savingGoalInput = document.getElementById('savingGoal');
const daysInMonthInput = document.getElementById('daysInMonth');
const expenseList = document.getElementById('expenseList');
const addExpenseBtn = document.getElementById('addExpenseBtn');

const totalBudgetDisplay = document.getElementById('totalBudget');
const totalExpensesDisplay = document.getElementById('totalExpenses');
const netBudgetDisplay = document.getElementById('netBudget');
const dailyBudgetDisplay = document.getElementById('dailyBudget');

const chartCanvas = document.getElementById('expenseChart');
let expenseChart;

// ฟังก์ชันหลัก
function updateSummary() {
  const totalBudget = parseFloat(monthlyBudgetInput.value) || 0;
  const savingGoal = parseFloat(savingGoalInput.value) || 0;
  const daysInMonth = parseInt(daysInMonthInput.value) || 30;

  let totalExpenses = 0;
  expenseData = [];

  const expenseItems = document.querySelectorAll('.expense-item');

  expenseItems.forEach(item => {
    const name = item.querySelector('.expense-name').value;
    const mealCalcMode = item.querySelector('input[type="radio"][name^="mealCalc"]:checked');
    const isAuto = mealCalcMode && mealCalcMode.value === 'auto';
    const costs = item.querySelectorAll('.meal-cost');
    let sum = 0;

    if (isAuto) {
      costs.forEach(input => {
        sum += parseFloat(input.value || 0);
      });
      sum *= daysInMonth;
    } else {
      costs.forEach(input => {
        sum += parseFloat(input.value || 0);
      });
    }

    totalExpenses += sum;
    expenseData.push({ name, cost: sum });
  });

  const netBudget = Math.max(0, totalBudget - savingGoal);
  const dailyBudget = daysInMonth > 0 ? Math.max(0, (netBudget - totalExpenses) / daysInMonth) : 0;

  totalBudgetDisplay.textContent = totalBudget.toLocaleString();
  totalExpensesDisplay.textContent = totalExpenses.toLocaleString();
  netBudgetDisplay.textContent = netBudget.toLocaleString();
  dailyBudgetDisplay.textContent = dailyBudget.toFixed(2);

  updateChart();
}

// อัปเดตก่อน
monthlyBudgetInput.addEventListener('input', updateSummary);
savingGoalInput.addEventListener('input', updateSummary);
daysInMonthInput.addEventListener('input', updateSummary);

// เพิ่มหมวด
addExpenseBtn.addEventListener('click', () => {
  const newItem = document.createElement('div');
  newItem.classList.add('expense-item');
  newItem.innerHTML = `
    <input type="text" class="expense-name" placeholder="ชื่อหมวด" />
    <div class="meal-option">
      <input type="radio" name="mealCalc${Date.now()}" value="manual" checked> ระบุเอง
      <input type="radio" name="mealCalc${Date.now()}" value="auto"> คูณตามวัน
    </div>
    <div class="meal-costs">
      <label>เช้า<input type="number" class="meal-cost" data-meal="เช้า" min="0" /></label>
      <label>บ่าย<input type="number" class="meal-cost" data-meal="กลางวัน" min="0" /></label>
      <label>เย็น<input type="number" class="meal-cost" data-meal="เย็น" min="0" /></label>
    </div>
    <button class="btn-remove-expense">ลบ</button>
  `;

  newItem.querySelectorAll('input[type="radio"]').forEach(input => {
  input.addEventListener('change', updateSummary);
});


  newItem.querySelector('.btn-remove-expense').addEventListener('click', () => {
    newItem.remove();
    updateSummary();
  });

  expenseList.appendChild(newItem);
});

// แรกสุด
updateSummary();

// Chart.js
function updateChart() {
  const labels = expenseData.map(item => item.name);
  const data = expenseData.map(item => item.cost);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#00aaff', '#ffaa00', '#ff5599', '#00cc99', '#9966ff', '#ffcc00'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            font: {
              family: 'Prompt',
              weight: '600'
            }
          }
        }
      }
    }
  });
}
