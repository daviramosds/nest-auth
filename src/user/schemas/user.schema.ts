import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ default: randomUUID() })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  profile: string;

  @Prop({ required: true })
  banner: string;

  @Prop({ required: true, type: Object })
  verification: {
    status: boolean;
    token: string;
    tokenExpires: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
