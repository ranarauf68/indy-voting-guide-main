import React, { useState, useEffect } from 'react';
import './Page3.css';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
const API_URL = 'https://0uuj9e2rh5.execute-api.us-east-2.amazonaws.com';

const ISSUES = [
  { id: 1, category: 'Economy', name: 'Inflation & Cost of Living', prompt: "What is [CANDIDATE]'s current stance on grocery and gas prices? Include any 2024-2026 statements on shrinkflation or price controls. Provide a complete 3-4 sentence answer." },
  { id: 2, category: 'Economy', name: 'Tax Policy', prompt: "Does [CANDIDATE] support extending individual income tax cuts or increasing corporate tax rates? Provide a complete 3-4 sentence answer." },
  { id: 3, category: 'Economy', name: 'Housing Affordability', prompt: "Summarize [CANDIDATE]'s position on housing affordability. Do they prioritize federal subsidies or deregulating zoning laws? Provide a complete 3-4 sentence answer." },
  { id: 4, category: 'Economy', name: 'Federal Minimum Wage', prompt: "Does [CANDIDATE] support a federal minimum wage increase? Provide a complete 3-4 sentence answer." },
  { id: 5, category: 'Economy', name: 'Trade & Tariffs', prompt: "What is [CANDIDATE]'s stance on tariffs, specifically regarding imports from China? Provide a complete 3-4 sentence answer." },
  { id: 6, category: 'Economy', name: 'Student Loan Relief', prompt: "Does [CANDIDATE] support federal student debt cancellation? Provide a complete 3-4 sentence answer." },
  { id: 7, category: 'Immigration', name: 'Border Security', prompt: "What is [CANDIDATE]'s position on border enforcement and security? Provide a complete 3-4 sentence answer." },
  { id: 8, category: 'Immigration', name: 'ICE & Sanctuary Cities', prompt: "Identify [CANDIDATE]'s stance on ICE funding and sanctuary cities. Provide a complete 3-4 sentence answer." },
  { id: 9, category: 'Immigration', name: 'Undocumented Population', prompt: "Describe [CANDIDATE]'s plan for undocumented immigrants currently in the U.S. Provide a complete 3-4 sentence answer." },
  { id: 10, category: 'Technology', name: 'AI & Job Protection', prompt: "Identify [CANDIDATE]'s position on AI regulation and workforce protection. Provide a complete 3-4 sentence answer." },
  { id: 11, category: 'Technology', name: 'Social Media Regulation', prompt: "What is [CANDIDATE]'s stance on social media laws regarding child safety and foreign-owned algorithms? Provide a complete 3-4 sentence answer." },
  { id: 12, category: 'Technology', name: 'Big Tech & Privacy', prompt: "Does [CANDIDATE] support a national data privacy standard or antitrust actions against tech monopolies? Provide a complete 3-4 sentence answer." },
  { id: 13, category: 'Health', name: 'Universal Healthcare', prompt: "Does [CANDIDATE] support Medicare for All or a public-private healthcare model? Provide a complete 3-4 sentence answer." },
  { id: 14, category: 'Health', name: 'Healthcare Costs', prompt: "Summarize [CANDIDATE]'s stance on capping prescription drug prices. Provide a complete 3-4 sentence answer." },
  { id: 15, category: 'Health', name: 'Social Security & Medicare', prompt: "How does [CANDIDATE] propose to ensure Social Security solvency? Provide a complete 3-4 sentence answer." },
  { id: 16, category: 'Environment', name: 'Climate & Green Energy', prompt: "Identify [CANDIDATE]'s position on renewable energy subsidies and carbon reduction goals. Provide a complete 3-4 sentence answer." },
  { id: 17, category: 'Environment', name: 'Environmental Regulation', prompt: "Does [CANDIDATE] support or oppose EPA authority to regulate emissions? Provide a complete 3-4 sentence answer." },
  { id: 18, category: 'Reform', name: 'Congress Term Limits', prompt: "Does [CANDIDATE] support a Constitutional Amendment for congressional term limits? Provide a complete 3-4 sentence answer." },
  { id: 19, category: 'Reform', name: 'Stock Trading & Ethics', prompt: "What is [CANDIDATE]'s position on banning members of Congress from trading individual stocks? Provide a complete 3-4 sentence answer." },
  { id: 20, category: 'Reform', name: 'Supreme Court Reform', prompt: "Identify [CANDIDATE]'s stance on Supreme Court term limits and ethics codes. Provide a complete 3-4 sentence answer." },
  { id: 21, category: 'Reform', name: 'Election Integrity', prompt: "Does [CANDIDATE] support a national Photo ID requirement for federal ballots? Provide a complete 3-4 sentence answer." },
  { id: 22, category: 'Reform', name: 'Campaign Finance', prompt: "What is [CANDIDATE]'s stance on dark money disclosure and PAC donation limits? Provide a complete 3-4 sentence answer." },
  { id: 23, category: 'Social', name: 'Abortion Rights', prompt: "Identify [CANDIDATE]'s position on federal abortion access laws. Provide a complete 3-4 sentence answer." },
  { id: 24, category: 'Social', name: 'Gun Safety & Rights', prompt: "What is [CANDIDATE]'s stance on universal background checks and Red Flag laws? Provide a complete 3-4 sentence answer." },
  { id: 25, category: 'Social', name: 'Crime & Public Safety', prompt: "Does [CANDIDATE] support increasing federal funding for police or criminal justice reform? Provide a complete 3-4 sentence answer." },
  { id: 26, category: 'Social', name: 'Education & School Choice', prompt: "Does [CANDIDATE] support federal funding for private school vouchers or public schools? Provide a complete 3-4 sentence answer." },
  { id: 27, category: 'Social', name: 'LGBTQ+ Rights', prompt: "Identify [CANDIDATE]'s stance on 2025-2026 federal gender policies regarding school sports, healthcare, and Title IX. Provide a complete 3-4 sentence answer." },
  { id: 28, category: 'Foreign Policy', name: 'Israel & Middle East', prompt: "Summarize [CANDIDATE]'s current stance on military aid to Israel and Middle East strategy. Provide a complete 3-4 sentence answer." },
  { id: 29, category: 'Foreign Policy', name: 'Ukraine & Russia', prompt: "Does [CANDIDATE] support continued military aid to Ukraine or a negotiated settlement? Provide a complete 3-4 sentence answer." },
  { id: 30, category: 'Foreign Policy', name: 'China & Taiwan', prompt: "What is [CANDIDATE]'s position on economic decoupling from China and defending Taiwan? Provide a complete 3-4 sentence answer." },
];

