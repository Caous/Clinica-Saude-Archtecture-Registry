---
id: PBI-20261124-definir-identidade-de-marca-clinica
tipo: feature
titulo: Definir identidade de marca (nome, posicionamento, logo, paleta e tipografia) da plataforma para clínicas
status: done
prioridade: alta
workspaces: [architecture-registry]
criado_em: 2026-11-24
origem: PBI-20261124-rebranding-marca-clinica (dividido; esta é a metade de descoberta/documentação)
---

# Definir identidade de marca (nome, posicionamento, logo, paleta e tipografia) da plataforma para clínicas

## Contexto de Negócio
- **Objetivo:** produzir o brand book da plataforma (nome com domínio/INPI verificados, missão, visão, valores, história, tom de voz, logo, paleta, tipografia) como artefatos versionados no registry. Métrica: brand book aprovado pelo dono + nome com domínio e anterioridade verificados.
- **Persona:** dono do produto (decisor); equipe de vendas; público final = clínicas pequenas/médias e profissionais de saúde, formais e informais.
- **Jornada atual:** produto com marca neutra placeholder ("Sistema Clínica"), sem posicionamento nem pesquisa de nomes.
- **Jornada desejada:** brand book em `Sistema-Clinica-Marca/`, pronto para ser aplicado ao sistema (PBI-20261124-aplicar-identidade-de-marca-ao-sistema) e usado em site, apresentação comercial e redes sociais.
- **Dependências:**
  - `PBI-20261124-desvincular-marca-instituto-barros` (done) — marca por configuração.
  - `PBI-20261124-publico-mercado-modelo-negocio` — **dono da lista e do comparativo de ≥8 concorrentes** (AC-4 dele). Este PBI reutiliza a lista e acrescenta só a análise de marca (nome, tom, identidade visual); não refaz a pesquisa de funcionalidades/preço. Nicho de entrada (AC-2 dele) orienta o tom de voz, mas o nome deve servir a todos os nichos.

## User Story
Como dono do produto, quero uma identidade de marca completa, documentada e aprovada, para que a plataforma seja reconhecida, memorável e vendável para clínicas de vários nichos.

## Critérios de Aceite
Cada AC é verificado por **artefato + script** (`scripts/check-marca.mjs`, Node sem dependências, mesmo estilo de `scripts/check-brand.mjs`), exceto a aprovação humana, que fica registrada em arquivo.

- **AC-1** — DADO a lista de ≥8 concorrentes do PBI de mercado, QUANDO analiso as marcas, ENTÃO `Sistema-Clinica-Marca/concorrentes-marca.md` traz, por concorrente: nome, URL, data da consulta, posicionamento, tom de voz, cores e fonte principais; e uma seção "Lacunas de marca" com ≥3 itens.
- **AC-2** — DADO os critérios de naming (≤ 12 caracteres, ≤ 4 sílabas, pronúncia única em PT-BR, sem conotação negativa, sem termo restrito a uma especialidade), QUANDO gero candidatos, ENTÃO `Sistema-Clinica-Marca/naming.md` lista ≥10 candidatos pré-filtrados e ≥3 finalistas; cada finalista traz resultado e data de: domínio `.com.br` e `.com`, handle Instagram e LinkedIn, busca de anterioridade no INPI nas classes NCL 9, 42 e 44 (com link/protocolo da consulta).
- **AC-3** — DADO os finalistas, QUANDO o dono escolhe, ENTÃO `Sistema-Clinica-Marca/decisao-nome.md` registra nome final, justificativa, riscos e linha `Aprovado por: <dono> em <AAAA-MM-DD>`.
- **AC-4** — DADO o nome final, QUANDO escrevo a identidade, ENTÃO `Sistema-Clinica-Marca/identidade.md` contém: missão, visão, 3–6 valores, história da marca, proposta de valor, slogan (≤ 8 palavras) e tom de voz (≥3 atributos, cada um com 1 exemplo "diga" e 1 "não diga").
- **AC-5** — DADO a identidade, QUANDO defino paleta e tipografia, ENTÃO `Sistema-Clinica-Marca/visual.md` + `Sistema-Clinica-Marca/tokens-marca.json` trazem: cores com papel (primária, secundária, neutras, feedback) em hex; família tipográfica com URL de fonte e licença livre (OFL/Apache, ex.: Google Fonts); **todos os pares texto/fundo declarados** atingem contraste ≥ 4.5:1 (texto normal) nos temas claro e escuro, verificado por `scripts/check-marca.mjs --contraste`.
- **AC-6** — DADO a identidade e a paleta, QUANDO desenho o logo, ENTÃO `Sistema-Clinica-Marca/assets/logo/` contém as 9 variantes `logo-{horizontal|vertical|icone}-{claro|escuro|mono}` em `.svg` e `.png` (18 arquivos); cada SVG tem `<title>`, `viewBox` e ≤ 20 KB; `visual.md` documenta área de proteção e tamanho mínimo; `assets/ORIGEM.md` registra autoria, ferramenta (se IA generativa: termos de uso que permitem uso comercial) e licença de cada ativo.
- **AC-7** — DADO o brand book aprovado pelo dono, QUANDO publico em `Architecture-Registry/context/marca/`, ENTÃO `context/marca/README.md` indexa todos os documentos e ativos com links relativos que resolvem (verificado por `check-marca.mjs --links`) e `architecture-registry.yaml` referencia o diretório numa chave `brand_book`.

