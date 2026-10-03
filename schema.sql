CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL
);