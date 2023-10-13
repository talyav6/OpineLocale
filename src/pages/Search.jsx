import React, { useState } from 'react';

// Dummy data for the example
const establishments = [
  { id: 1, name: 'Elegant Hotel', type: 'Hotel', rating: 4.5, reviews: 20 },
  { id: 2, name: 'Oceanic Restaurant', type: 'Restaurant', rating: 4.2, reviews: 10 },
  { id: 3, name: 'Mountain View Resort', type: 'Hotel', rating: 4.8, reviews: 15 },
];

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    const filtered = establishments.filter((establishment) =>
      establishment.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div>
      <h1>Search Establishments</h1>
      
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an establishment..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            <h2>{result.name} ({result.type})</h2>
            <p>Rating: {result.rating} stars based on {result.reviews} reviews</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;
