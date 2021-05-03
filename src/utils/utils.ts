import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import {
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';

const logger = new Logger('Utils');
const OUTPUT_ROOT = './output';
const UPLOAD_ROOT = './upload';

export const Utils = {
    isDefined: (object: any) => {
        return object !== undefined && object !== null;
    },

    generateUuid: (): string => {
        return uuidv4();
    },

    createFolderIfNotExists: (folderPath: string): void => {
        try {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        } catch (err: any) {
            throw new InternalServerErrorException(
                err,
                `Error looking for folder ${folderPath}`
            );
        }
    },

    checkIfPathExists: (path: string): boolean => {
        return fs.existsSync(path);
    },

    removeFile: (path: string): boolean => {
        if (fs.existsSync(path)) {
            fs.rmSync(path);
            return true;
        }

        return false;
    },

    readFileIntoBuffer: (path: string): Buffer => {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path);
        }

        return null;
    },

    transformImage: async (paths: string[]): Promise<number> => {
        Utils.createFolderIfNotExists(OUTPUT_ROOT);

        try {
            paths.forEach(async (folderPath) => {
                try {
                    const relativePath = path.relative(UPLOAD_ROOT, folderPath);
                    await sharp(folderPath)
                        .blur(20)
                        .toFile(OUTPUT_ROOT + '/' + relativePath);
                } catch (err: any) {
                    logger.error(`Error transforming image: ${folderPath}`);
                    throw new InternalServerErrorException(
                        `Error transforming image ${folderPath} with ${err}`
                    );
                }
            });

            return paths.length;
        } catch (err: any) {
            throw new NotFoundException(`File not found with error: ${err}`);
        }
    },
};
