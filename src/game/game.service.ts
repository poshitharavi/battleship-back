import { Injectable } from '@nestjs/common';
import { Game } from '@prisma/client';
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
}
