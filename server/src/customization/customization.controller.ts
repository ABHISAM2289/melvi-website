import { Controller, Get, Inject } from '@nestjs/common';
import { CustomizationService } from './customization.service';

@Controller('customization')
export class CustomizationController {
  constructor(@Inject(CustomizationService) private readonly customizationService: CustomizationService) {}

  @Get('options')
  getOptions() {
    return this.customizationService.getCustomizationOptions();
  }
}
