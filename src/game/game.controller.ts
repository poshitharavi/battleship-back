import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { AddComputerShipDto, AddPlayerShipDto } from 'src/ship/dtos';
import { ShipService } from 'src/ship/ship.service';

@Controller('game')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(
    private readonly gamesService: GameService,
    private shipService: ShipService,
  ) {}

  @Post('create')
  async saveTask(@Res() response: Response): Promise<any> {
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

  @Post('add-player-ship')
  async addPlayerShips(
    @Res() response: Response,
    @Body() addPlayerShipDto: AddPlayerShipDto,
  ): Promise<any> {
    try {
      const playersShip =
        await this.shipService.addPlayerShips(addPlayerShipDto);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully ship positioned',
        body: {
          playersShip,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /game/add-player-ship: ${error.message}`);

      if (error instanceof ConflictException) {
        // Handle BadRequestException differently
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

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

  @Post('add-computer-ships')
  async addComputerShips(
    @Res() response: Response,
    @Body() addComputerShipDto: AddComputerShipDto,
  ): Promise<any> {
    try {
      await this.shipService.addComputerShips(addComputerShipDto.gameId);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully computers ships positioned',
      });
    } catch (error) {
      this.logger.error(`Error at /game/add-computer-ships: ${error.message}`);

      if (error instanceof ConflictException) {
        // Handle BadRequestException differently
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

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
