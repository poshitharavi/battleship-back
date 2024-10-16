import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

@Controller('game')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(private readonly gamesService: GameService) {}

  @Post('create')
  async saveTask(@Req() request: any, @Res() response: Response): Promise<any> {
    try {
      const game = await this.gamesService.createGame();

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully game created',
        body: {
          game,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /game/save: ${error.message}`);

      if (error instanceof BadRequestException) {
        // Handle BadRequestException differently
        return response.status(StatusCodes.BAD_REQUEST).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.BAD_REQUEST),
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
