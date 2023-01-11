import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const REST_PORT: number = parseInt(process.env.REST_PORT) || 3000;
  const WS_PORT: number = parseInt(process.env.WS_PORT) || 3001;

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(REST_PORT, () =>
    console.log(`REST STARTED ON ${REST_PORT} \nWS STARTED ON ${WS_PORT}`)
  );
}
bootstrap();
