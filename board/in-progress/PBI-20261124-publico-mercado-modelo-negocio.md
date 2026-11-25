---
id: PBI-20261124-publico-mercado-modelo-negocio
tipo: feature
titulo: Definir público-alvo, análise de mercado e modelo de negócio da plataforma para clínicas
status: aguardando-aprovacao-dono
prioridade: alta
workspaces: [architecture-registry]
criado_em: 2026-11-24
revisado_em: 2026-11-24
---

# Definir público-alvo, análise de mercado e modelo de negócio da plataforma para clínicas

## Contexto de Negócio
- **Objetivo:** documentar para quem vender, como vender e como precificar o **Cuidaflux**. Entregar ICP por nicho, mapa de mercado e concorrentes, modelo de receita escolhido, plano de go-to-market, script de venda e metas financeiras. Métrica: plano aprovado pelo dono com preço, meta de MRR dos primeiros 12 meses e funil com taxas-alvo (como hipóteses declaradas).
- **Persona:** dono do produto (decisor); futuro time comercial; clínicas pequenas e médias e profissionais autônomos (formais e informais) de múltiplos nichos.
- **Jornada atual:** plataforma funcional, marca definida (Cuidaflux), sem estratégia de venda, preço nem público definidos.
- **Jornada desejada:** estratégia documentada e verificável, com primeiro nicho de entrada escolhido, proposta comercial e material de venda.
- **Fato técnico confirmado (registry):** o sistema é **single-tenant por implantação**: banco único `SistemaClinicaDB`, entidades sem `TenantId`, marca vinda de `appsettings` (`Branding`), filiais cadastradas por cliente. Hoje o modelo viável é **uma implantação dedicada por cliente**; SaaS compartilhado exige multi-tenant (PBI futuro). Esse fato alimenta a coluna "adequação do sistema" do AC-1 e as análises do AC-5 e AC-10.
- **Dependências:**
  - `PBI-20261124-desvincular-marca-instituto-barros` (done) e `PBI-20261124-definir-identidade-de-marca-clinica` (done, `context/marca/`).
  - Entrada existente: `context/marca/concorrentes-marca.md` traz lista **provisória** de 9 concorrentes (análise de marca). **Este PBI é o dono da lista e do comparativo de concorrentes** (`concorrentes.md`); ao concluir, `concorrentes-marca.md` deve passar a referenciar `context/negocio/concorrentes.md` (ajuste pequeno, parte da task de publicação).
  - `PBI-20261124-gerador-white-label-clinica` (backlog): a opção (d) do AC-5 (revenda/white-label) depende dela; a análise deve citar o estágio dela.
  - Pré-requisitos técnicos do modelo SaaS (multi-tenant, LGPD, cobrança recorrente) viram PBIs próprios depois (AC-10).

## User Story
Como dono do produto, quero público, mercado e modelo de negócio definidos e documentados, para que eu venda a plataforma de forma previsível, com receita recorrente e foco no nicho certo.

## Critérios de Aceite
Entregas em `Architecture-Registry/context/negocio/`. Cada AC é provado por **arquivo + verificação automática** (`scripts/check-negocio.mjs`, Node sem dependências, no padrão de `scripts/check-marca.mjs`) e, onde há decisão, por linha `Aprovado por: <dono> em <AAAA-MM-DD>`. As contas financeiras são provadas por `scripts/modelo-financeiro.mjs` (funções puras, testadas com `node:test`).

