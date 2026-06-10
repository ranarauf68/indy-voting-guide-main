import React, { useState, useRef } from 'react';
import './Admin.css';

const API_URL = 'https://0uuj9e2rh5.execute-api.us-east-2.amazonaws.com';

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

function getRaceLabel(race) {
  const state = STATE_NAMES[race.state] || race.state;
  if (race.racetype === 'house') return `${state} — District ${race.district}`;
  if (race.racetype === 'senate') return `${state} — U.S. Senate`;
  if (race.racetype === 'governor') return `${state} — Governor`;
  return race.raceId;
}

function getPartyColor(party) {
  const p = (party || '').toLowerCase();
  if (p.includes('democrat')) return '#3C3B6E';
  if (p.includes('republican')) return '#B22234';
  if (p.includes('libertarian')) return '#F38C00';
  if (p.includes('green')) return '#00A86B';
  return '#666';
}

function CandidatePhoto({ photo, name }) {
  const [imgError, setImgError] = useState(false);
  const initials = name === 'TBD' ? '?' : name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  if (photo && !imgError) {
    return <img src={photo} alt={name} onError={() => setImgError(true)} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }} />;
  }
  return <div className="admin-candidate-avatar">{initials}</div>;
}

function PhotoUploader({ candidate, password, selectedRace, onUploaded }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(candidate.photo || null);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5MB.'); return; }
    setUploadError('');
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${API_URL}/admin/upload-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          raceId: selectedRace.raceId,
          candidateid: candidate.candidateid,
          imageBase64: base64,
          imageType: file.type
        })
      });
      const data = await res.json();
      if (res.ok && data.photoUrl) {
        setPreview(data.photoUrl);
        onUploaded(data.photoUrl);
      } else {
        setUploadError(data.error || 'Upload failed. Please try again.');
      }
    } catch {
      setUploadError('Upload failed. Please check your connection.');
    }
    setUploading(false);
  };

  return (
    <div className="admin-photo-row">
      <div>
        {preview ? (
          <img src={preview} alt={candidate.name} onError={e => e.target.style.display = 'none'}
            style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '72px', height: '72px', borderRadius: '8px', background: getPartyColor(candidate.party), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
            {candidate.name === 'TBD' ? '?' : candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '8px' }}>Candidate Photo</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="admin-upload-btn">
          {uploading ? '⏳ Uploading...' : preview ? '📷 Change Photo' : '📷 Upload Photo'}
        </button>
        {preview && (
          <button onClick={() => { setPreview(null); onUploaded(''); }} className="admin-remove-photo-btn">Remove</button>
        )}
        {uploadError && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '6px' }}>{uploadError}</p>}
        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>JPG, PNG or WebP — max 5MB</p>
      </div>
    </div>
  );
}

