# RNC CMI Lite

Versao simplificada e leve do sistema de Registro de Nao Conformidades (RNC) do Centro Materno Infantil (CMI).

## Por que esta versao e diferente

A versao anterior usava React, SSR, build com Vite/Bun e deploy no Cloudflare Workers — uma stack pesada para manter.
Esta versao usa apenas **HTML, CSS e JavaScript puro**, sem build, sem framework e sem servidor proprio. Roda em qualquer navegador.

## Como funciona

- E um site estatico (3 arquivos: `index.html`, `app.js`, `config.js`).
- Hospedado gratuitamente no **GitHub Pages** (HTTPS automatico, sem custo).
- Os dados podem ser salvos de duas formas:
  1. **Modo offline/teste**: salva no navegador (localStorage) — cada maquina guarda so os seus proprios registros.
  2. **Modo compartilhado (recomendado para o hospital)**: conecta a um banco gratuito no [Supabase](https://supabase.com), assim todas as 130 maquinas veem os mesmos dados em tempo real.

## Como ativar o modo compartilhado (gratuito)

1. Crie uma conta gratuita em https://supabase.com e um novo projeto.
2. No SQL Editor do Supabase, execute o conteudo do arquivo `schema.sql` deste repositorio.
3. Em Project Settings > API, copie a **Project URL** e a chave **anon public**.
4. Edite o arquivo `config.js` deste repositorio e cole a URL e a chave.

## Como funciona o login de usuarios

- O sistema usa **Supabase Auth** (gratuito) para login de colaboradores, gestores e administradores.
- Na tela inicial, o botao **Acompanhar** leva para a tela de login/cadastro.
- Qualquer pessoa pode criar uma conta clicando em "Ainda nao tem conta? Criar acesso".
- Apos o cadastro, o Supabase envia um e-mail de confirmacao (configuravel no painel do Supabase).
- Depois de confirmar, o colaborador faz login normalmente com e-mail e senha.
- Todo usuario criado recebe automaticamente um perfil na tabela `profiles`, com papel padrao `colaborador`.
- Para promover alguem a `gestor` ou `admin`, acesse o Supabase (Table Editor > profiles) e edite o campo `papel` manualmente.
- Sem o login (modo offline, sem `config.js` preenchido), o Acompanhar mostra um aviso e o sistema funciona apenas com dados locais no navegador.
- Registro de RNC (botao "Abrir RNC") continua funcionando sem login, permitindo notificacao anonima.

## Como publicar online gratuitamente (GitHub Pages)

1. Vá em **Settings > Pages** deste repositorio no GitHub.
2. Em "Source", selecione a branch `main` e a pasta `/ (root)`.
3. Salve. Em alguns minutos o site estara disponivel em um endereco do tipo:
   `https://gbrcamilo.github.io/rnc-cmi-lite/`

## Como as 130 maquinas acessam

Nenhuma instalacao e necessaria. Basta abrir o navegador em qualquer uma das 130 maquinas e acessar o link do GitHub Pages, ou configurar esse link como pagina inicial/atalho na area de trabalho.

## Seguranca

- Nunca coloque a chave `service_role` do Supabase no `config.js` — use apenas a chave `anon public`.
- Para restringir o acesso somente a rede interna do hospital, configure um DNS interno ou proxy reverso apontando para o link do GitHub Pages, ou substitua o hosting por um servidor interno se exigir dados 100% locais.
- Para producao com dados sensiveis de pacientes, revise as politicas de RLS no `schema.sql` para exigir autenticacao antes de liberar acesso.
