---
id: PBI-20261124-desvincular-marca-instituto-barros
tipo: debt
titulo: Desvincular marca Instituto Barros e extrair branding para configuração em todo o ecossistema
status: backlog
prioridade: alta
workspaces: [core-backend, intranet-frontend, extranet-frontend, architecture-registry]
criado_em: 2026-11-24
---

# Desvincular marca Instituto Barros e extrair branding para configuração em todo o ecossistema

## Contexto de Negócio
- **Objetivo:** remover toda referência ao Instituto Barros (nome, logos, e-mails, URLs, dados de exemplo, identificadores técnicos) e transformar a identidade visual/textual em **configuração**, deixando o produto neutro e pronto para receber a marca nova (PBI-2) e, futuramente, white-label por cliente. Métrica: **0 ocorrências** de `barros` (case-insensitive) nos repositórios, exceto avisos de licença de terceiros.
- **Persona:** time de produto/dev (dono do produto); indireto: futuros clientes clínicas (qualquer nicho).
- **Jornada atual:** nome, logos, textos e URLs do Instituto estão hardcoded em ~32 arquivos da Intranet, ~13 da Extranet, ~14 do backend (workflow CI, solution, guia de criptografia, `Moq_Data.sql`) e no `architecture-registry.yaml`. Qualquer troca de marca exige caça manual.
- **Jornada desejada:** uma única fonte de configuração de marca (nome, nome curto, logos, cores primárias, e-mail de suporte, domínio, textos legais) consumida por back e fronts; placeholder neutro ("Sistema Clínica") até o PBI-2.
- **Dependências:** nenhuma. É pré-requisito do PBI-2 e do PBI-3 (pitch/demo sem marca de terceiro).

## User Story
Como dono do produto, quero que nenhuma referência ao Instituto Barros exista no código e que a marca seja configurável, para que eu possa lançar a plataforma com identidade própria e vender para outras clínicas sem expor dados de terceiros.

## Critérios de Aceite
- **AC-1** — DADO os 3 repositórios (backend, intranet, extranet) e o registry, QUANDO executo busca case-insensitive por `barros`, `institutobarros` e `instituto_barros` (excluindo `.git`, `node_modules`, `bin`, `obj`, lockfiles), ENTÃO retorna 0 ocorrências.
- **AC-2** — DADO o backend, QUANDO chamo `GET /api/Branding` (anônimo), ENTÃO retorna 200 com nome, nome curto, URLs de logo, cor primária/secundária e e-mail de suporte lidos de `BrandingSettings` (appsettings/variáveis de ambiente).
- **AC-3** — DADO a Intranet e a Extranet, QUANDO iniciam, ENTÃO título da aba, favicon, logo (header, sidebar, login), textos de rodapé/documentação e cores usam o branding carregado; se a API falhar, usam o fallback neutro embutido (sem erro de tela).
- **AC-4** — DADO templates de e-mail (`emailTemplates.ts`, assuntos, assinaturas) e template de importação de pacientes, QUANDO renderizados, ENTÃO usam o nome da marca configurado e nenhum domínio/e-mail do Instituto.
- **AC-5** — DADO a infraestrutura (`Instituto_Barros_Sistema.sln`, workflow `instituto_barros.yml`, `app-name` do Azure, imagem Docker `tecnologiainstitutobarrros/...`, nomes de pastas/projetos, `DATABASE_ENCRYPTION_GUIDE.md`, banco `InstitutoBarrosDB`), QUANDO reviso, ENTÃO todos usam o nome neutro; build, testes e `docker build` continuam passando.
- **AC-6** — DADO URLs externas hardcoded (Azure, Vercel, `api.institutobarros.com/errors`, `security.txt`/bug-bounty), QUANDO reviso, ENTÃO vêm de configuração/variável de ambiente ou foram removidas.
- **AC-7** — DADO `Moq_Data.sql` e seeds, QUANDO reviso, ENTÃO e-mails usam `@example.com`, usuário admin de exemplo é neutro (`admDemo`), e nomes de pessoas reais ou unidades (Morumbi, Mooca, Paulista, Ipiranga) são substituídos por dados fictícios.
- **AC-8** — DADO `architecture-registry.yaml`, `README`s e `mapa-modulos.md`, QUANDO reviso, ENTÃO descrevem a organização como "Sistema Clínica" (placeholder) sem endpoints ou domínios do Instituto.
- **AC-9** — DADO avisos de licença de terceiros (ex.: `LICENSE.md` do template TailAdmin) e pacote `tailadmin-react`, QUANDO reviso, ENTÃO os avisos de terceiros são preservados e o `package.json` usa nome neutro.
- **AC-11** — DADO os identificadores técnicos neutros (solution, namespaces, pastas, imagem Docker, banco, pacotes), QUANDO reviso, ENTÃO todos derivam de um conjunto único e documentado de tokens (`tokens.json`: ex. `SistemaClinica`, `sistema-clinica`, `SistemaClinicaDB`) que o gerador white-label (PBI-20261124-gerador-white-label-clinica) usa para substituição segura, sem colisão com palavras comuns.
- **AC-10** — DADO uma varredura de segredos (appsettings, workflows, `.env`, histórico recente), QUANDO executada, ENTÃO nenhuma chave/senha/token real do Instituto está no working tree; achados no histórico são listados no PBI como ação de rotação.

