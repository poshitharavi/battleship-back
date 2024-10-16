import { IsNotEmpty, IsString } from 'class-validator';

export class ShootDto {
  @IsNotEmpty()
  @IsString()
  position: string;
}
