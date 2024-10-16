import { ShipType } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AddPlayerShipDto {
  @IsNotEmpty()
  @IsString()
  gameId: string;
  @IsNotEmpty()
  @IsEnum(ShipType, {
    message: 'Ship must be a valid ShipType value',
  })
  ship: ShipType;
  @IsNotEmpty()
  @IsArray()
  positions: string[];
}
