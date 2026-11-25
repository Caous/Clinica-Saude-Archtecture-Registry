# Precificação

Margem bruta mínima: 60%
Aprovado por: Dono do produto (decisão da margem mínima, registrada em conversa) em 2026-11-24

> Produto: **Cuidaflux** (gestão para clínicas; entrada: fisioterapia; expansão: estética e pilates). Documento do PBI-20261124-publico-mercado-modelo-negocio (AC-6, T-12).
> **O que está aprovado e o que não está.** A aprovação acima cobre **somente a margem bruta mínima de 60%** (margem = (receita − custo variável) ÷ receita). **Preços, planos, add-ons e oferta de lançamento são PROPOSTA e aguardam aprovação do dono.**
> Regra do documento: todo número vem de `custos-referencia.md` (fonte lá citada), de `concorrentes.md` (preços públicos consultados em 2026-11-24) ou está marcado **hipótese**. Preços de concorrentes mudam (há promoções de Black Friday); trate como fotografia da data.
> Recursos "em breve" **não existem hoje**: tarefas agendadas (Hangfire), WhatsApp via Z-API, Google Agenda, prontuário e **IA no atendimento** (o bot de hoje é uma árvore de decisão no n8n, sem modelo de linguagem no registry). Não podem ser prometidos como prontos nem entram no preço como entregues.
> **Numeração de fases (vale para todos os documentos de negócio):** Fase 0 = Azure dedicado como hoje (só piloto ou "sob consulta", a partir de R$ 1.099); Fase 1 = servidor compartilhado entre implantações dedicadas (base dos planos de R$ 149 / R$ 319 / R$ 419); Fase 2 = multi-tenant (hipótese).

## Achado crítico (leia primeiro)

1. **A implantação dedicada no Azure como hoje não fecha 60% na faixa dos concorrentes.** Preço mínimo para 60%: Base R$ 1.051,28 e Conservador R$ 2.599,56 por clínica/mês (`custos-referencia.md`, seção 7), contra a faixa pública de R$ 38 a R$ 369,90 (`concorrentes.md`; Doctoralia, de R$ 420 a R$ 665, é a exceção). A verificação plano a plano abaixo confirma: com os preços propostos, o custo do Azure Base deixa a margem entre −164% e +28%.
2. **Só fecham 60% a preço competitivo duas arquiteturas:** (a) VPS compartilhado entre várias implantações (cada clínica com API e banco próprios, servidor dividido) e (b) multi-tenant (hipótese; depende de PBI futuro, risco R06).
3. **WhatsApp (Z-API, R$ 99,99 por canal) pesa tanto quanto o preço de entrada do mercado** e, sozinho, exigiria R$ 270 a R$ 280 por mês para manter 60%. Por isso fica **fora das mensalidades** e é tratado à parte (o cliente traz a própria conta ou paga add-on).
4. **R$ 99 para a clínica pequena só fecha 60% no cenário Enxuto** (servidor com promoção de 24 meses, 10 clientes por servidor, Vercel dividido por 20, gateway 1,5%, Evolution API, suporte mínimo), que é otimista. Na proposta de lançamento (Fase 1) o plano de entrada custa R$ 149; a meta de Fase 2 (multi-tenant) é R$ 109, não R$ 99. O cálculo do R$ 99 está na seção "Margens A/B/C".

## Modelo principal

**Decisão recomendada (o dono decide):** mensalidade fixa por clínica, em 3 faixas por número de profissionais, preço público, **sem fidelidade**; WhatsApp e IA ficam fora da mensalidade, como add-ons futuros ("em breve — confirmar antes de prometer"). Coerente com `modelo-negocio.md` (opção (a)+(e)) e com `icp-personas.md`.

**Qual arquitetura sustenta o preço, e quando:**

