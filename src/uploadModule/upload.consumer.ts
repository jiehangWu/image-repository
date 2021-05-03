import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor,
} from '@nestjs/bull';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Utils } from 'src/utils/utils';
import { UploadJob } from './upload.service';

export interface Consumer {
    processJob(job: Job<UploadJob>): Promise<any>;

    onCompleted(job: Job<UploadJob>): void;

    onFailed(job: Job<UploadJob>): void;

    onActive(job: Job<UploadJob>): void;
}

@Processor({
    name: 'upload',
})
export class ImageUploadExecutor implements Consumer {
    private readonly logger = new Logger(ImageUploadExecutor.name);

    @Process('imageUpload')
    public async processJob(job: Job<UploadJob>): Promise<any> {
        const uploadJob = job.data;
        const paths = uploadJob.files.map((file) => file.path);
        try {
            const numOfFilesTransformed = await Utils.transformImage(paths);
            const updatedUploadJob = {
                files: job.data.files,
                numOfFilesTransformed,
            };
            // doesn't seem to update
            await job.update(updatedUploadJob);
        } catch (err: any) {
            job.moveToFailed(err);
            throw new InternalServerErrorException(
                `Error in processing job: ${job.id} with ${err}`,
            );
        }
    }

    @OnQueueActive()
    onActive(job: Job): void {
        this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
    }

    @OnQueueCompleted({ name: 'imageUpload' })
    public onCompleted(job: Job<UploadJob>): void {
        this.logger.log(
            `Job ${job.id} completed with ${job.data.numberOfFilesTransformed}`,
        );
    }

    @OnQueueFailed({ name: 'imageUpload' })
    public onFailed(job: Job<UploadJob>): void {
        this.logger.log(`Job ${job.id} failed with ${job.failedReason}`);
    }
}
