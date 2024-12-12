import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ParseMongoObjectIdPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) {
      throw new BadRequestException({
        message: 'Validation failed (BSON Object ID is expected)',
      });
    }
    return value;
  }
}
