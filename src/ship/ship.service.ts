import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPlayerShipDto } from './dtos';
import { Ship } from '@prisma/client';

@Injectable()
export class ShipService {
  constructor(private prisma: PrismaService) {}

  private ships = [
    { type: 'Battleship', size: 5 },
    { type: 'Destroyer1', size: 4 },
    { type: 'Destroyer2', size: 4 },
  ];

  getShips() {
    return this.ships;
  }

  async addPlayerShips(addPlayerShipDto: AddPlayerShipDto): Promise<Ship> {
    try {
      const shipPositions = addPlayerShipDto.positions.map((position) => ({
        position: position,
        game_id: addPlayerShipDto.gameId,
      }));

      const playerShip = await this.prisma.ship.create({
        data: {
          game_id: addPlayerShipDto.gameId,
          type: addPlayerShipDto.ship,
          player: 'human',
          ShipPosition: {
            createMany: {
              data: shipPositions,
            },
          },
        },
      });

      return playerShip;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A ship with the same type and player already exists in this game.',
        );
      }
      throw error;
    }
  }
}