| Fase | Arquitetura | Quando | Preço que ela sustenta com 60% |
|---|---|---|---|
| 0 (hoje) | Azure dedicado (App Service + Azure SQL), 1 implantação por cliente | Só para o piloto dos primeiros 1 a 3 clientes (preço de piloto negociado, **margem abaixo de 60% declarada**, decisão explícita do dono) ou como oferta "sob consulta" a partir de R$ 1.099 | R$ 1.051 ou mais (`custos-referencia.md`) |
| 1 (lançamento) | **Servidores compartilhados entre implantações dedicadas**: um VPS por 4 a 10 clientes; cada clínica mantém contêiner de API e banco próprios (dados isolados, marca própria em `appsettings`) | Antes de abrir a venda pública. Exige, antes de vender: automação de implantação por contêiner, **backup externo com restauração testada (não existe hoje, R07)**, monitoramento e janela de manutenção conjunta | Tabela de preços proposta abaixo (R$ 149 / R$ 319 / R$ 419) |
| 2 (escala) | **Multi-tenant** (TenantId, isolamento por inquilino) | Quando houver cerca de 20+ clientes ou o suporte por implantação virar gargalo; PBI futuro (R06). Custo é hipótese C de `custos-referencia.md` | Tabela "meta pós multi-tenant" (R$ 109 / R$ 219 / R$ 299), hipótese |

Leituras e riscos que o dono deve ver:

- "Dedicado" no VPS compartilhado significa **API e banco próprios por clínica, não servidor próprio**. O argumento de "implantação dedicada" do posicionamento precisa dizer isso com precisão. Risco do VPS compartilhado: vizinho barulhento, manutenção conjunta, isolamento mais fraco que o Azure (`custos-referencia.md`, 2B).
- O Azure dedicado de verdade fica como **oferta sob consulta** (linha 4 da tabela), com preço a partir de R$ 1.099, para quem exigir isolamento de infraestrutura. Não é um plano competitivo; é honesto sobre o custo.
- Prometer multi-tenant ou VPS compartilhado antes de existir é risco comercial: a venda pública só abre quando a Fase 1 estiver no ar.

## Margens A/B/C

Preço mínimo por clínica/mês para cada margem: P = custo variável sem gateway ÷ (1 − margem − g), com g = taxa de gateway como percentual da receita (1,5% Enxuto, 3% Base e variações, 4,5% Conservador; `custos-referencia.md`, seção 5). **A decisão do dono é 60% (opção A).** B e C estão aqui só para mostrar o preço de cada exigência.

| Cenário de custo (R$/mês, sem gateway) | Custo | A: 60% (decisão) | B: 70% | C: 80% |
|---|---|---|---|---|
| Enxuto (VPS 10/servidor, Evolution API, sem IA) | 38,11 | 98,99 | 133,72 | 206,00 |
| Base (Azure B1 + SQL S0, Z-API, IA) | 388,97 | 1.051,27 | 1.440,63 | 2.288,06 |
| Conservador (Azure S1 + SQL S0, Z-API, IA, suporte alto) | 922,84 | 2.599,55 | 3.618,98 | 5.953,81 |
| VPS compartilhado (6/servidor, renovação) com Z-API | 216,02 | 583,84 | 800,07 | 1.270,71 |
| VPS compartilhado, sem WhatsApp na mensalidade | 116,03 | 313,59 | 429,74 | 682,53 |
| Multi-tenant (hipótese C) com Z-API | 153,36 | 414,49 | 568,00 | 902,12 |
| Multi-tenant (hipótese C), sem WhatsApp | 53,37 | 144,24 | 197,67 | 313,94 |

Diferenças de 1 a 2 centavos frente a `custos-referencia.md` (por exemplo R$ 1.051,28 contra 1.051,27; R$ 2.599,56 contra 2.599,55; R$ 313,60 contra 313,59; R$ 414,50 contra 414,49; R$ 144,26 contra 144,24) vêm de arredondamento. Os cenários Base e Conservador carregam R$ 1,37 e R$ 13,75 de IA como hipótese de custo ("por prudência"); IA não existe no produto hoje e, se for retirada, o preço mínimo desses cenários cai menos de 0,5%. Leitura:

- 70% e 80% empurram qualquer cenário Azure para R$ 1.440 a R$ 5.954: **inviável para competir**. Em VPS ou multi-tenant sem WhatsApp, 70% pede R$ 198 a R$ 430 e 80% pede R$ 314 a R$ 683: só faixa premium.
- Com 60%, a clínica pequena fica na faixa R$ 144 a R$ 314 (sem WhatsApp, multi-tenant ou VPS base). Só o cenário Enxuto chega a R$ 99.

## Tabela de preços (PROPOSTA — aguarda aprovação do dono)

