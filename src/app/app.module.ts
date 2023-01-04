import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Redis } from "ioredis";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { RedisKeys } from "src/common/enums";
import { AuthModule } from "src/auth/auth.module";
import { LobbiesModule } from "src/lobbies/lobbies.module";

@Module({
  imports: [
    AuthModule,
    LobbiesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          onClientCreated: (redisClient: Redis) => {
            redisClient.on("ready", async () => {
              // initialize empty lobbies object if it doesn't exist
              // object is the list of tokes that are allowed to play the game
              if (!(await redisClient.get(RedisKeys.Lobbies))) {
                try {
                  await redisClient.set(RedisKeys.Lobbies, JSON.stringify({}));
                  console.log("Successfully initialized empty lobbies");
                } catch (error) {
                  console.log("Error initializing the empty lobbies");
                }
              }
            });
            redisClient.on("error", async () => {
              console.log("Error while connecting to client");
            });
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
