const express = require("express");
const axios = require("axios");
const pool = require("../db").default;
const bcrypt = require("bcryptjs");
const router = express.Router();

const AI_API_URL = process.env.AI_API_URL;

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Authentication successful",
      user_id: user.user_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error during authentication" });
  }
});

router.post("/onboarding", async (req, res) => {
  try {
    const {
      age,
      monthly_income,
      current_saving,
      financial_literacy,
      address,
      risk_tolerance,
      financial_goals,
      password,
      investment_type,
      name,
      gender,
      email,
      phone_number,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (age, monthly_income, current_saving, financial_literacy, address, risk_tolerance, 
                          financial_goals, password, investment_type, name, gender, email, phone_number) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING user_id`,
      [
        age,
        monthly_income,
        current_saving,
        financial_literacy,
        address,
        risk_tolerance,
        financial_goals,
        hashedPassword,
        investment_type,
        name,
        gender,
        email,
        phone_number,
      ]
    );

    res.json({ success: true, user_id: result.rows[0].user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
});
router.post("/dashboard", async (req, res) => {
  try {
    const {
      user_id, // Keep this for database storage
      individual_goals,
      age,
      gender,
      risk_tolerance,
      financial_literacy,
    } = req.body;

    const aiRequestBody = {
      individual_goals,
      age,
      gender,
      risk_tolerance,
      financial_literacy,
    };

    const response = await axios.post(AI_API_URL, aiRequestBody);

    const recommended_products = JSON.stringify(
      response.data.recommended_products
    );

    await pool.query(
      `INSERT INTO investment_recommendations (user_id, individual_goals, age, gender, risk_tolerance, financial_literacy, recommended_products) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user_id,
        individual_goals,
        age,
        gender,
        risk_tolerance,
        financial_literacy,
        recommended_products,
      ]
    );

    res.json({ success: true, recommended_products });
  } catch (error) {
    console.error(
      "Error in /dashboard:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Error processing investment recommendation" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      "SELECT * FROM investment_recommendations WHERE user_id = $1",
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching recommendations" });
  }
});

module.exports = router;