Preços **por clínica**, por mês, em R$, sem fidelidade (proposta: mensalidade mês a mês e sem multa; **cancelamento por solicitação ao suporte, a confirmar**: o sistema não tem cobrança recorrente nem tela de cancelamento hoje). Faixas por nº de profissionais (profissional = quem tem agenda própria).

### Planos (lançamento, Fase 1: VPS compartilhado)

| Plano | Profissionais | Mensalidade (R$) | Implantação (taxa; lista) | Implantação no lançamento |
|---|---|---|---|---|
| **Essencial** | 1 a 2 | 149,00 | R$ 0 (hipótese: onboarding remoto de cerca de 2 h) | R$ 0 |
| **Clínica** | 3 a 6 | 319,00 | R$ 290 (hipótese: cerca de 5 h de implantação e treinamento a R$ 40/h = R$ 200 de custo) | R$ 0 |
| **Dedicado** | 7 a 12 | 419,00 | R$ 590 (hipótese: cerca de 10 h = R$ 400 de custo) | R$ 0 |
| Azure dedicado (sob consulta) | acima de 12, ou exigência de isolamento de infraestrutura | a partir de 1.099,00 | sob consulta | sob consulta |

**O que inclui** (no estado atual do sistema, sem prometer o roadmap):

- Todos os planos: agenda, cadastro de pacientes, sessões, financeiro, portal do paciente, notificações (e-mail), insights; marca própria da clínica; implantação com API e banco próprios; suporte por e-mail.
- **Backup: pré-requisito da Fase 1 (a implantar antes de vender), não existe hoje.** O registry não define política de backup, RPO/RTO nem teste de restauração (R07 em `riscos-prerequisitos.md`). Só pode ser listado como entregue depois que existir e for testado; o custo de R$ 2 a R$ 5 por cliente já está na margem por prudência.
- Essencial: 1 filial; 3 usuários de recepção/administrativo (hipótese).
- Clínica: 1 filial; 6 usuários.
- Dedicado: 2 filiais; 12 usuários; suporte prioritário.
- **Em breve (não vendido como pronto):** lembretes e tarefas agendadas (Hangfire), WhatsApp (Z-API), Google Agenda, prontuário e **IA no atendimento (em breve — confirmar antes de prometer; hoje não existe e não está em nenhum plano)**. Serão incluídos nos planos quando existirem, sem reajuste (a decisão de incluir é do dono; o custo do WhatsApp **não** está nas mensalidades).
- Proposta: sem fidelidade e sem taxa de cancelamento. Exportação dos dados ao sair: **a confirmar** (hoje só há exportação CSV/XLSX dos insights; exportação completa mediante pedido ao suporte seria hipótese).

### Add-ons (PROPOSTA)

| Add-on | Preço (R$/mês) | Observação |
|---|---|---|
| WhatsApp, **traga sua conta** (cliente contrata a Z-API no próprio nome e conecta) | R$ 0 para a clínica (custo da Z-API por conta dela, R$ 99,99 por canal, `custos-referencia.md`) | Em breve. Opção recomendada: não pesa na margem. Risco de banimento do número por ser conexão não oficial (hipótese, `custos-referencia.md` seção 3) |
| WhatsApp **gerenciado** (Cuidaflux contrata e opera 1 canal Z-API) | 279,00 | Em breve. Mínimo para 60% é R$ 270; não é competitivo (iClinic cobra WhatsApp a partir de R$ 29,90 por 85 mensagens). Existe para quem quer tudo resolvido |
| IA no atendimento (add-on **futuro**; hipótese) | 39,00 por pacote de 5.000 mensagens | **Em breve — confirmar antes de prometer.** Não existe no produto. Custo de referência com tokens em dobro: R$ 13,75 (`custos-referencia.md`, seção 4), só hipótese |
| Filial extra | 69,00 | Hipótese de custo: 0,5 h de suporte + backup |
| Usuário extra | 19,00 | Hipótese de custo: R$ 2 por mês de suporte marginal |

**Alternativa que o dono pode escolher (fora da regra de 60%):** WhatsApp gerenciado a R$ 149 por canal (margem de cerca de 23%, ver verificação). Faz o produto ficar competitivo no recurso que o mercado cobra à parte, mas **dilui a margem bruta total** e precisa de decisão explícita do dono, porque quebra a regra de margem mínima no add-on.

