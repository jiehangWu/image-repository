import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ImageUploadExecutor } from './upload.consumer';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        keyPrefix: 'image-repository',
      },
    }),
    BullModule.registerQueue({
      name: 'upload',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, ImageUploadExecutor],
})
export class UploadModule {}
