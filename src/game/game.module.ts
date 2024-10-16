import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ShipService } from 'src/ship/ship.service';

@Module({
  controllers: [GameController],
  providers: [GameService, ShipService],
})
export class GameModule {}
