'use client';
import React, { useState } from "react";

const teams = [
  "KIA",
  "Samsung",
  "LG",
  "KT",
  "Doosan",
  "SSG",
  "Lotte",
  "Hanhwa",
  "NC",
  "Kiwoom",
];

export default function Home() {
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async (team: string) => {
    setLoading(true);
    try {
      // 팀명에 맞는 JSON 파일을 비동기적으로 가져옵니다.
      const response = await fetch(`./data/${team}.json`);
      if (!response.ok) {
        throw new Error(`${team} 데이터를 불러오는데 실패했습니다.`);
      }
      const data = await response.json();
      
      // "선수명"만 추출해서 상태에 저장
      const playerNames = data.map((player: { 선수명: string }) => player.선수명);
      setPlayers(playerNames);
    } catch (error) {
      console.error("Error loading player data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px" }}>
      <h1>KBO 구단 버튼</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {teams.map((team) => (
          <button
            key={team}
            style={{
              padding: "10px 20px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f7f7f7",
              cursor: "pointer",
            }}
            onClick={() => handleClick(team)}
          >
            {team}
          </button>
        ))}
      </div>

      {/* 로딩 중 표시 */}
      {loading && <div>로딩 중...</div>}

      {/* 선수명 목록 표시 */}
      <div>
        {players.length > 0 && !loading && (
          <div>
            <h2>{teams[teams.indexOf(players[0])] || "선수 목록"}</h2>
            <ul>
              {players.map((player, index) => (
                <li key={index}>{player}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}