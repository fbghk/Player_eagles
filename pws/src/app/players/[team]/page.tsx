"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TeamPlayers() {
  const params = useParams();
  const team = Array.isArray(params.team) ? params.team[0] : params.team;
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/data/${team}.json`);
        if (!response.ok) {
          throw new Error(`${team} 데이터를 불러오는데 실패했습니다.`);
        }
        const data = await response.json();
        
        // "선수명"만 추출해서 상태에 저장
        const playerNames = data.map((player: { 선수명: string }) => player.선수명);
        setPlayers(playerNames);
      } catch (error) {
        console.error("Error loading player data:", error);
        setError(error instanceof Error ? error.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    if (team) {
      fetchPlayers();
    }
  }, [team]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: "10px", 
      padding: "20px" 
    }}>
      <h1>{team} 선수 목록</h1>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0 
      }}>
        {players.map((player, index) => (
          <li 
            key={index} 
            style={{ 
              padding: '5px', 
              borderBottom: '1px solid #eee' 
            }}
          >
            {player}
          </li>
        ))}
      </ul>
    </main>
  );
}