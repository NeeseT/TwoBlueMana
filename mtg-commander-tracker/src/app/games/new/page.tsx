"use client";

import { useState, useEffect } from "react";
import CommanderAutocomplete from "@/components/CommanderAutocomplete";

interface Player {
  id: string;
  name: string;
}

interface GamePlayer {
  playerId: string;
  playerName: string;
  commander: string;
  colors: string;
  placement: number;
}

export default function NewGamePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [commander, setCommander] = useState("");
  const [colors, setColors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all players when component loads
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players");
      if (response.ok) {
        const playersData = await response.json();
        setPlayers(playersData);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Handle commander selection from autocomplete
  const handleCommanderSelect = (
    commanderName: string,
    commanderColors: string
  ) => {
    setCommander(commanderName);
    setColors(commanderColors);
  };

  const addPlayerToGame = () => {
    if (selectedPlayerId && commander) {
      const player = players.find((p) => p.id === selectedPlayerId);
      if (player) {
        const newGamePlayer: GamePlayer = {
          playerId: selectedPlayerId,
          playerName: player.name,
          commander,
          colors,
          placement: gamePlayers.length + 1, // Will be updated when setting final placements
        };
        setGamePlayers([...gamePlayers, newGamePlayer]);
        setSelectedPlayerId("");
        setCommander("");
        setColors("");
      }
    }
  };

  const updatePlacement = (playerId: string, placement: number) => {
    setGamePlayers(
      gamePlayers.map((player) =>
        player.playerId === playerId ? { ...player, placement } : player
      )
    );
  };

  const submitGame = async () => {
    if (gamePlayers.length < 2) {
      alert("Need at least 2 players");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          players: gamePlayers.map((player) => ({
            playerId: player.playerId,
            commander: player.commander,
            colors: player.colors,
            placement: player.placement,
          })),
        }),
      });

      if (response.ok) {
        const game = await response.json();
        alert("Game saved successfully!");
        setGamePlayers([]); // Reset form
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting game:", error);
      alert("Failed to save game");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Record New Game</h1>

      {/* Add Player to Game Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Player to Game</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <select
            value={selectedPlayerId}
            id="text_box_input"
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="md:col-span-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Player</option>
            {players
              .filter(
                (player) => !gamePlayers.find((gp) => gp.playerId === player.id)
              )
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>

          {/* Commander Autocomplete */}
          <div className="md:col-span-6 rounded-md px-3 py-2">
            <CommanderAutocomplete
              onSelect={handleCommanderSelect}
              placeholder="Search for commander..."
              className="w-full"
            />
          </div>

          <button
            onClick={addPlayerToGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add to Game
          </button>
        </div>
      </div>

      {/* Game Players & Placements */}
      {gamePlayers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Set Final Placements</h2>
          <div className="space-y-3">
            {gamePlayers.map((player, index) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <span className="font-medium text-gray-500">
                    {player.playerName}
                  </span>
                  <span className="text-gray-500 ml-2">
                    playing {player.commander} ({player.colors})
                  </span>
                </div>
                <select
                  value={player.placement}
                  onChange={(e) =>
                    updatePlacement(player.playerId, parseInt(e.target.value))
                  }
                  className="px-2 py-1 border border-gray-300 rounded"
                >
                  {Array.from({ length: gamePlayers.length }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                      {i === 0
                        ? "st"
                        : i === 1
                        ? "nd"
                        : i === 2
                        ? "rd"
                        : "th"}{" "}
                      place
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={submitGame}
            disabled={isSubmitting}
            className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Game"}
          </button>
        </div>
      )}
    </div>
  );
}
