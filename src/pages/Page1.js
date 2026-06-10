import React, { useState, useEffect, useRef } from 'react';
import './Page1.css';

const CIVIC_API_KEY = process.env.REACT_APP_CIVIC_API_KEY;
const BEEHIIV_LAMBDA_URL = 'https://udvvohbxee.execute-api.us-east-2.amazonaws.com/default/indy-beehiiv-subscribe';
const API_URL = 'https://0uuj9e2rh5.execute-api.us-east-2.amazonaws.com';

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

const ISSUE_NAMES = {
  1:'Inflation & Cost of Living',2:'Tax Policy',3:'Housing Affordability',
  4:'Federal Minimum Wage',5:'Trade & Tariffs',6:'Student Loan Relief',
  7:'Border Security',8:'ICE & Sanctuary Cities',9:'Undocumented Population',
  10:'AI & Job Protection',11:'Social Media Regulation',12:'Big Tech & Privacy',
  13:'Universal Healthcare',14:'Healthcare Costs',15:'Social Security & Medicare',
  16:'Climate & Green Energy',17:'Environmental Regulation',18:'Congress Term Limits',
  19:'Stock Trading & Ethics',20:'Supreme Court Reform',21:'Election Integrity',
  22:'Campaign Finance',23:'Abortion Rights',24:'Gun Safety & Rights',
  25:'Crime & Public Safety',26:'Education & School Choice',27:'LGBTQ+ Rights',
  28:'Israel & Middle East',29:'Ukraine & Russia',30:'China & Taiwan'
};

const ISSUE_KEYWORDS = {
  1: ['inflation','cost of living','grocery','gas price','shrinkflation','price'],
  2: ['tax','taxes','tax cut','tax policy','corporate tax','income tax'],
  3: ['housing','home','rent','mortgage','zoning','affordable housing'],
  4: ['minimum wage','wage','wages'],
  5: ['tariff','tariffs','trade','china trade','imports'],
  6: ['student loan','student debt','college debt','loan forgiveness'],
  7: ['border','border security','border patrol','wall','illegal immigration','immigration'],
  8: ['ice','sanctuary city','sanctuary cities','deportation'],
  9: ['undocumented','illegal immigrants','dreamers','daca'],
  10: ['ai','artificial intelligence','job protection','automation','workforce'],
  11: ['social media','tiktok','algorithm','content moderation','child safety online'],
  12: ['big tech','privacy','data privacy','antitrust','monopoly','tech regulation'],
  13: ['healthcare','health care','medicare for all','universal healthcare','insurance'],
  14: ['prescription','drug prices','pharmaceutical','medication cost','healthcare cost'],
  15: ['social security','medicare','retirement','seniors','social security solvency'],
  16: ['climate','green energy','renewable','solar','wind','carbon','environment'],
  17: ['epa','emissions','environmental regulation','pollution'],
  18: ['term limits','congress term'],
  19: ['stock trading','insider trading','congress stock','ethics'],
  20: ['supreme court','court reform','court packing','justices'],
  21: ['election','voter id','election integrity','voting rights','ballot'],
  22: ['campaign finance','dark money','pac','super pac','campaign money'],
  23: ['abortion','pro choice','pro life','roe','reproductive'],
  24: ['gun','guns','second amendment','gun control','background check','red flag'],
  25: ['crime','police','public safety','law enforcement','criminal justice'],
  26: ['education','school','voucher','school choice','teachers'],
  27: ['lgbtq','transgender','gender','gay rights','title ix'],
  28: ['israel','middle east','gaza','hamas','military aid israel'],
  29: ['ukraine','russia','nato','military aid ukraine'],
  30: ['china','taiwan','decoupling','chinese']
};

// All issue-related words to strip from message when extracting name
const ISSUE_WORDS = [
  'immigration','healthcare','health care','climate','gun','guns','abortion',
  'tax','taxes','economy','housing','education','social security','israel',
  'ukraine','russia','china','taiwan','lgbtq','transgender','border','wage',
  'wages','trade','tariff','tariffs','student loan','student debt','inflation',
  'environment','election','crime','police','drug prices','prescription',
  'minimum wage','big tech','privacy','social media','tiktok','supreme court',
  'term limits','campaign finance','reproductive','second amendment','deportation',
  'sanctuary','daca','dreamers','medicare','retirement','renewable','solar',
  'carbon','emissions','insider trading','dark money','pac','voucher','nato',
  'decoupling','military aid','cost of living','affordable housing','mortgage',
  'job protection','automation','antitrust','monopoly','pollution','court packing'
];

