import { Game } from "@/types/game";

// This would typically come from your database
const mockGames: Game[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    duration: 90,
    results: [
      {
        id: "1",
        gameId: "1",
        playerId: "1",
        placement: 1,
        commander: "Atraxa",
        colors: "WUBG",
      },
      {
        id: "2",
        gameId: "1",
        playerId: "2",
        placement: 2,
        commander: "Edgar Markov",
        colors: "WBR",
      },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800">Total Games</h3>
          <p className="text-3xl font-bold text-blue-600">{mockGames.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Avg Game Duration
          </h3>
          <p className="text-3xl font-bold text-green-600">90m</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Most Played Commander
          </h3>
          <p className="text-lg font-medium text-purple-600">Atraxa</p>
        </div>
      </div>
    </div>
  );
}
