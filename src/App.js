import React, { useEffect, useState } from "react";
import "./fonts.css";
import "./App.css";

function ProgressBar({ percent, approved, total }) {
  return (
    <div className="person-progress-bar">
      <span className="person-counter" aria-label={`Approved ${approved} of ${total}`}>{approved} / {total}</span>
      <div className="person-progress-bg">
        <div
          className="person-progress-fill"
          style={{ width: `${percent}%` }}
          aria-valuenow={approved}
          aria-valuemax={total}
          aria-valuemin={0}
          role="progressbar"
        />
      </div>
    </div>
  );
}

function PersonCard({ person, isWinner, percent, isLoaded, fadeInDelay, progressDelay }) {
  return (
    <div
      className="dashboard-person"
      style={{
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease-out ${fadeInDelay}s, transform 0.6s ease-out ${fadeInDelay}s`
      }}
    >
      <div className="person-avatar-label">
        <img
          src={`/avatars/${person.name.split(' ')[0].toLowerCase()}.png`}
          alt={person.name}
          className="person-avatar"
          onError={e => { e.target.src = "/avatars/fallback.png"; }}
        />
        <span className="person-label">
          {person.name.split(' ')[0]}
          {isWinner && <span className="person-trophy">🏆</span>}
        </span>
      </div>
      <ProgressBar percent={percent} approved={person.approved} total={person.total} />
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("https://n8n-faisandier-u48592.vm.elestio.app/webhook/invoice-dashboard")
      .then(res => res.json())
      .then(res => {
        const dataArray = Array.isArray(res) ? res : [];
        const aggregated = {};
        dataArray.forEach(person => {
          const names = person.name.split(',').map(n => n.trim());
          names.forEach(name => {
            if (!aggregated[name]) {
              aggregated[name] = { name, approved: 0, total: 0 };
            }
            aggregated[name].approved += Number(person.approved) || 0;
            aggregated[name].total += Number(person.total) || 0;
          });
        });
        setData(Object.values(aggregated));
        setTimeout(() => setIsLoaded(true), 100);
      });
  }, []);

  // Calculate winners
  const peopleWhoCompletedAll = data.filter(person => Number(person.approved) === Number(person.total) && Number(person.approved) > 0);
  const maxApproved = peopleWhoCompletedAll.length > 0 ? Math.max(...peopleWhoCompletedAll.map(person => Number(person.approved))) : 0;
  const mostApproved = data.filter(person =>
    Number(person.approved) === maxApproved &&
    Number(person.approved) > 0 &&
    Number(person.approved) === Number(person.total)
  );

  return (
    <main className="dashboard-root">
      <img
        src="/avatars/fallback.png"
        alt="Logo"
        className="dashboard-logo"
        aria-hidden="true"
      />
      <header>
        <h1 className="dashboard-title">Live Invoice Dashboard</h1>
      </header>
      <section className="dashboard-content">
        {data.map((person, index) => {
          const percent = person.total > 0 ? (person.approved / person.total) * 100 : 0;
          const fadeInDelay = index * 0.1;
          const progressDelay = 0.5 + fadeInDelay;
          return (
            <div key={person.name} className="dashboard-item">
              <PersonCard
                person={person}
                isWinner={mostApproved.includes(person)}
                percent={percent}
                isLoaded={isLoaded}
                fadeInDelay={fadeInDelay}
                progressDelay={progressDelay}
              />
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default App;