## Regras de Negócio
- Nome não pode colidir com marca registrada nas classes NCL 9, 42 e 44 no INPI (verificação preliminar; registro formal é ação posterior e fora deste PBI).
- Nome e identidade funcionam para todos os nichos-alvo (fisioterapia, estética, odontologia, medicina, psicologia, nutrição, outros), sem termo restrito a uma especialidade.
- Fontes e imagens com licença que permita uso comercial; IA generativa só com termos que permitam uso comercial, com origem registrada em `ORIGEM.md`.
- Decisão de nome e logo é do dono do produto; o agente propõe e justifica. AC-3 só fecha com a linha de aprovação.
- Todo dado externo (domínio, INPI, concorrente) leva data da consulta; o que for estimativa fica marcado como hipótese.
- **Local do brand book:** durante a elaboração, rascunho em `G:/Projetos/Sistema-Clinica/Sistema-Clinica-Marca/` (pasta irmã do registry, para o dono ler e aprovar). **Após a aprovação do dono**, o conteúdo aprovado é publicado em `Architecture-Registry/context/marca/` (local definitivo) e referenciado pelo `brand_book` do yaml. `check-marca` aceita `--marca <dir>` para validar qualquer das duas pastas.
- **Identidade visual no Pencil:** paleta, tipografia e logo (T-10/T-11) são trabalhadas no arquivo `.pen` aberto (`Sistema-Clinica-Marca/Idv-Visual-Sistema-Clinica.pen`) via MCP Pencil; por decisão do dono, **o modelo `fable` é usado apenas para o trabalho no Pencil** (subagente com `model: fable`), nunca para o resto.

## Cenários de Teste Unitário
> Testes do próprio `scripts/check-marca.mjs` (Node test runner), sobre fixtures.

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-5 | Contraste aprovado | par `#101828` sobre `#ffffff` | ≥ 4.5, exit 0 |
| UT-2 | AC-5 | Contraste reprovado | par `#9ca3af` sobre `#ffffff` (≈2.5:1) | exit 1 e imprime o par reprovado |
| UT-3 | AC-5 | Token de cor inválido | `"primaria": "azul"` | exit 1 apontando a chave |
| UT-4 | AC-6 | Variantes completas | pasta com 18 arquivos | exit 0 |
| UT-5 | AC-6 | Variante faltando | falta `logo-icone-mono.png` | exit 1 listando o arquivo |
| UT-6 | AC-6 | SVG inválido | SVG sem `<title>` ou > 20 KB | exit 1 apontando o arquivo |
| UT-7 | AC-7 | Link quebrado no README | link para arquivo inexistente | exit 1 apontando o link |
| UT-8 | AC-1/2/4 | Documento sem seção obrigatória | `identidade.md` sem "Missão" | exit 1 apontando a seção |
| UT-9 | AC-3 | Decisão sem aprovação | `decisao-nome.md` sem linha `Aprovado por:` | exit 1 |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-7 | Rodar `node scripts/check-marca.mjs` na raiz do registry | exit 0, sem pendências |
| FT-2 | AC-7 | Abrir `context/marca/README.md` no GitHub (após T-13) | Brand book legível, todos os links e imagens abrem |
| FT-3 | AC-3 | Dono revisa `decisao-nome.md` | Aprovação registrada com data |

