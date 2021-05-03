import {
  BadRequestException,
  Controller,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Utils } from 'src/utils/utils';
import { UploadMiddleware } from './upload.middleware';
import { JobType, UploadService } from './upload.service';
import { Response } from 'express';

@Controller()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('/upload/file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
      }),
      fileFilter: UploadMiddleware.imageFileNameFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    if (Utils.isDefined(file)) {
      if (!Utils.checkIfPathExists(file.path)) {
        throw new NotFoundException(
          `File ${file.originalname} is not persisted`,
        );
      }

      const jobId = await this.uploadService.runUploadJob(
        [file],
        JobType.ImageUpload,
      );

      this.logger.log(
        `Files ${file.originalname} uploaded job ${jobId} succesfuly started`,
      );

      const uploadResponse: UploadJobResponse = {
        files: [file.originalname],
        jobId: jobId.toString(),
      };
      return res.status(HttpStatus.OK).json(uploadResponse);
    } else {
      throw new BadRequestException(
        'Can not extract file from request or file is not in supported format',
      );
    }
  }
}

export type UploadJobResponse = {
  files: string[];
  jobId: string;
};
