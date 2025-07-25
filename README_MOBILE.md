# Melhorias de Responsividade Móvel

Este documento descreve as melhorias implementadas para tornar o Sistema de Controle de Pecuária mais amigável para dispositivos móveis.

## Funcionalidades Implementadas

### 1. Ocultação de Colunas Menos Importantes

Em telas pequenas (menos de 576px de largura), algumas colunas menos importantes são automaticamente ocultadas para melhorar a legibilidade:

- Estado
- Área Total
- Responsável

Isso é feito através da classe CSS `hide-xs` aplicada tanto aos cabeçalhos quanto às células da tabela.

### 2. Botão de Detalhes para Visualização Completa

Para permitir que os usuários vejam todas as informações mesmo em dispositivos móveis, foi adicionado um botão de "Detalhes" que abre um modal com todas as informações da fazenda, incluindo as que estão escondidas na tabela.

O botão de detalhes só aparece em dispositivos móveis (telas pequenas) e permite:
- Visualizar todos os dados da fazenda
- Acessar a função de edição diretamente do modal de detalhes

### 3. Indicador de Rolagem Horizontal

Quando a tabela é maior que a largura da tela, um indicador visual aparece para mostrar ao usuário que ele pode deslizar horizontalmente para ver mais colunas.

O indicador:
- Aparece automaticamente quando necessário
- Desaparece após 3 segundos ou quando o usuário rola a tabela
- Tem uma animação sutil para chamar a atenção

### 4. Botão Flutuante de Ação (FAB)

Foi adicionado um botão flutuante no canto inferior direito da tela para permitir que o usuário adicione uma nova fazenda sem precisar rolar até o topo da página.

O botão:
- É visível apenas em dispositivos móveis
- Tem uma animação de pulso para chamar a atenção
- Abre o mesmo modal de cadastro que o botão no topo da página

### 5. Pull-to-Refresh (Puxar para Atualizar)

Foi implementada a funcionalidade de "puxar para atualizar" que permite ao usuário atualizar a lista de fazendas puxando a tela para baixo, como é comum em aplicativos móveis.

Funciona da seguinte forma:
- O usuário puxa a tela para baixo quando está no topo da página
- Um indicador visual aparece mostrando o progresso
- Quando o usuário solta, a lista é atualizada automaticamente

### 6. Melhorias nos Botões de Ação

Os botões de ação (Editar, Excluir, Detalhes) foram melhorados para dispositivos móveis:
- Tamanho mínimo aumentado para facilitar o toque
- Espaçamento maior entre os botões
- Disposição vertical em telas pequenas para evitar cliques acidentais

## Melhorias de Autenticação

Para garantir que as funcionalidades móveis funcionem corretamente com o sistema de autenticação, foram implementadas as seguintes melhorias:

### 1. Tratamento de Sessões Expiradas

- Todas as requisições AJAX agora verificam o status de autenticação (código 401)
- Quando uma sessão expira, o usuário é automaticamente redirecionado para a página de login
- Cabeçalho `X-Requested-With: XMLHttpRequest` adicionado a todas as requisições AJAX para identificação

### 2. Redirecionamento Inteligente

- O decorador `login_required` agora diferencia entre requisições API e HTML
- Requisições HTML são redirecionadas para a página de login
- Requisições API recebem um código de status 401 com informação de redirecionamento

### 3. Compatibilidade com Pull-to-Refresh

- A funcionalidade de pull-to-refresh foi modificada para lidar corretamente com sessões expiradas
- O indicador de atualização agora inclui texto para melhor feedback ao usuário

## Como Testar

1. Acesse o sistema em um dispositivo móvel ou redimensione a janela do navegador para menos de 576px de largura
2. Verifique se as colunas menos importantes estão ocultas
3. Teste o botão de detalhes para visualizar todas as informações
4. Deslize horizontalmente para ver o indicador de rolagem
5. Use o botão flutuante para adicionar uma nova fazenda
6. Puxe a tela para baixo para atualizar a lista
7. Teste os botões de ação para verificar se são fáceis de usar
8. Teste o comportamento de autenticação deixando a sessão expirar e verificando se o redirecionamento funciona corretamente

## Considerações Técnicas

- A classe `hide-xs` é aplicada via CSS para telas menores que 576px
- O indicador de rolagem é criado dinamicamente via JavaScript
- O pull-to-refresh usa eventos de toque (touchstart, touchmove, touchend)
- O botão flutuante usa posicionamento fixo e animação CSS
- Os modais são responsivos e se ajustam automaticamente ao tamanho da tela
- O cabeçalho `X-Requested-With: XMLHttpRequest` é usado para identificar requisições AJAX
- O decorador `login_required` verifica o caminho da requisição e os cabeçalhos para determinar o tipo de resposta