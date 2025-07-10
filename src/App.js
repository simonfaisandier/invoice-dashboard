import React, { useEffect, useState } from "react";
import "./fonts.css";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://n8n-faisandier-u48592.vm.elestio.app/webhook/invoice-dashboard")
      .then((res) => res.json())
      .then((res) => {
        setData(Array.isArray(res) ? res : []);
      });
  }, []);

  const avatarMap = {
    "Ty Loveridge": "/avatars/ty.png",
    "Declan Bowers": "/avatars/declan.png",
    "Taryn Brouwer": "/avatars/taryn.png",
    "Isaac": "/avatars/isaac.png",
    "Josh": "/avatars/josh.png",
    "Zach": "/avatars/zach.png",
    "Collette": "/avatars/collette.png",
    "Jessie": "/avatars/jessie.png",
    "Piri": "/avatars/piri.png"
    // Add more as needed
  };

  // Split data into two columns
  const mid = Math.ceil(data.length / 2);
  const leftCol = data.slice(0, mid);
  const rightCol = data.slice(mid);

  const renderPerson = (person) => {
    const percent = person.total > 0 ? (person.approved / person.total) * 100 : 0;
    return (
      <div key={person.name} style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", minHeight: 72 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
            <img
              src={avatarMap[person.name] || "/avatars/fallback.png"}
              alt={person.name}
              style={{
                width: 108,
                height: 108,
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
            <span
              style={{
                fontSize: "22pt",
                fontFamily: "FT Polar",
                fontWeight: 600,
                marginTop: 8,
                textAlign: "center"
              }}
            >
              {person.name.split(' ')[0]}
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
                  width: `${percent}%`,
                  height: "100%",
                  transition: "width 0.5s",
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
          height: 48
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
          marginTop: 0
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
          {leftCol.map(renderPerson)}
        </div>
        <div style={{ flex: 1, minWidth: 350 }}>
          {rightCol.map(renderPerson)}
        </div>
      </div>
    </div>
  );
}

export default App;