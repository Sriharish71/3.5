const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const dataFile = path.join(__dirname, "data", "recipes.json");

// --- Helper: Read recipes from file ---
const getRecipes = () => {
  return fs.readFile(dataFile, "utf-8")
    .then((data) => JSON.parse(data || "[]"))
    .catch((err) => {
      console.error("Error reading recipes.json:", err);
      return [];
    });
};

// --- Helper: Save recipes to file ---
const saveRecipes = (recipes) => {
  return fs.writeFile(dataFile, JSON.stringify(recipes, null, 2))
    .then(() => console.log("Recipes saved successfully"))
    .catch((err) => console.error("Error saving recipes:", err));
};

// --- Task 1: Add a new recipe (POST) ---
app.post("/api/recipes", (req, res) => {
  const { title, ingredients, instructions, cookTime, difficulty } = req.body;

  if (!title || !ingredients || !instructions) {
    return res
      .status(400)
      .json({ error: "Title, ingredients, and instructions are required." });
  }

  const newRecipe = {
    id: Date.now(),
    title,
    ingredients,
    instructions,
    cookTime: cookTime || "N/A",
    difficulty: difficulty || "medium",
  };

  getRecipes()
    .then((recipes) => {
      recipes.push(newRecipe);
      return saveRecipes(recipes).then(() => res.status(201).json(newRecipe));
    })
    .catch((error) => {
      console.error("Error adding recipe:", error);
      res.status(500).json({ error: "Could not save recipe." });
    });
});

// --- Task 2: Get all recipes (GET) ---
app.get("/api/recipes", (req, res) => {
  getRecipes()
    .then((recipes) => res.json(recipes))
    .catch((error) => {
      console.error("Error retrieving recipes:", error);
      res.status(500).json({ error: "Could not read recipes.json" });
    });
});

// --- Default Route ---
app.get("/", (req, res) => {
  res.send("Recipe API is running successfully!");
});

// --- Server Port ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});