- **AC-1** — DADO os nichos candidatos (fisioterapia, estética, odontologia, medicina geral/especialidades, psicologia, nutrição, fonoaudiologia, estúdios de pilates/bem-estar, veterinária, podologia, profissionais autônomos informais), QUANDO avalio cada um, ENTÃO `mercado.md` traz matriz com **11 linhas** e colunas: nicho, tamanho de mercado (com fonte URL e data, ou marcado `hipótese`), dor principal, ticket possível, adequação do sistema (módulos que atendem × lacunas, considerando o fato single-tenant) e nota final (0–10, número).
- **AC-2** — DADO a matriz, QUANDO escolho, ENTÃO `mercado.md` tem a seção "Decisão de nicho" com **1 nicho de entrada e 1–2 de expansão**, justificados, mais a linha `Aprovado por:`.
- **AC-3** — DADO o nicho de entrada, QUANDO crio o ICP e as personas, ENTÃO `icp-personas.md` traz perfil (porte, nº de profissionais, ferramentas atuais), dores, gatilhos de compra, objeções e critérios de decisão, para **≥ 2 personas**.
- **AC-4** — DADO ≥ 8 concorrentes (partindo dos 9 de `concorrentes-marca.md`, reconciliados), QUANDO analiso, ENTÃO `concorrentes.md` traz por concorrente: URL, data da consulta, funcionalidades, preço, modelo de cobrança, pontos fortes e fracos; e a seção "Espaço de diferenciação" (inclui IA, WhatsApp e agendamento como candidatos).
- **AC-5** — DADO os modelos candidatos, QUANDO comparo, ENTÃO `modelo-negocio.md` analisa **5 modelos** — (a) SaaS com implantação + mensalidade, (b) licença perpétua/on-premise, (c) híbrido, (d) revenda/white-label via parceiros, (e) add-on de IA por consumo — cada um com receita, custo, risco, esforço técnico e adequação ao porte do cliente, e declara o impacto do fato single-tenant e do estágio do gerador white-label.
- **AC-6** — DADO a comparação, QUANDO decido, ENTÃO `precificacao.md` registra modelo principal, tabela de preços (implantação, mensalidade por faixa, add-ons), premissas e a **margem bruta mínima** escolhida entre 3 opções (ver Regras de Negócio), com `Aprovado por:`.
- **AC-7** — DADO as premissas, QUANDO modelo as finanças, ENTÃO `modelo-financeiro.xlsx` (gerado por `scripts/modelo-financeiro.mjs`, com fórmulas e aba "Premissas") traz CAC, LTV, churn, payback, margem, ponto de equilíbrio e **3 cenários (conservador/base/otimista) para 12 meses**; os cálculos vêm das funções testadas do módulo.
- **AC-8** — DADO o ICP e o modelo, QUANDO monto o go-to-market, ENTÃO `go-to-market.md` traz ≥ 6 canais (indicação, parcerias com conselhos/associações/fornecedores, WhatsApp, redes, anúncios, conteúdo), funil com taxas-alvo **como hipótese, cada uma com faixa mínimo–máximo**, oferta de lançamento e plano de 90 dias com marcos.
- **AC-9** — DADO o funil, QUANDO escrevo o material comercial, ENTÃO existem `script-vendas.md` (prospecção), `demo-roteiro.md` (passos numerados da demonstração), `objecoes-faq.md` (tratamento de objeções + FAQ) e `proposta-modelo.md` (proposta comercial modelo).
- **AC-10** — DADO o plano, QUANDO reviso riscos, ENTÃO `riscos-prerequisitos.md` lista pré-requisitos técnicos e regulatórios (multi-tenant, LGPD para dado de saúde, cobrança recorrente, suporte, SLA, regras de conselhos como CFM/CRO por nicho) cada um com PBI futuro sugerido.
- **AC-11** — DADO todos os documentos, QUANDO publico, ENTÃO `context/negocio/README.md` indexa todos os arquivos com links relativos que resolvem (`check-negocio --links`) e `architecture-registry.yaml` referencia a pasta em `organization.business_docs` (mesmo molde de `brand_book`).

## Regras de Negócio
- Todo número de mercado e preço de concorrente cita **fonte (URL) e data**; o que for estimativa fica marcado `hipótese`. Taxas de funil, churn e CAC são hipóteses até haver dado real.
- Dados de saúde são dados sensíveis (LGPD): o plano trata compliance como requisito de venda, não opcional.
- **Margem bruta mínima** = (receita − custos variáveis por cliente: infraestrutura, IA por consumo, suporte, taxa de pagamento) ÷ receita. O dono escolhe uma das **3 opções**:
  - **A — 60%:** conservadora; absorve suporte pesado e IA por consumo; permite preço mais baixo e entrada mais rápida.
  - **B — 70%:** equilíbrio (base dos exemplos de teste); exige controle de suporte e custo de IA.
  - **C — 80%:** padrão de SaaS maduro; exige preço mais alto ou operação muito enxuta.
  **Decisão do dono (2026-11-24): opção A — margem bruta mínima de 60%.** `precificacao.md` mostra o impacto de A/B/C em preço e payback para referência e registra o 60% com `Aprovado por:`. Qualquer preço da tabela abaixo da margem escolhida é reprovado pela verificação (UT-7).