function detectIssues(msg) {
  const lower = msg.toLowerCase();
  const matched = [];
  for (const [id, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(id);
    }
  }
  return matched;
}

function extractNameFromMessage(msg) {
  let cleaned = msg.toLowerCase();
  // Remove question phrases
  cleaned = cleaned.replace(/tell me about|what is|what does|where does|how does|what are|position on|stance on|views? on|thoughts? on|stand on|think about|say about|support|oppose|regarding|about the topic of|views of|opinion on|thoughts on/gi, '');
  // Remove issue words
  ISSUE_WORDS.forEach(word => {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });
  // Remove punctuation and possessives
  cleaned = cleaned.replace(/\?|,|\.|!|'s|'s/gi, '');
  // Clean up extra spaces
  const words = cleaned.split(/\s+/).filter(w => w.length > 1);
  return words.join(' ').trim();
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

function getRaceLabel(candidate) {
  const state = STATE_NAMES[candidate.state] || candidate.state || '';
  const type = candidate.racetype || '';
  const district = candidate.district || '';
  if (type === 'house') return `${state} — U.S. House District ${district}`;
  if (type === 'senate') return `${state} — U.S. Senate`;
  if (type === 'governor') return `${state} — Governor`;
  return candidate.raceId || '';
}

async function searchCandidates(query) {
  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results || [];
  } catch { return []; }
}

