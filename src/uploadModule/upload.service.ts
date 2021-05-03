import { InjectQueue } from '@nestjs/bull';
import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { Utils } from 'src/utils/utils';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);

    constructor(@InjectQueue('upload') private uploadQueue: Queue) { }

    public async runUploadJob(
        files: Express.Multer.File[],
        jobType: JobType,
    ): Promise<Bull.JobId> {
        const job = this.createUploadJobAndPersist(files);
        const jobId = await this.addToUploadQueue(job, jobType);
        this.logger.log(`There are ${(await this.uploadQueue.getWorkers()).length} idle workers`);
        return jobId;
    }

    private async addToUploadQueue(
        job: UploadJob,
        jobType: JobType,
    ): Promise<Bull.JobId> {
        try {
            const result = await this.uploadQueue.add(jobType, job);
            this.logger.log(`Upload job ${result.id} succcesfully created`);
            return result.id;
        } catch (err: any) {
            const filesIncludedInJob = job.files.map((file) => file.id);
            this.logger.error(
                `Upload job is not successfully created for files ${filesIncludedInJob.join(',')}`,
                err,
            );
            throw new InternalServerErrorException();
        }
    }

    private createUploadJobAndPersist(
        multerFiles: Express.Multer.File[],
    ): UploadJob {
        const files = multerFiles.map((file) => {
            return {
                id: Utils.generateUuid(),
                fileName: file.filename,
                path: file.path,
            };
        });
        //TODO: add to database

        return {
            files,
        };
    }
}

export type UploadJob = {
    files: File[];
    numberOfFilesTransformed?: number;
};

export type File = {
    id: string;
    fileName: string;
    path: string;
};

export enum JobType {
    ImageUpload = 'imageUpload',
}