### Verificação de margem plano a plano (calculada com `scripts/modelo-financeiro.mjs`)

Método: custo variável do plano = soma dos componentes de `custos-referencia.md` (premissas na seção "Premissas e hipóteses") + gateway de 3% da receita; margem por `avaliarMargemBruta` com mínimo de 60%. Cenário de custo declarado: **VPS compartilhado, preço de renovação do servidor (R$ 149,99 por KVM 4), Essencial 10 por servidor, Clínica 6, Dedicado 4, Vercel Pro dividido por 10 clientes, gateway 3%**. Todos os valores em R$/mês; custo fixo = sem gateway.

**Planos propostos, Fase 1 (cenário VPS compartilhado):**

| Plano | Receita | Custo sem gateway | Gateway (3%) | Custo variável | Margem bruta | Passa 60% |
|---|---|---|---|---|---|---|
| Essencial | 149,00 | 52,22 | 4,47 | 56,69 | 62,0% | sim |
| Clínica | 319,00 | 111,33 | 9,57 | 120,90 | 62,1% | sim |
| Dedicado | 419,00 | 143,83 | 12,57 | 156,40 | 62,7% | sim |

Composição do custo sem gateway: Essencial = infra 15,00 + Vercel 12,22 + backup 2,00 + monitoramento 3,00 + suporte 20,00 (0,5 h). Clínica = infra 25,00 + Vercel 12,22 + backup 5,00 + e-mail 6,11 + monitoramento 3,00 + suporte 60,00 (1,5 h). Dedicado = infra 37,50 + Vercel 12,22 + backup 5,00 + e-mail 6,11 + monitoramento 3,00 + suporte 80,00 (2 h). **Sem custo de IA** (IA não existe no produto e não está nos planos; a versão anterior desta tabela reservava R$ 1,37 e R$ 2,74 de IA, o que dava 61,7% e 62,0% no Clínica e no Dedicado). O custo de backup entra como hipótese, embora o backup ainda não exista.

As margens ficam a só 2,0 a 2,7 pontos acima do mínimo: **qualquer deslize de suporte, de densidade dos servidores ou de câmbio derruba o plano abaixo de 60%.** E nada disso conta imposto (seção própria abaixo).

**Os mesmos preços no Azure dedicado (cenário Base, como hoje) NÃO fecham 60%:**

| Plano | Receita | Custo sem gateway | Custo variável | Margem bruta | Passa 60% |
|---|---|---|---|---|---|
| Essencial (Azure, com Z-API) | 149,00 | 388,97 | 393,44 | −164,1% | NÃO |
| Clínica (Azure, com Z-API) | 319,00 | 388,97 | 398,54 | −24,9% | NÃO |
| Dedicado (Azure, com Z-API) | 419,00 | 388,97 | 401,54 | 4,2% | NÃO |
| Essencial (Azure, sem WhatsApp) | 149,00 | 288,98 | 293,45 | −96,9% | NÃO |
| Clínica (Azure, sem WhatsApp) | 319,00 | 288,98 | 298,55 | 6,4% | NÃO |
| Dedicado (Azure, sem WhatsApp) | 419,00 | 288,98 | 301,55 | 28,0% | NÃO |

Custo Azure sem WhatsApp = infra 197,95 + Vercel 12,22 + domínio 3,33 + backup 5,00 + e-mail 6,11 + IA 1,37 + monitoramento 3,00 + suporte 60,00 = 288,98 (os R$ 1,37 de IA vêm do cenário Base de `custos-referencia.md`, mantidos por prudência apenas neste cálculo do Azure; as tabelas da Fase 1 e da Fase 2 não têm IA; sem eles a margem muda menos de 0,5 ponto e nenhum plano passa a fechar); com Z-API soma 99,99 (388,97, igual ao cenário Base). **Para vender no Azure dedicado, é preciso cobrar a partir de R$ 1.051 (R$ 1.099 passa com 61,6%).** Nenhum plano competitivo fecha lá; o dono não precisa escolher entre "ajustar o número" e "migrar": só a migração resolve.

**Linha sob consulta e add-ons:**

