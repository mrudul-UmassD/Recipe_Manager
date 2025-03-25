import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Form.module.css';

const RecipeForm = ({ recipe, isEditing }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Uncategorized',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [''],
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data with existing recipe when editing
  useEffect(() => {
    if (isEditing && recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        category: recipe.category || 'Uncategorized',
        prepTime: recipe.prep_time || '',
        cookTime: recipe.cook_time || '',
        servings: recipe.servings || '',
        ingredients: recipe.ingredients && recipe.ingredients.length > 0 
          ? recipe.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }))
          : [{ name: '', quantity: '', unit: '' }],
        instructions: recipe.instructions && recipe.instructions.length > 0
          ? recipe.instructions.map(i => i.description)
          : [''],
        image: null
      });

      if (recipe.image_path) {
        setImagePreview(`http://localhost:5000${recipe.image_path}`);
      }
    }
  }, [isEditing, recipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [name]: value };
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleInstructionChange = (index, e) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = e.target.value;
    setFormData({ ...formData, instructions: updatedInstructions });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const removeInstruction = (index) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions.splice(index, 1);
    setFormData({ ...formData, instructions: updatedInstructions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError('Title is required');
      return;
    }

    // Filter out empty ingredients and instructions
    const ingredients = formData.ingredients.filter(ing => ing.name.trim() !== '');
    const instructions = formData.instructions.filter(inst => inst.trim() !== '');

    try {
      setLoading(true);
      setError('');

      // Create FormData for multipart/form-data (for image upload)
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('prepTime', formData.prepTime);
      formDataToSend.append('cookTime', formData.cookTime);
      formDataToSend.append('servings', formData.servings);
      formDataToSend.append('ingredients', JSON.stringify(ingredients));
      formDataToSend.append('instructions', JSON.stringify(instructions));
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        response = await axios.put(`/api/recipes/${recipe.id}`, formDataToSend);
      } else {
        response = await axios.post('/api/recipes', formDataToSend);
      }

      setLoading(false);
      
      // Navigate to the recipe detail page
      navigate(`/recipes/${response.data.id}`);
    } catch (err) {
      setLoading(false);
      setError('Error saving recipe. Please try again.');
      console.error('Error saving recipe:', err);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</h2>
      
      {error && <div className={styles.formError}>{error}</div>}
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Recipe Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Enter recipe title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.formSelect}
          >
            <option value="Uncategorized">Uncategorized</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
            <option value="Snack">Snack</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.formTextarea}
            placeholder="Enter recipe description"
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.imageUpload}>
            <label className={styles.formLabel}>Recipe Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.formInput}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Recipe preview"
                className={styles.imagePreview}
              />
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Prep Time (minutes)</label>
          <input
            type="number"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Enter prep time in minutes"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Cook Time (minutes)</label>
          <input
            type="number"
            name="cookTime"
            value={formData.cookTime}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Enter cook time in minutes"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Servings</label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Enter number of servings"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ingredients</label>
          <div className={styles.dynamicFields}>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className={styles.ingredientField}>
                <input
                  type="text"
                  name="name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, e)}
                  className={styles.formInput}
                  placeholder="Ingredient name"
                />
                <input
                  type="text"
                  name="quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, e)}
                  className={styles.formInput}
                  placeholder="Amount"
                />
                <input
                  type="text"
                  name="unit"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, e)}
                  className={styles.formInput}
                  placeholder="Unit"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className={styles.removeButton}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className={styles.addButton}
            >
              <i className="fas fa-plus"></i> Add Ingredient
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Instructions</label>
          <div className={styles.dynamicFields}>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className={styles.dynamicField}>
                <textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e)}
                  className={`${styles.formTextarea} ${styles.fieldInput}`}
                  placeholder={`Step ${index + 1}`}
                />
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className={styles.removeButton}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInstruction}
              className={styles.addButton}
            >
              <i className="fas fa-plus"></i> Add Step
            </button>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={`btn ${styles.formSubmitButton}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Recipe' : 'Save Recipe'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm; 