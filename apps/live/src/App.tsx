import { useState, useEffect } from 'react'
import { calculateStandings, getScoringRules, Team, Match, Standing } from '@tournament-champ/engine'
import './App.css'

// Mock data for demonstration
const mockTeams: Team[] = [
  { id: '1', name: 'Hurricanes' },
  { id: '2', name: 'Thunderbolts' },
  { id: '3', name: 'Wildcats' },
  { id: '4', name: 'Phoenix' },
]

const mockMatches: Match[] = [
  {
    id: 'm1',
    homeTeamId: '1',
    awayTeamId: '2',
    homeScore: 3,
    awayScore: 1,
    pitchId: 'pitch1',
    scheduledTime: new Date('2024-01-20T10:00:00'),
    sortOrder: 1,
    status: 'completed'
  },
  {
    id: 'm2',
    homeTeamId: '3',
    awayTeamId: '4',
    homeScore: 2,
    awayScore: 2,
    pitchId: 'pitch2',
    scheduledTime: new Date('2024-01-20T10:00:00'),
    sortOrder: 2,
    status: 'completed'
  },
  {
    id: 'm3',
    homeTeamId: '1',
    awayTeamId: '3',
    pitchId: 'pitch1',
    scheduledTime: new Date('2024-01-20T11:00:00'),
    sortOrder: 3,
    status: 'scheduled'
  },
]

function App() {
  const [standings, setStandings] = useState<Standing[]>([])

  useEffect(() => {
    const rules = getScoringRules('soccer')
    const calculatedStandings = calculateStandings(mockTeams, mockMatches, rules)
    setStandings(calculatedStandings)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Tournament Champ Live</h1>
        <p className="subtitle">Real-time Scoreboard & Umpire Portal</p>
      </header>
      
      <main className="main-content">
        <section className="standings">
          <h2>Current Standings</h2>
          <div className="standings-table">
            <div className="table-header">
              <div className="pos">Pos</div>
              <div className="team">Team</div>
              <div className="stat">P</div>
              <div className="stat">W</div>
              <div className="stat">D</div>
              <div className="stat">L</div>
              <div className="stat">GF</div>
              <div className="stat">GA</div>
              <div className="stat">GD</div>
              <div className="stat points">Pts</div>
            </div>
            {standings.map((standing, index) => (
              <div key={standing.teamId} className="table-row">
                <div className="pos">{index + 1}</div>
                <div className="team">{standing.teamName}</div>
                <div className="stat">{standing.played}</div>
                <div className="stat">{standing.won}</div>
                <div className="stat">{standing.drawn}</div>
                <div className="stat">{standing.lost}</div>
                <div className="stat">{standing.goalsFor}</div>
                <div className="stat">{standing.goalsAgainst}</div>
                <div className="stat">{standing.goalDifference}</div>
                <div className="stat points">{standing.points}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="upcoming-matches">
          <h2>Upcoming Matches</h2>
          <div className="matches-list">
            {mockMatches
              .filter(m => m.status === 'scheduled')
              .map(match => {
                const homeTeam = mockTeams.find(t => t.id === match.homeTeamId)
                const awayTeam = mockTeams.find(t => t.id === match.awayTeamId)
                return (
                  <div key={match.id} className="match-card">
                    <div className="match-time">
                      {match.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="match-teams">
                      <span className="team-name">{homeTeam?.name}</span>
                      <span className="vs">vs</span>
                      <span className="team-name">{awayTeam?.name}</span>
                    </div>
                    <div className="match-venue">{match.pitchId}</div>
                  </div>
                )
              })}
          </div>
        </section>

        <section className="info">
          <h3>📱 Mobile Responsive</h3>
          <p>Access live scores and standings from any device</p>
          <h3>🎯 Umpire Portal</h3>
          <p>Update match scores in real-time</p>
        </section>
      </main>
    </div>
  )
}

export default App
