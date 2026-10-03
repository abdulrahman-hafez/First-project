const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.query("SELECT NOW()", (error, result) => {
    if (error) {
        console.error("Database connection failed:", error);
    } else {
        console.log("Database connected successfully");
    }
});

app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                title,
                amount::float AS amount,
                category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date
             FROM expenses
             ORDER BY id`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        const result = await pool.query(
            `SELECT
                id,
                title,
                amount::float AS amount,
                category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date
             FROM expenses
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/expenses", async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        if (!title || amount === undefined || !category || !date) {
            return res.status(400).json({
                message: "Title, amount, category, and date are required"
            });
        }

        const numericAmount = Number(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "Amount must be a number greater than 0"
            });
        }

        const allowedCategories = [
            "Food",
            "Transport",
            "Bills",
            "Entertainment",
            "Other"
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category"
            });
        }

        const result = await pool.query(
            `INSERT INTO expenses (title, amount, category, date)
             VALUES ($1, $2, $3, $4)
             RETURNING
                id,
                title,
                amount::float AS amount,
                category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date`,
            [title, numericAmount, category, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.put("/api/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        const { title, amount, category, date } = req.body;

        if (!title || amount === undefined || !category || !date) {
            return res.status(400).json({
                message: "Title, amount, category, and date are required"
            });
        }

        const numericAmount = Number(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "Amount must be a number greater than 0"
            });
        }

        const allowedCategories = [
            "Food",
            "Transport",
            "Bills",
            "Entertainment",
            "Other"
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category"
            });
        }

        const result = await pool.query(
            `UPDATE expenses
             SET title = $1,
                 amount = $2,
                 category = $3,
                 date = $4
             WHERE id = $5
             RETURNING
                id,
                title,
                amount::float AS amount,
                category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date`,
            [title, numericAmount, category, date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        const result = await pool.query(
            `DELETE FROM expenses
             WHERE id = $1
             RETURNING
                id,
                title,
                amount::float AS amount,
                category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully",
            expense: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/hello", (req, res) => {
    res.json({
        message: "Hello from Expense Tracker API"
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});