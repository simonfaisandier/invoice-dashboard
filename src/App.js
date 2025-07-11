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



  // Distribute people into three columns using round-robin assignment
  const colCount = 3;
  const columns = Array.from({ length: colCount }, () => []);
  data.forEach((person, idx) => {
    columns[idx % colCount].push(person);
  });

  // Calculate the number of rows (max of all columns)
  const numRows = Math.max(...columns.map(col => col.length));
  // Calculate dynamic row height
  // We'll subtract the header height (approx 5.5rem) and top/bottom padding (5rem) from 100vh
  const gridAvailableHeight = 'calc(100vh - 5.5rem - 5rem)';
  const rowHeight = `calc((${gridAvailableHeight}) / ${numRows})`;
  // Dynamic avatar and font sizes
  const avatarSize = `min(108px, calc((${gridAvailableHeight}) / ${numRows} * 0.7))`;
  const nameFontSize = `min(22pt, calc((${gridAvailableHeight}) / ${numRows} * 0.22))`;
  const progressFontSize = `min(12pt, calc((${gridAvailableHeight}) / ${numRows} * 0.13))`;

  const renderPerson = (person, index) => {
    const percent = person.total > 0 ? (person.approved / person.total) * 100 : 0;
    const fadeInDelay = index * 0.1; // Stagger the fade-in animations
    const progressDelay = 0.5 + fadeInDelay; // Progress bar animates after fade-in
    return (
      <div
        key={person.name}
        style={{
          marginBottom: 0,
          height: rowHeight,
          display: "flex",
          alignItems: "center",
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.6s ease-out ${fadeInDelay}s, transform 0.6s ease-out ${fadeInDelay}s`
        }}
      >
        {/* Avatar and name vertically centered as a flex column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: avatarSize, height: "100%" }}>
          <img
            src={`/avatars/${person.name.split(' ')[0].toLowerCase()}.png`}
            alt={person.name}
            style={{
              width: avatarSize,
              height: avatarSize,
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
              fontSize: `calc(${nameFontSize} * 0.7)`,
              fontFamily: "FT Polar",
              fontWeight: 600,
              marginTop: 8,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              wordBreak: "break-word",
              maxWidth: avatarSize
            }}
          >
            {person.name.split(' ')[0]}
            {mostApproved.includes(person) && (
              <span style={{ fontSize: `calc(${nameFontSize} * 0.8)` }}>🏆</span>
            )}
          </span>
        </div>
        <div style={{ flex: 1, marginLeft: 32, display: "flex", alignItems: "center", position: "relative", height: avatarSize, top: "-27px" }}>
          {/* Progress count above bar */}
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-150%)",
              fontSize: progressFontSize,
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
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#F8F5EC",
        height: "100vh",
        padding: "3rem 3rem 2rem 3rem",
        fontFamily: "FT Polar, sans-serif",
        color: "#222",
        position: "relative",
        overflow: "hidden"
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
      {/* Three columns with grid for vertical fit, no scroll */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3vw",
          justifyContent: "flex-start",
          alignItems: "stretch",
          height: gridAvailableHeight,
          minHeight: 0
        }}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
            {col.map((person, index) => renderPerson(person, index + colIdx * numRows))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;