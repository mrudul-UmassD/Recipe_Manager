const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class Recipe {
  // Get all recipes with basic info
  static getAllRecipes() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM recipes ORDER BY created_at DESC`;
      
      db.all(query, [], (err, recipes) => {
        if (err) {
          reject(err);
        } else {
          resolve(recipes);
        }
      });
    });
  }

  // Get a single recipe with all details
  static getRecipeById(id) {
    return new Promise((resolve, reject) => {
      // Get the recipe
      const recipeQuery = `SELECT * FROM recipes WHERE id = ?`;
      
      db.get(recipeQuery, [id], (err, recipe) => {
        if (err) {
          return reject(err);
        }
        
        if (!recipe) {
          return resolve(null);
        }
        
        // Get ingredients
        const ingredientsQuery = `SELECT * FROM ingredients WHERE recipe_id = ?`;
        db.all(ingredientsQuery, [id], (err, ingredients) => {
          if (err) {
            return reject(err);
          }
          
          // Get instructions
          const instructionsQuery = `SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number`;
          db.all(instructionsQuery, [id], (err, instructions) => {
            if (err) {
              return reject(err);
            }
            
            // Combine all data
            recipe.ingredients = ingredients;
            recipe.instructions = instructions;
            resolve(recipe);
          });
        });
      });
    });
  }

  // Create a new recipe
  static createRecipe(recipeData) {
    return new Promise((resolve, reject) => {
      const recipeId = uuidv4();
      const { 
        title, description, category, 
        prepTime, cookTime, servings, 
        imagePath, ingredients, instructions 
      } = recipeData;
      
      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insert recipe
        const recipeQuery = `
          INSERT INTO recipes (id, title, description, category, prep_time, cook_time, servings, image_path)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(recipeQuery, [
          recipeId, title, description, category, 
          prepTime, cookTime, servings, imagePath
        ], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          // Insert ingredients
          if (ingredients && ingredients.length > 0) {
            const ingredientQuery = `
              INSERT INTO ingredients (recipe_id, name, quantity, unit)
              VALUES (?, ?, ?, ?)
            `;
            
            ingredients.forEach(ingredient => {
              db.run(ingredientQuery, [
                recipeId, 
                ingredient.name, 
                ingredient.quantity, 
                ingredient.unit
              ], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
              });
            });
          }
          
          // Insert instructions
          if (instructions && instructions.length > 0) {
            const instructionQuery = `
              INSERT INTO instructions (recipe_id, step_number, description)
              VALUES (?, ?, ?)
            `;
            
            instructions.forEach((instruction, index) => {
              db.run(instructionQuery, [
                recipeId, 
                index + 1, 
                instruction
              ], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
              });
            });
          }
          
          // Commit transaction
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            resolve({
              id: recipeId,
              ...recipeData
            });
          });
        });
      });
    });
  }

  // Update an existing recipe
  static updateRecipe(id, recipeData) {
    return new Promise((resolve, reject) => {
      const { 
        title, description, category, 
        prepTime, cookTime, servings, 
        imagePath, ingredients, instructions 
      } = recipeData;
      
      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Update recipe
        const recipeQuery = `
          UPDATE recipes 
          SET title = ?, description = ?, category = ?, 
              prep_time = ?, cook_time = ?, servings = ?, 
              image_path = CASE WHEN ? IS NULL THEN image_path ELSE ? END
          WHERE id = ?
        `;
        
        db.run(recipeQuery, [
          title, description, category, 
          prepTime, cookTime, servings, 
          imagePath, imagePath, id
        ], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          // Delete existing ingredients
          db.run(`DELETE FROM ingredients WHERE recipe_id = ?`, [id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            // Delete existing instructions
            db.run(`DELETE FROM instructions WHERE recipe_id = ?`, [id], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              // Insert ingredients
              if (ingredients && ingredients.length > 0) {
                const ingredientQuery = `
                  INSERT INTO ingredients (recipe_id, name, quantity, unit)
                  VALUES (?, ?, ?, ?)
                `;
                
                ingredients.forEach(ingredient => {
                  db.run(ingredientQuery, [
                    id, 
                    ingredient.name, 
                    ingredient.quantity, 
                    ingredient.unit
                  ], (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject(err);
                    }
                  });
                });
              }
              
              // Insert instructions
              if (instructions && instructions.length > 0) {
                const instructionQuery = `
                  INSERT INTO instructions (recipe_id, step_number, description)
                  VALUES (?, ?, ?)
                `;
                
                instructions.forEach((instruction, index) => {
                  db.run(instructionQuery, [
                    id, 
                    index + 1, 
                    instruction
                  ], (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject(err);
                    }
                  });
                });
              }
              
              // Commit transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                resolve({
                  id,
                  ...recipeData
                });
              });
            });
          });
        });
      });
    });
  }

  // Delete a recipe
  static deleteRecipe(id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Delete recipe (cascades to ingredients and instructions)
        const query = `DELETE FROM recipes WHERE id = ?`;
        
        db.run(query, [id], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          if (this.changes === 0) {
            db.run('ROLLBACK');
            return resolve({ deleted: false });
          }
          
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            resolve({ deleted: true });
          });
        });
      });
    });
  }
}

module.exports = Recipe; 