## Requisitos Técnicos
- **Tipo de mudança:** nova feature (documentação + ativos + script de verificação). Sem alteração em backend ou fronts.
- **APIs/contratos:** nenhum.
- **Requisitos não-funcionais:** SVG otimizado; contraste AA nos temas claro e escuro; texto alternativo/`<title>` nos logos.
- **Riscos técnicos:** nome indisponível no INPI/domínio (manter ≥3 finalistas); decisão subjetiva do dono (bloqueia AC-3 e tudo que depende); direitos de uso de fontes/imagens/IA; consultas ao INPI e ao Registro.br são manuais/externas e podem não ser automatizáveis — registrar o resultado como evidência.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

## Validação
**Status:** ✅ APPROVED — 2026-11-24
**Validador:** /validate-pbi
**Notas:**
- Workspace `architecture-registry` existe; `scripts/` já tem `check-brand.mjs` + `check-brand.test.mjs` (Node test runner, sem dependências). `check-marca.mjs` deve seguir o mesmo padrão (exports testáveis, exit 0/1/2).
- `Sistema-Clinica-Marca/` não existe ainda (só `mapa-modulos.md`); não há `brand_book` no `architecture-registry.yaml` — sem duplicação.
- `check-brand` roda com `--exclude board,context,tokens.json`, então o nome novo em `Sistema-Clinica-Marca/` não dispara o guarda; PNGs são binários e já são ignorados.
- AC-1/AC-2/AC-4 são parte documental; a checagem automática cobre só estrutura (seções, colunas, contagens), não a qualidade do conteúdo. Consultas a INPI/Registro.br/redes são manuais e entram como evidência datada.
- AC-3 e AC-6 (logo) dependem de decisão do dono: tasks de conteúdo ficam bloqueadas até a aprovação do nome. As tasks de script (UT-1..UT-9) podem rodar em paralelo, com fixtures.
- Risco: PBI de mercado (AC-4) é dono da lista de concorrentes; se ainda não existir, AC-1 usa lista provisória marcada como hipótese.

## Tasks
> Status por task: ⬜ pendente · 🟦 em progresso · ✅ concluída
> Fluxo: o bloco de script (T-1..T-5) é código com AC-TDD e roda já, com fixtures. O bloco de conteúdo (T-6..T-12) é documental; T-8 é portão de aprovação do dono e bloqueia T-9..T-12.

### architecture-registry — script de verificação (Node ESM, sem dependências → coder-react-ts, estilo `scripts/check-brand.mjs`)
- [x] **T-1** ✅ (AC-5, UT-1, UT-2, UT-3) — Criar `scripts/check-marca.mjs` + `scripts/check-marca.test.mjs` (node:test). Escrever UT-1/UT-2/UT-3 primeiro (RED) e implementar `--contraste` até GREEN: lê `Sistema-Clinica-Marca/tokens-marca.json` (cores hex com papel; lista `pares` texto/fundo por tema claro e escuro), calcula razão WCAG, falha se < 4.5 listando o par, e falha em hex inválido apontando a chave. Funções exportadas e testáveis; exit 0 ok, 1 pendência, 2 erro de uso. Documentar o schema de `tokens-marca.json` em comentário de cabeçalho.
- [x] **T-2** ✅ (AC-6, UT-4, UT-5, UT-6) — UT-4/5/6 (RED) e `--assets`: exige as 9 variantes `logo-{horizontal|vertical|icone}-{claro|escuro|mono}` em `.svg` e `.png` em `Sistema-Clinica-Marca/assets/logo/` (18 arquivos), valida cada SVG (`<title>`, `viewBox`, ≤ 20 KB) e exige `assets/ORIGEM.md` com uma entrada por ativo. Lista todos os faltantes de uma vez.
- [x] **T-3** ✅ (AC-1, AC-2, AC-3, AC-4, UT-8, UT-9) — UT-8/UT-9 (RED) e `--docs`: valida estrutura mínima de `concorrentes-marca.md` (≥8 linhas; colunas nome, URL, data, posicionamento, tom, cores/fonte; seção "Lacunas de marca" ≥3 itens), `naming.md` (≥10 candidatos, ≥3 finalistas, campos domínio/handles/INPI com data), `decisao-nome.md` (linha `Aprovado por: <nome> em <AAAA-MM-DD>`), `identidade.md` (missão, visão, 3–6 valores, história, proposta de valor, slogan ≤ 8 palavras, ≥3 atributos de tom com "diga"/"não diga").
- [x] **T-4** ✅ (AC-7, UT-7) — UT-7 (RED) e `--links`: resolve links relativos e imagens de `Sistema-Clinica-Marca/README.md` e dos demais `.md` da pasta; falha apontando o link quebrado e o arquivo de origem.
- [x] **T-5** ✅ (AC-7, FT-1) — Modo padrão (sem flag) roda `--contraste --assets --docs --links` e consolida exit code; documentar uso no `README.md` do registry (junto de `check-brand`); verificar que `check-brand . --exclude board,context,tokens.json` segue verde com o nome novo nos documentos. Executar FT-1 sobre os artefatos finais (após T-12).

