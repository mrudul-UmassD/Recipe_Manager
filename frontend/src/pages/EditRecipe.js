import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeForm from '../components/RecipeForm';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading recipe data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="btn"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Recipe not found.</p>
        <button 
          onClick={() => navigate('/')} 
          className="btn"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="edit-recipe-page">
      <RecipeForm 
        recipe={recipe} 
        isEditing={true} 
      />
    </div>
  );
};

export default EditRecipe; 