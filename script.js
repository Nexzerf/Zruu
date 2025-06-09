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
const remainingBalanceDisplay = document.getElementById('remainingBalance');
const foodDailyDisplay = document.getElementById('foodDaily');
const foodPerMealDisplay = document.getElementById('foodPerMeal');

const chartCanvas = document.getElementById('expenseChart');
let expenseChart;

function updateSummary() {
  const totalBudget = parseFloat(monthlyBudgetInput.value) || 0;
  const savingGoal = parseFloat(savingGoalInput.value) || 0;
  const daysInMonth = parseInt(daysInMonthInput.value) || 30;

  // ถ้ายังไม่ได้กรอกงบประมาณ ไม่ให้คำนวณ
  if (!totalBudget) {
    totalBudgetDisplay.textContent = '0';
    totalExpensesDisplay.textContent = '0';
    netBudgetDisplay.textContent = '0';
    dailyBudgetDisplay.textContent = '0.00';
    remainingBalanceDisplay.textContent = '0';
    foodDailyDisplay.textContent = '-';
    foodPerMealDisplay.textContent = '-';
    if (expenseChart) expenseChart.destroy();
    return;
  }

  const netBudget = Math.max(0, totalBudget - savingGoal);
  let totalExpenses = 0;
  expenseData = [];

  let foodItem = null;
  let otherExpenses = 0;

  let foodPerMeal = '-';
  let foodDaily = '-';

  const expenseItems = document.querySelectorAll('.expense-item');

  expenseItems.forEach((item) => {
    const name = item.querySelector('.expense-name')?.value || 'ไม่ระบุ';
    const mealInputs = item.querySelectorAll('.meal-cost');
    const generalCostInput = item.querySelector('.general-cost');
    const radio = item.querySelector('input[type="radio"]:checked');
    let cost = 0;

    if (mealInputs.length > 0) {
      if (radio?.value === 'auto') {
        foodItem = { item, name };
        return; // ข้ามไปก่อน ยังไม่คิด
      } else {
        // manual
        let subtotal = 0;
        mealInputs.forEach(input => {
          subtotal += parseFloat(input.value || 0);
        });
        cost = subtotal * daysInMonth;
      }
    } else if (generalCostInput) {
      const mode = item.querySelector(`input[name="costMode${item.dataset.id}"]:checked`)?.value;
      let value = parseFloat(generalCostInput.value || 0);
      cost = (mode === 'daily') ? value * daysInMonth : value;
    }

    totalExpenses += cost;
    otherExpenses += cost;
    expenseData.push({ name, cost });
  });

  if (foodItem) {
    if (totalBudget === 0) {
      alert("โปรดใส่จำนวนงบประมาณรายเดือนก่อนเลือกคำนวณค่าอาหารแบบอัตโนมัติ");
      const mealInputs = foodItem.item.querySelectorAll('.meal-cost');
      mealInputs.forEach(input => {
        input.placeholder = 'ต้องกรอกงบก่อน';
        input.value = '';
      });
    } else {
      const available = Math.max(0, netBudget - otherExpenses);
      const totalMeals = 3 * daysInMonth;

      let foodBudgetPercent;
      if (netBudget <= 2000) {
        foodBudgetPercent = 0.85;
      } else if (netBudget <= 5000) {
        foodBudgetPercent = 0.65;
      } else if (netBudget <= 10000) {
        foodBudgetPercent = 0.55;
      } else if (netBudget <= 20000) {
        foodBudgetPercent = 0.45;
      } else {
        foodBudgetPercent = 0.35;
      }

      const foodBudget = available * foodBudgetPercent;
      foodPerMeal = totalMeals > 0 ? foodBudget / totalMeals : 0;
      foodDaily = foodPerMeal * 3;
      const foodCost = foodPerMeal * totalMeals;

      const mealInputs = foodItem.item.querySelectorAll('.meal-cost');
      mealInputs.forEach(input => {
        input.placeholder = `${foodPerMeal.toFixed(0)} (auto)`;
        input.value = '';
      });

      totalExpenses += foodCost;
      expenseData.push({ name: foodItem.name, cost: foodCost });
    }
  }

  const remainingBalance = Math.max(0, netBudget - totalExpenses);
  const dailyBudget = daysInMonth > 0 ? remainingBalance / daysInMonth : 0;

  totalBudgetDisplay.textContent = totalBudget.toLocaleString();
  totalExpensesDisplay.textContent = totalExpenses.toLocaleString();
  netBudgetDisplay.textContent = netBudget.toLocaleString();
  dailyBudgetDisplay.textContent = dailyBudget.toFixed(2);
  remainingBalanceDisplay.textContent = remainingBalance.toLocaleString();
  foodDailyDisplay.textContent = (typeof foodDaily === 'number') ? foodDaily.toFixed(0) : '-';
  foodPerMealDisplay.textContent = (typeof foodPerMeal === 'number') ? foodPerMeal.toFixed(0) : '-';

  updateChart();
}

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
        backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function createNewExpenseItem(id) {
  const newItem = document.createElement('div');
  newItem.classList.add('expense-item');
  newItem.dataset.id = id;
  newItem.innerHTML = `
    <input type="text" class="expense-name" placeholder="ชื่อหมวดหมู่" />
    <input type="number" class="general-cost" placeholder="จำนวนเงิน" min="0" />
    <div class="cost-mode-wrapper">
      <label><input type="radio" name="costMode${id}" value="daily" checked /> ต่อวัน</label>
      <label><input type="radio" name="costMode${id}" value="monthly" /> ต่อเดือน</label>
    </div>
    <button class="btn-remove-expense">ลบ</button>
  `;

  newItem.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateSummary);
    input.addEventListener('change', updateSummary);
  });

  newItem.querySelector('.btn-remove-expense').addEventListener('click', () => {
    newItem.remove();
    updateSummary();
  });

  return newItem;
}

monthlyBudgetInput.addEventListener('input', updateSummary);
savingGoalInput.addEventListener('input', updateSummary);
daysInMonthInput.addEventListener('input', updateSummary);

expenseList.addEventListener('change', (e) => {
  if (e.target.name?.startsWith('mealCalc')) {
    const parent = e.target.closest('.expense-item');
    const mealInputs = parent.querySelector('.meal-costs');
    if (mealInputs) {
      mealInputs.style.display = (e.target.value === 'auto') ? 'none' : 'flex';
    }
    updateSummary();
  }
});

addExpenseBtn.addEventListener('click', () => {
  const newId = Date.now();
  const newItem = createNewExpenseItem(newId);
  expenseList.appendChild(newItem);
});

updateSummary();