| Item | Receita | Custo variável | Margem bruta | Passa 60% |
|---|---|---|---|---|
| Azure dedicado sob consulta (custo Base com Z-API) | 1.099,00 | 421,94 | 61,6% | sim |
| WhatsApp gerenciado | 279,00 | 108,36 | 61,2% | sim |
| WhatsApp gerenciado (alternativa, sem aprovação do dono) | 149,00 | 114,46 | 23,2% | NÃO |
| IA no atendimento, add-on futuro (pacote de 5.000 mensagens; hipótese) | 39,00 | 14,92 | 61,7% | sim |
| Filial extra | 69,00 | 24,07 | 65,1% | sim |
| Usuário extra | 19,00 | 2,57 | 86,5% | sim |

O custo variável do WhatsApp gerenciado a R$ 279 é R$ 99,99 + 3% de gateway (R$ 8,37); a alternativa de R$ 149 soma R$ 10 de suporte (0,25 h, hipótese).

**Meta pós multi-tenant (Fase 2; HIPÓTESE, depende da hipótese C de `custos-referencia.md`):**

| Plano | Receita | Custo sem gateway | Gateway (3%) | Custo variável | Margem bruta | Passa 60% |
|---|---|---|---|---|---|---|
| Essencial | 109,00 | 36,11 | 3,27 | 39,38 | 63,9% | sim |
| Clínica | 219,00 | 71,33 | 6,57 | 77,90 | 64,4% | sim |
| Dedicado | 299,00 | 91,33 | 8,97 | 100,30 | 66,5% | sim |

Premissas da Fase 2 (todas hipótese): infra por cliente R$ 8 (Essencial) e R$ 15 (demais); Vercel R$ 6,11 no Essencial (dividido por 20) e R$ 12,22 nos demais; suporte de 0,5 h, 0,75 h e 1,25 h (R$ 20, R$ 30 e R$ 50); sem monitoramento rateado no Essencial; sem custo de IA (como na Fase 1). Esses preços **não** valem até o multi-tenant existir e ser medido.

**Efeito do ponto de partida mais barato (Essencial em R$ 99, cenário otimista, hipótese):** servidor no preço promocional de 24 meses (infra R$ 6), Vercel dividido por 20 (R$ 6,11), backup R$ 2, suporte R$ 20 e gateway 1,5% dão custo de R$ 35,60 e margem de 64,0%. **Mas** se o servidor estiver na renovação (infra R$ 15, Vercel R$ 12,22, monitoramento R$ 3, gateway 3%), R$ 99 dá margem de 44,3%, R$ 129 dá 56,5% e R$ 139 dá 59,4%: **todos reprovam.** O Essencial só fica a R$ 149 no lançamento.

**Indicadores unitários por plano (LTV e payback, `calcularCenarios`; churn 4% ao mês e CAC de R$ 800 são hipóteses; cenário conservador: churn ×1,5, CAC ×1,3):**

| Plano | LTV base (R$) | Payback base (meses) | LTV conservador (R$) | Payback conservador (meses) |
|---|---|---|---|---|
| Essencial | 2.307,75 | 8,67 | 1.538,50 | 11,27 |
| Clínica | 4.952,50 | 4,04 | 3.301,67 | 5,25 |
| Dedicado | 6.565,00 | 3,05 | 4.376,67 | 3,96 |

O Essencial é o plano mais frágil: payback de 8,7 a 11,3 meses com churn de clínica pequena. Convém priorizar a venda do Clínica.

## Posicionamento contra o mercado

Fonte dos preços: `concorrentes.md` (2026-11-24), salvo indicado. Comparação para uma clínica de 1, 3 e 5 profissionais. Onde a base de cobrança não é confirmada, está dito.

