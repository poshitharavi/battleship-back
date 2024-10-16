import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame() {
    try {
      const playerBoard = this.initializeBoard();
      const computerBoard = this.placeShips();

      const game = await this.prisma.game.create({
        data: {
          player_board: playerBoard,
          computer_board: computerBoard,
          status: 'in_progress',
        },
      });

      return game;
    } catch (error) {
      throw error;
    }
  }

  private initializeBoard() {
    return Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));
  }

  private placeShips() {
    const board = Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));
    return board;
  }
}
