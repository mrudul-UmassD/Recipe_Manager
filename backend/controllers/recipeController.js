const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.getAllRecipes();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ message: 'Failed to get recipes', error: error.message });
  }
};

// Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.getRecipeById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error getting recipe:', error);
    res.status(500).json({ message: 'Failed to get recipe', error: error.message });
  }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const { 
      title, description, category, 
      prepTime, cookTime, servings, 
      ingredients, instructions 
    } = req.body;
    
    // Check for required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    // Create recipe with all data
    const recipeData = {
      title,
      description: description || '',
      category: category || 'Uncategorized',
      prepTime: prepTime || 0,
      cookTime: cookTime || 0,
      servings: servings || 0,
      imagePath,
      ingredients: JSON.parse(ingredients || '[]'),
      instructions: JSON.parse(instructions || '[]')
    };
    
    const recipe = await Recipe.createRecipe(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe', error: error.message });
  }
};

// Update an existing recipe
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, category, 
      prepTime, cookTime, servings, 
      ingredients, instructions 
    } = req.body;
    
    // Check if recipe exists
    const existingRecipe = await Recipe.getRecipeById(id);
    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Handle image upload
    let imagePath = null;
    if (req.file) {
      // Remove old image if exists
      if (existingRecipe.image_path) {
        const oldImagePath = path.join(__dirname, '..', existingRecipe.image_path);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    // Update recipe with all data
    const recipeData = {
      title: title || existingRecipe.title,
      description: description !== undefined ? description : existingRecipe.description,
      category: category || existingRecipe.category,
      prepTime: prepTime || existingRecipe.prep_time,
      cookTime: cookTime || existingRecipe.cook_time,
      servings: servings || existingRecipe.servings,
      imagePath,
      ingredients: JSON.parse(ingredients || JSON.stringify(existingRecipe.ingredients || [])),
      instructions: JSON.parse(instructions || JSON.stringify(existingRecipe.instructions || []))
    };
    
    const recipe = await Recipe.updateRecipe(id, recipeData);
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe', error: error.message });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if recipe exists and get image path
    const existingRecipe = await Recipe.getRecipeById(id);
    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Delete recipe from database
    const result = await Recipe.deleteRecipe(id);
    
    if (result.deleted) {
      // Remove image if exists
      if (existingRecipe.image_path) {
        const imagePath = path.join(__dirname, '..', existingRecipe.image_path);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.status(200).json({ message: 'Recipe deleted successfully' });
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Failed to delete recipe', error: error.message });
  }
}; 