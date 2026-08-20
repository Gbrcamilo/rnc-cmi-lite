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
5. Pronto — todas as maquinas que acessarem o site vao usar o mesmo banco.

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
