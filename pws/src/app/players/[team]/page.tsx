"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Player = {
  등번호: string;
  선수명: string;
  팀명: string;
  포지션: string;
  생년월일: string;
  체격: string;
  출신교: string;
};

export default function TeamPlayers() {
  const params = useParams();
  const team = Array.isArray(params.team) ? params.team[0] : params.team;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/data/${team}.json`);
        if (!response.ok) {
          throw new Error(`${team} 데이터를 불러오는데 실패했습니다.`);
        }
        const data: Player[] = await response.json();
        setPlayers(data);
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

  const openPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
  };

  const closePlayerModal = () => {
    setSelectedPlayer(null);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="flex">
      <main 
        style={{ 
          width: '50%', 
          height: '100vh',
          overflowY: 'auto',
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "10px", 
          padding: "20px" 
        }}
      >
        <h1>{team} 선수 목록</h1>
        <ul style={{ 
          width: '100%',
          listStyle: 'none', 
          padding: 0 
        }}>
          {players.map((player, index) => (
            <li 
              key={index} 
              style={{ 
                padding: '10px', 
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: selectedPlayer?.선수명 === player.선수명 ? '#f0f0f0' : 'white'
              }}
              onClick={() => openPlayerModal(player)}
            >
              {player.선수명}
            </li>
          ))}
        </ul>
      </main>

      {/* 모달 영역 */}
      <div 
        style={{
          width: '50%', 
          height: '100vh',
          position: 'sticky',
          top: 0,
          padding: '20px',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto'
        }}
      >
        {selectedPlayer ? (
          <div 
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              width: '300px',
              position: 'sticky',
              top: '20px'
            }}
          >
            <h2>선수 정보</h2>
            <h3>{selectedPlayer.선수명}</h3>
            <p>
              {selectedPlayer.등번호 
                ? `등번호: ${selectedPlayer.등번호}` 
                : "등번호가 없습니다."}
            </p>
            <button 
              onClick={closePlayerModal}
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            >
              닫기
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <p>선수를 선택해주세요</p>
          </div>
        )}
      </div>
    </div>
  );
}