import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UploadMiddleware } from './uploadModule/upload.middleware';
import { UploadModule } from './uploadModule/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadMiddleware.validateUploadFolder)
      .forRoutes({ path: '/upload/image', method: RequestMethod.POST });
  }
}
