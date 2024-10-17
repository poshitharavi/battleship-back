import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Logger,
  NotAcceptableException,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { AddComputerShipDto, AddPlayerShipDto } from 'src/ship/dtos';
import { ShipService } from 'src/ship/ship.service';
import { ShootDto } from './dtos';

@Controller('game')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(
    private readonly gameService: GameService,
    private shipService: ShipService,
  ) {}

  @Post('create')
  async saveTask(@Res() response: Response): Promise<any> {
    try {
      const game = await this.gameService.createGame();

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
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      if (error instanceof BadRequestException) {
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
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      if (error instanceof BadRequestException) {
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

  @Patch('start-game/:id')
  async startTheGame(@Res() response: Response, @Param('id') id: string) {
    try {
      const isPlayerAllGood = await this.shipService.checkAllShipsAvailable(
        id,
        'human',
      );

      const isComputerAllGood = await this.shipService.checkAllShipsAvailable(
        id,
        'computer',
      );

      if (!isPlayerAllGood)
        throw new NotAcceptableException(
          'Player has to add all the available ships',
        );

      if (!isComputerAllGood)
        throw new NotAcceptableException(
          'Computer has to add all the available ships',
        );

      const gameStatus = await this.gameService.getGamesStatus(id);

      if (gameStatus !== 'initialized')
        throw new NotAcceptableException(
          'Game is already started or completed',
        );

      const game = await this.gameService.updateGameStatus(id, 'in_progress');

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Lets start the game.',
        body: {
          game,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /game/start-game/${id}: ${error.message}`);

      if (error instanceof NotAcceptableException) {
        return response.status(StatusCodes.NOT_ACCEPTABLE).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_ACCEPTABLE),
          statusCode: StatusCodes.NOT_ACCEPTABLE,
        });
      }
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch('shoot/:id')
  async shootToPosition(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() shootDto: ShootDto,
  ): Promise<any> {
    try {
      const gameStatus = await this.gameService.getGamesStatus(id);

      if (gameStatus !== 'in_progress') {
        throw new BadRequestException(
          'Game is already completed or yet to be started',
        );
      }

      const checkHumanShootPosition = await this.shipService.checkShootPosition(
        id,
        shootDto.position,
        'computer',
      );

      const allShipsBeenDestroyedByHuman =
        await this.shipService.checkAllShipsBeenDestroyedByPlayer(
          id,
          'computer',
        );

      let allShipsBeenDestroyedByComputer = false;
      let computerAttack = {};

      if (!allShipsBeenDestroyedByHuman) {
        const shotsByComputer =
          await this.shipService.automaticShotByComputer(id);
        allShipsBeenDestroyedByComputer =
          shotsByComputer.allShipsBeenDestroyedByComputer;

        computerAttack = {
          position: shotsByComputer.newPosition,
          ...shotsByComputer.checkComputerShootPosition,
        };
      }

      if (allShipsBeenDestroyedByComputer || allShipsBeenDestroyedByHuman) {
        await this.gameService.updateGameStatus(id, 'completed');
      }

      const message = this.gameService.getShootMessage(
        checkHumanShootPosition.isSuccessfulHit,
        allShipsBeenDestroyedByHuman,
        allShipsBeenDestroyedByComputer,
      );

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: message,
        body: {
          ...checkHumanShootPosition,
          allShipsBeenDestroyedByHuman,
          allShipsBeenDestroyedByComputer,
          computerAttack,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /game/shoot/${id}: ${error.message}`);

      if (error instanceof BadRequestException) {
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
