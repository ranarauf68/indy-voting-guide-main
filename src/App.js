import React, { useState, useEffect } from 'react';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Admin from './pages/Admin';
import CandidatePage from './pages/CandidatePage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [voterData, setVoterData] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handlePage1Submit = (data) => {
    setVoterData(data);
    setCurrentPage(2);
    window.history.pushState({ page: 2 }, '');
  };

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setCurrentPage(3);
    window.history.pushState({ page: 3 }, '');
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setCurrentPage(4);
    window.history.pushState({ page: 4 }, '');
  };

  const handleBack = () => {
    setCurrentPage((prevPage) => {
      if (prevPage === 4) {
        setSelectedCandidate(null);
        return 1;
      }
      return Math.max(1, prevPage - 1);
    });
  };

  const handleCloseAdmin = () => {
    setShowAdmin(false);
    // Fix: push state so browser back works correctly after closing admin
    window.history.pushState({ page: 1 }, '');
  };

  const handleOpenAdmin = () => {
    setShowAdmin(true);
    // Push admin state so browser back closes admin
    window.history.pushState({ admin: true }, '');
  };

  useEffect(() => {
    const onPopState = (e) => {
      // If going back from admin, close admin
      if (showAdmin) {
        setShowAdmin(false);
        return;
      }
      handleBack();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [showAdmin]);

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setShowAdmin(true);
    }
  }, []);

  if (showAdmin) {
    return <Admin onClose={handleCloseAdmin} />;
  }

  return (
    <div className="app">
      {currentPage === 1 && <Page1 onSubmit={handlePage1Submit} onCandidateSelect={handleCandidateSelect} onAdminOpen={handleOpenAdmin} />}
      {currentPage === 2 && <Page2 voterData={voterData} onRaceSelect={handleRaceSelect} onBack={handleBack} />}
      {currentPage === 3 && selectedRace && <Page3 voterData={voterData} selectedRace={selectedRace} onBack={handleBack} />}
      {currentPage === 4 && selectedCandidate && <CandidatePage candidate={selectedCandidate} onBack={handleBack} />}
    </div>
  );
}

export default App;