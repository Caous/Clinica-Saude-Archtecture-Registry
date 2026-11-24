---
id: PBI-20261124-gerador-white-label-clinica
tipo: feature
titulo: Criar gerador white-label que gera back, intranet e portal do paciente a partir do nome da empresa
status: backlog
prioridade: alta
workspaces: [core-backend, intranet-frontend, extranet-frontend, architecture-registry]
criado_em: 2026-11-24
---

# Criar gerador white-label que gera back, intranet e portal do paciente a partir do nome da empresa

## Contexto de Negócio
- **Objetivo:** informar o nome da empresa e receber um projeto completo (back-end .NET, Intranet, Extranet) com todos os nomes técnicos no padrão (solution, namespaces, pastas, Docker, CI, banco, pacotes, marca). Métrica: gerar um cliente novo em ≤ 5 minutos, com build verde e 0 vestígio da marca base.
- **Persona:** dono do produto/implantador (executa o gerador); clínicas clientes (recebem instância com a marca delas).
- **Jornada atual:** não existe gerador para a clínica. No template InnovaSfera, `dotnet new innovasfera-erp-clean` troca só o `sourceName` do back; o README documenta `CompanyName` e `ProjectName`, mas o `template.json` não os define. O front não tem gerador. Cada cliente novo seria cópia e busca/troca manual.
- **Jornada desejada:** `create-clinic --company "Clínica Vida Saúde"` deriva os nomes, copia as 3 bases, renomeia pastas e arquivos, substitui tokens, grava a configuração de marca e entrega um relatório. Modelo: **uma instância por cliente (single-tenant)**, sem depender de multi-tenant.
- **Dependências:** PBI-20261124-desvincular-marca-instituto-barros (bases sem marca, com tokens neutros e branding por configuração). Reaproveita a ideia do `dotnet new` do template InnovaSfera.

## User Story
Como implantador, quero gerar um projeto completo de clínica a partir do nome da empresa, para que cada cliente nasça com nomes técnicos e marca corretos sem renomeação manual.

## Critérios de Aceite
- **AC-1** — DADO o nome "Clínica Vida & Saúde", QUANDO o gerador deriva identificadores, ENTÃO produz PascalCase `ClinicaVidaSaude`, slug `clinica-vida-saude`, nome de banco `ClinicaVidaSaudeDB`, imagem Docker `clinica-vida-saude-api`, e exibe o resultado para confirmação antes de gerar.
- **AC-2** — DADO as 3 bases (backend, intranet, extranet) com tokens neutros, QUANDO executo o gerador, ENTÃO cria a saída com pastas, arquivos, solution, projetos, namespaces e referências renomeados.
- **AC-3** — DADO a saída gerada, QUANDO busco o nome do token base e o nome da marca antiga, ENTÃO há 0 ocorrências em conteúdo, nomes de arquivos e nomes de pastas.
- **AC-4** — DADO a saída gerada, QUANDO executo `dotnet build`, `dotnet test`, `npm ci` e `npm run build` em cada projeto, ENTÃO todos concluem com sucesso.
- **AC-5** — DADO parâmetros opcionais (cores, logo, e-mail de suporte, domínio, TargetFramework), QUANDO informados, ENTÃO são gravados em `BrandingSettings` e nos `.env` dos fronts; QUANDO omitidos, usa padrões neutros.
- **AC-6** — DADO a flag `--dry-run`, QUANDO executo, ENTÃO lista tudo que seria criado/renomeado sem escrever nada em disco.
- **AC-7** — DADO uma pasta de saída já existente e não vazia, QUANDO executo sem `--force`, ENTÃO aborta com erro claro e não altera nada.
- **AC-8** — DADO nome inválido (vazio, só símbolos, começa com número, > 60 caracteres), QUANDO executo, ENTÃO rejeita com mensagem orientando o formato.
- **AC-9** — DADO arquivos binários (imagens, fontes, `.ico`), QUANDO o gerador substitui tokens, ENTÃO não corrompe binários (só renomeia o que for texto).
- **AC-10** — DADO a execução concluída, QUANDO termina, ENTÃO grava `generation-report.json` (nome, tokens, versão das bases, data) e opcionalmente `git init` com commit inicial.
- **AC-11** — DADO as bases, QUANDO uma nova versão do produto é lançada, ENTÃO o relatório registra a versão base usada, permitindo saber o que atualizar nos clientes.

