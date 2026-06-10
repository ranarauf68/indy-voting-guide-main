import React, { useState } from 'react';
import './CandidatePage.css';

const ISSUES = [
  { id: 1, category: 'Economy', name: 'Inflation & Cost of Living' },
  { id: 2, category: 'Economy', name: 'Tax Policy' },
  { id: 3, category: 'Economy', name: 'Housing Affordability' },
  { id: 4, category: 'Economy', name: 'Federal Minimum Wage' },
  { id: 5, category: 'Economy', name: 'Trade & Tariffs' },
  { id: 6, category: 'Economy', name: 'Student Loan Relief' },
  { id: 7, category: 'Immigration', name: 'Border Security' },
  { id: 8, category: 'Immigration', name: 'ICE & Sanctuary Cities' },
  { id: 9, category: 'Immigration', name: 'Undocumented Population' },
  { id: 10, category: 'Technology', name: 'AI & Job Protection' },
  { id: 11, category: 'Technology', name: 'Social Media Regulation' },
  { id: 12, category: 'Technology', name: 'Big Tech & Privacy' },
  { id: 13, category: 'Health', name: 'Universal Healthcare' },
  { id: 14, category: 'Health', name: 'Healthcare Costs' },
  { id: 15, category: 'Health', name: 'Social Security & Medicare' },
  { id: 16, category: 'Environment', name: 'Climate & Green Energy' },
  { id: 17, category: 'Environment', name: 'Environmental Regulation' },
  { id: 18, category: 'Reform', name: 'Congress Term Limits' },
  { id: 19, category: 'Reform', name: 'Stock Trading & Ethics' },
  { id: 20, category: 'Reform', name: 'Supreme Court Reform' },
  { id: 21, category: 'Reform', name: 'Election Integrity' },
  { id: 22, category: 'Reform', name: 'Campaign Finance' },
  { id: 23, category: 'Social', name: 'Abortion Rights' },
  { id: 24, category: 'Social', name: 'Gun Safety & Rights' },
  { id: 25, category: 'Social', name: 'Crime & Public Safety' },
  { id: 26, category: 'Social', name: 'Education & School Choice' },
  { id: 27, category: 'Social', name: 'LGBTQ+ Rights' },
  { id: 28, category: 'Foreign Policy', name: 'Israel & Middle East' },
  { id: 29, category: 'Foreign Policy', name: 'Ukraine & Russia' },
  { id: 30, category: 'Foreign Policy', name: 'China & Taiwan' },
];

const CATEGORIES = [...new Set(ISSUES.map(i => i.category))];

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'
};

function getPartyColor(party) {
  const p = (party || '').toLowerCase();
  if (p.includes('democrat')) return '#3C3B6E';
  if (p.includes('republican')) return '#B22234';
  if (p.includes('libertarian')) return '#F38C00';
  if (p.includes('green')) return '#00A86B';
  return '#808080';
}

function getRaceLabel(candidate) {
  const state = STATE_NAMES[candidate.state] || candidate.state || '';
  const type = candidate.racetype || '';
  const district = candidate.district || '';
  if (type === 'house') return `${state} — U.S. House District ${district}`;
  if (type === 'senate') return `${state} — U.S. Senate`;
  if (type === 'governor') return `${state} — Governor`;
  return candidate.raceId || '';
}

function CandidatePage({ candidate, onBack }) {
  const [activeCategory, setActiveCategory] = useState('Economy');
  const [imgError, setImgError] = useState(false);
  const color = getPartyColor(candidate.party);
  const initials = candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const filteredIssues = ISSUES.filter(i => i.category === activeCategory);
  const hasPositions = candidate.positions && Object.keys(candidate.positions).length > 0;

  return (
    <div className="candidate-page">
      {/* Header */}
      <div className="candidate-page-header" style={{ background: color }}>
        <button className="candidate-page-back" onClick={onBack}>← Back</button>
        <div className="candidate-page-hero">
          <div className="candidate-page-photo">
            {candidate.photo && !imgError ? (
              <img src={candidate.photo} alt={candidate.name} onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="candidate-page-hero-info">
            <p className="candidate-page-eyebrow">November 2026 General Election</p>
            <h1 className="candidate-page-name">{candidate.name}</h1>
            <p className="candidate-page-party">{candidate.party}</p>
            {candidate.currentRole && <p className="candidate-page-role">{candidate.currentRole}</p>}
            <p className="candidate-page-race">{getRaceLabel(candidate)}</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="candidate-page-links">
        {candidate.website && (
          <a href={candidate.website} target="_blank" rel="noopener noreferrer" className="candidate-page-link candidate-page-link--website">
            🌐 Official Website
          </a>
        )}
        <a href={`https://ballotpedia.org/${candidate.name.replace(/ /g, '_')}`} target="_blank" rel="noopener noreferrer" className="candidate-page-link candidate-page-link--ballotpedia">
          📋 Ballotpedia
        </a>
        <a href={`https://www.opensecrets.org/search?q=${encodeURIComponent(candidate.name)}&type=candidates`} target="_blank" rel="noopener noreferrer" className="candidate-page-link candidate-page-link--opensecrets">
          💰 OpenSecrets
        </a>
        <a href={candidate.youtubeSearchUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(candidate.name + ' interview 2026')}&sp=CAISAhAB`} target="_blank" rel="noopener noreferrer" className="candidate-page-link candidate-page-link--youtube">
          ▶ Interviews
        </a>
      </div>

      {/* Positions */}
      <div className="candidate-page-body">
        {hasPositions ? (
          <>
            <h2 className="candidate-page-section-title" style={{ color }}>Issue Positions</h2>
            <div className="candidate-page-cats">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  className={`candidate-page-cat${activeCategory === cat ? ' active' : ''}`}
                  style={{ '--cat-color': color }}
                  onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="candidate-page-positions">
              {filteredIssues.map(issue => {
                const pos = candidate.positions?.[String(issue.id)];
                if (!pos || pos === 'Position information not available.' || pos === 'Candidate not yet declared.') return null;
                return (
                  <div key={issue.id} className="candidate-page-position">
                    <div className="candidate-page-position-label" style={{ color }}>{issue.name}</div>
                    <div className="candidate-page-position-text">{pos}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="candidate-page-no-positions">
            <p>Position information not yet available for this candidate.</p>
          </div>
        )}
      </div>

      <div className="candidate-page-footer">
        <p>Powered by IndTimes.news · Non-partisan · Independent Voter Resource</p>
      </div>
    </div>
  );
}

export default CandidatePage;