import { AnalogicReadDTO } from './analogic-read-dto';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('analogic-read')
export class AnalogicReadController {
  @Post('/')
  postRead(@Body() analogicRead: AnalogicReadDTO) {
    console.log(analogicRead);
    return analogicRead;
  }

  @Get('/')
  getRead() {
    return { message: 'Hello World' };
  }
}
