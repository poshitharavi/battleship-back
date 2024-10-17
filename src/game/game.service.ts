import { Injectable } from '@nestjs/common';
import { Game, GameStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(): Promise<Game> {
    try {
      const game = await this.prisma.game.create({
        data: {
          status: 'initialized',
        },
      });

      return game;
    } catch (error) {
      throw error;
    }
  }

  async getGamesStatus(gameId: string): Promise<GameStatus> {
    const game = await this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
      select: {
        status: true,
      },
    });

    return game.status;
  }

  async updateGameStatus(gameId: string, status: GameStatus): Promise<Game> {
    try {
      const game = await this.prisma.game.update({
        where: {
          id: gameId,
        },
        data: {
          status: status,
        },
      });

      return game;
    } catch (error) {
      throw error;
    }
  }

  getShootMessage(
    isSuccessfulHit: boolean,
    allShipsBeenDestroyedByHuman: boolean,
    allShipsBeenDestroyedByComputer: boolean,
  ): string {
    if (allShipsBeenDestroyedByHuman) {
      return 'You destroyed the enemy fleet, Congratulations! You are the winner';
    }

    if (allShipsBeenDestroyedByComputer) {
      return 'Computer destroyed the enemy fleet, Try again with a new game';
    }

    return isSuccessfulHit ? "That's a hit! Great job" : 'You missed the shot';
  }
}
