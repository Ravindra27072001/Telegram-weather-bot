import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('telegram')
export class AppController {
  constructor(private readonly appService: AppService) {
    this.appService.startBot();
  }
}