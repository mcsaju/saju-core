import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('/')
export class AppController {
  constructor() {}

  @Get('/health')
  @HttpCode(200)
  getHello(): string {
    return 'OK';
  }
}