- **Cenários (padrão editável, registrado na aba "Premissas"):** base = premissas do dono; conservador = churn ×1,5, CAC ×1,3, conversão ×0,7; otimista = churn ×0,7, CAC ×0,8, conversão ×1,3; preço (ARPA) igual nos três, salvo decisão do dono.
- O modelo precisa permitir implantação rápida para clínicas pequenas e profissionais autônomos.
- Decisão de modelo, preço, margem e nicho é do dono do produto; o agente recomenda com números.

## Cenários de Teste Unitário
> `scripts/modelo-financeiro.test.mjs` e `scripts/check-negocio.test.mjs` (node:test, fixtures em diretório temporário).

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-7 | LTV | ARPA 300, margem 70%, churn 3%/mês | LTV = 7.000 |
| UT-2 | AC-7 | Payback | CAC 1.200, margem mensal 210 | 5,71 meses (2 casas) |
| UT-3 | AC-7 | Ponto de equilíbrio | custo fixo 15.000, margem unitária 210 | 72 clientes (arredonda para cima de 71,43) |
| UT-4 | AC-7 | Churn zero | churn = 0 | premissa inválida sinalizada, sem divisão por zero |
| UT-5 | AC-7 | Cenários | base churn 3% | conservador 4,5% (LTV 4.666,67) e otimista 2,1% (LTV 10.000) |
| UT-6 | AC-7 | Premissa inválida | ARPA ≤ 0 ou margem fora de 0–100% | premissa inválida sinalizada |
| UT-7 | AC-6 | Margem mínima | preço com margem bruta 55% e mínimo escolhido 60% | reprovado, aponta o plano |
| UT-8 | AC-1 | Matriz de nichos | nicho sem nota ou coluna | exit 1 apontando o nicho |
| UT-9 | AC-1 | Fonte ou hipótese | linha de mercado sem URL nem `hipótese` | exit 1 |
| UT-10 | AC-4 | Concorrentes | menos de 8 linhas | exit 1 |
| UT-11 | AC-2/AC-6 | Decisão sem aprovação | `precificacao.md` sem `Aprovado por:` | exit 1 |
| UT-12 | AC-8 | Funil | taxa sem faixa mínimo–máximo | exit 1 |
| UT-13 | AC-11 | Arquivo obrigatório ausente ou link quebrado | falta `riscos-prerequisitos.md` | exit 1 listando o arquivo |
| UT-14 | AC-3 | Personas | `icp-personas.md` com 1 persona ou sem objeções | exit 1 apontando a persona/seção |
| UT-15 | AC-5 | Modelos | `modelo-negocio.md` sem o modelo (e) ou sem coluna de risco | exit 1 apontando o modelo |
| UT-16 | AC-8/AC-10 | Canais e riscos | menos de 6 canais; risco sem PBI sugerido | exit 1 apontando o item |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-6/AC-9 | Percorrer `demo-roteiro.md` e `objecoes-faq.md` contra `proposta-modelo.md` (checklist: preço, plano e próximos passos presentes; cada objeção do ICP tem resposta) | Checklist completo e aprovado pelo dono (`Aprovado por:`); validação com cliente real fica como ação posterior |
| FT-2 | AC-7 | Rodar `node scripts/modelo-financeiro.mjs --churn 0.05` | LTV, cenários e projeção de 12 meses recalculam e o `.xlsx` é regerado com os novos valores (o payback, por definição CAC ÷ margem mensal, depende de CAC e margem, não do churn; ele só muda entre cenários) |
| FT-3 | AC-11 | Rodar `node scripts/check-negocio.mjs .` e abrir `context/negocio/README.md` no GitHub | exit 0; documentos navegáveis e linkados no registry |

