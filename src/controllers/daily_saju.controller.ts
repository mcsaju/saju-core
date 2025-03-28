import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { User } from 'src/decorators/user.decorator';
import {
  DailySajuRequest,
  DailySajuRequestSchema,
  DailySajuResponse,
} from 'src/schemas/daily_saju.schema';
import { RoleEnum } from 'src/schemas/role.schema';
import { DailySajuService } from 'src/services/daily_saju.service';

@Controller('daily')
export class DailySajuController {
  constructor(private readonly dailySajuService: DailySajuService) {}

  @Post()
  @Roles([RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.GUEST])
  @HttpCode(200)
  async getDailySaju(
    @Body() body: DailySajuRequest,
    @User('uuid') uuid?: string,
  ): Promise<DailySajuResponse> {
    // Check if the user has already requested the daily saju
    if (uuid) {
      const existing = await this.dailySajuService.getExistingDailySaju({
        userUuid: uuid,
      });
      if (existing) {
        return existing.fortune;
      }
    }
    const parsed = await DailySajuRequestSchema.parseAsync({
      ...body,
      birthDateTime: new Date(body.birthDateTime),
    });
    const response = await this.dailySajuService.getDailySaju({
      request: parsed,
    });

    // Save the response if the user is logged in
    if (uuid) {
      await this.dailySajuService.saveDailySaju({
        data: response,
        userUuid: uuid,
      });
    }
    return response;
  }
}