### architecture-registry — conteúdo do brand book (documental → scribe, com decisão do dono)
- [x] **T-6** ✅ (AC-1, UT-8) — Pesquisar as marcas dos ≥8 concorrentes (reutilizar a lista do PBI-20261124-publico-mercado-modelo-negocio AC-4; se ainda não existir, lista provisória marcada como hipótese) e escrever `Sistema-Clinica-Marca/concorrentes-marca.md` com fonte e data de consulta por linha e seção "Lacunas de marca".
- [x] **T-7** ✅ (AC-2, UT-8) — Definir critérios de naming (≤ 12 caracteres, ≤ 4 sílabas, pronúncia única PT-BR, sem conotação negativa, sem termo de especialidade), gerar e filtrar ≥10 candidatos, escolher ≥3 finalistas e registrar em `Sistema-Clinica-Marca/naming.md`: domínio `.com.br`/`.com`, handles Instagram/LinkedIn, anterioridade INPI (classes 9, 42, 44, com protocolo/link) — cada um com data.
- [x] **T-8** ✅ (Cuidaflux, 2026-11-24; condicionado à consulta manual do INPI) (AC-3, UT-9, FT-3) — **Portão do dono:** apresentar finalistas com justificativa e riscos; após a escolha, gravar `Sistema-Clinica-Marca/decisao-nome.md` com `Aprovado por: <dono> em <data>`. Bloqueia T-9..T-12.
- [x] **T-9** ✅ (AC-4, UT-8) — Escrever `Sistema-Clinica-Marca/identidade.md`: missão, visão, 3–6 valores, história, proposta de valor, slogan (≤ 8 palavras), tom de voz (≥3 atributos com exemplos "diga"/"não diga"), coerente com o nicho de entrada do PBI de mercado e válido para todos os nichos.
- [x] **T-10** ✅ (AC-5, UT-1, UT-2, UT-3) — Definir paleta (primária, secundária, neutras, feedback) e tipografia (família livre OFL/Apache, URL da fonte, licença); gravar `Sistema-Clinica-Marca/visual.md` e `Sistema-Clinica-Marca/tokens-marca.json` com pares texto/fundo nos temas claro e escuro; rodar `check-marca --contraste` até exit 0 (ajustar cores, não o validador).
- [x] **T-11** ✅ (AC-6, UT-4, UT-5, UT-6) — Produzir as 9 variantes de logo em SVG e PNG em `Sistema-Clinica-Marca/assets/logo/`, documentar área de proteção e tamanho mínimo em `visual.md` e registrar autoria/ferramenta/licença (e termos de uso se IA generativa) em `assets/ORIGEM.md`; aprovação do dono do logo registrada em `decisao-nome.md` ou `visual.md`. Rodar `check-marca --assets` até exit 0.
- [x] **T-12** ✅ (AC-7, UT-7, FT-1, FT-2) — Escrever `Sistema-Clinica-Marca/README.md` (índice em português, links relativos, para leitura do dono) e rodar `check-marca --marca ../Sistema-Clinica-Marca` completo.
- [x] **T-13** ✅ (AC-7, UT-7, FT-1, FT-2) — **Só após aprovação do dono:** copiar o brand book aprovado para `Architecture-Registry/context/marca/`, adicionar `brand_book: context/marca/` ao `architecture-registry.yaml`, rodar `check-marca .` (sem `--marca`) e `check-brand . --exclude board,context,tokens.json` (FT-1) e conferir a renderização no GitHub (FT-2). Decidir se `Sistema-Clinica-Marca/` vira espelho ou é arquivada.

### Rastreabilidade
| AC | Tasks | Cenários |
|----|-------|----------|
| AC-1 | T-3, T-6 | UT-8 |
| AC-2 | T-3, T-7 | UT-8 |
| AC-3 | T-3, T-8 | UT-9, FT-3 |
| AC-4 | T-3, T-9 | UT-8 |
| AC-5 | T-1, T-10 | UT-1, UT-2, UT-3 |
| AC-6 | T-2, T-11 | UT-4, UT-5, UT-6 |
| AC-7 | T-4, T-5, T-12, T-13 | UT-7, FT-1, FT-2 |