| Concorrente | 1 profissional | 3 profissionais | 5 profissionais | Observação (fonte: `concorrentes.md`) |
|---|---|---|---|---|
| **Cuidaflux (proposta)** | **R$ 149** (Essencial) | **R$ 319** (Clínica) | **R$ 319** (Clínica) | Preço por clínica; sem fidelidade; WhatsApp à parte (em breve) |
| iClinic (por profissional, todos no mesmo plano) | R$ 99 a R$ 299 | R$ 297 a R$ 897 | R$ 495 a R$ 1.495 | Starter 99, Plus 129, Pro 169, Premium 299; WhatsApp a partir do Plus; cálculo = preço × profissionais (base de cobrança do `concorrentes.md`) |
| Shosp | R$ 149 | R$ 447 | R$ 745 | "a partir de" por prestador, tabela publicada na página do iClinic |
| Clinicorp (odontologia) | R$ 149,90 a R$ 369,90 | R$ 149,90 a R$ 369,90 | R$ 149,90 a R$ 369,90 | Usuários ilimitados; só odontologia |
| Simples Dental (odontologia) | R$ 149,90 a R$ 349,90 | igual | igual | Preço de lista; promoção anual menor; só odontologia |
| Dental Office (odontologia) | R$ 39,90 a R$ 298,54 | idem | idem | Por faixa de usuários e dentistas; só odontologia |
| ProDoctor | R$ 135 | não confirmado | não confirmado | "a partir de"; base e periodicidade não confirmadas |
| Trinks (estética) | R$ 38 a R$ 55 | R$ 55 a R$ 79 | R$ 103 a R$ 146 | Duas tabelas sem rótulo mensal/anual; prontuário limitado (anamnese); WhatsApp à parte |
| Booksy (estética) | R$ 99,99 | R$ 139,99 (hipótese: R$ 20 por agenda extra) | R$ 179,99 (idem) | Sem prontuário clínico; sem WhatsApp declarado |
| Secretaria.io | R$ 197 | não é plano de clínica | não é plano de clínica | Só secretária no WhatsApp para autônomos |
| Doctoralia | a partir de R$ 420,42 | idem | idem | Anual, valor ambíguo; modelo de captação |
| Amplimed, Ninsaúde, Feegow, AgendaPro, Doutore | não confirmado | não confirmado | não confirmado | Preço não público |

Faixas do iClinic: mínimo = Starter × n; máximo = Premium × n.

**Leitura honesta:**

- **Clínica de 3 a 5 profissionais (alvo do ICP, `icp-personas.md`): o preço fixo ganha a partir de 4 profissionais; em 3 profissionais é equivalente.** Contra iClinic Starter por profissional: em 3 profissionais R$ 297 (abaixo dos R$ 319 do Cuidaflux), em 4 R$ 396 e em 5 R$ 495 (acima dos R$ 319). Contra iClinic Plus (já inclui WhatsApp): R$ 387 (3), R$ 516 (4) e R$ 645 (5). Shosp: R$ 447 a R$ 745 (3 a 5). Não vence Clinicorp Standard nem Simples Dental Basic (R$ 149,90), mas esses são de odontologia e têm prontuário e WhatsApp maduros, que o Cuidaflux ainda não tem.
- **Clínica de 1 profissional (autônomo): o preço não é o mais baixo.** R$ 149 fica acima de iClinic Starter (R$ 99), Booksy (R$ 99,99) e Trinks (R$ 38 a R$ 55), no nível de Clinicorp Standard (R$ 149,90). Esses concorrentes ou não têm prontuário (Booksy, Trinks) ou cobram por profissional. O argumento para o autônomo é diferenciação (portal do paciente, financeiro de planos de sessões), não preço. Se o dono quiser R$ 99 no autônomo, depende do multi-tenant.
- **Preços públicos e sem fidelidade são diferenciais frente a Amplimed, ProDoctor, Ninsaúde, Feegow e AgendaPro** (preço opaco ou sem base de cobrança, `concorrentes.md`).
- **A proposta não ganha de ninguém em preço bruto.** O argumento é preço fixo por clínica (não cresce a cada profissional, e a partir de 4 profissionais costuma sair melhor), preço público e proposta sem fidelidade; IA no atendimento é "em breve" e não entra no argumento; o WhatsApp é o recurso em que os concorrentes cobram à parte e onde o Cuidaflux, por custo da Z-API, também não consegue dar de graça com margem de 60%.
- Faixa a testar do ICP: R$ 150 a R$ 450 por clínica (`icp-personas.md`). Os três planos (R$ 149, R$ 319, R$ 419) caem nessa faixa.

## Oferta de lançamento (proposta)

Hipótese de oferta, para o dono decidir; não altera a margem mínima de 60%, mas reduz a receita dos primeiros meses.