const RACE_LABELS = {
  house: 'U.S. House of Representatives',
  senate: 'U.S. Senate',
  governor: 'Governor'
};

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

function getRaceId(raceType, state, district) {
  if (raceType === 'house') return `${state}-house-${district}`;
  if (raceType === 'senate') return `${state}-senate`;
  if (raceType === 'governor') return `${state}-governor`;
  return null;
}

function getPartyColor(party) {
  const p = (party || '').toLowerCase();
  if (p.includes('democrat')) return '#3C3B6E';
  if (p.includes('republican')) return '#B22234';
  if (p.includes('libertarian')) return '#F38C00';
  if (p.includes('green')) return '#00A86B';
  if (p.includes('independent')) return '#6B7280';
  return '#808080';
}

function getBallotpediaUrl(name) {
  const cleanName = name.replace(/\s*\(likely\)\s*/gi, '').trim();
  return `https://ballotpedia.org/${cleanName.replace(/ /g, '_')}`;
}

function getYouTubeSearchUrl(name) {
  const cleanName = name.replace(/\s*\(likely\)\s*/gi, '').trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName + ' interview 2026')}&sp=CAISAhAB`;
}
function getOpenSecretsUrl(name) {
  const cleanName = name.replace(/\s*\(likely\)\s*/gi, '').trim();
  return `https://www.opensecrets.org/search?q=${encodeURIComponent(cleanName)}`;
}
async function fetchFromDatabase(raceId) {
  try {
    const res = await fetch(`${API_URL}/candidates?raceId=${raceId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) return null;
    return data.candidates;
  } catch {
    return null;
  }
}

async function geminiCall(prompt, isJson = false, useSearch = false) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.0, maxOutputTokens: 600 }
      };
      if (useSearch) body.tools = [{ googleSearch: {} }];
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.status === 429) {
        if (attempt < 2) { await sleep(2000); continue; }
        return null;
      }
      const data = await response.json();
      if (data.error) return null;
      const parts = data.candidates?.[0]?.content?.parts || [];
      const text = parts.map(p => p.text || '').join('').trim();
      if (!text) return null;
      if (isJson) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        try { return JSON.parse(jsonMatch[0]); } catch { return null; }
      }
      return text;
    } catch {
      if (attempt < 2) await sleep(2000);
    }
  }
  return null;
}

async function fetchCandidatesFromGemini(raceType, state, district) {
  const raceLabel = RACE_LABELS[raceType];
  const stateName = STATE_NAMES[state] || state;
  let location = stateName;
  if (raceType === 'house' && district) {
    location = `${stateName} ${district}th Congressional District`;
  }
  const prompt = `Search the web for the November 2026 general election candidates for:
Race: ${raceLabel}
Location: ${location}
Return exactly 5 candidates one per party in this order:
1. Democratic Party
2. Republican Party
3. Libertarian Party
4. Green Party
5. Independent (any notable independent candidate, or TBD)
Rules:
- Use confirmed declared candidates for 2026 if they exist
- If likely but unconfirmed add "(likely)" after name
- If unknown use exactly "TBD"
- NEVER use 2022 or 2024 candidates unless re-declared for 2026
- Always return all 5 slots
Return ONLY this JSON:
{"candidates":[{"name":"Name or TBD","party":"Democratic"},{"name":"Name or TBD","party":"Republican"},{"name":"Name or TBD","party":"Libertarian"},{"name":"Name or TBD","party":"Green Party"},{"name":"Name or TBD","party":"Independent"}]}`;
  const result = await geminiCall(prompt, true, true);
  if (result && Array.isArray(result.candidates)) {
    return result.candidates.filter(c => c.name && c.name.trim() !== '').slice(0, 5);
  }
  return [];
}

async function fetchWikipediaPhoto(name) {
  try {
    const cleanName = name.replace(/\s*\(likely\)\s*/gi, '').trim();
    const encoded = encodeURIComponent(cleanName);
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    const data = res.ok ? await res.json() : null;
    return data?.thumbnail?.source || null;
  } catch { return null; }
}

async function fetchIssuePosition(candidateName, issuePrompt) {
  if (candidateName === 'TBD') return 'Candidate not yet declared.';
  const cleanName = candidateName.replace(/\s*\(likely\)\s*/gi, '').trim();
  const prompt = `Search the web for verified public statements and voting record of ${cleanName} on this topic:
${issuePrompt.replace('[CANDIDATE]', cleanName)}
Use actual voting record, official statements, campaign website, and news. Provide a complete 3-4 sentence answer.`;
  return await geminiCall(prompt, false, true) || 'Position information not available.';
}

function transformDbCandidates(dbCandidates) {
  const partyOrder = ['democratic', 'republican', 'libertarian', 'green-party', 'independent'];
  const sorted = [...dbCandidates].sort((a, b) => {
    const ai = partyOrder.indexOf(a.candidateid);
    const bi = partyOrder.indexOf(b.candidateid);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return sorted.map(c => ({
    name: c.name,
    party: c.party,
    currentRole: c.currentRole || '',
    photo: c.photo || null,
    website: c.website || null,
    ballotpediaUrl: c.ballotpediaUrl || getBallotpediaUrl(c.name),
    youtubeSearchUrl: c.youtubeSearchUrl || getYouTubeSearchUrl(c.name),
    xUrl: c.xUrl || null,
    facebookUrl: c.facebookUrl || null,
    instagramUrl: c.instagramUrl || null,
    tiktokUrl: c.tiktokUrl || null,
    contactEmail: c.contactEmail || null,
    contactPhone: c.contactPhone || null,
    positions: c.positions || {},
    fromDb: true
  }));
}

function CandidatePhoto({ name, photo, initials }) {
  const [imgError, setImgError] = useState(false);
  if (photo && !imgError) {
    return (
      <img src={photo} alt={name} onError={() => setImgError(true)}
        style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }}
      />
    );
  }
  return <div className="candidate-avatar">{initials}</div>;
}

function Page3({ voterData, selectedRace, onBack }) {
  const [candidates, setCandidates] = useState(null);
  const [issues, setIssues] = useState({});
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Economy');
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('');

  const { state, district, stateName } = selectedRace;
  const raceLabel = RACE_LABELS[selectedRace.type];
  const raceId = getRaceId(selectedRace.type, state, district);

  // Page title with district number
  const pageTitle = selectedRace.type === 'house' && district
    ? `${stateName} ${raceLabel} — District ${district}`
    : `${stateName} ${raceLabel}`;

  const declaredCandidates = Array.isArray(candidates)
    ? candidates.filter(c => c.name !== 'TBD')
    : [];

  useEffect(() => {
    let cancelled = false;
    async function loadCandidates() {
      setError('');
      setCandidates(null);
      setIssues({});
      setLoadedCount(0);

      try {
        const dbCandidates = await fetchFromDatabase(raceId);

        if (dbCandidates && dbCandidates.length > 0) {
          if (cancelled) return;
          const transformed = transformDbCandidates(dbCandidates);
          setCandidates(transformed);
          setDataSource('db');

          const issueResults = {};
          ISSUES.forEach(issue => {
            const row = {};
            transformed.filter(c => c.name !== 'TBD').forEach(c => {
              row[c.name] = c.positions?.[String(issue.id)] || 'Position information not available.';
            });
            issueResults[issue.id] = row;
          });
          setIssues(issueResults);
          return;
        }

        if (cancelled) return;
        setDataSource('live');
        const list = await fetchCandidatesFromGemini(selectedRace.type, state, district);
        if (cancelled) return;
        if (!list || list.length === 0) {
          setError('Could not load candidates. Please go back and try again.');
          return;
        }

        const enriched = await Promise.all(list.map(async c => {
          if (c.name === 'TBD') return { ...c, photo: null, currentRole: '', website: null, ballotpediaUrl: getBallotpediaUrl('TBD'), youtubeSearchUrl: '', xUrl: null, facebookUrl: null, instagramUrl: null, tiktokUrl: null, contactEmail: null, contactPhone: null };
          const photo = await fetchWikipediaPhoto(c.name);
          return {
            ...c,
            photo,
            currentRole: '',
            website: null,
            ballotpediaUrl: getBallotpediaUrl(c.name),
            youtubeSearchUrl: getYouTubeSearchUrl(c.name),
            xUrl: null,
            facebookUrl: null,
            instagramUrl: null,
            tiktokUrl: null,
            contactEmail: null,
            contactPhone: null,
            positions: {},
            fromDb: false
          };
        }));

        if (cancelled) return;
        setCandidates(enriched);

      } catch {
        if (!cancelled) setError('Unable to load candidate information. Please try again.');
      }
    }
    loadCandidates();
    return () => { cancelled = true; };
  }, [selectedRace]);

  const loadIssues = async () => {
    if (Object.keys(issues).length > 0 || loadingIssues) return;
    setLoadingIssues(true);
    setLoadedCount(0);
    const issueResults = {};
    for (const issue of ISSUES) {
      const posResults = await Promise.all(
        declaredCandidates.map(c => fetchIssuePosition(c.name, issue.prompt))
      );
      const issueRow = {};
      declaredCandidates.forEach((c, i) => { issueRow[c.name] = posResults[i]; });
      issueResults[issue.id] = issueRow;
      setIssues({ ...issueResults });
      setLoadedCount(Object.keys(issueResults).length);
      await sleep(200);
    }
    setLoadingIssues(false);
  };

  const categories = [...new Set(ISSUES.map(i => i.category))];
  const filteredIssues = ISSUES.filter(i => i.category === activeCategory);
  const numCandidates = Array.isArray(candidates) ? candidates.length : 5;
  const numDeclared = declaredCandidates.length;
  const issuesFromDb = dataSource === 'db' && Object.keys(issues).length > 0;

  if (error) {
    return (
      <div className="page3 page3--error">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn-primary" onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page3">
      <div className="page3-header">
        <div className="page3-header-inner">
          <button className="btn-back" onClick={onBack}>← Back to Races</button>
          <div className="page3-header-text">
            <p className="page3-eyebrow">November 2026 General Election</p>
            <h1 className="page3-title">{pageTitle}</h1>
          </div>
        </div>
      </div>

      <div className="page3-body">
        <div className="candidates-grid" style={{ '--num-candidates': numCandidates }}>
          {candidates === null ? (
            <div className="loading-container" style={{ gridColumn: '1 / -1', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div className="loading-spinner" style={{ borderColor: 'rgba(60,59,110,0.3)', borderTopColor: '#3C3B6E' }} />
              <p>Loading candidates for {stateName}...</p>
            </div>
          ) : candidates.map((candidate, idx) => {
            const name = candidate.name;
            const isTBD = name === 'TBD';
            const isLikely = name.toLowerCase().includes('(likely)');
            const displayName = name.replace(/\s*\(likely\)\s*/gi, '').trim();
            const color = isTBD ? '#aaaaaa' : getPartyColor(candidate.party);
            const initials = isTBD ? '?' : displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const hasSocial = !isTBD && (candidate.xUrl || candidate.facebookUrl || candidate.instagramUrl || candidate.tiktokUrl);
            const hasContact = !isTBD && (candidate.contactEmail || candidate.contactPhone);

            return (
              <div key={idx} className="candidate-card" style={{ '--party-color': color }}>
                <div className="candidate-header" style={{ background: color }}>
                  <CandidatePhoto name={isTBD ? null : displayName} photo={candidate.photo || null} initials={initials} />
                  <div className="candidate-info">
                    <h2 className="candidate-name">{isTBD ? 'To Be Determined' : displayName}</h2>
                    <p className="candidate-party">{candidate.party}{isLikely ? ' · Likely' : ''}</p>
                    {!isTBD && candidate.currentRole && (
                      <p className="candidate-role">{candidate.currentRole}</p>
                    )}
                  </div>
                </div>

                <div className="candidate-links">
                  {isTBD ? (
                    <span className="candidate-links-tbd">No candidate declared yet</span>
                  ) : (
                    <div className="candidate-links-row">
                      {candidate.website && (
                        <a href={candidate.website} target="_blank" rel="noopener noreferrer" className="candidate-link-btn candidate-link-btn--website">
                          <span className="link-icon">🌐</span>
                          <span>Website</span>
                        </a>
                      )}
                      <a href={candidate.ballotpediaUrl || getBallotpediaUrl(name)} target="_blank" rel="noopener noreferrer" className="candidate-link-btn candidate-link-btn--ballotpedia">
                        <span className="link-icon">📋</span>
                        <span>Ballotpedia</span>
                      </a>
                      <a href={getOpenSecretsUrl(displayName)} target="_blank" rel="noopener noreferrer" className="candidate-link-btn candidate-link-btn--opensecrets">
                        <span className="link-icon">💰</span>
                        <span>Donors</span>
                      </a>
                      <a href={candidate.youtubeSearchUrl || getYouTubeSearchUrl(displayName)} target="_blank" rel="noopener noreferrer" className="candidate-link-btn candidate-link-btn--youtube">
                        <span className="link-icon">▶</span>
                        <span>Interviews</span>
                      </a>
                    </div>
                  )}
                </div>

                {hasSocial && (
                  <div className="candidate-social">
                    <p className="candidate-social-label">Social Media</p>
                    <div className="candidate-social-icons">
                      {candidate.xUrl && (
                        <a href={candidate.xUrl} target="_blank" rel="noopener noreferrer" className="social-icon social-icon--x" title="X (Twitter)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.256 2.25H8.08l4.261 5.637L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                      {candidate.facebookUrl && (
                        <a href={candidate.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-icon social-icon--facebook" title="Facebook">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                      )}
                      {candidate.instagramUrl && (
                        <a href={candidate.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon social-icon--instagram" title="Instagram">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                      )}
                      {candidate.tiktokUrl && (
                        <a href={candidate.tiktokUrl} target="_blank" rel="noopener noreferrer" className="social-icon social-icon--tiktok" title="TikTok">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {hasContact && (
                  <div className="candidate-contact">
                    <p className="candidate-social-label">Contact</p>
                    <div className="candidate-contact-links">
                      {candidate.contactEmail && (
                        <a href={`mailto:${candidate.contactEmail}`} className="candidate-contact-link">
                          <span>✉</span> {candidate.contactEmail}
                        </a>
                      )}
                      {candidate.contactPhone && (
                        <a href={`tel:${candidate.contactPhone}`} className="candidate-contact-link">
                          <span>📞</span> {candidate.contactPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="issues-section">
          <div className="issues-header">
            <h2 className="issues-title">Compare Their Positions</h2>
            {dataSource === 'db' && (
              <span style={{ fontSize: '12px', color: '#00A86B', fontWeight: '600', background: 'rgba(0,168,107,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                ⚡ Loaded from database
              </span>
            )}
            {numDeclared === 0 && (
              <p style={{ color: '#888', fontSize: '14px' }}>No declared candidates yet to compare.</p>
            )}
            {numDeclared > 0 && !issuesFromDb && Object.keys(issues).length === 0 && !loadingIssues && (
              <button className="btn-primary btn-load-issues" onClick={loadIssues}>Load Position Comparisons</button>
            )}
            {loadingIssues && (
              <div className="loading-issues">
                <div className="loading-spinner" style={{ borderColor: 'rgba(60,59,110,0.3)', borderTopColor: '#3C3B6E', width: 24, height: 24, borderWidth: 3 }} />
                <span>Analyzing positions... ({loadedCount}/30 loaded)</span>
              </div>
            )}
          </div>

          {Object.keys(issues).length > 0 && numDeclared > 0 && (
            <>
              <div className="category-tabs">
                {categories.map(cat => (
                  <button key={cat} className={`category-tab${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                ))}
              </div>

              <div className="issues-table-wrap">
                <div className="issues-table">
                  <div className="issues-table-header" style={{ gridTemplateColumns: `180px repeat(${numDeclared}, 1fr)` }}>
                    <div className="issue-col-label" />
                    {declaredCandidates.map((c, i) => {
                      const dn = c.name.replace(/\s*\(likely\)\s*/gi, '').trim();
                      return (
                        <div key={i} style={{ color: getPartyColor(c.party), padding: '0 16px', fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: '600' }}>
                          {dn}
                          <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '400', fontFamily: 'sans-serif', marginTop: '2px' }}>{c.party}</div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredIssues.map((issue, idx) => (
                    <div key={issue.id} className={`issue-row${idx % 2 === 0 ? ' issue-row--even' : ''}`} style={{ gridTemplateColumns: `180px repeat(${numDeclared}, 1fr)` }}>
                      <div className="issue-name">{issue.name}</div>
                      {declaredCandidates.map((c, i) => {
                        const dn = c.name.replace(/\s*\(likely\)\s*/gi, '').trim();
                        return (
                          <div key={i} className="issue-position" style={{ borderLeft: `3px solid ${getPartyColor(c.party)}` }}>
                            <div className="mobile-label" style={{ color: getPartyColor(c.party) }}>{dn}</div>
                            {issues[issue.id]?.[c.name] || '—'}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="page3-footer">
          <p>Candidate data sourced from our verified database and Google Search. "Likely" indicates expected but unconfirmed candidates. Always verify with official sources.</p>
          <p>Powered by IndTimes.news · Independent Voter Resource · Non-partisan</p>
        </div>
      </div>
    </div>
  );
}

export default Page3;