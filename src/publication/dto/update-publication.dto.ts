import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicationDto } from './create-publication.dto';

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {


    title: string;

    description?: string;

}