- **Primeiros 10 clientes (hipótese de N):** implantação grátis (R$ 0 em vez da taxa de lista de R$ 290 a R$ 590) e **preço travado por 12 meses** nos valores da tabela. A taxa de implantação é custo único e não entra na margem mensal, mas custa horas reais (de R$ 80 a R$ 400 por cliente, hipótese).
- **Clientes-fundadores:** nos 5 primeiros, 1 mês grátis em troca de depoimento e uso do nome da clínica (com consentimento por escrito). O mês grátis tem custo variável integral (margem negativa naquele mês).
- **Sem fidelidade para todos** (proposta). Cancelamento por solicitação ao suporte e exportação dos dados mediante pedido: **hipótese a confirmar** (o sistema não tem cobrança recorrente nem tela de cancelamento, e só exporta CSV/XLSX de insights).
- **Rotina de preço:** no multi-tenant (Fase 2) quem entrou na oferta mantém o preço travado mesmo se a tabela cair; quem pagar tabela cheia deve receber a redução. Isso evita punir o cliente antigo.
- **Condição:** a oferta só abre quando a Fase 1 (VPS compartilhado) estiver operando e os recursos vendidos estiverem prontos. Enquanto Z-API, Hangfire, Google Agenda, IA e prontuário forem "em breve", a oferta usa o texto "em breve", sem data prometida.

## Premissas e hipóteses

Todas abaixo são **hipótese** salvo quando indicada a fonte. Nenhuma foi medida em operação real.

| Item | Valor | Marcação |
|---|---|---|
| Margem bruta mínima | 60% | **decisão do dono, 2026-11-24** |
| Câmbio efetivo | USD 1 = R$ 6,11 (inclui IOF de 3,5%) | fonte: `custos-referencia.md`, seção 1; IOF é hipótese |
| Servidor VPS | KVM 4 a R$ 149,99/mês na renovação (R$ 59,99 só no contrato promocional de 24 meses) | fonte: `custos-referencia.md`, seção 2B |
| Clientes por servidor | 10 (Essencial), 6 (Clínica), 4 (Dedicado) | hipótese; não testado; depende de RAM por API (0,5 GB, hipótese) e SQL Server Express (teto de 10 GB por banco, hipótese) |
| Vercel Pro dividido por 10 clientes | R$ 12,22 | preço fonte; divisão hipótese. No lançamento, com poucos clientes, o rateio será maior (R$ 122,19 ÷ 5 = R$ 24,44) e a margem do Essencial e do Clínica cai |
| Suporte | R$ 40/h; 0,5 h, 1,5 h e 2 h por mês por plano | hipótese |
| Backup externo, monitoramento, e-mail | R$ 2 a R$ 5; R$ 3; R$ 0 a R$ 6,11 | hipótese (`custos-referencia.md`, seção 6); **o backup não existe hoje** (R07): pré-requisito da Fase 1 |
| Gateway (Pix/cartão) | 3% da receita | hipótese de mistura; taxas públicas na seção 5 de `custos-referencia.md` |
| IA (add-on futuro; **não incluída nos planos**) | R$ 1,37 por 1.000 mensagens em Haiku 5.5; 5.000 mensagens com tokens em dobro = R$ 13,75 | preço de lista fonte; volume e tokens hipótese; IA não existe no produto (bot n8n é árvore de decisão) |
| Z-API | R$ 99,99 por canal (plano Omni); Partner R$ 89,99 com 10 canais | fonte: `custos-referencia.md`, seção 3; risco de bloqueio do número é hipótese |
| Multi-tenant (Fase 2) | infra R$ 8 a R$ 15 por cliente; suporte de 0,5 a 1,25 h | hipótese C; sem arquitetura implementada |
| Mix de planos para o modelo financeiro | 50% Essencial, 40% Clínica, 10% Dedicado | hipótese |
| Churn mensal | 4% (3% a 5%) | blog (SaaStr, citado em `modelo-negocio.md`); churn de clínica pequena é hipótese |
| CAC | R$ 800 | hipótese sem fonte (CAC de SaaS de saúde no Brasil não pesquisado) |
| Custo fixo mensal do negócio | R$ 5.000 | hipótese sem fonte; pró-labore e marketing fora |
| Leads por mês e conversão | 20 e 15% | hipótese |
| Implantação (horas) | 2 h, 5 h, 10 h | hipótese |
| Faixas por profissional (1–2, 3–6, 7–12) | — | hipótese; casa com Trinks (1–2, 3–4, 5–10) e o ICP de 3 a 10 profissionais |

