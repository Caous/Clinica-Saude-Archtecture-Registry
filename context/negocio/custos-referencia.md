# Custos de referência por cliente

> Base para o preço do Cuidaflux (PBI `PBI-20261124-publico-mercado-modelo-negocio`, AC-6 e AC-7). Preços públicos consultados em **2026-11-24** e resumidos em palavras próprias; cada número vem marcado como **fonte** (com URL) ou **hipótese**. Nada do projeto ou de usuários foi enviado a serviços externos (só consultas públicas de preço). Preços mudam com frequência (há promoções de Black Friday em vigor); trate como fotografia da data. Margem alvo: bruta de 60% = (receita − custo variável) ÷ receita. Concorrentes em `context/negocio/concorrentes.md`.

## 1. Premissas e câmbio

| Item | Valor | Marcação |
|---|---|---|
| Cotação USD/BRL | 1 USD = R$ 5,9031 (compra) em 2026-11-24 16:56 | fonte: https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL (cotação de mercado, não o câmbio do cartão) |
| Cotação EUR/BRL | 1 EUR = R$ 6,4698 em 2026-11-24 16:51 | fonte: mesma URL |
| IOF em compra internacional no cartão | +3,5% sobre USD/EUR | **hipótese** (alíquota conhecida de 2025; não reconfirmada hoje) |
| **Câmbio efetivo adotado** | **USD 1 = R$ 6,11; EUR 1 = R$ 6,70** (cotação × 1,035) | derivado |
| Mês | 730 h (serviços cobrados por hora) e 30,4 dias (serviços cobrados por dia) | convenção |
| Valor da hora de suporte | R$ 40/h (custo carregado) | **hipótese** |
| Impostos sobre a receita (Simples etc.) | **não incluídos**: a definição do dono é receita − custo variável | fora do escopo; reduz a margem real |
| Taxa de implantação (única) | fora deste documento; custos mensais recorrentes apenas | escopo |