function Admin() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [edits, setEdits] = useState({});
  const [activeCategory, setActiveCategory] = useState('Economy');
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/races?password=${password}`);
      if (res.status === 401) { setLoginError('Incorrect password.'); return; }
      const data = await res.json();
      setRaces(data.races || []);
      setLoggedIn(true);
      setLoginError('');
    } catch {
      setLoginError('Connection error. Please try again.');
    }
  };

  const loadCandidates = async (race) => {
    setSelectedRace(race);
    setLoading(true);
    setEdits({});
    setMessage('');
    setExpandedCandidate(null);
    setSidebarOpen(false);
    try {
      const res = await fetch(`${API_URL}/admin/candidates?raceId=${race.raceId}&password=${password}`);
      const data = await res.json();
      if (res.status === 401) { setLoggedIn(false); return; }
      setCandidates(data.candidates || []);
    } catch {
      setMessage('Error loading candidates');
      setMessageType('error');
    }
    setLoading(false);
  };

  const handleEdit = (candidateid, field, value) => {
    setEdits(prev => ({
      ...prev,
      [`${candidateid}-${field}`]: { candidateid, field, value }
    }));
  };

  const getEditValue = (candidateid, field, defaultValue) => {
    const key = `${candidateid}-${field}`;
    return edits[key] !== undefined ? edits[key].value : (defaultValue || '');
  };

  const saveAll = async () => {
    const editList = Object.values(edits);
    if (editList.length === 0) { setMessage('No changes to save.'); setMessageType('info'); return; }
    setSaving(true);
    setMessage('');
    let saved = 0, failed = 0;
    for (const edit of editList) {
      try {
        const res = await fetch(`${API_URL}/admin/override`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            raceId: selectedRace.raceId,
            candidateid: edit.candidateid,
            fieldKey: edit.field,
            value: edit.value
          })
        });
        if (res.ok) saved++; else failed++;
      } catch { failed++; }
    }
    setSaving(false);
    setEdits({});
    if (failed === 0) {
      setMessage(`✓ ${saved} change${saved !== 1 ? 's' : ''} saved.`);
      setMessageType('success');
      await loadCandidates(selectedRace);
    } else {
      setMessage(`Saved ${saved}, failed ${failed}.`);
      setMessageType('error');
    }
  };

  const editCount = Object.keys(edits).length;

  const filteredRaces = races.filter(race => {
    const matchesType = filterType === 'all' || race.racetype === filterType;
    const label = getRaceLabel(race).toLowerCase();
    const matchesSearch = label.includes(searchTerm.toLowerCase()) || race.raceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="admin-login-bg" />
        <div className="admin-login-card">
          <div className="admin-login-logo">🇺🇸</div>
          <h1 className="admin-login-title">Manager Portal</h1>
          <p className="admin-login-sub">Indy Voting Guide · Admin Access</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-login-field">
              <label>Password</label>
              <input type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            </div>
            {loginError && <p className="admin-login-error">{loginError}</p>}
            <button type="submit" className="admin-login-btn">Access Portal →</button>
          </form>
          <p className="admin-login-footer">Authorized personnel only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-flag">🇺🇸</span>
          <div>
            <div className="admin-sidebar-title">Manager Portal</div>
            <div className="admin-sidebar-sub">Indy Voting Guide</div>
          </div>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="admin-sidebar-search">
          <input type="text" placeholder="Search races..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="admin-search-input" />
          <div className="admin-filter-tabs">
            {['all', 'house', 'senate', 'governor'].map(type => (
              <button key={type} className={`admin-filter-tab${filterType === type ? ' active' : ''}`} onClick={() => setFilterType(type)}>
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="admin-races-count">{filteredRaces.length} races</div>
        </div>

        <div className="admin-sidebar-races">
          {filteredRaces.map(race => (
            <button key={race.raceId} className={`admin-race-btn${selectedRace?.raceId === race.raceId ? ' active' : ''}`} onClick={() => loadCandidates(race)}>
              <span className={`admin-race-badge admin-race-badge--${race.racetype}`}>{race.racetype?.toUpperCase()}</span>
              <span className="admin-race-label">{getRaceLabel(race)}</span>
            </button>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={() => setLoggedIn(false)}>Sign Out</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 className="admin-topbar-title">{selectedRace ? getRaceLabel(selectedRace) : 'Select a Race'}</h1>
              {selectedRace && <p className="admin-topbar-sub">{candidates.length} candidates · {selectedRace.raceId}</p>}
            </div>
          </div>
          <div className="admin-topbar-actions">
            {editCount > 0 && <span className="admin-unsaved">{editCount} unsaved</span>}
            <button className="admin-save-btn" onClick={saveAll} disabled={saving || editCount === 0}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {message && <div className={`admin-message admin-message--${messageType}`}>{message}</div>}

        {!selectedRace && (
          <div className="admin-empty">
            <div className="admin-empty-icon">🗳️</div>
            <h2>Select a race</h2>
            <p>{races.length > 0 ? `${races.length} races loaded.` : 'No races yet.'}</p>
            <button className="admin-login-btn" style={{ marginTop: '16px', width: 'auto', padding: '12px 24px' }} onClick={() => setSidebarOpen(true)}>Browse Races</button>
          </div>
        )}

        {loading && <div className="admin-loading"><div className="admin-spinner" /><p>Loading candidates...</p></div>}

        {!loading && candidates.length > 0 && (
          <>
            <div className="admin-candidates-grid">
              {candidates.map(candidate => {
                const currentPhoto = getEditValue(candidate.candidateid, 'photo', candidate.photo);
                return (
                  <div key={candidate.candidateid} className={`admin-candidate-card${expandedCandidate === candidate.candidateid ? ' expanded' : ''}`} style={{ '--party-color': getPartyColor(candidate.party) }}>
                    <div className="admin-candidate-header">
                      <CandidatePhoto photo={currentPhoto} name={candidate.name} />
                      <div className="admin-candidate-info">
                        <div className="admin-candidate-name">{candidate.name}</div>
                        <div className="admin-candidate-party">{candidate.party}</div>
                      </div>
                      <button className="admin-candidate-toggle" onClick={() => setExpandedCandidate(expandedCandidate === candidate.candidateid ? null : candidate.candidateid)}>
                        {expandedCandidate === candidate.candidateid ? '▲' : '▼ Edit'}
                      </button>
                    </div>

                    {expandedCandidate === candidate.candidateid && (
                      <div className="admin-candidate-body">

                        {/* Photo */}
                        <div className="admin-field-group">
                          <h3 className="admin-field-group-title">Photo</h3>
                          <PhotoUploader
                            candidate={candidate}
                            password={password}
                            selectedRace={selectedRace}
                            onUploaded={(url) => {
                              setCandidates(prev => prev.map(c =>
                                c.candidateid === candidate.candidateid ? { ...c, photo: url } : c
                              ));
                            }}
                          />
                        </div>

                        {/* Basic info */}
                        <div className="admin-field-group">
                          <h3 className="admin-field-group-title">Basic Information</h3>
                          <div className="admin-fields-row">
                            <div className="admin-field">
                              <label>Full Name</label>
                              <input value={getEditValue(candidate.candidateid, 'name', candidate.name)} onChange={e => handleEdit(candidate.candidateid, 'name', e.target.value)} placeholder="Full name" />
                            </div>
                            <div className="admin-field">
                              <label>Current Role</label>
                              <input value={getEditValue(candidate.candidateid, 'currentRole', candidate.currentRole || '')} onChange={e => handleEdit(candidate.candidateid, 'currentRole', e.target.value)} placeholder="e.g. U.S. Representative" />
                            </div>
                            <div className="admin-field">
                              <label>Party</label>
                              <input value={getEditValue(candidate.candidateid, 'party', candidate.party || '')} onChange={e => handleEdit(candidate.candidateid, 'party', e.target.value)} placeholder="Democratic / Republican / etc." />
                            </div>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="admin-field-group">
                          <h3 className="admin-field-group-title">Links</h3>
                          <div className="admin-fields-row">
                            <div className="admin-field">
                              <label>Official Website</label>
                              <input value={getEditValue(candidate.candidateid, 'website', candidate.website || '')} onChange={e => handleEdit(candidate.candidateid, 'website', e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="admin-field">
                              <label>Ballotpedia URL</label>
                              <input value={getEditValue(candidate.candidateid, 'ballotpediaUrl', candidate.ballotpediaUrl || '')} onChange={e => handleEdit(candidate.candidateid, 'ballotpediaUrl', e.target.value)} placeholder="https://ballotpedia.org/..." />
                            </div>
                            <div className="admin-field">
                              <label>YouTube URL</label>
                              <input value={getEditValue(candidate.candidateid, 'youtubeSearchUrl', candidate.youtubeSearchUrl || '')} onChange={e => handleEdit(candidate.candidateid, 'youtubeSearchUrl', e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                          </div>
                        </div>

                        {/* Social Media — NEW */}
                        <div className="admin-field-group">
                          <h3 className="admin-field-group-title">Social Media</h3>
                          <div className="admin-fields-row">
                            <div className="admin-field">
                              <label>X (Twitter) URL</label>
                              <input value={getEditValue(candidate.candidateid, 'xUrl', candidate.xUrl || '')} onChange={e => handleEdit(candidate.candidateid, 'xUrl', e.target.value)} placeholder="https://x.com/username" />
                            </div>
                            <div className="admin-field">
                              <label>Facebook URL</label>
                              <input value={getEditValue(candidate.candidateid, 'facebookUrl', candidate.facebookUrl || '')} onChange={e => handleEdit(candidate.candidateid, 'facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
                            </div>
                            <div className="admin-field">
                              <label>Instagram URL</label>
                              <input value={getEditValue(candidate.candidateid, 'instagramUrl', candidate.instagramUrl || '')} onChange={e => handleEdit(candidate.candidateid, 'instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
                            </div>
                            <div className="admin-field">
                              <label>TikTok URL</label>
                              <input value={getEditValue(candidate.candidateid, 'tiktokUrl', candidate.tiktokUrl || '')} onChange={e => handleEdit(candidate.candidateid, 'tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@..." />
                            </div>
                          </div>
                        </div>

                        {/* Contact Info — NEW */}
                        <div className="admin-field-group">
                          <h3 className="admin-field-group-title">Contact Information</h3>
                          <div className="admin-fields-row">
                            <div className="admin-field">
                              <label>Contact Email</label>
                              <input value={getEditValue(candidate.candidateid, 'contactEmail', candidate.contactEmail || '')} onChange={e => handleEdit(candidate.candidateid, 'contactEmail', e.target.value)} placeholder="contact@campaign.com" />
                            </div>
                            <div className="admin-field">
                              <label>Contact Phone</label>
                              <input value={getEditValue(candidate.candidateid, 'contactPhone', candidate.contactPhone || '')} onChange={e => handleEdit(candidate.candidateid, 'contactPhone', e.target.value)} placeholder="(555) 123-4567" />
                            </div>
                          </div>
                        </div>

                        {/* Positions */}
                        <div className="admin-field-group">
                          <h3 className="admin-field-group-title">Issue Positions</h3>
                          <div className="admin-category-tabs">
                            {CATEGORIES.map(cat => (
                              <button key={cat} className={`admin-cat-tab${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                            ))}
                          </div>
                          {ISSUES.filter(i => i.category === activeCategory).map(issue => (
                            <div key={issue.id} className="admin-position-field">
                              <label>{issue.id}. {issue.name}</label>
                              <textarea value={getEditValue(candidate.candidateid, `position-${issue.id}`, candidate.positions?.[String(issue.id)] || '')} onChange={e => handleEdit(candidate.candidateid, `position-${issue.id}`, e.target.value)} rows={3} placeholder="Enter candidate position..." />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {editCount > 0 && (
              <div className="admin-save-bar">
                <span>{editCount} unsaved change{editCount !== 1 ? 's' : ''}</span>
                <button onClick={saveAll} disabled={saving} className="admin-save-bar-btn">
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Admin;