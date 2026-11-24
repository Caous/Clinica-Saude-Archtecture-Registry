---
id: PBI-20261124-publico-mercado-modelo-negocio
tipo: feature
titulo: Definir público-alvo, análise de mercado e modelo de negócio da plataforma para clínicas
status: backlog
prioridade: alta
workspaces: [architecture-registry]
criado_em: 2026-11-24
---

# Definir público-alvo, análise de mercado e modelo de negócio da plataforma para clínicas

## Contexto de Negócio
- **Objetivo:** documentar para quem vender, como vender e como precificar. Entregar ICP por nicho, mapa de mercado e concorrentes, modelo de receita escolhido, plano de go-to-market, script de venda e metas financeiras. Métrica: plano aprovado com preço, meta de MRR dos primeiros 12 meses e funil com taxas-alvo.
- **Persona:** dono do produto (decisor); futuro time comercial; clínicas pequenas e médias e profissionais autônomos (formais e informais) de múltiplos nichos.
- **Jornada atual:** sistema funcional herdado de uma clínica de fisioterapia, sem estratégia de venda, preço nem público definido.
- **Jornada desejada:** estratégia documentada e testável, com primeiro nicho de entrada escolhido, proposta comercial e material de venda.
- **Dependências:** PBI-1 (demo sem marca de terceiro). Coordenar com PBI-2 (posicionamento). Pré-requisitos técnicos do modelo SaaS (multi-tenant, LGPD, cobrança recorrente) viram PBIs próprios depois.

## User Story
Como dono do produto, quero público, mercado e modelo de negócio definidos e documentados, para que eu venda a plataforma de forma previsível, com receita recorrente e foco no nicho certo.

## Critérios de Aceite
- **AC-1** — DADO os nichos candidatos (fisioterapia, estética, odontologia, medicina geral/especialidades, psicologia, nutrição, fonoaudiologia, estúdios de pilates/bem-estar, veterinária, podologia, profissionais autônomos informais), QUANDO avalio cada um, ENTÃO existe matriz com tamanho de mercado (fonte citada), dor principal, ticket possível, adequação do sistema atual (módulos que já atendem vs. lacunas) e nota final.
- **AC-2** — DADO a matriz, QUANDO escolho, ENTÃO há 1 nicho de entrada e 1–2 de expansão, justificados.
- **AC-3** — DADO o nicho de entrada, QUANDO crio o ICP e as personas, ENTÃO documento traz perfil (porte, nº de profissionais, ferramentas atuais), dores, gatilhos de compra, objeções e critérios de decisão.
- **AC-4** — DADO ao menos 8 concorrentes, QUANDO analiso, ENTÃO há comparativo de funcionalidades, preços, modelo de cobrança, pontos fortes/fracos e espaço de diferenciação (inclui IA, WhatsApp e agendamento como candidatos).
- **AC-5** — DADO os modelos candidatos, QUANDO comparo, ENTÃO há análise de pelo menos: (a) SaaS com implantação + mensalidade, (b) licença perpétua/on-premise, (c) híbrido, (d) revenda/white-label via parceiros, (e) add-on de IA por consumo, cada um com receita, custo, risco, esforço técnico e adequação ao porte do cliente.
- **AC-6** — DADO a comparação, QUANDO decido, ENTÃO modelo principal e planos/tabela de preços (implantação, mensalidade por faixa, add-ons) estão documentados com premissas.
- **AC-7** — DADO as premissas, QUANDO modelo as finanças, ENTÃO planilha traz CAC, LTV, churn, payback, margem, ponto de equilíbrio e cenários (conservador/base/otimista) para 12 meses.
- **AC-8** — DADO o ICP e o modelo, QUANDO monto o go-to-market, ENTÃO documento traz canais (indicação, parcerias com conselhos/associações/fornecedores, WhatsApp, redes, anúncios, conteúdo), funil com taxas-alvo, oferta de lançamento e plano de 90 dias.
- **AC-9** — DADO o funil, QUANDO escrevo o material comercial, ENTÃO existem script de prospecção, roteiro de demonstração, tratamento de objeções, proposta comercial modelo e FAQ.
- **AC-10** — DADO o plano, QUANDO reviso riscos, ENTÃO há lista de pré-requisitos técnicos e regulatórios do modelo (multi-tenant, LGPD para dado de saúde, cobrança recorrente, suporte, SLA) com PBIs futuros sugeridos.
- **AC-11** — DADO todos os documentos, QUANDO publico, ENTÃO ficam em `Architecture-Registry/context/negocio/` e são referenciados no registry.

## Regras de Negócio
- Todo número de mercado e preço de concorrente cita fonte e data; o que for estimativa fica marcado como hipótese.
- Dados de saúde são dados sensíveis (LGPD): o plano trata compliance como requisito de venda, não opcional.
- Preço deve cobrir custo de infraestrutura e de IA por cliente com margem mínima definida pelo dono (premissa a registrar).
- O modelo precisa permitir implantação rápida para clínicas pequenas e profissionais autônomos.
- Decisão de modelo e preço é do dono do produto; o agente recomenda com números.

## Cenários de Teste Unitário
> Verificações automatizáveis sobre os artefatos (planilha financeira e checklist de documentos).

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-7 | LTV | ARPA 300, margem 70%, churn 3%/mês | LTV = 7.000 |
| UT-2 | AC-7 | Payback | CAC 1.200, margem mensal 210 | ≈ 5,7 meses |
| UT-3 | AC-7 | Ponto de equilíbrio | custo fixo 15.000, margem unitária 210 | ≈ 72 clientes |
| UT-4 | AC-7 | Churn zero | churn = 0 | cálculo sinaliza premissa inválida, sem divisão por zero |
| UT-5 | AC-1 | Matriz de nichos | nichos listados | todos têm as colunas e nota preenchidas |

## Cenários de Teste Funcional / E2E

| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-6/AC-9 | Simular a venda de ponta a ponta usando script, demo e proposta modelo com um profissional do nicho de entrada | Cliente entende preço, plano e próximos passos; objeções mapeadas |
| FT-2 | AC-7 | Alterar premissa de churn na planilha | LTV, payback e cenários recalculam |
| FT-3 | AC-11 | Navegar `context/negocio/` no GitHub | Documentos navegáveis e linkados no registry |

## Requisitos Técnicos
- **Tipo de mudança:** nova feature (documentação estratégica e planilha)
- **APIs/contratos:** n/a. Entregas: `mercado.md`, `concorrentes.md`, `icp-personas.md`, `modelo-negocio.md`, `precificacao.md`, `go-to-market.md`, `script-vendas.md`, `modelo-financeiro.xlsx`.
- **Requisitos não-funcionais:** fontes citadas e datadas; linguagem comercial clara em PT-BR.
- **Riscos técnicos:** o sistema hoje parece single-tenant (a confirmar), o que limita o SaaS; compliance LGPD/CFM/CRO por nicho; concorrentes consolidados no Brasil (a levantar na pesquisa); suposições de preço não validadas com clientes reais.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos
