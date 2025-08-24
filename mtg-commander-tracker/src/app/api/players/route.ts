import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: { name },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    // Handle unique constraint violation (duplicate name)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Player name already exists" },
        { status: 400 }
      );
    }

    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
