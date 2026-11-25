# Negócio — público, mercado e modelo (Cuidaflux)

> Estado em 2026-11-24: **rascunho completo para leitura e aprovação do dono.** Os preços, a oferta de lançamento e o roteiro de demo são **PROPOSTAS** (a única decisão do dono já registrada é a margem bruta mínima de 60% e a ordem de nichos). O que ainda não existe no produto (prontuário, IA no atendimento, Z-API, Google Agenda, Hangfire, TISS, backup padronizado) aparece sempre como "em breve" ou "a implantar antes de vender".

**Resumo em 6 linhas**

1. **Nicho de entrada:** fisioterapia; expansão: estética e estúdios de pilates/bem-estar.
2. **Modelo:** mensalidade fixa por clínica em faixas, preço público, proposta sem fidelidade (cancelamento e exportação de dados: a confirmar), implantação dedicada por cliente (API e banco próprios). Fases: **Fase 0** = Azure dedicado de hoje (só piloto ou sob consulta, a partir de R$ 1.099); **Fase 1** = servidor compartilhado entre implantações dedicadas; **Fase 2** = multi-tenant.
3. **Achado crítico:** a implantação dedicada em Azure (Fase 0, ≈ R$ 389/mês de custo por cliente) não fecha 60% de margem na faixa dos concorrentes (R$ 38 a R$ 369,90; Doctoralia R$ 420 a R$ 665 é exceção); só servidor compartilhado entre implantações (Fase 1) ou multi-tenant (Fase 2) fecham.
4. **Planos propostos (Fase 1; margem de 62,0% a 62,7%, sem custo de IA):** Essencial R$ 149, Clínica R$ 319, Dedicado R$ 419; WhatsApp (em breve) e IA (em breve) fora das mensalidades. Em 3 profissionais o preço é equivalente ao iClinic Starter por profissional (R$ 297); a partir de 4 o preço fixo costuma sair melhor.
5. **Financeiro (hipóteses):** equilíbrio em ~33 clientes; o ano 1 ainda tem margem negativa nos três cenários por causa do CAC.
6. **Antes de vender:** infraestrutura compartilhada no ar, backup com restauração testada (não existe hoje, R07) e pendências P0 de segurança e LGPD resolvidas.

## Documentos

| Documento | O que tem |
|---|---|
| [mercado.md](mercado.md) | matriz de 11 nichos com nota e fontes, critérios e decisão de nicho |
| [concorrentes.md](concorrentes.md) | 15 concorrentes: funcionalidades, preço público, cobrança, pontos fortes e fracos, espaço de diferenciação |
| [icp-personas.md](icp-personas.md) | ICP e 3 personas de fisioterapia, insights para vendas |
| [modelo-negocio.md](modelo-negocio.md) | os 5 modelos (SaaS, licença, híbrido, revenda, IA por consumo) e a recomendação |
| [custos-referencia.md](custos-referencia.md) | custo variável por cliente (infra, WhatsApp, gateway, suporte; IA só como hipótese de add-on futuro) e preço mínimo para 60% |
| [precificacao.md](precificacao.md) | margens A/B/C, planos, add-ons, verificação de margem plano a plano (coluna "Passa 60%"), posicionamento e oferta de lançamento (PROPOSTA) |
| [modelo-financeiro.xlsx](modelo-financeiro.xlsx) | planilha com Premissas e 3 cenários × 12 meses (gerada por `scripts/modelo-financeiro.mjs`) |
| [go-to-market.md](go-to-market.md) | canais, funil (hipóteses), oferta de lançamento, plano de 90 dias, metas e indicadores |
| [script-vendas.md](script-vendas.md) | prospecção, qualificação, descoberta, follow-up e fechamento |
| [demo-roteiro.md](demo-roteiro.md) | roteiro de demonstração de 30 minutos em 11 passos |
| [objecoes-faq.md](objecoes-faq.md) | 12 objeções com resposta, 18 perguntas frequentes e checklist de validação do dono |
| [proposta-modelo.md](proposta-modelo.md) | proposta comercial modelo com placeholders |
| [riscos-prerequisitos.md](riscos-prerequisitos.md) | 14 riscos e pré-requisitos com PBI sugerido |

## Verificação

```
node scripts/check-negocio.mjs .
```

(rodar na raiz do `Architecture-Registry`). O modelo financeiro se regera com `node scripts/modelo-financeiro.mjs --premissas scripts/modelo-financeiro.premissas-cuidaflux.json --out context/negocio/modelo-financeiro.xlsx`.

## Pendências do dono

- Aprovar a tabela de preços, os add-ons e a oferta de lançamento (`precificacao.md`).
- Decidir se os 60% de margem valem antes ou depois dos impostos.
- Checklist de validação do FT-1 (`objecoes-faq.md`).
- Decisões em aberto de WhatsApp (provedor), cancelamento e exportação de dados (hoje sem suporte no sistema), cobrança recorrente, backup (pré-requisito da Fase 1), suporte e SLA, e se a IA no atendimento entra no roadmap e como add-on.
- Reconsultar fontes de mercado (conselhos) e conferir os preços de concorrentes antes de usar em material comercial.
