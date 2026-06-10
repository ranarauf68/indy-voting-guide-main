import React from 'react';
import './Page2.css';

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
};

const GOVERNOR_STATES_2026 = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IA', 'KS', 'ME', 'MD', 'MA', 'MI', 'MN', 'NE',
  'NV', 'NH', 'NM', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'VT', 'WI', 'WY'
];

const SENATE_STATES_2026 = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
  'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

function getOrdinal(n) {
  const num = parseInt(n);
  if (isNaN(num)) return n;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

function Page2({ voterData, onRaceSelect, onBack }) {
  const { state, district, zipCode } = voterData;
  const stateName = STATE_NAMES[state] || state;

  const hasGovernor = GOVERNOR_STATES_2026.includes(state);
  const hasSenate = SENATE_STATES_2026.includes(state);

  return (
    <div className="page2">
      <div className="page2-hero">
        <div className="page2-overlay" />
        <div className="page2-content fade-in">
          <button className="btn-back" onClick={onBack}>← Back</button>

          <div className="page2-header">
            <p className="page2-district">
              Your {stateName}{district ? ` · ${getOrdinal(district)} Congressional District` : ''} Ballot
            </p>
            <h1 className="page2-title">Select a race to compare<br />the major party candidates.</h1>
            <p className="page2-note">
              We are actively working to expand our database to include your full ballot soon.
            </p>
          </div>

          <div className="page2-buttons">
            <button
              className="race-btn race-btn--blue"
              onClick={() => onRaceSelect({ type: 'house', state, district, stateName, zipCode })}
            >
              <span className="race-btn-icon">🏛️</span>
              U.S. House of<br />Representatives
            </button>

            {hasSenate ? (
              <button
                className="race-btn race-btn--red"
                onClick={() => onRaceSelect({ type: 'senate', state, district, stateName, zipCode })}
              >
                <span className="race-btn-icon">⭐</span>
                U.S. Senate
              </button>
            ) : (
              <div className="race-btn race-btn--red race-btn--unavailable">
                <span className="race-btn-icon">⭐</span>
                U.S. Senate
                <span className="unavailable-note">No Senate race in {stateName} this November</span>
              </div>
            )}

            {hasGovernor ? (
              <button
                className="race-btn race-btn--purple"
                onClick={() => onRaceSelect({ type: 'governor', state, district, stateName, zipCode })}
              >
                <span className="race-btn-icon">🗳️</span>
                Governor
              </button>
            ) : (
              <div className="race-btn race-btn--purple race-btn--unavailable">
                <span className="race-btn-icon">🗳️</span>
                Governor
                <span className="unavailable-note">No Governor race in {stateName} this November</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page2;