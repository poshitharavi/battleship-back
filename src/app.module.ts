import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GameModule } from './game/game.module';
import { ShipModule } from './ship/ship.module';

@Module({
  imports: [PrismaModule, GameModule, ShipModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
