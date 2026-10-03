const API_URL = "http://localhost:3000/api/expenses";

let allExpenses = [];

// Show Alert Message
function showAlert(message, type) {
    const alertMessage = document.getElementById("alertMessage");

    alertMessage.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// Update Summary Cards
function updateSummary() {
    const totalExpenses = allExpenses.length;

    const totalAmount = allExpenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
    }, 0);

    const highestExpense = allExpenses.length > 0
        ? Math.max(...allExpenses.map(expense => Number(expense.amount)))
        : 0;

    document.getElementById("totalExpenses").textContent = totalExpenses;
    document.getElementById("totalAmount").textContent = totalAmount.toFixed(2);
    document.getElementById("highestExpense").textContent = highestExpense.toFixed(2);
}

// Load Expenses
async function loadExpenses() {
    const tableBody = document.getElementById("expenseTableBody");

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        allExpenses = await response.json();

        updateSummary();
        displayExpenses(allExpenses);
    } catch (error) {
        console.error("Error loading expenses:", error);
        showAlert("Failed to load expenses.", "danger");
    }
}

// Display Expenses
function displayExpenses(expenses) {
    const tableBody = document.getElementById("expenseTableBody");
    tableBody.innerHTML = "";

    expenses.forEach(expense => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${expense.id}</td>
            <td>${expense.title}</td>
            <td>${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="editExpense(${expense.id})">
                    Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="if (confirm('Are you sure you want to delete this expense?')) deleteExpense(${expense.id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Category Filter
document.getElementById("categoryFilter").addEventListener("change", function () {
    const selectedCategory = this.value;

    if (selectedCategory === "All") {
        displayExpenses(allExpenses);
    } else {
        const filteredExpenses = allExpenses.filter(expense => {
            return expense.category === selectedCategory;
        });

        displayExpenses(filteredExpenses);
    }
});

// Add Expense
document.getElementById("expenseForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const expense = {
        title: title,
        amount: Number(amount),
        category: category,
        date: date
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            throw new Error("Failed to add expense");
        }

        document.getElementById("expenseForm").reset();

        await loadExpenses();

        showAlert("Expense added successfully!", "success");
    } catch (error) {
        console.error("Error adding expense:", error);
        showAlert("Failed to add expense.", "danger");
    }
});

// Delete Expense
async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete expense");
        }

        await loadExpenses();

        showAlert("Expense deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting expense:", error);
        showAlert("Failed to delete expense.", "danger");
    }
}

// Edit Expense
async function editExpense(id) {
    const expense = allExpenses.find(expense => expense.id === id);

    if (!expense) {
        return;
    }

    document.getElementById("editId").value = expense.id;
    document.getElementById("editTitle").value = expense.title;
    document.getElementById("editAmount").value = expense.amount;
    document.getElementById("editCategory").value = expense.category;
    document.getElementById("editDate").value = expense.date;

    const modal = new bootstrap.Modal(
        document.getElementById("editExpenseModal")
    );

    modal.show();
}

// Update Expense
document.getElementById("editExpenseForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const title = document.getElementById("editTitle").value;
    const amount = document.getElementById("editAmount").value;
    const category = document.getElementById("editCategory").value;
    const date = document.getElementById("editDate").value;

    const updatedExpense = {
        title: title,
        amount: Number(amount),
        category: category,
        date: date
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedExpense)
        });

        if (!response.ok) {
            throw new Error("Failed to update expense");
        }

        const modalElement = document.getElementById("editExpenseModal");
        const modal = bootstrap.Modal.getInstance(modalElement);

        modal.hide();

        await loadExpenses();

        showAlert("Expense updated successfully!", "success");
    } catch (error) {
        console.error("Error updating expense:", error);
        showAlert("Failed to update expense.", "danger");
    }
});

// Start App
loadExpenses();