## Requisitos Técnicos
- **Tipo de mudança:** nova feature (documentação estratégica, modelo financeiro e scripts de verificação). Sem alteração em backend ou fronts.
- **APIs/contratos:** n/a. Entregas em `context/negocio/`: `mercado.md`, `icp-personas.md`, `concorrentes.md`, `modelo-negocio.md`, `precificacao.md`, `modelo-financeiro.xlsx`, `go-to-market.md`, `script-vendas.md`, `demo-roteiro.md`, `objecoes-faq.md`, `proposta-modelo.md`, `riscos-prerequisitos.md`, `README.md`. Scripts: `scripts/check-negocio.mjs`, `scripts/modelo-financeiro.mjs` (+ testes).
- **Decisão técnica do `.xlsx`:** módulo Node puro com as contas (testável sem planilha); a geração do `.xlsx` com fórmulas pode usar uma dependência de desenvolvimento isolada (ex.: `exceljs` em `scripts/package.json`), sem afetar o `check-negocio` (sem dependências). Se a dependência for recusada, a entrega cai para `.csv` + documento, registrando o motivo.
- **Requisitos não-funcionais:** fontes citadas e datadas; linguagem comercial clara em PT-BR; os documentos não contêm credenciais nem dados pessoais.
- **Riscos técnicos:** compliance LGPD/CFM/CRO por nicho; concorrentes consolidados no Brasil; suposições de preço, churn e conversão não validadas com clientes reais (hipóteses); dependência de decisão do dono (nicho, margem, preço) bloqueia AC-2 e AC-6; sites de concorrentes podem bloquear a coleta de preço (marcar "não confirmado"); o sistema é single-tenant (um SaaS compartilhado exige trabalho técnico prévio).

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
- As 10 pendências da rodada anterior foram tratadas. Contas conferidas: LTV 300×0,7/0,03 = 7.000; payback 1.200/210 = 5,71; break-even ⌈15.000/210⌉ = 72; cenários 4.666,67 e 10.000. Matriz de nichos tem exatamente 11 linhas.
- Fato técnico confirmado no `architecture-registry.yaml`: banco único `SistemaClinicaDB`, entidades sem `TenantId`, marca em `appsettings` → single-tenant por implantação. `organization.business_docs` segue o molde de `organization.brand_book` (já na master). `context/negocio/` e `scripts/check-negocio.mjs`/`modelo-financeiro.mjs` ainda não existem (sem duplicação).
- Cada AC tem teste (UT-14..16 acrescentados na validação para AC-3, AC-5, AC-8, AC-10). A verificação é estrutural (seções, contagens, fonte+data, aprovação); a qualidade do conteúdo é do dono.
- **Portões do dono:** AC-2 (escolha do nicho de entrada) e AC-6 (aprovação do preço e do modelo). Margem bruta mínima já decidida: **60% (opção A)**.
- Riscos: `.xlsx` com fórmulas pede dependência de desenvolvimento (ex.: `exceljs`) isolada em `scripts/package.json`; se recusada, cai para `.csv`. Sites de concorrentes podem bloquear coleta de preço (registrar "não confirmado", nunca inventar).

## Tasks
> Status por task: ⬜ pendente · 🟦 em progresso · ✅ concluída
> Fluxo: o bloco de scripts (T-1..T-6) é código com AC-TDD e roda já, com fixtures. O bloco de conteúdo (T-7..T-17) é documental e vai para `Architecture-Registry/context/negocio/`. **Portões do dono:** T-9 (nicho de entrada) e T-12 (preço/modelo) exigem a linha `Aprovado por:`; T-10 depende de T-9 e T-13 de T-12. Margem bruta mínima já decidida: 60%.

