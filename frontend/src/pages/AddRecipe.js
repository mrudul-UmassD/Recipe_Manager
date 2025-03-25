import React from 'react';
import RecipeForm from '../components/RecipeForm';

const AddRecipe = () => {
  return (
    <div className="add-recipe-page">
      <RecipeForm isEditing={false} />
    </div>
  );
};

export default AddRecipe; 