## Regras de Negócio
- Uma geração produz uma instância isolada (banco, segredos e deploy próprios do cliente).
- Segredos nunca são gerados em texto nos arquivos versionados; o gerador cria `.env.example` e chaves aleatórias só quando solicitado e fora do versionamento.
- Nome é normalizado (acentos removidos, `&` e símbolos descartados, espaços colapsados).
- Tokens do gerador ficam em um único arquivo de manifesto (`tokens.json`) versionado com as bases.
- O gerador nunca modifica as bases; escreve apenas na pasta de saída.
- Licenças de terceiros (ex.: template de UI) são preservadas na saída.

## Cenários de Teste Unitário

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-1 | Derivar PascalCase | "Clínica Vida & Saúde" | `ClinicaVidaSaude` |
| UT-2 | AC-1 | Derivar slug | "Clínica Vida & Saúde" | `clinica-vida-saude` |
| UT-3 | AC-1 | Derivar nome de banco | "Clínica Vida & Saúde" | `ClinicaVidaSaudeDB` |
| UT-4 | AC-8 | Nome vazio | "" | erro de validação |
| UT-5 | AC-8 | Nome começa com número | "123 Clínica" | erro de validação |
| UT-6 | AC-8 | Nome muito longo | 61 caracteres | erro de validação |
| UT-7 | AC-2 | Renomear caminho | `src/Domain/Base.Domain/X.cs` | `src/Domain/ClinicaVidaSaude.Domain/X.cs` |
| UT-8 | AC-9 | Detectar binário | `logo.png` | ignora substituição de conteúdo |
| UT-9 | AC-7 | Saída existente sem `--force` | pasta não vazia | erro, zero escrita |
| UT-10 | AC-6 | Dry-run | qualquer entrada válida | lista de operações, zero escrita |

## Cenários de Teste Funcional / E2E

| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-2/AC-3 | `create-clinic --company "Clínica Teste"` | 3 projetos gerados, varredura por token base retorna 0 |
| FT-2 | AC-4 | Build e testes dos 3 projetos gerados | Todos verdes |
| FT-3 | AC-5 | Gerar com cor e logo informados e subir tudo | Telas exibem marca informada |
| FT-4 | AC-6 | `--dry-run` | Relatório de operações, saída vazia |
| FT-5 | AC-7 | Executar duas vezes na mesma saída | Segunda execução aborta |
| FT-6 | AC-10 | Abrir `generation-report.json` | Tokens, versão e data corretos |

## Requisitos Técnicos
- **Tipo de mudança:** nova feature (ferramenta de geração)
- **APIs/contratos:** CLI:
  ```
  create-clinic --company "Clínica Vida Saúde" [--out ./clientes/vida-saude]
    [--primary-color "#0ea5e9"] [--logo ./logo.svg] [--support-email suporte@cliente.com]
    [--domain cliente.com.br] [--target-framework net8.0] [--dry-run] [--force] [--git-init]
  ```
  Manifesto `tokens.json` com tokens e extensões de texto aceitas.
- **Requisitos não-funcionais:** multiplataforma (Windows/Linux); determinístico (mesma entrada, mesma saída); **geração dos 3 projetos em ≤ 60 s** (sem IA, sem build no caminho; verificação por build é opcional via `--verify`); log claro.
- **Como fica rápido:** o gerador trabalha numa cópia e aplica um mapa único de variantes por token (Pascal, kebab, snake, lower, UPPER, nome de exibição) em uma passada sobre nomes de pastas/arquivos e conteúdo de texto, ignorando binários e `.git`/`node_modules`/`bin`/`obj`. Para o back pode reutilizar o motor do `dotnet new` (`sourceName` + `symbols.replaces`); para os fronts, script Node.
- **Riscos técnicos:** tokens ambíguos em substituição (ex.: nome base aparecer em palavras comuns) exigem delimitadores fortes; migrações EF com nome de namespace antigo; gerar lockfiles; manter as bases sincronizadas entre 3 repos (definir repo "bundle" ou submódulos e escolher entre script próprio e `dotnet new` para o back).

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos
