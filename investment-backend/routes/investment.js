const express = require("express");
const axios = require("axios");
const pool = require("../db").default;
const router = express.Router();

const AI_API_URL = process.env.AI_API_URL || "http://localhost:5000/predict";

router.post("/recommendation", async (req, res) => {
  try {
    const {
      user_id,
      individual_goals,
      age,
      gender,
      risk_tolerance,
      financial_literacy,
    } = req.body;

    const response = await axios.post(AI_API_URL, req.body);
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
    console.error(error);
    res
      .status(500)
      .json({ error: "Error processing investment recommendation" });
  }
});

router.get("/recommendations/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
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
