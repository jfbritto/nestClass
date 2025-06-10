import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePessoaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  readonly nome: string;
}