O arquivo `scripts/modelo-financeiro.premissas-cuidaflux.json` guarda as premissas BASE da proposta (ARPA R$ 244 e custo variável por cliente R$ 92,35, médias ponderadas pelo mix acima e já sem custo de IA, margem bruta média 62,2%; antes era R$ 93,17 e 61,8%).

## Impostos e taxas fora da conta

A margem de 60% desta proposta é **receita − custo variável de infraestrutura, WhatsApp, IA, suporte e gateway**, a definição do dono. Ela **não** desconta:

- **Imposto sobre a receita** (Simples Nacional, ISS, PIS/Cofins ou o regime que valer para o Cuidaflux): reduz a margem real em pontos percentuais da receita. Alíquota não pesquisada (hipótese de que seja da ordem de um dígito a poucos pontos percentuais; **a definir com contador**). Com margens de só 2,0 a 2,7 pontos acima de 60%, **um imposto de poucos pontos já leva a margem líquida de imposto abaixo de 60%**.
- **Nota fiscal:** emissão e eventual custo de sistema de NFS-e.
- **Taxa de implantação:** é receita única e custo único (horas de implantação e treinamento); fora da mensalidade, ela alivia o caixa dos primeiros meses mas não corrige margem recorrente. Na oferta de lançamento ela vira R$ 0 e **aumenta o custo de aquisição**.
- **Custo fixo:** salários, marketing, licenças, contador, jurídico e encarregado de dados (LGPD) ficam fora da margem bruta; entram no ponto de equilíbrio do modelo financeiro (hipótese de R$ 5.000 por mês).
- **Inadimplência e estorno (chargeback) de cartão:** não incluídos.
- **Antecipação de recebíveis do gateway** (1,25% ao mês no Asaas): não incluída.

Conclusão para o dono: se a regra de 60% for aplicada **depois do imposto**, os preços propostos precisam subir ou o custo cair; isso deve ser decidido antes de publicar a tabela.

## Como validar

Cada teste tem hipótese falsificável, critério de sucesso e prazo. Nenhum envolve dados reais de pacientes.

1. **Teste de preço do plano Clínica (R$ 319) em entrevistas com 10 donas de clínica de fisioterapia (3 a 10 profissionais).** Mostrar a tabela sem o nome do concorrente e perguntar o preço "caro demais", "barato demais" e "em que faixa compraria" (método de sensibilidade de preço). Sucesso: mais de metade aceita R$ 319 como "justo ou barato". Falha: a maioria cita R$ 200 ou menos, o que pede multi-tenant antes do lançamento.
2. **Teste A/B do plano de entrada (R$ 149 contra R$ 129) em página de preços e lista de espera.** Hipótese: a conversão em R$ 149 não é menor que em R$ 129 em mais de 20% relativos (a R$ 129 a margem real é de 56,5%, abaixo do mínimo). Só publicar R$ 129 se os custos medidos (Fase 1) fecharem 60%.
3. **Pré-venda de 5 clientes-fundadores com preço travado** (oferta de lançamento). Sucesso: 5 de 15 conversas qualificadas aceitam pagar. Mede conversão, objeções de WhatsApp e se querem "traga sua conta" ou o gerenciado.
4. **Medir o custo real nas primeiras 3 implantações em VPS compartilhado:** horas de suporte por cliente, RAM por API, clientes por servidor (e, se um add-on de IA vier a existir, tokens por mensagem). Sucesso: custo variável medido de cada plano dentro de 10% da tabela de verificação. Se a medição passar o limite, recalcular com `scripts/modelo-financeiro.mjs` e refazer a tabela.
5. **Teste de WhatsApp como add-on:** oferecer "traga sua conta" e "gerenciado a R$ 279" a 10 clínicas. Sucesso: pelo menos 30% escolhem "traga sua conta" ou "gerenciado" sem pedir desconto. Falha: a maioria só quer WhatsApp incluso, o que obriga a decidir entre margem menor no add-on ou preço de mensalidade mais alto.