function buildAnswer(userMessage, candidates) {
  const msg = userMessage.toLowerCase();
  const detectedIssues = detectIssues(msg);

  if (candidates.length === 0) {
    return "I couldn't find that candidate in our database. Try using their full name, for example:\n\n• \"Bill Foster\"\n• \"Mike Quigley immigration\"\n• \"Tom Hanson healthcare\"";
  }

  // Single candidate + issue detected — give direct answer
  if (candidates.length === 1 && detectedIssues.length > 0) {
    const candidate = candidates[0];
    const issueId = detectedIssues[0];
    const issueName = ISSUE_NAMES[issueId];
    const position = candidate.positions?.[issueId];

    if (position && position !== 'Position information not available.' && position !== 'Candidate not yet declared.') {
      return `**${candidate.name}** (${candidate.party}) on **${issueName}**:\n\n${position}`;
    }

    const availablePositions = Object.entries(candidate.positions || {})
      .filter(([, v]) => v && v !== 'Position information not available.' && v !== 'Candidate not yet declared.')
      .map(([id]) => ISSUE_NAMES[id])
      .filter(Boolean)
      .slice(0, 6);

    if (availablePositions.length > 0) {
      return `I don't have **${candidate.name}'s** specific position on **${issueName}** yet.\n\nI do have their positions on:\n${availablePositions.map(p => `• ${p}`).join('\n')}\n\nAsk me about any of those!`;
    }
    return `I have **${candidate.name}** in our database running for **${getRaceLabel(candidate)}**, but their policy positions haven't been loaded yet.`;
  }

  // Single candidate — general info
  if (candidates.length === 1) {
    const c = candidates[0];
    const availablePositions = Object.entries(c.positions || {})
      .filter(([, v]) => v && v !== 'Position information not available.' && v !== 'Candidate not yet declared.')
      .map(([id]) => ISSUE_NAMES[id])
      .filter(Boolean)
      .slice(0, 6);

    let answer = `**${c.name}** is the **${c.party}** candidate for **${getRaceLabel(c)}**.`;
    if (c.currentRole) answer += ` Currently serving as ${c.currentRole}.`;

    if (availablePositions.length > 0) {
      answer += `\n\nI have positions on:\n${availablePositions.map(p => `• ${p}`).join('\n')}\n\nAsk me about any of these!`;
    } else {
      answer += `\n\nI don't have their policy positions loaded yet.`;
    }
    return answer;
  }

  // Multiple candidates + issue
  if (candidates.length > 1 && detectedIssues.length > 0) {
    const issueName = ISSUE_NAMES[detectedIssues[0]];
    let answer = `I found ${candidates.length} candidates. Which one did you mean?\n\n`;
    candidates.slice(0, 5).forEach(c => {
      answer += `• **${c.name}** (${c.party}) — ${getRaceLabel(c)}\n`;
    });
    answer += `\nTry: "${candidates[0].name} ${issueName.toLowerCase()}"`;
    return answer;
  }

  // Multiple candidates — general
  let answer = `I found ${candidates.length} candidates:\n\n`;
  candidates.slice(0, 5).forEach(c => {
    answer += `• **${c.name}** (${c.party}) — ${getRaceLabel(c)}\n`;
  });
  answer += `\nAsk about a specific one by full name.`;
  return answer;
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm the Indy Voting Guide assistant.\n\nAsk me anything like:\n• \"Bill Foster\"\n• \"Mike Quigley immigration\"\n• \"Tom Hanson healthcare\"\n• \"Where does Quigley stand on climate?\"\n\nI only answer from our verified database." }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setThinking(true);

    try {
      // Step 1: extract name by stripping issue words and question phrases
      const extractedName = extractNameFromMessage(text);

      let candidates = [];

      // Step 2: try extracted name first if meaningful
      if (extractedName.length >= 2) {
        candidates = await searchCandidates(extractedName);
      }

      // Step 3: fall back to full message if no results
      if (candidates.length === 0) {
        candidates = await searchCandidates(text);
      }

      const answer = buildAnswer(text, candidates);
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I had trouble searching the database. Please try again." }]);
    }
    setThinking(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatMessage = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
      ));
    });
  };

  return (
    <>
      <button className="chatbot-btn" onClick={() => setOpen(o => !o)} title="Ask our AI assistant">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🗳️</div>
              <div>
                <div className="chatbot-title">Indy Voting Guide</div>
                <div className="chatbot-subtitle">Database-powered assistant</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message chatbot-message--${msg.role}`}>
                {msg.role === 'bot' && <div className="chatbot-message-avatar">🗳️</div>}
                <div className="chatbot-message-bubble">
                  {msg.role === 'bot' ? formatMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="chatbot-message chatbot-message--bot">
                <div className="chatbot-message-avatar">🗳️</div>
                <div className="chatbot-message-bubble chatbot-thinking">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="e.g. Mike Quigley immigration"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={thinking}
            />
            <button className="chatbot-send" onClick={sendMessage} disabled={!input.trim() || thinking}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function CandidateSearch({ onCandidateSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (!value || value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
        setShowResults((data.results || []).length > 0);
      } catch {
        setResults([]);
        setShowResults(false);
      }
      setSearching(false);
    }, 350);
  };

  const handleClear = () => {
    clearTimeout(debounceRef.current);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSearching(false);
  };

  return (
    <div className="candidate-search" ref={searchRef}>
      <div className="candidate-search-box">
        <span className="candidate-search-icon">🔍</span>
        <input
          type="text"
          className="candidate-search-input"
          placeholder="Search any candidate by name..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {searching && <div className="candidate-search-spinner" />}
        {query && (
          <button className="candidate-search-clear" onClick={handleClear}>✕</button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="candidate-search-results">
          {results.map((candidate, idx) => {
            const color = getPartyColor(candidate.party);
            const initials = candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <button key={idx} className="candidate-search-result"
                onClick={() => { onCandidateSelect(candidate); setShowResults(false); setQuery(''); setResults([]); }}>
                <div className="candidate-search-result-avatar" style={{ background: color }}>
                  {candidate.photo ? (
                    <img src={candidate.photo} alt={candidate.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  ) : initials}
                </div>
                <div className="candidate-search-result-info">
                  <div className="candidate-search-result-name">{candidate.name}</div>
                  <div className="candidate-search-result-race">{getRaceLabel(candidate)}</div>
                </div>
                <div className="candidate-search-result-party" style={{ color }}>{candidate.party}</div>
              </button>
            );
          })}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !searching && (
        <div className="candidate-search-results">
          <div style={{ padding: '16px', color: '#888', fontSize: '14px', textAlign: 'center' }}>No candidates found for "{query}"</div>
        </div>
      )}
    </div>
  );
}

async function subscribeToBeehiiv(email) {
  if (!email || !email.trim()) return;
  try {
    await fetch(BEEHIIV_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    });
  } catch { }
}

function Page1({ onSubmit, onCandidateSelect, onAdminOpen }) {
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
      setError('Please enter a valid 5-digit zip code.');
      return;
    }

    if (!streetAddress.trim()) {
      setError('Please enter your street address.');
      return;
    }

    setLoading(true);

    if (email && email.trim()) {
      subscribeToBeehiiv(email);
    }

    try {
      const fullAddress = `${streetAddress.trim()}, ${zipCode}`;
      const electionId = '9000';
      const url = `https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?address=${encodeURIComponent(fullAddress)}&electionId=${electionId}&key=${CIVIC_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        const divUrl = `https://civicinfo.googleapis.com/civicinfo/v2/divisionsByAddress?address=${encodeURIComponent(fullAddress)}&key=${CIVIC_API_KEY}`;
        const divResponse = await fetch(divUrl);
        const divData = await divResponse.json();

        if (divData.error) {
          setError('We could not find district information for this address. Please check and try again.');
          setLoading(false);
          return;
        }

        let state = '';
        let stateName = '';
        const districts = [];

        Object.keys(divData.divisions || {}).forEach(key => {
          if (key.match(/ocd-division\/country:us\/state:[a-z]+$/) && !key.includes('/cd:')) {
            state = key.split('state:')[1].toUpperCase();
            stateName = divData.divisions[key].name || state;
          }
          if (key.includes('/cd:')) {
            const d = key.split('/cd:')[1];
            if (d && !districts.includes(d)) districts.push(d);
            if (!state) {
              const stateMatch = key.match(/state:([a-z]+)/);
              if (stateMatch) state = stateMatch[1].toUpperCase();
            }
          }
        });

        onSubmit({ zipCode, email, state, stateName, district: districts[0] || '', districts });
      } else {
        const contests = data.contests || [];
        const normalizedAddress = data.normalizedInput || {};
        const state = (normalizedAddress.state || '').toUpperCase();
        const districts = [];

        contests.forEach(contest => {
          if (contest.office && contest.office.toLowerCase().includes('representative')) {
            if (contest.district && contest.district.name) {
              const match = contest.district.name.match(/(\d+)/);
              if (match && !districts.includes(match[1])) districts.push(match[1]);
            }
            if (districts.length === 0 && contest.office) {
              const match = contest.office.match(/District\s+(\d+)/i);
              if (match && !districts.includes(match[1])) districts.push(match[1]);
            }
          }
        });

        if (districts.length === 0) {
          try {
            const divUrl = `https://civicinfo.googleapis.com/civicinfo/v2/divisionsByAddress?address=${encodeURIComponent(fullAddress)}&key=${CIVIC_API_KEY}`;
            const divResponse = await fetch(divUrl);
            const divData = await divResponse.json();
            Object.keys(divData.divisions || {}).forEach(key => {
              if (key.includes('/cd:')) {
                const d = key.split('/cd:')[1];
                if (d && !districts.includes(d)) districts.push(d);
              }
            });
          } catch { }
        }

        onSubmit({ zipCode, email, state, stateName: state, district: districts[0] || '', districts, contests, normalizedAddress });
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page1">
      <div className="page1-search-bar">
        <div className="page1-search-bar-inner">
          <CandidateSearch onCandidateSelect={onCandidateSelect} />
          <button className="page1-admin-btn" onClick={onAdminOpen} title="Manager Portal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="page1-hero">
        <div className="page1-overlay" />
        <div className="page1-content fade-in">
          <p className="page1-eyebrow">YOUR VOTE MATTERS</p>
          <h1 className="page1-title">
            Side-by-Side:<br />
            Compare Major Party<br />
            Candidates for the<br />
            November 2026 Election
          </h1>
          <p className="page1-subtitle">
            Enter your address to see the candidates on your ballot
          </p>

          <form className="page1-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email - Optional</label>
              <input type="email" className="form-input" placeholder="example@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input type="text" className="form-input" placeholder="123 Main St" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input type="text" className="form-input" placeholder="Five Digits" value={zipCode} onChange={e => setZipCode(e.target.value.slice(0, 5))} maxLength={5} required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'See My Candidates'}
            </button>
          </form>

          <p className="page1-footer">
            Powered by IndTimes.news · Non-partisan · Independent Voter Resource
          </p>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

export default Page1;