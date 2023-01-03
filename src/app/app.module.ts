import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Redis } from "ioredis";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { RedisKeys } from "src/common/enums";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        config: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          onClientCreated: (redisClient: Redis) => {
            redisClient.on("ready", async () => {
              // initialize empty whitelist if it doesn't exist
              // whitelist is the list of tokes that are allowed to play the game
              if (!(await redisClient.get(RedisKeys.Whitelist))) {
                try {
                  await redisClient.set(RedisKeys.Whitelist, JSON.stringify({}));
                  console.log("Successfully initialized empty whitelist");
                } catch (error) {
                  console.log("Error initializing the empty whitelist");
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
