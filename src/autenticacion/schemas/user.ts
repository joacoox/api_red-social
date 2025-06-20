import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { ROLES } from 'src/helpers/roles.consts';

@Schema()
export class User {

    _id?: ObjectId;

    @Prop({ required: true, unique: true, minlength: 4, maxlength: 15 })
    username: string;

    @Prop({
        required: true,
        minlength: 8,
        maxlength: 100,
        match: /^(?=.*[A-Z])(?=.*\d).{8,}$/
    })
    password: string;

    @Prop({ required: true, unique: true,  maxlength: 50 ,match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
    email: string;

    @Prop({ required: true, minlength: 3, maxlength: 15 })
    name: string;

    @Prop({ required: true, minlength: 3, maxlength: 15 })
    surname: string;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: false, maxlength: 50 })
    description: string;

    @Prop({ required: true, maxlength: 50 })
    image: string;

    @Prop({ required: true, enum: [ROLES.USER, ROLES.ADMIN], default: ROLES.USER })
    role : string;

}

export const UserSchema = SchemaFactory.createForClass(User);