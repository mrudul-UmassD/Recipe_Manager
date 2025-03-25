import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Recipe.module.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load recipe. It may have been deleted or does not exist.');
      setLoading(false);
      console.error('Error fetching recipe:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await axios.delete(`/api/recipes/${id}`);
      navigate('/');
    } catch (err) {
      setError('Failed to delete recipe. Please try again.');
      console.error('Error deleting recipe:', err);
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} h ${mins > 0 ? `${mins} min` : ''}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/" className="btn">
          Back to Recipes
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Recipe not found.</p>
        <Link to="/" className="btn">
          Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.recipeDetail}>
      <div className={styles.detailHeader}>
        {recipe.image_path ? (
          <img 
            src={`http://localhost:5000${recipe.image_path}`} 
            alt={recipe.title} 
            className={styles.detailImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-recipe.jpg';
            }}
          />
        ) : (
          <img 
            src="/default-recipe.jpg" 
            alt={recipe.title} 
            className={styles.detailImage}
          />
        )}
      </div>

      <div className={styles.detailContent}>
        <h1 className={styles.detailTitle}>{recipe.title}</h1>
        <p className={styles.detailCategory}>{recipe.category || 'Uncategorized'}</p>

        <div className={styles.detailTime}>
          <div>
            <i className="far fa-clock"></i> Prep: {formatTime(recipe.prep_time)}
          </div>
          <div>
            <i className="fas fa-fire"></i> Cook: {formatTime(recipe.cook_time)}
          </div>
          {recipe.servings && (
            <div>
              <i className="fas fa-utensils"></i> Servings: {recipe.servings}
            </div>
          )}
        </div>

        {recipe.description && (
          <p className={styles.detailDescription}>{recipe.description}</p>
        )}

        <h2 className={styles.sectionTitle}>Ingredients</h2>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <ul className={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className={styles.ingredientItem}>
                <i className="fas fa-check"></i>
                {ingredient.quantity && `${ingredient.quantity} `}
                {ingredient.unit && `${ingredient.unit} `}
                {ingredient.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No ingredients listed.</p>
        )}

        <h2 className={styles.sectionTitle}>Instructions</h2>
        {recipe.instructions && recipe.instructions.length > 0 ? (
          <ol className={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className={styles.instructionItem}>
                <span className={styles.instructionNumber}>{index + 1}</span>
                {instruction.description}
              </li>
            ))}
          </ol>
        ) : (
          <p>No instructions listed.</p>
        )}

        <div className={styles.actionButtons}>
          <Link to={`/edit-recipe/${id}`} className="btn">
            <i className="fas fa-edit"></i> Edit Recipe
          </Link>
          <button 
            onClick={handleDelete} 
            className={`btn btn-danger ${confirmDelete ? 'btn-confirm' : ''}`}
          >
            {confirmDelete ? 'Confirm Delete' : <><i className="fas fa-trash"></i> Delete Recipe</>}
          </button>
          {confirmDelete && (
            <button 
              onClick={() => setConfirmDelete(false)} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 