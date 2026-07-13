import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

// --- GLOBAL SIDEBAR COMPONENT ---
function Sidebar() {
  return (
      <aside className="sidebar">
        <h2>🍺 BrewDash</h2>
        <nav>
          <ul>
            <li><Link to="/">🏠 Dashboard</Link></li>
            <li><a href="#search">🔍 Search & Filter</a></li>
          </ul>
        </nav>
      </aside>
  );
}

// --- MAIN DASHBOARD VIEW ---
function Dashboard() {
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Stretch Feature 2 State: Toggle visualization layout view modes
  const [chartToggle, setChartToggle] = useState('all'); // 'all' | 'pie' | 'bar' | 'hidden'

  useEffect(() => {
    const fetchBreweries = async () => {
      try {
        const response = await fetch('https://api.openbrewerydb.org/v1/breweries?per_page=50');
        const data = await response.json();
        setBreweries(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    fetchBreweries();
  }, []);

  // Filter Pipeline
  const filteredBreweries = breweries.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || b.brewery_type === selectedType;
    return matchesSearch && matchesType;
  });

  // KPI Computations
  const totalCount = filteredBreweries.length;
  const microCount = filteredBreweries.filter(b => b.brewery_type === 'micro').length;
  const uniqueStates = [...new Set(filteredBreweries.map(b => b.state).filter(Boolean))].length;

  // Chart 1: Classification Data
  const typeCounts = filteredBreweries.reduce((acc, b) => {
    acc[b.brewery_type] = (acc[b.brewery_type] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = Object.keys(typeCounts).map(type => ({ name: type, value: typeCounts[type] }));
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  // Chart 2: Regional Data
  const stateCounts = filteredBreweries.reduce((acc, b) => {
    if (b.state) acc[b.state] = (acc[b.state] || 0) + 1;
    return acc;
  }, {});
  const stateChartData = Object.keys(stateCounts)
      .map(state => ({ state, count: stateCounts[state] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  if (loading) return <div className="loading">Loading analytical dashboard...</div>;

  return (
      <main className="main-content">
        {/* Stretch Feature 1: Explicit Data Story Callout & Annotation */}
        <section className="data-story-card">
          <h3>📊 The Craft Brewery Landscape Story</h3>
          <p>
            This dashboard visualizes regional market setups across our production database.
            Notice how <strong>Micro</strong> setups heavily dominate local ecosystems, while larger regional supply chains
            concentrate heavily inside historic micro-production hubs.
          </p>
          <blockquote className="tip-box">
            💡 <strong>Analysis Tip:</strong> Try switching the category filter to <strong>"micro"</strong>. Watch how the
            Top States bar graph instantly shifts to map where small-business independent craft setups are densest!
          </blockquote>
        </section>

        {/* Metrics Summary Rows */}
        <section className="stats-container">
          <div className="stat-card"><h3>{totalCount}</h3><p>Total Filtered</p></div>
          <div className="stat-card"><h3>{microCount}</h3><p>Micro Breweries</p></div>
          <div className="stat-card"><h3>{uniqueStates}</h3><p>States Represented</p></div>
        </section>

        {/* Stretch Feature 2: Visualization Toggle Panel Buttons */}
        <section className="visualization-controls">
          <span className="control-label">👁️ Toggle Visualizations:</span>
          <button className={`toggle-btn ${chartToggle === 'all' ? 'active' : ''}`} onClick={() => setChartToggle('all')}>Show Both Charts</button>
          <button className={`toggle-btn ${chartToggle === 'pie' ? 'active' : ''}`} onClick={() => setChartToggle('pie')}>Breakdown Only</button>
          <button className={`toggle-btn ${chartToggle === 'bar' ? 'active' : ''}`} onClick={() => setChartToggle('bar')}>Regional Only</button>
          <button className={`toggle-btn ${chartToggle === 'hidden' ? 'active' : ''}`} onClick={() => setChartToggle('hidden')}>Hide All Visuals</button>
        </section>

        {/* Dynamic Conditional Visualization Charts Render Blocks */}
        {chartToggle !== 'hidden' && (
            <section className="charts-container">
              {(chartToggle === 'all' || chartToggle === 'pie') && (
                  <div className="chart-box">
                    <h4>Brewery Classification Breakdown</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                          {typeChartData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} Hubs`, 'Total']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
              )}

              {(chartToggle === 'all' || chartToggle === 'bar') && (
                  <div className="chart-box">
                    <h4>Top States Representation</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stateChartData}>
                        <XAxis dataKey="state" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              )}
            </section>
        )}

        {/* Core Search and Filters Panel */}
        <section id="search" className="controls-panel">
          <input
              type="text" placeholder="Search by brewery name..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input"
          />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            <option value="micro">Micro</option>
            <option value="regional">Regional</option>
            <option value="large">Large</option>
            <option value="brewpub">Brewpub</option>
          </select>
        </section>

        {/* Main Table Items Data Rows */}
        <section className="list-container">
          <table className="data-table">
            <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>City</th>
              <th>Details Link</th>
            </tr>
            </thead>
            <tbody>
            {filteredBreweries.map((brewery) => (
                <tr key={brewery.id}>
                  <td className="brewery-name">{brewery.name}</td>
                  <td><span className={`badge ${brewery.brewery_type}`}>{brewery.brewery_type}</span></td>
                  <td>{brewery.city}</td>
                  <td>
                    <Link to={`/brewery/${brewery.id}`} className="details-btn">View Details →</Link>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </section>
      </main>
  );
}

// --- ITEM ROUTE DETAIL VIEW ---
function BreweryDetail() {
  const { id } = useParams();
  const [brewery, setBrewery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndividualBrewery = async () => {
      try {
        const response = await fetch(`https://api.openbrewerydb.org/v1/breweries/${id}`);
        const data = await response.json();
        setBrewery(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile item:", error);
        setLoading(false);
      }
    };
    fetchIndividualBrewery();
  }, [id]);

  if (loading) return <div className="loading">Loading deep-dive details...</div>;
  if (!brewery) return <div className="no-results">Brewery records could not be found.</div>;

  return (
      <main className="main-content">
        <div className="detail-card">
          <Link to="/" className="back-link">← Back to Analytics Dashboard</Link>
          <h2>{brewery.name}</h2>
          <span className={`badge ${brewery.brewery_type}`}>{brewery.brewery_type} facility</span>

          <hr className="divider" />

          {/* Unique extra details parameters not present on the main dashboard view */}
          <div className="specs-grid">
            <div className="spec-item"><strong>📍 Street Address:</strong> {brewery.street || "Not Listed"}</div>
            <div className="spec-item"><strong>🏙️ City / Region:</strong> {brewery.city}, {brewery.state}</div>
            <div className="spec-item"><strong>📮 Postal Code:</strong> {brewery.postal_code || "N/A"}</div>
            <div className="spec-item"><strong>🌎 Country Base:</strong> {brewery.country}</div>
            <div className="spec-item"><strong>📞 Phone Contact:</strong> {brewery.phone || "No phone listed"}</div>
            <div className="spec-item">
              <strong>🌐 Official URL:</strong> {' '}
              {brewery.website_url ? (
                  <a href={brewery.website_url} target="_blank" rel="noreferrer" className="site-link">
                    Visit Web Domain
                  </a>
              ) : "No Website Provided"}
            </div>
          </div>
        </div>
      </main>
  );
}

// --- ROUTER CONFIGURATION ---
export default function App() {
  return (
      <BrowserRouter>
        <div className="dashboard-container">
          <Sidebar /> {/* Persists globally across both views */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/brewery/:id" element={<BreweryDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}
