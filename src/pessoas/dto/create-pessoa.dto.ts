import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePessoaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nome: string;

  // @IsEnum(RoutePolicies, { each: true })
  // routePolicies: RoutePolicies[];
}
