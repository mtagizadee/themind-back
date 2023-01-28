import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Redis } from "ioredis";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { ERedisKeys } from "src/common/enums";
import { AuthModule } from "src/auth/auth.module";
import { LobbiesModule } from "src/lobbies/lobbies.module";

@Module({
  imports: [
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
              if (!(await redisClient.get(ERedisKeys.Lobbies))) {
                try {
                  await redisClient.set(ERedisKeys.Lobbies, JSON.stringify({}));
                  console.log("Successfully initialized empty lobbies");
                } catch (error) {
                  console.log("Error initializing the empty lobbies");
                }
              }

              if (!(await redisClient.get(ERedisKeys.Games))) {
                try {
                  await redisClient.set(ERedisKeys.Games, JSON.stringify({}));
                  console.log("Successfully initialized empty games");
                } catch (error) {
                  console.log("Error initializing the empty games");
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
    AuthModule,
    LobbiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
