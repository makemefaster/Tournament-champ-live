import { useState } from 'react'
import { SportType, getScoringRules } from '@tournament-champ/engine'
import './App.css'

function App() {
  const [selectedSport, setSelectedSport] = useState<SportType>('soccer')
  const rules = getScoringRules(selectedSport)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tournament Champ Admin</h1>
        <p className="subtitle">The Architect - Design and Manage Your Tournament</p>
      </header>
      
      <main className="main-content">
        <section className="sport-selector">
          <h2>Select Sport Logic</h2>
          <div className="sport-options">
            <button 
              className={selectedSport === 'soccer' ? 'active' : ''}
              onClick={() => setSelectedSport('soccer')}
            >
              ⚽ Soccer
            </button>
            <button 
              className={selectedSport === 'rugby' ? 'active' : ''}
              onClick={() => setSelectedSport('rugby')}
            >
              🏉 Rugby
            </button>
            <button 
              className={selectedSport === 'custom' ? 'active' : ''}
              onClick={() => setSelectedSport('custom')}
            >
              ⚙️ Custom
            </button>
          </div>
        </section>

        <section className="scoring-rules">
          <h3>Scoring Rules for {selectedSport.toUpperCase()}</h3>
          <div className="rules-grid">
            <div className="rule-item">
              <span className="rule-label">Win:</span>
              <span className="rule-value">{rules.winPoints} points</span>
            </div>
            <div className="rule-item">
              <span className="rule-label">Draw:</span>
              <span className="rule-value">{rules.drawPoints} points</span>
            </div>
            <div className="rule-item">
              <span className="rule-label">Loss:</span>
              <span className="rule-value">{rules.lossPoints} points</span>
            </div>
            <div className="rule-item">
              <span className="rule-label">Walkover:</span>
              <span className="rule-value">{rules.walkoverScore.home}-{rules.walkoverScore.away}</span>
            </div>
          </div>
        </section>

        <section className="features">
          <h3>Admin Features</h3>
          <ul>
            <li>📋 Design tournament grid (Supercounties or Blank Canvas)</li>
            <li>✅ Automatic validation for resource and team clashes</li>
            <li>🚀 Publish tournament to live URL</li>
            <li>⏰ Global push-back for schedule adjustments</li>
            <li>🏟️ Pitch evacuator for emergency relocations</li>
            <li>👋 Dropout handler for team withdrawals</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
