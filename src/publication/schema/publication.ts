import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 150 })
  text: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Publication {
  @Prop({ required: true })
  title: string;

  @Prop({ maxlength: 300 })
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  filed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [Comment], default: [] })
  comments: Comment[];
}


export const PublicationSchema = SchemaFactory.createForClass(Publication);
PublicationSchema.index({ userId: 1, createdAt: -1 });
