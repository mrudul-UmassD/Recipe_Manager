import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Recipe.module.css';

const RecipeCard = ({ recipe }) => {
  const { id, title, description, category, prep_time, cook_time, image_path } = recipe;
  
  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} h ${mins > 0 ? `${mins} min` : ''}`;
  };

  return (
    <div className={`${styles.recipeCard} card`}>
      <img 
        src={image_path ? `http://localhost:5000${image_path}` : '/default-recipe.jpg'} 
        alt={title}
        className={styles.recipeImage}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/default-recipe.jpg';
        }}
      />
      <div className={styles.recipeContent}>
        <h3 className={styles.recipeTitle}>{title}</h3>
        <p className={styles.recipeCategory}>{category}</p>
        <p className={styles.recipeDescription}>
          {description && description.length > 120
            ? `${description.substring(0, 120)}...`
            : description}
        </p>
        <div className={styles.recipeTime}>
          <div>
            <i className="far fa-clock"></i> Prep: {formatTime(prep_time)}
          </div>
          <div>
            <i className="fas fa-fire"></i> Cook: {formatTime(cook_time)}
          </div>
        </div>
        <div className={styles.recipeFooter}>
          <Link to={`/recipes/${id}`} className="btn">
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 