## Regras de Negócio
- Placeholder de marca padrão: nome "Sistema Clínica", nome curto "Clínica", cores neutras já presentes no tema.
- `GET /api/Branding` é somente leitura, anônimo e não expõe segredos.
- Fallback de branding no front é obrigatório (aplicação nunca fica sem nome/logo).
- Assets do Instituto (`instituto-barros-logo-*`) são removidos do repo; logos placeholder neutros entram no lugar.
- Dados pessoais reais (se houver) não podem permanecer em seeds, testes ou docs.
- Renomear banco/app-name exige nota de migração (conexões existentes não quebram sem aviso).

## Cenários de Teste Unitário
> Rastreiam ACs; base do AC-TDD.

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-2 | BrandingService lê configuração | `BrandingSettings` válido | DTO com todos os campos |
| UT-2 | AC-2 | BrandingService com campo ausente | `SupportEmail` vazio | usa valor padrão neutro, não lança |
| UT-3 | AC-3 | `useBranding` com API ok | resposta 200 | retorna nome/logo/cores da API |
| UT-4 | AC-3 | `useBranding` com API falhando | erro de rede | retorna fallback neutro, sem throw |
| UT-5 | AC-4 | Template de e-mail | marca "Acme Saúde" | corpo e assunto contêm "Acme Saúde" |
| UT-6 | AC-1 | Teste de guarda anti-marca | varredura de `src/` | 0 matches de `barros` (teste automatizado de regressão) |
| UT-7 | AC-6 | URL base da API | variável de ambiente ausente | falha explícita com mensagem clara (sem URL do Instituto como default) |

## Cenários de Teste Funcional / E2E

| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-2/AC-3 | Subir API + Intranet com `BrandingSettings.Name="Teste Clínica"` e abrir `/signin` | Título da aba, logo e textos mostram "Teste Clínica" |
| FT-2 | AC-3 | Subir Intranet com API offline | Tela carrega com marca neutra, sem erro |
| FT-3 | AC-4 | Enviar e-mail de teste pela tela de disparo | E-mail recebido sem menção ao Instituto |
| FT-4 | AC-5 | Pipeline CI no novo repo | Build, testes e imagem Docker concluem verdes |
| FT-5 | AC-7 | Aplicar `Moq_Data.sql` em banco limpo | Seeds carregam; nenhum nome/e-mail do Instituto na UI |

## Requisitos Técnicos
- **Tipo de mudança:** refactor + infra (sem mudança de regra de negócio)
- **APIs/contratos:** novo endpoint de leitura:
  ```json
  GET /api/Branding
  {
    "name": "Sistema Clínica",
    "shortName": "Clínica",
    "logoLightUrl": "/images/logo/logo.svg",
    "logoDarkUrl": "/images/logo/logo-dark.svg",
    "faviconUrl": "/favicon.png",
    "primaryColor": "#465fff",
    "secondaryColor": "#101828",
    "supportEmail": "suporte@example.com"
  }
  ```
- **Requisitos não-funcionais:** resposta cacheável (ex.: 5 min); sem dados sensíveis; build de front não pode depender da API para renderizar o primeiro frame.
- **Método de execução (obrigatório):** a troca de identificadores é feita por **script determinístico**, não manualmente nem arquivo a arquivo: (1) inventário por `git grep -il` das variantes (`InstitutoBarros`, `instituto-barros`, `instituto_barros`, `institutobarros`, `Instituto Barros`, `INSTITUTO_BARROS`); (2) `git mv` em lote de pastas e arquivos; (3) substituição por regex com mapa de variantes → tokens; (4) um único `build` + `test` ao final; (5) varredura final de 0 ocorrências (AC-1). Meta de tempo da conversão: minutos, não horas. O mesmo script é a semente do gerador do PBI-4.
- **Riscos técnicos:** renomear namespaces/solution quebra paths do CI e Dockerfile; renomear banco exige coordenar connection strings; remover histórico antigo (git) fica fora do escopo, mas segredos antigos nele exigem rotação; confirmar que a licença cedida pelo Instituto cobre uso/modificação/venda do código e guardar o termo fora do repositório.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos
