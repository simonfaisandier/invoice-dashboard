import React, { useEffect, useState } from "react";
import "./fonts.css";

function App() {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [colCount, setColCount] = useState(3);

  // Get column count based on window width
  const getColCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1600) return 1;
      return 4;
    }
    return 1;
  };

  // Update column count on resize
  useEffect(() => {
    const handleResize = () => {
      setColCount(getColCount());
    };
    
    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch("https://n8n-faisandier-u48592.vm.elestio.app/webhook/invoice-dashboard")
      .then((res) => res.json())
      .then((res) => {
        const dataArray = Array.isArray(res) ? res : [];
        const aggregated = {};

        dataArray.forEach(person => {
          // Split names by comma for group assignments
          const names = person.name.split(',').map(n => n.trim());
          names.forEach(name => {
            if (!aggregated[name]) {
              aggregated[name] = { name, approved: 0, total: 0 };
            }
            aggregated[name].approved += Number(person.approved) || 0;
            aggregated[name].total += Number(person.total) || 0;
          });
        });

        const uniqueData = Object.values(aggregated);
        console.log("Names from API (aggregated):", uniqueData.map(person => person.name));
        setData(uniqueData);
        setTimeout(() => setIsLoaded(true), 100);
      });
  }, []);

  // Calculate winners - only for people who have completed ALL their assigned invoices (approved = total)
  const peopleWhoCompletedAll = data.filter(person => Number(person.approved) === Number(person.total) && Number(person.approved) > 0);
  const maxApproved = peopleWhoCompletedAll.length > 0 ? Math.max(...peopleWhoCompletedAll.map(person => Number(person.approved))) : 0;
  
  const mostApproved = data.filter(person => 
    Number(person.approved) === maxApproved && 
    Number(person.approved) > 0 && 
    Number(person.approved) === Number(person.total)
  );

  const renderPerson = (person, index) => {
    const percent = person.total > 0 ? (person.approved / person.total) * 100 : 0;
    const fadeInDelay = index * 0.1;
    const progressDelay = 0.5 + fadeInDelay;
    return (
      <div
        key={person.name}
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.6s ease-out ${fadeInDelay}s, transform 0.6s ease-out ${fadeInDelay}s`
        }}
      >
        {/* Avatar and name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "2rem" }}>
          <img
            src={`/avatars/${person.name.split(' ')[0].toLowerCase()}.png`}
            alt={person.name}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              display: "block"
            }}
            onError={(e) => {
              e.target.src = "/avatars/fallback.png";
            }}
          />
          <span
            style={{
              fontSize: "16px",
              fontFamily: "FT Polar",
              fontWeight: 600,
              marginTop: "8px",
              textAlign: "center"
            }}
          >
            {person.name.split(' ')[0]}
            {mostApproved.includes(person) && (
              <span style={{ marginLeft: "4px" }}>🏆</span>
            )}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-150%)",
              fontSize: "12px",
              fontFamily: "FT Polar Mono",
              fontWeight: "bold",
              color: "#262724",
              padding: "0 6px",
              paddingBottom: "5px",
              zIndex: 2
            }}
          >
            {person.approved} / {person.total}
          </span>
          <div
            style={{
              background: "#D1C6B4",
              borderRadius: "12px",
              overflow: "hidden",
              height: "18px",
              flex: 1,
              marginRight: "16px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <div
              style={{
                background: "#585F51",
                width: isLoaded ? `${percent}%` : "0%",
                height: "100%",
                transition: `width 0.8s ease-out ${progressDelay}s`,
                borderRadius: "12px"
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#F8F5EC",
        minHeight: "100vh",
        padding: "3rem 3rem 2rem 3rem",
        fontFamily: "FT Polar, sans-serif",
        color: "#222",
        position: "relative",
        overflow: "hidden",
        minWidth: "360px"
      }}
    >
      {/* Logo in top-right */}
      <img
        src="/avatars/fallback.png"
        alt="Logo"
        style={{
          position: "absolute",
          top: 60,
          right: 32,
          width: 48,
          height: 48,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s"
        }}
      />
      {/* Header */}
      <h1
        style={{
          fontSize: "42pt",
          fontFamily: "FT Polar",
          fontWeight: 500,
          letterSpacing: "-0.4px",
          lineHeight: 1,
          textAlign: "left",
          marginBottom: "2.5rem",
          marginTop: 0,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s",
          paddingRight: "80px",
        }}
      >
        Live Invoice Dashboard
      </h1>
      {/* Responsive columns */}
      <div
        className="dashboard-content"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          gap: "2rem"
        }}
      >
        {data.map((person, index) => (
          <div key={person.name} className="dashboard-item">
            {renderPerson(person, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;