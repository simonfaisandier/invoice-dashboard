import React, { useEffect, useState } from "react";
import "./fonts.css";

function App() {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("https://n8n-faisandier-u48592.vm.elestio.app/webhook/invoice-dashboard")
      .then((res) => res.json())
      .then((res) => {
        const dataArray = Array.isArray(res) ? res : [];
        
        // Remove duplicates based on name
        const uniqueData = dataArray.filter((person, index, self) => 
          index === self.findIndex(p => p.name === person.name)
        );
        
        console.log("Names from API:", uniqueData.map(person => person.name));
        setData(uniqueData);
        // Trigger animations after data loads
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



  // Split data into two columns
  const mid = Math.ceil(data.length / 2);
  const leftCol = data.slice(0, mid);
  const rightCol = data.slice(mid);

  const renderPerson = (person, index) => {
    const percent = person.total > 0 ? (person.approved / person.total) * 100 : 0;
    const fadeInDelay = index * 0.1; // Stagger the fade-in animations
    const progressDelay = 0.5 + fadeInDelay; // Progress bar animates after fade-in
    
    return (
      <div 
        key={person.name} 
        style={{ 
          marginBottom: "3.5rem",
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.6s ease-out ${fadeInDelay}s, transform 0.6s ease-out ${fadeInDelay}s`
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", minHeight: 72 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
            <img
              src={`/avatars/${person.name.split(' ')[0].toLowerCase()}.png`}
              alt={person.name}
              style={{
                width: 108,
                height: 108,
                borderRadius: "50%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.src = "/avatars/fallback.png";
              }}
            />
            <span
              style={{
                fontSize: "22pt",
                fontFamily: "FT Polar",
                fontWeight: 600,
                marginTop: 8,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {person.name.split(' ')[0]}
              {mostApproved.includes(person) && (
                <span style={{ fontSize: "18pt" }}>🏆</span>
              )}
            </span>
          </div>
          <div style={{ flex: 1, marginLeft: 32, display: "flex", alignItems: "center", position: "relative", height: 72, top: "-27px" }}>
            {/* Progress count above bar */}
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-150%)",
                fontSize: "12pt",
                fontFamily: "FT Polar Mono",
                fontWeight: "bold",
                minWidth: 50,
                textAlign: "right",
                color: "#262724",
                background: "#F8F5EC",
                padding: "0 6px",
                borderRadius: "8px",
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
                marginRight: 16,
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
        position: "relative"
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
          textAlign: "left",
          marginBottom: "2.5rem",
          marginTop: 0,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s"
        }}
      >
        Live Invoice Dashboard
      </h1>
      {/* Two columns */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "5vw",
          justifyContent: "flex-start"
        }}
      >
        <div style={{ flex: 1, minWidth: 350 }}>
          {leftCol.map((person, index) => renderPerson(person, index))}
        </div>
        <div style={{ flex: 1, minWidth: 350 }}>
          {rightCol.map((person, index) => renderPerson(person, index + leftCol.length))}
        </div>
      </div>
    </div>
  );
}

export default App;