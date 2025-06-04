import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { ObjectId } from 'mongoose';

@Schema()
export class User {

    _id?: ObjectId;

    @Prop({ required: true, unique: true , minlength: 5, maxlength: 15})
    username: string;

    @Prop({
        required: true,
        minlength: 8,
        maxlength: 100,
        match: /^(?=.*[A-Z])(?=.*\d).{8,}$/
    })
    password: string;

    @Prop({ required: true, unique: true})
    @IsEmail()
    email: string;

    @Prop({ required: true, minlength: 5, maxlength: 15 })
    name: string;

    @Prop({ required: true ,minlength: 5, maxlength: 15})
    surname: string;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: false, maxlength:50})
    description: string;

    @Prop({ required: false, maxlength:50})
    image: string;

}

export const UserSchema = SchemaFactory.createForClass(User);