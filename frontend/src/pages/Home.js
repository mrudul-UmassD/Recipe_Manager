import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/recipes');
      setRecipes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load recipes. Please try again later.');
      setLoading(false);
      console.error('Error fetching recipes:', err);
    }
  };

  // Filter recipes based on category and search term
  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = category === '' || recipe.category === category;
    const matchesSearch = searchTerm === '' || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Get unique categories from recipes
  const categories = ['', ...new Set(recipes.map(recipe => recipe.category))].filter(Boolean);

  return (
    <div className="home-container">
      <div className="page-header" style={{ marginBottom: '30px', marginTop: '30px' }}>
        <h1>My Recipes</h1>
        <Link to="/add-recipe" className="btn">
          <i className="fas fa-plus"></i> Add New Recipe
        </Link>
      </div>

      <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            flexGrow: 1
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ddd' 
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading recipes...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={fetchRecipes} className="btn">
            Retry
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No recipes found. Add your first recipe!</p>
          <Link to="/add-recipe" className="btn">
            Add Recipe
          </Link>
        </div>
      ) : (
        <div className="grid">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 