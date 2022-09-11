import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://davirds:12qwaszx@cluster0.5rskjhc.mongodb.net/nest-auth',
    ),
    UserModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
