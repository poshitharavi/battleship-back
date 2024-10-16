import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPlayerShipDto } from './dtos';
import { Ship, ShipType } from '@prisma/client';

@Injectable()
export class ShipService {
  constructor(private prisma: PrismaService) {}

  private ships = [
    { type: 'Battleship', size: 5 },
    { type: 'Destroyer1', size: 4 },
    { type: 'Destroyer2', size: 4 },
  ];

  private gridLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  private gridSize = 10;

  getShips() {
    return this.ships;
  }

  async addPlayerShips(addPlayerShipDto: AddPlayerShipDto): Promise<Ship> {
    try {
      const ship = this.ships.find(
        (ship) => ship.type === addPlayerShipDto.ship,
      );

      if (ship.size !== addPlayerShipDto.positions.length)
        throw new BadRequestException(
          'Ship positions are not equal to the size',
        );
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

  async addComputerShips(gameId: string): Promise<any[]> {
    try {
      const placedPositions: Set<string> = new Set();

      for (const ship of this.ships) {
        let shipPlaced = false;

        while (!shipPlaced) {
          const orientation = this.getRandomOrientation(); // horizontal or vertical
          const startPosition = this.getRandomPosition();

          const shipPositions = this.generateShipPositionsWithoutOverlap(
            startPosition,
            orientation,
            ship.size,
            placedPositions, // Pass existing positions
          );

          // If valid positions are generated (i.e., they all fit on the grid)
          if (shipPositions) {
            await this.prisma.ship.create({
              data: {
                game_id: gameId,
                type: ship.type as ShipType,
                player: 'computer',
                ShipPosition: {
                  createMany: {
                    data: shipPositions.map((position) => ({
                      position,
                      game_id: gameId,
                    })),
                  },
                },
              },
            });

            // Add the valid positions to the set of placed positions
            shipPositions.forEach((position) => placedPositions.add(position));
            shipPlaced = true;
          }
        }
      }

      return Array.from(placedPositions);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A ship with the same type and player already exists in this game.',
        );
      }
      throw error;
    }
  }

  private getRandomOrientation(): 'horizontal' | 'vertical' {
    return Math.random() < 0.5 ? 'horizontal' : 'vertical';
  }

  private getRandomPosition(): { letter: string; number: number } {
    const letter = this.gridLetters[Math.floor(Math.random() * this.gridSize)];
    const number = Math.floor(Math.random() * this.gridSize) + 1;
    return { letter, number };
  }

  private generateShipPositionsWithoutOverlap(
    start: { letter: string; number: number },
    orientation: 'horizontal' | 'vertical',
    size: number,
    placedPositions: Set<string>,
  ): string[] | null {
    const positions: string[] = [];
    const letterIndex = this.gridLetters.indexOf(start.letter);

    for (let i = 0; i < size; i++) {
      let newPosition: string;

      if (orientation === 'horizontal') {
        // Check if the ship fits on the grid horizontally
        if (start.number + size - 1 <= this.gridSize) {
          newPosition = `${start.letter}${start.number + i}`;
        } else {
          return null; // If ship doesn't fit, return null to retry
        }
      } else {
        // Check if the ship fits on the grid vertically
        if (letterIndex + size - 1 < this.gridLetters.length) {
          newPosition = `${this.gridLetters[letterIndex + i]}${start.number}`;
        } else {
          return null; // If ship doesn't fit, return null to retry
        }
      }

      // Check if the position is already occupied
      if (placedPositions.has(newPosition)) {
        return null; // If the position is taken, return null to retry
      }

      positions.push(newPosition);
    }

    return positions;
  }
}
