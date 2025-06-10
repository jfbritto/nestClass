import { Global, Module } from '@nestjs/common';

@Global()
@Module({})
export class AuthModule {
  // This module can be used to encapsulate authentication-related functionality
  // such as user registration, login, JWT token generation, etc.
  // You can import necessary services and controllers here.
}
