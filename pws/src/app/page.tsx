"use client";

import React from 'react';
import Link from 'next/link';

const teams = [
  'Doosan',
  'Lotte',
  'Samsung',
  'LG',
  'NC',
  'SSG',
  'Hanhwa',
  'Kiwoom',
  'KT',
  'KIA',
];

export default function Home() {
  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: "10px", 
      padding: "20px" 
    }}>
      <h1>KBO 구단 선수</h1>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "10px", 
        justifyContent: "center" 
      }}>
        {teams.map((team) => (
          <Link 
            key={team} 
            href={`/players/${team}`}
            style={{
              textDecoration: 'none'
            }}
          >
            <button
              style={{
                padding: "10px 20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: "#f7f7f7",
                cursor: "pointer",
              }}
            >
              {team}
            </button>
          </Link>
        ))}
      </div>
    </main>
  );
}