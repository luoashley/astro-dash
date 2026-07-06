import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State variables
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Fetch API data using useEffect and async/await
  useEffect(() => {
    const fetchBreweries = async () => {
      try {
        const response = await fetch('https://api.openbrewerydb.org/v1/breweries?per_page=30');
        const data = await response.json();
        setBreweries(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchBreweries();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredBreweries = breweries.filter((brewery) => {
    const matchesSearch = brewery.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || brewery.brewery_type === selectedType;
    return matchesSearch && matchesType;
  });

  // --- CALCULATING SUMMARY STATISTICS ---
  const totalCount = filteredBreweries.length;

  const microCount = filteredBreweries.filter(b => b.brewery_type === 'micro').length;

  const uniqueStates = [...new Set(filteredBreweries.map(b => b.state).filter(Boolean))].length;

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
      <div className="dashboard-container">
        {/* Sidebar / Navbar Navigation */}
        <aside className="sidebar">
          <h2>🍺 BrewDash</h2>
          <nav>
            <ul>
              <li className="active">Dashboard</li>
              <li>Search</li>
              <li>About</li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Summary Statistics Cards */}
          <section className="stats-container">
            <div className="stat-card">
              <h3>{totalCount}</h3>
              <p>Total Filtered</p>
            </div>
            <div className="stat-card">
              <h3>{microCount}</h3>
              <p>Micro Breweries</p>
            </div>
            <div className="stat-card">
              <h3>{uniqueStates}</h3>
              <p>States Represented</p>
            </div>
          </section>

          {/* Controls: Search and Categories */}
          <section className="controls-panel">
            <input
                type="text"
                placeholder="Search by brewery name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />

            <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="micro">Micro</option>
              <option value="regional">Regional</option>
              <option value="large">Large</option>
              <option value="brewpub">Brewpub</option>
            </select>
          </section>

          {/* Data List View */}
          <section className="list-container">
            <table className="data-table">
              <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>State</th>
              </tr>
              </thead>
              <tbody>
              {filteredBreweries.length > 0 ? (
                  filteredBreweries.map((brewery) => (
                      <tr key={brewery.id}>
                        <td className="brewery-name">{brewery.name}</td>
                        <td><span className={`badge ${brewery.brewery_type}`}>{brewery.brewery_type}</span></td>
                        <td>{brewery.city || "N/A"}</td>
                        <td>{brewery.state || "N/A"}</td>
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan="4" className="no-results">No matches found. Try adjusting your filters!</td>
                  </tr>
              )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
  );
}

export default App;