**Cobertura:** 12 tasks; 7 ACs, todos com ≥1 task e ≥1 teste; UT-1..UT-9 e FT-1..FT-3 cobertos.
**Ordem sugerida:** T-1..T-4 (paralelas, sem dependência de conteúdo) → T-6, T-7 → T-8 (dono) → T-9, T-10, T-11 → T-12 → T-13 (publicar após aprovação) → T-5 (FT-1 final).

## Coordenação
- **Radar início (2026-11-24):** 0 sessões com `isRunning: true` (30 listadas, todas ociosas); 0 PRs abertos no repositório; 1 worktree (a atual, `feature/desvincular-marca`); `board/in-progress/` vazio antes deste PBI. Escopo desta rodada: só `scripts/check-marca*.mjs` — sem sobreposição.
- **Acordos:** n/a
- **Radar fim (2026-11-24):** sem mudança — 0 PRs abertos, nenhuma sessão ativa tocando o escopo. Ordem de merge: n/a.

## Execução (parcial — T-1..T-4)
**Concluído em:** 2026-11-24 (script de verificação); PBI segue `in-progress` — T-5..T-12 pendentes.
**Arquivos alterados:** `scripts/check-marca.mjs`, `scripts/check-marca.test.mjs` (novos, não commitados).
**Prova de Rastreabilidade:**
| AC | Cenário | Status |
|----|---------|--------|
| AC-5 | UT-1, UT-2, UT-3 (+ fronteira 4.5, `constructor`, par inválido) | PASS |
| AC-6 | UT-4, UT-5, UT-6 (+ ORIGEM.md, EISDIR) | PASS |
| AC-1/2/3/4 | UT-8, UT-9 (+ INPI sem link/protocolo, `.com` vs `.com.br`, NCL 4 vs 42) | PASS |
| AC-7 | UT-7 (+ links absolutos/fora de `Sistema-Clinica-Marca`, exit 2) | PASS |
**Testes:** `node --test scripts/check-marca.test.mjs scripts/check-brand.test.mjs` → 69/69; `check-brand . --exclude board,context,tokens.json` → 0 ocorrências. Suíte completa dispensada (mudança pequena, 2 arquivos novos isolados). FT-1/FT-2/FT-3 não executados (dependem das tasks de conteúdo).
**Quality Gate:** auditoria sem P0/P1; P2 corrigidos; review APPROVE (rodada 2).
**Débitos abertos:** `PBI-20261124-melhorias-check-marca` (P3 da auditoria).

## Execução (final)
**Concluído em:** 2026-11-24. Brand book aprovado pelo dono (nome Cuidaflux, slogan "O fluxo do cuidado.", símbolo "C em fluxo", tema escuro azul suave) e publicado em `Architecture-Registry/context/marca/`; referenciado em `brand_book` no `architecture-registry.yaml`.
**Arquivos:** `scripts/check-marca.mjs`, `scripts/check-marca.test.mjs`, `context/marca/**` (documentos, `tokens-marca.json`, 22 logos SVG/PNG, `assets/ORIGEM.md`, `scripts/gerar-logos.mjs`, versão 1 arquivada), `architecture-registry.yaml`.
**Prova de Rastreabilidade:** AC-1..AC-7 verificados por `node scripts/check-marca.mjs .` (contraste, assets, docs e links: ok) e pelos 74 testes (`check-marca` + `check-brand`) — PASS. `check-brand . --exclude board,context,tokens.json` → 0 ocorrências.
**Quality Gate:** ✅ (script: auditoria sem P0/P1, review APPROVE). Conteúdo: aprovado pelo dono em conversa.
**Débitos / pendências abertas:**
- Consulta manual no INPI (NCL 9/42/44), handles de Instagram e LinkedIn e registro dos domínios `cuidaflux.com.br`/`.com` — condição da decisão do nome (`decisao-nome.md`).
- Lista de concorrentes provisória: reconciliar com `PBI-20261124-publico-mercado-modelo-negocio`.
- Testar o ícone pequeno como favicon real em 16 px; arquivo `.pen` precisa ser salvo no Pencil (estava com 0 bytes no disco) e não foi versionado.
- `PBI-20261124-melhorias-check-marca` (P3 do script).
- Próximo: `PBI-20261124-aplicar-identidade-de-marca-ao-sistema` (bloqueado também por `completar-branding`).
**Coordenação:** radar início e fim sem sobreposição.
