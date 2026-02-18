import { NestModule, MiddlewareConsumer } from '@nestjs/common';
export declare class TenancyModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