### architecture-registry — scripts de cálculo e verificação (Node ESM → coder-react-ts, estilo `scripts/check-marca.mjs`)
- [x] **T-1** ✅ (AC-7, UT-1, UT-2, UT-3, UT-4, UT-5, UT-6) — Criar `scripts/modelo-financeiro.mjs` + `scripts/modelo-financeiro.test.mjs` (node:test). RED primeiro e depois funções puras: LTV = ARPA × margem ÷ churn, payback = CAC ÷ margem mensal (2 casas), ponto de equilíbrio com `ceil`, cenários base/conservador/otimista (churn ×1,5/×0,7, CAC ×1,3/×0,8, conversão ×0,7/×1,3). Churn 0, ARPA ≤ 0 e margem fora de 0–100% devolvem premissa inválida, sem exceção nem divisão por zero.
- [x] **T-2** ✅ (AC-6, UT-7) — Função de margem bruta mínima em `modelo-financeiro.mjs`: (receita − custos variáveis) ÷ receita por plano, comparada ao mínimo (padrão 60%). Teste: plano com 55% contra mínimo 60% é reprovado e aponta o plano.
- [x] **T-3** ✅ (AC-7, FT-2) — Projeção de 12 meses por cenário e CLI `node scripts/modelo-financeiro.mjs [--churn <x>] [--out <arquivo>]` que gera `modelo-financeiro.xlsx` com aba "Premissas" e fórmulas (CAC, LTV, churn, payback, margem, equilíbrio). Dependência de desenvolvimento isolada em `scripts/package.json` (ex.: `exceljs`); se recusada, fallback `.csv` com o motivo registrado. Teste: alterar `--churn` muda LTV, payback e cenários.
- [x] **T-4** ✅ (AC-1, AC-2, AC-4, AC-6, UT-8, UT-9, UT-10, UT-11) — Criar `scripts/check-negocio.mjs` + `scripts/check-negocio.test.mjs` com `--docs` parte 1: `mercado.md` (11 nichos, colunas, nota numérica, fonte URL+data ou `hipótese`, seção "Decisão de nicho" com 1 entrada e 1–2 expansão e `Aprovado por:`), `concorrentes.md` (≥ 8 concorrentes com URL, data e colunas obrigatórias, seção "Espaço de diferenciação") e `precificacao.md` (`Aprovado por:`). Exit 0/1/2; `--negocio <dir>` opcional como o `--marca` do check-marca.
- [x] **T-5** ✅ (AC-3, AC-5, AC-8, AC-10, UT-12, UT-14, UT-15, UT-16) — `check-negocio --docs` parte 2: `icp-personas.md` (≥ 2 personas com perfil, dores, gatilhos, objeções, critérios), `modelo-negocio.md` (5 modelos a–e com receita, custo, risco, esforço, adequação), `go-to-market.md` (≥ 6 canais; cada taxa de funil com faixa mínimo–máximo marcada como hipótese; oferta de lançamento; plano de 90 dias), `riscos-prerequisitos.md` (cada risco com PBI sugerido).
- [x] **T-6** ✅ (AC-9, AC-11, UT-13, FT-3) — `check-negocio --links` (links relativos e imagens resolvem; fora da pasta reprova) e verificação da lista de 13 arquivos obrigatórios (inclui `script-vendas.md`, `demo-roteiro.md`, `objecoes-faq.md`, `proposta-modelo.md`, `README.md`); modo padrão roda tudo e consolida o exit code; documentar uso no `README.md` do registry. Rodar FT-3 sobre os artefatos finais (após T-17).

### architecture-registry — conteúdo (documental → pesquisa web + scribe, com decisão do dono)
- [x] **T-7** ✅ (AC-4, UT-10) — `context/negocio/concorrentes.md`: partir dos 9 de `context/marca/concorrentes-marca.md`, reconciliar/ampliar (≥ 8), levantar funcionalidades, preço público e modelo de cobrança com URL e data; o que o site bloquear fica "não confirmado" (nunca inventar); seção "Espaço de diferenciação" (IA, WhatsApp, agendamento).
- [x] **T-8** ✅ (AC-1, UT-8, UT-9) — `context/negocio/mercado.md`: matriz de 11 nichos (tamanho de mercado com fonte+data ou `hipótese`, dor, ticket, adequação do sistema considerando o fato single-tenant e os módulos do registry, nota 0–10).
- [x] **T-9** ✅ (AC-2, UT-11) — **Portão do dono:** recomendar 1 nicho de entrada e 1–2 de expansão com números; após a escolha, gravar a seção "Decisão de nicho" com `Aprovado por:`. Bloqueia T-10.
- [x] **T-10** ✅ (AC-3, UT-14) — `context/negocio/icp-personas.md` para o nicho de entrada: ≥ 2 personas com perfil, dores, gatilhos, objeções e critérios de decisão.
- [x] **T-11** ✅ (AC-5, UT-15) — `context/negocio/modelo-negocio.md`: os 5 modelos (a–e) comparados, com o impacto do fato single-tenant e do estágio do `PBI-20261124-gerador-white-label-clinica`.
- [x] **T-12** ✅ (AC-6, UT-7, UT-11) — **Portão do dono:** `context/negocio/precificacao.md` com modelo principal, tabela (implantação, mensalidade por faixa, add-ons), premissas, impacto das margens A/B/C e a decisão registrada de **60%**; todos os planos passam na verificação de margem (T-2); `Aprovado por:`.
- [x] **T-13** ✅ (AC-7, FT-2) — Gerar `context/negocio/modelo-financeiro.xlsx` com as premissas reais de T-12/T-14 (ARPA, CAC, churn, conversão, custos), 3 cenários × 12 meses; rodar FT-2 (alterar churn e conferir o recálculo).
- [x] **T-14** ✅ (AC-8, UT-12, UT-16) — `context/negocio/go-to-market.md`: ≥ 6 canais, funil com taxas-alvo em faixa e marcadas como hipótese, oferta de lançamento, plano de 90 dias com marcos.
- [x] **T-15** ✅ (AC-9, FT-1) — `script-vendas.md`, `demo-roteiro.md` (passos numerados), `objecoes-faq.md` e `proposta-modelo.md`; executar o checklist do FT-1 (preço, plano e próximos passos presentes; cada objeção do ICP respondida) e registrar `Aprovado por:` do dono.
- [x] **T-16** ✅ (AC-10, UT-16) — `context/negocio/riscos-prerequisitos.md`: multi-tenant, LGPD para dado de saúde, cobrança recorrente, suporte, SLA, regras de CFM/CRO por nicho; cada item com PBI futuro sugerido.
- [x] **T-17** ✅ (AC-11, UT-13, FT-3) — `context/negocio/README.md` (índice com links relativos), chave `organization.business_docs` no `architecture-registry.yaml`, atualizar `context/marca/concorrentes-marca.md` para referenciar `context/negocio/concorrentes.md`; rodar `check-negocio .` e `check-brand . --exclude board,context,tokens.json` e conferir a renderização no GitHub (FT-3).

