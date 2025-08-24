import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handle POST requests to /api/games
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();

    // Validate the data (basic example)
    if (!body.players || body.players.length < 2) {
      return NextResponse.json(
        { error: "At least 2 players required" },
        { status: 400 }
      );
    }

    // Create the game and all results in a transaction
    const game = await prisma.$transaction(async (tx) => {
      // First, create the game
      const newGame = await tx.game.create({
        data: {
          date: new Date(),
          duration: body.duration || null,
        },
      });

      // Then create all the game results
      const gameResults = await Promise.all(
        body.players.map((player: any) =>
          tx.gameResult.create({
            data: {
              gameId: newGame.id,
              playerId: player.playerId,
              placement: player.placement,
              commander: player.commander,
              colors: player.colors,
            },
          })
        )
      );

      return {
        ...newGame,
        results: gameResults,
      };
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}

// Handle GET requests to /api/games
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        results: {
          include: {
            player: true, // Include player info
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
