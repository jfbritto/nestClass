import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request['user']?.role;
    return role === 'admin';
  }
}
// Este guard pode ser usado para proteger rotas que requerem privilégios de administrador
// e deve ser aplicado nas rotas desejadas no controlador.
// Exemplo de uso:
// @UseGuards(IsAdminGuard)
// @Post('admin')
// createAdminResource(@Body() createDto: CreateDto) {
//   return this.adminService.create(createDto);
// }
// Certifique-se de que o usuário tenha a propriedade `isAdmin` definida corretamente
// no middleware ou na estratégia de autenticação que você estiver usando.
// Isso geralmente é feito após a autenticação do usuário, onde você define as propriedades do usuário no objeto `request.user`.
// Assim, o guard pode verificar se o usuário é um administrador com base nessa propriedade.
// Lembre-se de que este é um exemplo básico e você pode precisar ajustar a lógica
// de verificação de administrador de acordo com a estrutura do seu usuário e as necessidades da sua aplicação.
// Além disso, você pode querer adicionar tratamento de erros ou logs para melhorar a manutenção e depuração do código.
// Certifique-se de que o guard esteja importado e registrado corretamente no módulo onde será utilizado.
// Você pode usar o guard em controladores ou rotas específicas para garantir que apenas usuários administradores possam acessar determinadas funcionalidades.
// Além disso, você pode querer considerar o uso de decorators personalizados para simplificar a aplicação do guard em várias rotas.
// Isso pode ser feito criando um decorator que aplique o guard automaticamente, tornando o código mais limpo e reutilizável.
// Por exemplo, você pode criar um decorator `@UseAdminGuard()` que aplique o `IsAdminGuard` automaticamente.
// Isso pode ser feito da seguinte forma:
// import { applyDecorators, UseGuards } from '@nestjs/common';
// import { IsAdminGuard } from './is-admin.guard';
//
// export function UseAdminGuard() {
//   return applyDecorators(UseGuards(IsAdminGuard));
// }
// Com isso, você pode usar o decorator em vez de aplicar o guard manualmente em cada rota:
// @UseAdminGuard()
// @Post('admin')
// createAdminResource(@Body() createDto: CreateDto) {
//   return this.adminService.create(createDto);
// }
// Isso torna o código mais limpo e fácil de manter, além de seguir as melhores práticas do NestJS.
// Certifique-se de que o guard esteja bem testado e documentado para facilitar a compreensão e manutenção por outros desenvolvedores.
// Além disso, considere adicionar testes unitários para garantir que o guard funcione conforme o esperado em diferentes cenários.
// Isso ajudará a garantir a robustez e a confiabilidade do seu código, especialmente em aplicações maiores e mais complexas.
// Além disso, você pode querer considerar a implementação de logs ou métricas para monitorar o uso do guard e identificar possíveis problemas de segurança ou desempenho.
// Isso pode ser feito usando bibliotecas de logging como o Winston ou o Pino, que são populares no ecossistema Node.js.
// Além disso, você pode querer considerar a implementação de testes de integração para garantir que o guard funcione corretamente em conjunto com outros componentes da aplicação.
// Isso pode ser feito usando bibliotecas de teste como o Jest ou o Mocha, que são amplamente utilizadas no ecossistema Node.js.
// Certifique-se de que o guard esteja bem documentado e que os desenvolvedores saibam como usá-lo corretamente.
// Além disso, considere a possibilidade de criar uma documentação mais abrangente para o guard,
// incluindo exemplos de uso, melhores práticas e considerações de segurança.
// Isso pode ser feito usando ferramentas de documentação como o Swagger ou o Compodoc, que são populares no ecossistema NestJS.