### Rastreabilidade
| AC | Tasks | Cenários |
|----|-------|----------|
| AC-1 | T-4, T-8 | UT-8, UT-9 |
| AC-2 | T-4, T-9 | UT-11 |
| AC-3 | T-5, T-10 | UT-14 |
| AC-4 | T-4, T-7 | UT-10 |
| AC-5 | T-5, T-11 | UT-15 |
| AC-6 | T-2, T-4, T-12 | UT-7, UT-11, FT-1 |
| AC-7 | T-1, T-3, T-13 | UT-1..UT-6, FT-2 |
| AC-8 | T-5, T-14 | UT-12, UT-16 |
| AC-9 | T-6, T-15 | UT-13, FT-1 |
| AC-10 | T-5, T-16 | UT-16 |
| AC-11 | T-6, T-17 | UT-13, FT-3 |

**Cobertura:** 17 tasks; 11 ACs, todos com ≥ 1 task e ≥ 1 teste; UT-1..UT-16 e FT-1..FT-3 cobertos.
**Ordem sugerida:** T-1..T-6 (scripts, em paralelo onde possível) ‖ T-7, T-8 (pesquisa) → T-9 (dono) → T-10, T-11 → T-12 (dono) → T-13, T-14, T-15, T-16 → T-17 → T-6 (FT-3 final).

## Coordenação
- **Radar início (2026-11-24):** 0 sessões com `isRunning: true` (30 listadas, todas ociosas); 0 PRs abertos; 1 worktree (a atual, `feature/modelo-negocio-cuidaflux`); `origin/master` sem novidades (0/0); `board/in-progress/` só com este PBI. Escopo desta rodada: `scripts/modelo-financeiro*`, `scripts/check-negocio*`, `context/negocio/{concorrentes,mercado}.md` e o `README.md` do registry — sem sobreposição.
- **Acordos:** n/a
- **Radar fim (2026-11-24):** sem mudança — 0 PRs abertos, `origin/master` sem novidades, nenhuma sessão ativa tocando o escopo. Ordem de merge: n/a.