Observação sobre o Azure: as páginas em pt-BR (`azure.microsoft.com/pt-br/pricing/...`) carregam os valores por JavaScript e mostram só "$-" para quem lê sem navegador; usei a API pública de preços de varejo do Azure (https://prices.azure.com/api/retail/prices, região `brazilsouth`, consulta em 2026-11-24). Sua conversão em reais embutida (cerca de R$ 5,38 por USD) está defasada do mercado; por isso converto os valores em USD pelo câmbio efetivo acima.

## 2. Infraestrutura por cliente (API .NET 8 em container + SQL Server)

### A) Azure App Service + Azure SQL (implantação dedicada hoje)

Preços Brazil South em USD (fonte: API de preços do Azure acima, 2026-11-24). Converti por R$ 6,11.

| Componente | USD/mês | R$/mês | Observação |
|---|---|---|---|
| App Service Linux Basic B1 (1 núcleo, 1,75 GB) | 14,60 (US$ 0,02/h) | 89,20 | fonte; folga curta de RAM para API .NET 8 (**hipótese**: aguenta clínica pequena) |
| App Service Linux Standard S1 | 84,68 (US$ 0,116/h) | 517,37 | fonte; a página oficial de planos Linux só lista Basic, Free e Premium v3 para novos clientes |
| App Service Premium v3 P0v3 (1 vCPU, 4 GB) | 81,03 (US$ 0,111/h) | 495,07 | fonte (alternativa atual ao S1) |
| Azure SQL Basic (5 DTU, 2 GB) | 5,92 (US$ 0,1948/dia) | 36,18 | fonte |
| Azure SQL Standard S0 (10 DTU, até 250 GB) | 17,80 (US$ 0,5855/dia) | 108,75 | fonte |
| Azure SQL Standard S1 (20 DTU) | 35,60 (US$ 1,171/dia) | 217,50 | fonte |
| Azure SQL serverless General Purpose Gen5 | ≈ US$ 0,99 por vCore-hora + ≈ US$ 0,22 por GB-mês | ver nota | fonte (API; BRL 5,3293 por vCore-hora ÷ 5,376 implícito). Uso mínimo ativo de 0,5 vCore: 120 h ativas no mês ≈ R$ 370 (**hipótese** de uso). Mais caro que S0 para clínica ativa em horário comercial; só compensa com muita pausa |
| Azure SQL "free tier" | 100 mil vCore-segundos, 32 GB, 32 GB de backup por mês | 0 | fonte: https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier (atualizada em 2026-11-18). A página diz que é para desenvolvimento e prova de conceito, sem SLA, pausa em 15 min de inatividade e só vale para banco novo: **não usar em produção** |

Backup do banco: **hipótese** de que o backup automático com retenção curta está incluído no preço do Azure SQL (não reconfirmado hoje). Backup externo adicional é contado na tabela 6.

Combinações de infraestrutura (App + SQL):

| Combinação | USD/mês | R$/mês |
|---|---|---|
| A-enxuta: B1 + SQL Basic | 20,52 | 125,38 |
| A-base: B1 + SQL S0 | 32,40 | 197,95 |
| A-conservadora: S1 + SQL S0 | 102,48 | 626,12 |
| A-pesada: S1 + SQL S1 | 120,28 | 734,87 |

### B) VPS compartilhado entre vários clientes (um contêiner de API por cliente, um banco por cliente)

Cada cliente mantém API e banco próprios (dados isolados), mas dividem a máquina. **Hipótese** de arquitetura: uma instância de SQL Server por servidor com um banco por cliente (SQL Server Express é gratuito, mas com teto de 10 GB por banco, conhecimento prévio não reconfirmado hoje; edição paga muda a conta); API em contêiner com cerca de 0,5 GB de RAM por cliente (**hipótese**).

| Provedor / plano | Especificação | Preço | Marcação |
|---|---|---|---|
| Hostinger Brasil KVM 2 | 2 vCPU, 8 GB, 100 GB NVMe | R$ 42,99/mês no contrato de 24 meses (R$ 1.031,76 pagos de uma vez, parcelável em 12x); renovação R$ 77,99/mês | fonte: https://www.hostinger.com/br/vps |
| Hostinger Brasil KVM 4 | 4 vCPU, 16 GB, 200 GB NVMe | R$ 59,99/mês em 24 meses (R$ 1.439,76); renovação R$ 149,99/mês | fonte: mesma URL (preço de 12 meses e mensal não aparecem na página; a localização do datacenter não aparece na página, **hipótese** de que há opção no Brasil) |
| Hostinger Brasil KVM 8 | 8 vCPU, 32 GB, 400 GB NVMe | R$ 119,99/mês em 24 meses; renovação R$ 259,99 | fonte: mesma URL |
| Hetzner Cloud CPX22 / CPX32 (Helsinque) | 2 vCPU 4 GB / 4 vCPU 8 GB | € 16,99 / € 30,49 por mês sem IVA (R$ 113,77 / R$ 204,17); em Nuremberg € 19,99 / € 35,99 | fonte: https://www.hetzner.com/cloud/regular-performance/ . Servidores na Europa: latência alta ao Brasil e **hipótese** de que a transferência internacional de dados de saúde exige análise de LGPD |
| DigitalOcean Droplet 4 GB / 8 GB | 2 vCPU 4 GB / 4 vCPU 8 GB | US$ 24 / US$ 48 por mês (R$ 146,63 / R$ 293,27); backup semanal +20%, diário +30% | fonte: https://www.digitalocean.com/pricing/droplets |

Custo de infraestrutura por cliente = preço do servidor ÷ clientes por servidor (divisão é **hipótese**; o preço do servidor é fonte):

| Cenário B | Servidor | Clientes por servidor | R$/cliente/mês |
|---|---|---|---|
| B-enxuto | KVM 4, preço promocional de 24 meses (R$ 59,99) | 10 | 6,00 |
| B-base | KVM 4, preço de renovação (R$ 149,99) | 6 | 25,00 |
| B-conservador | KVM 4, preço de renovação (R$ 149,99) | 3 | 50,00 |

Risco declarado: vizinho barulhento, janela de manutenção conjunta e isolamento mais fraco que o Azure dedicado; o argumento de "implantação dedicada" do posicionamento precisa ser relido com cuidado neste modelo.

### C) Multi-tenant futuro (apenas estimativa, **hipótese**)

Um App Service P0v3 (R$ 495/mês, fonte acima) mais um banco Standard S1 ou elástico (R$ 217/mês) atendendo cerca de 50 clientes dá cerca de R$ 14/cliente. Adotei **R$ 8 / R$ 15 / R$ 30** por cliente (enxuto / base / conservador) como hipótese, já com folga de crescimento. O ganho real do multi-tenant está no suporte e na operação, não só na infraestrutura.

### Itens comuns às arquiteturas

| Item | Valor | Marcação |
|---|---|---|
| Frontends (admin React/Vite e portal Next.js) na Vercel | **Hobby** é grátis, mas os termos limitam a "uso pessoal ou não comercial": **não serve** para clientes pagantes (fonte: https://vercel.com/legal/terms). **Pro**: US$ 20/mês por assento de desenvolvedor (R$ 122,19), projetos ilimitados, crédito de uso de US$ 20 incluído (fonte: https://vercel.com/pricing e https://vercel.com/docs/plans/hobby). Um único time Pro pode hospedar os frontends de todos os clientes | fonte; rateio por clientes é hipótese: ÷ 20 = R$ 6,11 (enxuto), ÷ 10 = R$ 12,22 (base), ÷ 5 = R$ 24,44 (conservador, início de operação) |
| Domínio .com.br | R$ 40/ano = R$ 3,33/mês no Registro.br | fonte indireta: https://teletime.com.br/14/10/2026/br-6-milhoes/ (citando NIC.br); não confirmei no site do registro.br. Subdomínio do Cuidaflux = R$ 0 (**hipótese** de oferta) |
| E-mail transacional (Resend) | Grátis: 3.000 e-mails/mês, limite de 100/dia, 3 domínios; Pro US$ 20/mês: 50.000 e-mails, 10 domínios (fonte: https://resend.com/pricing). Conta única dividida entre clientes | fonte; rateio hipótese: grátis (enxuto), Pro ÷ 20 = R$ 6,11 (base), Pro ÷ 10 = R$ 12,22 (conservador) |
| Backup externo (cópia fora do provedor) | R$ 2 / R$ 5 / R$ 15 por cliente | **hipótese** (não pesquisei preço de armazenamento de objetos) |
| Monitoramento, logs e alertas | R$ 0 / R$ 3 / R$ 8 por cliente | **hipótese** |
| Hangfire, Google Agenda API, prontuário | R$ 0 de licença: Hangfire roda na própria API (consome CPU/RAM já contada); Google Agenda API gratuita segundo o roadmap do dono | **hipótese** (não reverifiquei a cota da Google Agenda API) |

## 3. WhatsApp

| Opção | Preço | Marcação |
|---|---|---|
| **Z-API plano Omni** | R$ 99,99/mês **por canal** (até 9 canais), 2 dias de teste; requisições sem franquia, webhooks, suporte nacional | fonte: https://z-api.io/ (2026-11-24) |
| **Z-API plano Partner** | R$ 89,99/mês por canal, para software house com 10 canais ou mais (10 canais ≈ R$ 899,90/mês), com API para gerenciar vários clientes e fatura pós-paga unificada | fonte: https://z-api.io/ . A página fala em "canal" e não cita o WhatsApp de forma explícita na lista; **hipótese**: o canal de WhatsApp tem o mesmo preço. **Hipótese**: tecnologia não oficial (via WhatsApp Web), com risco de bloqueio do número |
| **Evolution API auto-hospedada** | Licença gratuita (Apache 2.0 com termos de marca), sem custo por mensagem; custo é o servidor. O projeto oferece conexão não oficial (Baileys), com "limitações" segundo o próprio repositório, e a conexão oficial da Meta | fonte: https://github.com/EvolutionAPI/evolution-api . Servidor: **hipótese** de R$ 4 por cliente (enxuto) dentro do VPS compartilhado, junto com n8n e Redis. Risco de banimento do número não é citado no repositório (**hipótese** de que existe, como em toda conexão não oficial) |
| **API oficial da Meta (Cloud API)**, preço por mensagem, Brasil | Modelo por mensagem entregue, por categoria; cobrança em reais desde 2026-07-01 para contas elegíveis (migração obrigatória até 2027-06-30). Utilitária e de autenticação para o Brasil: cerca de US$ 0,0068 (0,68 centavo de dólar) ≈ R$ 0,042. Cada número ganha **1.000 mensagens de serviço grátis por mês**; a partir de 2026-10-01 as excedentes passam a ser cobradas | fonte oficial: https://developers.facebook.com/docs/whatsapp/pricing/ (tabela de comparação; os arquivos CSV/PDF com a tabela completa em BRL não pude abrir) |
| Mesma API, valores em R$ | Marketing R$ 0,3217; utilitária, autenticação e serviço (após a franquia) R$ 0,0350; utilitária grátis dentro da janela de 24 h de atendimento | **fonte de terceiro** (ChatMaxima, provedor comercial, que atribui à tabela BRL da Meta): https://chatmaxima.com/whatsapp-api-pricing/brazil/ . Trate o preço de marketing como **hipótese** até conferir na tabela oficial da Meta |

Custo de mensagens na API oficial, conta de referência (**hipótese** de volume; preços acima):

| Volume mensal por clínica | Cálculo | R$/mês |
|---|---|---|
| 600 lembretes e confirmações (utilitárias, fora da janela) | 600 × 0,035 | 21,00 |
| 300 mensagens de marketing | 300 × 0,3217 | 96,51 |
| Respostas de atendimento (serviço) até 1.000 | franquia grátis | 0 |
| Total (uso moderado a intenso) | | ≈ 117,51 |

Leitura: a API oficial com poucos lembretes custa menos que a Z-API (R$ 21 contra R$ 99,99), mas campanhas de marketing a encarecem; exigiria ainda um provedor/BSP ou desenvolvimento próprio (**hipótese**: sem tarifa fixa se for integração direta, não verifiquei).

## 4. IA por consumo (add-on futuro, se o dono decidir criar)

> **IA não existe no produto hoje** (o bot de WhatsApp no n8n é uma árvore de decisão, sem modelo de linguagem no registry). Esta seção é só hipótese de custo de um add-on futuro ("em breve — confirmar antes de prometer"); nenhum plano de `precificacao.md` inclui IA. Onde as tabelas abaixo (seção 6) ainda trazem R$ 1,37 ou R$ 13,75 de IA nos cenários Base e Conservador, é reserva por prudência.

Conta de referência (**hipótese**): cada mensagem do paciente consome cerca de 1.500 tokens de entrada (instruções, histórico e ferramentas) e 150 de saída; 1.000 mensagens = 1,5 milhão de tokens de entrada + 0,15 milhão de saída. Preço de lista em USD por milhão de tokens (fonte), custo por 1.000 mensagens e em reais a R$ 6,11:

| Modelo | Entrada / saída por 1 milhão | US$ por 1.000 msgs | R$ por 1.000 msgs | Fonte |
|---|---|---|---|---|
| Claude Haiku 5.5 (prompts até 100 mil tokens) | US$ 0,10 / US$ 0,50 | 0,225 | **1,37** | https://platform.claude.com/docs/en/about-claude/pricing |
| Claude Sonnet 5.5 | US$ 2 / US$ 10 | 4,50 | 27,49 | mesma URL |
| OpenAI gpt-5-nano | US$ 0,05 / US$ 0,40 | 0,135 | 0,82 | https://developers.openai.com/api/docs/pricing |
| OpenAI gpt-5-mini | US$ 0,25 / US$ 2,00 | 0,675 | 4,12 | mesma URL |
| Gemini 2.5 Flash-Lite | US$ 0,10 / US$ 0,40 | 0,21 | 1,28 | https://aistudio.google.com/docs/pricing (a página avisa que o 2.5 Flash passa a rotear para o 3.5 Flash-Lite em 2026-12-01; esse novo modelo custa US$ 0,30 / US$ 2,50, ou R$ 5,04 por 1.000 mensagens) |

Leitura: com modelo barato a IA custa cerca de R$ 1 a R$ 5 por 1.000 mensagens, quase irrelevante ante WhatsApp e suporte. O custo cresce se o contexto aumentar (histórico longo, prontuário no prompt) e com modelo de ponta. Cache de prompt (leitura a 10% do preço de entrada nos modelos Claude, segundo a mesma página) e processamento em lote (50% de desconto) reduzem a conta, mas lote não serve para conversa em tempo real. Para o câmbio, a conta é em USD no cartão (IOF já incluído no câmbio efetivo).

## 5. Suporte e taxas de pagamento

**Suporte** (todos **hipótese**, a validar com a operação real): 0,5 h por cliente por mês no cenário enxuto (cliente autônomo, pouco uso), 1,5 h no base, 3 h no conservador (implantação dedicada exige atualização, monitoramento e correção por cliente). A R$ 40/h: **R$ 20 / R$ 60 / R$ 120**. Implantação e treinamento iniciais são custo único e não entram na mensalidade.

**Taxas de gateway** (cobrada sobre a receita, portanto entra como percentual):

| Gateway | Pix | Cartão de crédito | Boleto | Fonte |
|---|---|---|---|---|
| Asaas | R$ 1,08 por recebimento (a página também mostra R$ 2,15 sem deixar claro qual vale; use a faixa R$ 1,08 a R$ 2,15) | "a partir de 1,99% + R$ 0,49" nos 3 primeiros meses; depois, tabela com valores que aparecem como 2,99% e 3,49% (diagramação ambígua); taxa sobre o total, mesma para parcelado; antecipação 1,25%/mês | R$ 1,08 (mesma ambiguidade) | https://www.asaas.com/precos-e-taxas e https://www.asaas.com/cobranca-cartao |
| Mercado Pago (link de pagamento) | 0,99% | 4,98% (na hora), 4,48% (14 dias), 3,99% (30 dias) | R$ 3,99 | resultado de busca em páginas oficiais: https://www.mercadopago.com.br/ferramentas-para-vender/link-de-pagamento (a página direta bloqueou meu acesso) |
| Stripe Brasil | 1,19% | 3,99% + R$ 0,39 (cartões nacionais), sem mensalidade | R$ 3,45 | https://stripe.com/br/pricing |
| Pagar.me | 0,99% | 4,19% à vista, recebimento em 2 dias | não informado | https://www.pagar.me/precos (valores sob banner de Black Friday, podem ser promocionais) |

Efeito em uma mensalidade de R$ 149: Pix no Mercado Pago ou Pagar.me ≈ R$ 1,48 (1%); Pix no Asaas ≈ R$ 1,08 a R$ 2,15 (0,7% a 1,4%); cartão no Stripe ≈ R$ 6,33 (4,2%); cartão no Mercado Pago na hora ≈ R$ 7,42 (5%). Adotei, como **hipótese** de mistura Pix/cartão: **1,5% / 3,0% / 4,5%** da receita (enxuto / base / conservador).

## 6. Tabela-resumo: custo variável mensal por cliente (R$)

Cenários: **Enxuto** = VPS compartilhado (B-enxuto, 10 clientes por servidor), Evolution API, sem IA, suporte mínimo. **Base** = Azure dedicado B1 + SQL S0 (como hoje), Z-API Omni, reserva de IA hipotética de 1.000 mensagens/mês em Haiku 5.5 (a IA não existe hoje; reserva por prudência). **Conservador** = Azure App Service S1 + SQL S0, Z-API Omni, IA com 5.000 mensagens/mês e o dobro de tokens por mensagem, suporte maior.

| Linha | Enxuto | Base | Conservador | Marcação |
|---|---|---|---|---|
| Infraestrutura (API + banco) | 6,00 | 197,95 | 626,12 | Azure: fonte (US$ × 6,11). VPS: preço fonte, divisão por clientes hipótese |
| Frontends Vercel Pro (rateio) | 6,11 | 12,22 | 24,44 | preço fonte; rateio hipótese |
| Domínio .com.br | 0,00 | 3,33 | 3,33 | fonte indireta (R$ 40/ano); gratuito no enxuto é hipótese |
| Backup externo | 2,00 | 5,00 | 15,00 | hipótese |
| E-mail transacional | 0,00 | 6,11 | 12,22 | preço fonte (Resend); rateio hipótese |
| WhatsApp | 4,00 | 99,99 | 99,99 | Z-API: fonte; Evolution (servidor): hipótese |
| IA (reserva hipotética; não existe hoje) | 0,00 | 1,37 | 13,75 | preços fonte; volume e tokens hipótese |
| Monitoramento | 0,00 | 3,00 | 8,00 | hipótese |
| Suporte (R$ 40/h × 0,5 / 1,5 / 3 h) | 20,00 | 60,00 | 120,00 | hipótese |
| **Subtotal (sem gateway)** | **38,11** | **388,97** | **922,84** | |
| Taxa de gateway (% da receita) | 1,5% | 3,0% | 4,5% | taxas fonte; mistura hipótese |

## 7. Receita mínima por cliente para margem bruta de 60%

Com o gateway cobrado em percentual (g) sobre a receita P, a margem de 60% pede: P = custo sem gateway ÷ (0,40 − g). Sem gateway, vale a regra do dono: P = custo ÷ 0,40. As duas colunas da direita usam bases diferentes (a do meio ignora o gateway; a última retira o WhatsApp do custo mas mantém o gateway em %), por isso não são comparáveis linha a linha: no Conservador, a regra simples (R$ 2.307,11) fica abaixo do preço sem WhatsApp com gateway (R$ 2.317,90) apenas porque o gateway de 4,5% pesa mais que os R$ 99,99 retirados.

| Cenário | Preço mínimo (com gateway em %) | Regra simples custo ÷ 0,40 (sem gateway) | Preço mínimo sem WhatsApp (repassado ao cliente), com gateway em % |
|---|---|---|---|
| Enxuto | **R$ 98,99** | R$ 95,28 | R$ 88,60 |
| Base | **R$ 1.051,28** | R$ 972,43 | R$ 781,04 |
| Conservador | **R$ 2.599,56** | R$ 2.307,11 | R$ 2.317,90 |

### Sensibilidades (para decidir o caminho)

Mesmas premissas do cenário base salvo o indicado, com gateway de 3%:

| Variação | Subtotal R$ | Preço mínimo R$ |
|---|---|---|
| Base com VPS (6 clientes/servidor, renovação) em vez de Azure, com Z-API | 216,02 | 583,84 |
| Base com VPS, **sem** WhatsApp na mensalidade | 116,03 | 313,60 |
| Enxuto com Z-API Partner (R$ 89,99) em vez de Evolution | 124,10 | 322,34 |
| Multi-tenant (hipótese C: infra R$ 15, suporte 0,75 h) com Z-API | 153,36 | 414,50 |
| Multi-tenant (hipótese C), **sem** WhatsApp na mensalidade | 53,37 | 144,26 |
| Multi-tenant enxuto (infra R$ 8, suporte 0,5 h), sem WhatsApp, gateway 1,5% | 31,00 | 80,52 |

Diferenças de 1 a 2 centavos frente a `precificacao.md` (por exemplo R$ 313,60 contra 313,59; R$ 414,50 contra 414,49; R$ 144,26 contra 144,24) vêm de arredondamento.

### Reconciliação com os planos propostos (Fase 1)

Os custos por plano de `precificacao.md` não são nenhum dos três cenários da seção 6; misturam premissas. Essencial (R$ 52,22 sem gateway) = infra R$ 15,00 (KVM 4 na renovação ÷ 10, em vez dos R$ 6,00 do Enxuto, que usa o preço promocional) + Vercel R$ 12,22 (÷ 10, como no Base) + backup R$ 2,00 + monitoramento R$ 3,00 + suporte R$ 20,00 (0,5 h); sem WhatsApp, sem e-mail e sem IA. Em relação ao Enxuto (R$ 38,11): sem R$ 4,00 de Evolution API, mais R$ 9,00 de infra, R$ 6,11 de Vercel e R$ 3,00 de monitoramento = R$ 52,22. Clínica (R$ 111,33) = infra R$ 25,00 (como B-base) + Vercel R$ 12,22 + backup R$ 5,00 + e-mail R$ 6,11 + monitoramento R$ 3,00 + suporte R$ 60,00 (1,5 h, como no Base). Dedicado (R$ 143,83) = infra R$ 37,50 (KVM 4 ÷ 4, hipótese) + Vercel, backup, e-mail e monitoramento como no Clínica + suporte R$ 80,00 (2 h, hipótese). Nenhum inclui WhatsApp nem IA. O gateway é 3% da receita em todos.

### Onde dá para competir

- **O que decide o preço é WhatsApp, suporte e infraestrutura dedicada, não a IA.** IA custa de R$ 0 a R$ 14 nos cenários; Z-API custa R$ 99,99 por clínica (preço público de 2026-11-24), igual ao preço de entrada do iClinic (R$ 99) ou do Booksy (R$ 99,99), sozinho.
- **Com a implantação dedicada no Azure como hoje (Base e Conservador) a margem de 60% exige R$ 1.000 a R$ 2.600 por mês**, muito acima da faixa dos concorrentes (R$ 38 a R$ 369,90; Doctoralia, de R$ 420 a R$ 665, é a exceção). A infraestrutura (R$ 198 a R$ 626) e o suporte (R$ 60 a R$ 120) são a causa. Nessa arquitetura, só dá para competir cobrando bem menos que o preço mínimo (margem menor que a decidida) ou migrando.
- **A faixa de R$ 99 a R$ 149,90** (iClinic Starter a Clinicorp Standard) só fecha em dois casos: o cenário Enxuto (R$ 99) e o multi-tenant **sem WhatsApp na mensalidade** (R$ 144), ambos com suporte baixo. O VPS compartilhado no cenário base (6 clientes por servidor, renovação) pede cerca de R$ 314 sem WhatsApp e R$ 584 com Z-API incluída: ambos acima dessa faixa. O Enxuto (R$ 99) só fecha com Evolution API, sem IA e com 0,5 h de suporte por cliente: possível para o plano de entrada, mas com risco de banimento do número (conexão não oficial).
- **Ideia a validar com o dono:** cobrar o WhatsApp à parte (cliente contrata a Z-API no próprio nome ou paga repasse) ou limitar o plano de entrada ao portal e agenda, deixando WhatsApp e IA como complemento. Concorrentes já fazem isso (iClinic: a partir de R$ 29,90 por 85 mensagens; Trinks e Simples Dental cobram WhatsApp como extra).
- **Faixa premium (R$ 250 a R$ 370)**, como Clinicorp Premium (R$ 369,90) ou iClinic Premium (R$ 299), comporta o VPS compartilhado **sem WhatsApp** (mínimo de R$ 314), mas **não** comporta Z-API incluída: com Z-API o mínimo é R$ 584 em VPS compartilhado e R$ 414,50 em multi-tenant, ambos acima da faixa. Z-API incluída nessa faixa exigiria menos de 1,5 h de suporte por cliente além do multi-tenant.
- Impostos sobre a receita e a taxa de implantação não entram; ambos mudam a conta real.

## Hipóteses a validar (resumo)

Câmbio efetivo com IOF; horas e valor da hora de suporte; clientes por servidor; arquitetura de VPS (SQL Express, RAM por API); localização do datacenter da Hostinger; backup externo e monitoramento; rateio de Vercel Pro e Resend; tabela BRL da Meta (marketing e utilitária; só obtive via terceiro e via cifra em dólar); canal de WhatsApp do plano Partner da Z-API; risco de banimento nas conexões não oficiais; volume de mensagens e tokens de IA; cota da Google Agenda API; custo da arquitetura multi-tenant (C); mistura Pix/cartão; taxas finais do Asaas (página ambígua) e do Mercado Pago (acesso direto bloqueado); R$ 40/ano do domínio (fonte indireta).
