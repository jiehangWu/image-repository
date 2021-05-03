import {
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import * as fs from 'fs';

export const UploadMiddleware = {
    imageFileNameFilter: (
        req: Request,
        file: Express.Multer.File,
        callback: any,
    ) => {
        const acceptableFileFormatsRegex = /\.(jpg|jpeg|png)$/;
        if (!file.originalname.match(acceptableFileFormatsRegex)) {
            return callback(
                new BadRequestException(
                    `The format of file/image ${file.filename} is not supported`
                ),
                false,
            );
        }
        callback(null, true);
    },

    validateUploadFolder: (req: Request, res: Response, next: NextFunction) => {
        const folderPath = './upload';

        try {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            next();
        } catch (err: any) {
            throw new InternalServerErrorException(
                `Error ${err} when looking for folder ${folderPath}`
            );
        }
    },
};