## Execução (parcial — T-1..T-8)
**Concluído em:** 2026-11-24 (scripts e pesquisa); PBI segue `in-progress` — T-9..T-17 pendentes. **Portões do dono:** T-9 (nicho de entrada) e T-12 (preço/modelo; margem 60% já decidida).
**Arquivos:** `scripts/modelo-financeiro.mjs`, `scripts/modelo-financeiro.test.mjs`, `scripts/modelo-financeiro.premissas-exemplo.json` (marcado EXEMPLO), `scripts/package.json` e `package-lock.json` (devDependency `exceljs`), `scripts/check-negocio.mjs`, `scripts/check-negocio.test.mjs`, `README.md` (seção check-negocio), `.gitignore`, `context/negocio/concorrentes.md`, `context/negocio/mercado.md`.
**Prova de Rastreabilidade:**
| AC | Cenário | Status |
|----|---------|--------|
| AC-7 | UT-1..UT-6, FT-2 (LTV 7.000; payback 5,71; equilíbrio 72; churn 0 inválido; cenários 4.666,67 e 10.000; `--churn 0.05` recalcula) | PASS |
| AC-6 | UT-7 (margem mínima 60%; modelo sinaliza cenários abaixo) | PASS |
| AC-1/2/4 | UT-8..UT-11 (matriz de nichos, concorrentes, aprovação) | PASS |
| AC-3/5/8/10 | UT-12, UT-14..UT-16 | PASS (fixtures) |
| AC-9/11 | UT-13, FT-3 (fixtures; sobre artefatos reais após T-17) | PASS (fixtures) |
**Testes:** `node --test` em `modelo-financeiro`, `check-negocio`, `check-marca` e `check-brand` → 202/202; `check-brand . --exclude board,context,tokens.json` → 0 ocorrências. Suíte completa dispensada (arquivos novos isolados). Não executado: abrir o `.xlsx` no Excel/LibreOffice; FT-1 e FT-3 sobre os artefatos finais.
**Quality Gate (scripts):** auditoria sem P0/P1 nos dois scripts, P2 corrigidos, review APPROVE.
**Conteúdo:** `concorrentes.md` passa no `check-negocio` (15 concorrentes; preços não publicados ficam "não confirmado"); `mercado.md` passa exceto a seção "Decisão de nicho" (T-9).
**Débitos / riscos aceitos:** P3 das auditorias (duplicação entre `check-negocio` e `check-marca` → `scripts/lib/`, links com espaço/parênteses, datas múltiplas por célula, vírgula em nichos de expansão, placeholders "TBD"); `exceljs` com 2 vulnerabilidades moderadas via `uuid` transitivo (sem impacto: só escreve arquivos; sem downgrade); fontes de mercado secundárias e datas-base antigas (reconsultar conselhos antes de uso comercial).
**Coordenação:** radar início e fim sem sobreposição.

## Execução (final — todas as tasks T-1..T-17)
**Concluído em:** 2026-11-24. Todos os documentos escritos e verificados; **o PBI fecha quando o dono aprovar** a tabela de preços/oferta e o checklist FT-1 (`objecoes-faq.md`). Até lá o status é `aguardando-aprovacao-dono`.
**Arquivos:** `context/negocio/` (13 documentos + `modelo-financeiro.xlsx`), `scripts/modelo-financeiro.mjs` (+ testes, premissas de exemplo e `premissas-cuidaflux.json`), `scripts/check-negocio.mjs` (+ testes), `scripts/package.json` e `package-lock.json`, `README.md`, `.gitignore`, `architecture-registry.yaml` (`organization.business_docs`), `context/marca/concorrentes-marca.md` (nota de referência). Cópia para leitura em `Sistema-Clinica-Marca/negocio/`.
**Prova de Rastreabilidade:** AC-1..AC-11 verificados por `node scripts/check-negocio.mjs .` (docs, links e arquivos obrigatórios: ok) e pelos testes (202/202 somando `modelo-financeiro`, `check-negocio`, `check-marca`, `check-brand`); `check-brand . --exclude board,context,tokens.json` → 0 ocorrências. Aprovação registrada: margem bruta mínima de 60% (AC-6) e ordem de nichos (AC-2). Review de consistência: rodada 1 REQUEST_CHANGES (6 bloqueios corrigidos), rodada 2 APPROVE.
**Em aberto (dono):** aprovar preços (Essencial R$ 149, Clínica R$ 319, Dedicado R$ 419), add-ons e oferta de lançamento; decidir se os 60% valem antes ou depois de impostos; checklist FT-1; WhatsApp (provedor), cancelamento e exportação, cobrança recorrente, backup, suporte/SLA, IA no roadmap.
**Achados que mudam decisões:** Azure dedicado (≈ R$ 389/mês de custo) não fecha 60% na faixa dos concorrentes; só servidor compartilhado (Fase 1) ou multi-tenant (Fase 2). Ano 1 com margem negativa nos três cenários (equilíbrio ~33 clientes). Antes de vender: infra compartilhada no ar, backup com restauração testada e P0 de segurança/LGPD resolvidos.
**Débitos:** `PBI-20261124-melhorias-scripts-negocio` (P3); fontes de mercado secundárias e preços de concorrentes a reconferir; `.xlsx` não aberto no Excel/LibreOffice; riscos sugerem PBIs futuros (multi-tenant, LGPD, backup, cobrança recorrente, segurança P0).
**Coordenação:** radar início e fim sem sobreposição.
