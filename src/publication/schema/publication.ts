import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Publication {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  filed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: Types.ObjectId[];
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
