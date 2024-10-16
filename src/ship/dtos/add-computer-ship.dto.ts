import { IsNotEmpty, IsString } from 'class-validator';

export class AddComputerShipDto {
  @IsNotEmpty()
  @IsString()
  gameId: string;
}
