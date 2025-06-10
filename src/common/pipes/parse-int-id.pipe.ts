import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): number {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      throw new BadRequestException(`ID inválido: ${value} não é um número`);
    }

    if (parsedValue <= 0) {
      throw new BadRequestException(
        `ID inválido: ${value} deve ser um número inteiro positivo`,
      );
    }

    return parsedValue;
  }
}
