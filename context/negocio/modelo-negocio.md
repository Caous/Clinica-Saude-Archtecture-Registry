# Modelo de negócio

> Produto: **Cuidaflux** (gestão para clínicas; nicho de entrada: fisioterapia, conforme `mercado.md`). Documento do PBI-20261124-publico-mercado-modelo-negocio (AC-5 / T-11). Consulta de fontes em 2026-11-24.
> Regra do documento: todo número tem fonte (URL e data) ou vem marcado `hipótese`. Nenhum custo interno do Cuidaflux foi medido até hoje; os custos por cliente abaixo são hipóteses a validar com a primeira implantação real. A decisão de modelo é do dono; este texto recomenda (portão em `precificacao.md`).
> **Numeração de fases (a mesma de `precificacao.md`):** Fase 0 = Azure dedicado como hoje (piloto ou "sob consulta", a partir de R$ 1.099); Fase 1 = servidor compartilhado entre implantações dedicadas (API e banco próprios por clínica, servidor dividido); Fase 2 = multi-tenant (PBI futuro). Os planos propostos de R$ 149 / R$ 319 / R$ 419 pertencem à Fase 1 e são PROPOSTA.
> Premissas já decididas: margem bruta mínima de **60%** (custos variáveis por cliente de no máximo 40% da receita) e vontade de **competir com o mercado** em preço.

## Fatos que condicionam o modelo

### Single-tenant por implantação

Fato confirmado no `architecture-registry.yaml`: banco único por implantação (`SistemaClinicaDB`), entidades sem `TenantId` e marca lida de `appsettings` (`BrandingSettings`). Consequências diretas:

- **Hoje cada cliente exige uma implantação dedicada**: uma API, um banco, uma marca em configuração, segredos e variáveis de pipeline (`DOCKER_IMAGE`, `AZURE_WEBAPP_NAME`) próprios. Não existe "cadastrar clínica nova" dentro de um sistema compartilhado.
- **Custo variável por cliente não é desprezível**: hospedagem da API, banco, backup, monitoramento e um número de WhatsApp conectado por cliente entram no custo de cada implantação (o backup ainda não existe hoje, R07, e o WhatsApp via Z-API é "em breve"), mesmo com a clínica usando pouco. Com margem mínima de 60%, vale a conta: **preço mínimo = custo variável mensal ÷ 0,40** (por exemplo, custo variável de R$ 100 pede preço de R$ 250; de R$ 60, R$ 150; exemplos aritméticos, não estimativas).
- **O preço de entrada dos concorrentes pressiona esse piso.** Planos públicos de R$ 39,90 (Dental Office Compacto), R$ 99 (iClinic Starter por profissional) e R$ 149,90 (Clinicorp Standard) vêm de SaaS multi-tenant, com custo marginal por cliente muito menor (fonte: `concorrentes.md`, 2026-11-24). Competir abaixo de uns R$ 150 por clínica com implantação dedicada só fecha a conta se o custo variável ficar abaixo de R$ 60 (conta acima), o que é hipótese a medir.
- **Ganho colateral**: isolamento de dados por cliente é argumento de venda para dado de saúde (LGPD) e permite marca própria da clínica sem trabalho extra (ver "Espaço de diferenciação" em `concorrentes.md`).
- **Escala e operação**: com N implantações, cada correção ou versão nova precisa ser aplicada N vezes (o `PBI-20261124-gerador-white-label-clinica` prevê o `generation-report.json` com a versão base justamente para isso). Suporte e atualização crescem linearmente com clientes, o que limita quantos clientes de ticket baixo o dono consegue atender sozinho.
- **O que o multi-tenant destravaria** (PBI futuro, ainda não existe): custo marginal baixo, autoatendimento (cadastro e pagamento sem implantação manual) e acesso ao segmento de autônomos e profissionais de ticket de R$ 30 a R$ 200 (hipótese de `mercado.md`), hoje inviável.

### Estágio do gerador white-label

`PBI-20261124-gerador-white-label-clinica` está em **backlog** (status `backlog`, prioridade alta, criado em 2026-11-24), sem nenhuma linha de código: não existe gerador para a clínica. Depende do PBI de desvínculo da marca anterior (já concluído, bases com tokens neutros e branding por configuração). A meta declarada do PBI é gerar um cliente novo em até 5 minutos, com build verde e zero vestígio da marca base, num modelo de uma instância por cliente.

O que isso muda:

- **Hoje cada cliente novo seria cópia das 3 bases e busca/troca manual** (descrição do próprio PBI). O custo de implantação em horas do dono é, portanto, alto e imprevisível (hipótese: várias horas por cliente; medir na primeira venda).
- **Modelo (d) revenda/white-label não é executável hoje**: sem gerador, o parceiro não consegue ter instância própria com a marca dele, e o dono viraria o implantador de cada parceiro e de cada cliente do parceiro.
- **Modelo (a) e (c) funcionam desde já com poucos clientes** (implantação manual aceitável para os 3 a 5 primeiros), mas a escala depende do gerador mais deploy automatizado. O gerador só cobre a geração do projeto; subir infraestrutura, pipeline, banco, domínio e número de WhatsApp de cada cliente continua exigindo trabalho (automação disso não está no PBI).
- **O gerador não resolve manutenção**: ele registra a versão base, mas não atualiza as instâncias já entregues. Isso reforça a necessidade de multi-tenant para escalar.

### Contexto de produto que afeta o preço (hipótese de roteiro)

O próprio `mercado.md` registra que a próxima entrega traz agendador Hangfire, WhatsApp via Z-API, Google Agenda e prontuário. Prontuário e integração oficial de WhatsApp mudam o que dá para cobrar; o modelo abaixo trata isso como cenário a reavaliar após a entrega, não como fato.

### Referências de preço do mercado usadas nas contas

Valores públicos coletados em 2026-11-24 (detalhes e URLs em `concorrentes.md`): Clinicorp R$ 149,90 e R$ 369,90 por mês; Simples Dental R$ 149,90 a R$ 349,90; Dental Office R$ 39,90 a R$ 298,54; iClinic R$ 99 a R$ 299 por mês, por profissional; Trinks R$ 38 a R$ 146 por faixa de profissionais (tabela ambígua); Booksy R$ 99,99 por agenda; Secretaria.io R$ 197 por mês. Em clínica de fisioterapia com 3 profissionais, a conta aritmética sobre o iClinic por profissional (R$ 99 a R$ 169 nos três planos de entrada) dá R$ 297 a R$ 507 por mês; em 3 profissionais um preço fixo por clínica nessa faixa fica equivalente ao iClinic Starter (R$ 297) e, a partir de 4 profissionais, tende a sair melhor; não é o mais barato para 1 a 2 profissionais. Conta feita por este documento sobre preços públicos, sem verificação com cotação real.

## Modelos comparados

Convenção: números de custo e receita sem fonte são `hipótese`; "ARPA" = receita média por conta por mês. Faixas de preço sugeridas aqui são insumo para `precificacao.md`, não tabela final.

### (a) SaaS com implantação + mensalidade

- **Receita:** taxa de implantação única (hipótese: R$ 0 a R$ 1.500, para cobrir o trabalho de subir a instância dedicada) mais mensalidade recorrente por clínica, em faixas por número de profissionais, sem fidelidade. Mensalidades propostas (Fase 1, `precificacao.md`; PROPOSTA, aguardam o dono): R$ 149 (1 a 2 profissionais), R$ 319 (3 a 6) e R$ 419 (7 a 12), dentro do ticket hipotético de R$ 150 a R$ 450 do nicho em `mercado.md` e da faixa pública dos concorrentes (R$ 38 a R$ 369,90; Doctoralia, de R$ 420 a R$ 665, é a exceção). A faixa anterior deste documento (R$ 197 a R$ 449) foi substituída por essa. Receita previsível (MRR), base para o `modelo-financeiro.xlsx`.
- **Custo:** variável por cliente, dedicado: hospedagem da API e banco, backup (não existe hoje, R07), monitoramento, número e mensagens de WhatsApp, e-mail, taxa de pagamento recorrente e suporte. Valores em R$ não medidos em operação (hipótese). Dois cenários de hospedagem calculados em `custos-referencia.md`: **Azure dedicado como hoje (Fase 0)**, cerca de R$ 389 por mês de custo por cliente (API, banco e WhatsApp), que só fecha 60% a partir de R$ 1.051; e **VPS compartilhado entre implantações dedicadas (Fase 1)**, de R$ 6 a R$ 37,50 por cliente de infraestrutura conforme clientes por servidor, que sustenta os planos de R$ 149 a R$ 419 com margem de 62,0% a 62,7%. Tarifas de WhatsApp: ver (e). Custo fixo: operação, desenvolvimento e comercial do dono. Referência de churn para o plano financeiro: 3% a 5% ao mês para SaaS de pequenas empresas (https://www.saastr.com/the-challenge-with-smb-saas, consultado em 2026-11-24; fonte de blog, sem metodologia aberta, tratar como hipótese).
- **Risco:** custo por cliente alto demais para o preço de mercado (piso = custo variável ÷ 0,40); suporte e atualização linear por cliente; churn de clínica pequena alto; dependência de implantação manual até haver gerador. Risco de inadimplência recorrente sem cobrança automatizada (pré-requisito de AC-10).
- **Esforço técnico:** baixo a médio no curto prazo, pois o produto já roda como instância dedicada. Faltam: cobrança recorrente (assinatura e régua de inadimplência), checklist de implantação, monitoramento e rotina de atualização por cliente. O gerador ajuda mas está em backlog.
- **Adequação:** alta para clínica pequena e média de fisioterapia (3+ profissionais), que aceita preço a partir de ~R$ 319 por mês no plano Clínica (R$ 149 no Essencial para 1 a 2 profissionais; todos PROPOSTA). Baixa para autônomo solo de ticket de R$ 30 a R$ 200 (hipótese): implantação dedicada não fecha a conta de margem 60% nessa faixa. Compete com concorrentes por clínica (preço fixo) em vez de por profissional.

### (b) Licença perpétua/on-premise

- **Receita:** pagamento único alto (hipótese: algumas vezes a mensalidade anual do plano equivalente, a definir) mais manutenção e atualização opcionais. Receita concentrada no ato da venda, sem MRR; ruim para o objetivo declarado do PBI de receita recorrente.
- **Custo:** instalação e configuração no ambiente do cliente (ou orientação de hospedagem em nuvem do cliente), treinamento, suporte pós-venda e correções sem receita recorrente que as financie. O cliente leva o código executável e o banco: custo de suporte de ambientes diferentes (hipótese: alto e imprevisível). Sem custo de hospedagem para o dono.
- **Risco:** baixa previsibilidade de caixa; risco de cópia e uso fora da licença; versões espalhadas e sem atualização (cada cliente numa versão), o que agrava o problema de manutenção do single-tenant; responsabilidade de LGPD e backup passa ao cliente, mas o dono responde pelo produto. Cliente de clínica pequena raramente tem TI para operar servidor e banco.
- **Esforço técnico:** médio: instalador ou imagem Docker documentada, migrações de banco versionadas, mecanismo de licença e chave, manual de operação. O backend já tem Dockerfile, mas não há instalador, licenciamento nem atualização automática.
- **Adequação:** baixa para o público-alvo (clínica pequena, sem TI, quer preço mensal baixo). Pode servir a caso pontual (rede com exigência de dados em ambiente próprio), tratado como exceção sob contrato, não como linha de produto.

### (c) Híbrido

- **Receita:** licença de implantação (taxa única que dá direito à instância dedicada e à customização de marca, hipótese: R$ 1.500 a R$ 5.000) mais mensalidade reduzida de hospedagem e suporte (hipótese: abaixo da mensalidade do modelo (a)), mais add-ons. Antecipa caixa e reduz o risco do custo de implantação, mantendo MRR menor que o de (a).
- **Custo:** o mesmo custo variável dedicado de (a), com a diferença de que a taxa inicial cobre o trabalho de implantação (hoje manual). Custo de suporte e atualização continua por cliente.
- **Risco:** barreira de entrada maior que a dos concorrentes (que têm teste grátis ou planos sem taxa: Clinicorp, iClinic e Trinks informam sem taxa de entrada, em `concorrentes.md`); conversão mais baixa em clínica pequena; complexidade comercial (duas cobranças, duas negociações). Risco de o cliente cancelar a mensalidade depois de pagar a licença e querer a instância própria.
- **Esforço técnico:** baixo, quase igual a (a), mais cobrança de parcela única e contrato de licença. Sem dependência do gerador no curto prazo, mas ele reduz o custo real da implantação.
- **Adequação:** média: boa para clínica média ou rede que valoriza dado isolado, marca própria e personalização e aceita pagar de entrada; fraca para o consultório pequeno sensível a preço e à comparação com planos sem taxa. Funciona como "plano Dedicado" premium dentro do modelo principal.

### (d) Revenda/white-label via parceiros

- **Receita:** o parceiro (associação, conselho, fornecedor de equipamentos, consultoria, agência) revende com a marca dele; o dono recebe licença por cliente final ou percentual de comissão sobre a mensalidade (hipótese: margem de 20% a 40% para o parceiro, a negociar). Canal de aquisição sem CAC próprio; receita por cliente menor que a venda direta pelo desconto de revenda.
- **Custo:** gerador, deploy, suporte nível 2 ao parceiro, materiais comerciais e treinamento; comissão ao parceiro, que pesa na margem de 60% (com 30% de comissão, o custo variável restante precisa caber nos mesmos 40% da receita bruta ou o preço sobe). Hospedagem por cliente final segue dedicada.
- **Risco:** perda de relacionamento direto com o cliente final; dependência de poucos parceiros; marca e suporte de terceiros afetam a reputação do produto; responsabilidade LGPD compartilhada entre dono, parceiro e clínica (contratos de operador e controlador); conflito de canal com a venda direta. Sem gerador, o próprio dono vira o implantador de cada cliente do parceiro.
- **Esforço técnico:** alto hoje: depende do gerador (backlog, sem código), de deploy automatizado, de painel de gestão de clientes do parceiro e, para escalar, de multi-tenant com marca por tenant. Com o gerador pronto, cada parceiro ou cliente ganha uma instância isolada (single-tenant), o que atende o gerador mas não elimina o custo por instância.
- **Adequação:** média no longo prazo (canal por conselhos e associações é candidato em `go-to-market.md`), **inadequada para agora**: sem gerador e sem produto validado em cliente real, revenda antecipa problema de suporte para terceiros. Reavaliar depois do gerador concluído e de pelo menos alguns clientes diretos satisfeitos.

### (e) Add-on de IA por consumo

- **Receita:** cobrança por uso (mensagens de WhatsApp com IA, resumos, transcrição) em pacotes de créditos ou por unidade (hipótese; hoje nenhum plano inclui franquia de IA). Concorrentes cobram IA como complemento: Doctoralia Noa Notes R$ 199 por mês, iClinic WhatsApp a partir de R$ 29,90 por mês (85 mensagens), assinatura eletrônica R$ 14,90 por profissional por mês (`concorrentes.md`, 2026-11-24). Faixa sugerida para add-on do Cuidaflux: hipótese de R$ 29 a R$ 99 por mês por pacote, a validar. Complemento do modelo principal, não substitui mensalidade.
- **Custo:** variável e proporcional ao uso, o que protege a margem se o preço do pacote for calculado com o custo unitário. Tarifas de WhatsApp na API oficial da Meta têm cotação em R$ (a Meta passou a publicar tabela em BRL; fontes terceiras divergem: utilidade de R$ 0,035 a R$ 0,08 por mensagem e marketing de R$ 0,32 a R$ 0,39, sem confirmação na tabela oficial; consulta em 2026-11-24, https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing e https://chatmaxima.com/whatsapp-api-pricing/brazil/). Custo de modelos de IA por token: ver `custos-referencia.md`, seção 4 (hipótese). **IA não existe no produto hoje**: o bot atual (n8n/Evolution API) é uma árvore de decisão, sem modelo de linguagem no registry. Provedores não oficiais de WhatsApp (Evolution API hoje, Z-API no roadmap) têm cobrança própria que não foi levantada.
- **Risco:** custo de IA e mensagens crescer mais rápido que a receita se o pacote não tiver limite; dependência de provedores de WhatsApp não oficiais (risco de bloqueio de número, hipótese a confirmar nos termos do provedor) e da Meta; tarifação por mensagem mudou em 2025 e muda de novo (cotação em BRL em 2026); LGPD: dado de saúde enviado a modelo de IA externo exige base legal, contrato e anonimização (pré-requisito de AC-10). Qualquer franquia de IA que o dono venha a incluir no plano precisaria caber nos 40% de custo variável (hoje nenhuma está incluída).
- **Esforço técnico:** médio: medição de consumo por cliente (hoje não há contador por implantação), limite e bloqueio ao estourar a franquia, cobrança do excedente, painel de uso. O bot (n8n/Evolution API) existe; a migração para Z-API e o agendador Hangfire estão no roadmap. Em single-tenant, o medidor é local a cada instância, sem agregação central.
- **Adequação:** potencial diferencial competitivo (a oportunidade "IA e WhatsApp como recurso da rotina, não módulo caro à parte" em `concorrentes.md`) para clínica pequena que já sofre com faltas e confirmação, **mas só depois de a IA existir**: hoje é "em breve — confirmar antes de prometer" e nenhum plano a inclui. Se vier, tende a funcionar como add-on por consumo (hipótese de R$ 39 por pacote de 5.000 mensagens em `precificacao.md`), decisão do dono.

## Recomendação

### Modelo principal sugerido

**(a) SaaS com implantação dedicada + mensalidade fixa por clínica, em faixas por número de profissionais, com taxa de implantação baixa ou promocional e WhatsApp e IA fora da mensalidade, como add-ons futuros (e) ("em breve — confirmar antes de prometer").** Plano "Dedicado" (7 a 12 profissionais) com taxa de implantação de lista (c) apenas para quem quiser personalização. Esta é uma sugestão para decisão do dono em `precificacao.md`, não decisão tomada.

Por quê:

- **A implantação dedicada de hoje (single-tenant) não permite SaaS compartilhado**, mas pode rodar em servidor compartilhado entre implantações (Fase 1): (a) é o único modelo que combina receita recorrente com o produto como ele é, sem esperar trabalho técnico novo. (b) elimina o MRR e agrava a manutenção; (d) depende de gerador e deploy que não existem.
- **Margem de 60%**: o preço precisa cobrir o custo variável dedicado por cliente com pelo menos 60% de margem bruta, e esse custo ainda não foi medido (os planos de R$ 149 / R$ 319 / R$ 419 fecham 62,0% a 62,7% só no VPS compartilhado, não no Azure). Conta do piso: preço mínimo = custo variável ÷ 0,40. Enquanto o custo não for medido, a primeira meta operacional é medi-lo com as 3 a 5 primeiras implantações e ajustar a tabela de `precificacao.md`.
- **Clínica pequena e preço competitivo**: mensalidade fixa por clínica (e não por profissional) é um contraponto ao modelo do iClinic. Em 3 profissionais o preço é equivalente (plano Clínica R$ 319 contra R$ 297 do iClinic Starter e R$ 387 do Plus, por profissional); a partir de 4 profissionais o preço fixo costuma sair melhor (Starter R$ 396 em 4 e R$ 495 em 5; cálculo sobre preços públicos). Evita-se brigar com planos de R$ 39,90 a R$ 99, que são de outro público (autônomo solo, multi-tenant). Sem fidelidade e com preço público, em linha com o espaço de diferenciação.
- **IA e WhatsApp como possível diferencial futuro**: hoje não existem como produto (IA) ou não estão prontos (WhatsApp via Z-API) e ficam fora da mensalidade; se vierem, entram como add-on calculado com o custo unitário, para proteger a margem.
- **Taxa de implantação**: manter baixa ou zero (concorrentes não cobram) e subsidiada pelo ganho de MRR, mas só enquanto a implantação manual for rara; com 3 a 5 clientes o custo é absorvível, depois exige gerador ou taxa maior (hipótese a validar).

### Caminho de evolução (dedicado para multi-tenant)

Os marcos abaixo usam gatilhos por evidência, não por data, e a numeração é a de `precificacao.md` (Fase 0 Azure dedicado, Fase 1 servidor compartilhado, Fase 2 multi-tenant); limites numéricos são hipóteses a calibrar com dados reais.

1. **Fase 0: dedicado manual no Azure atual (só piloto de 1 a 3 clientes, com margem abaixo de 60% declarada, decisão explícita do dono).** Vender o modelo (a) com implantação manual. Medir: horas de implantação, custo mensal real por cliente (infraestrutura, WhatsApp, IA, suporte), churn e tickets de suporte. Nenhuma venda de revenda ou licença perpétua. Entrega-chave: custo variável medido, que alimenta o `precificacao.md` e o `modelo-financeiro.xlsx`.
2. **Fase 1: servidor compartilhado entre implantações dedicadas (base dos planos de R$ 149 a R$ 419).** Implementar o gerador white-label (PBI em backlog) mais deploy e provisionamento automáticos por contêiner, backup externo com restauração testada (não existe hoje), cobrança recorrente e, se algum add-on de IA/WhatsApp vier a existir, medidor de consumo. Gatilho sugerido (hipótese): implantação manual passa a consumir tempo que impede vender, ou o custo de suporte por versões divergentes começa a ameaçar a margem de 60%. Habilita o plano "Dedicado" e, com cuidado, uma primeira revenda piloto (d) com 1 parceiro.
3. **Fase 2: multi-tenant (PBI futuro, inexistente hoje).** Introduzir `TenantId`, isolamento por tenant (decidir entre banco por tenant, esquema ou coluna), marca por tenant em vez de `appsettings`, cadastro de clínica e cobrança em autoatendimento. Gatilho sugerido (hipótese): custo de operar N implantações supera o ganho do preço, ou há demanda mensurável de ticket baixo (autônomos, estética solo, podologia) que o dedicado não atende com margem de 60%. Resultado: plano de entrada barato compartilhado (meta de R$ 109 / R$ 219 / R$ 299, hipótese de `precificacao.md`) e oferta de isolamento total de infraestrutura para quem quiser, com mesma base de código quando possível.
4. **Depois: revenda (d) em escala e licença (b) apenas por exceção contratual.** Revenda só depois da Fase 1 e, para volume, da Fase 2.

### Trade-offs principais

- Preço competitivo contra margem de 60%: o piso depende do custo dedicado por cliente, ainda não medido; baixar o preço sem baixar o custo derruba a margem.
- Velocidade de entrada contra escala: implantação manual permite vender já, mas não escala; gerador e multi-tenant são o preço de crescer sem inchar o suporte.
- Mensalidade fixa por clínica contra por profissional: simples e competitiva para clínica pequena, mas deixa de ganhar com a clínica que cresce (mitigar com faixas por número de profissionais).
- IA incluída contra IA por consumo: só vale discutir depois que a IA existir; incluir atrairia e diferenciaria, mas só com limite, para não comer a margem (hoje nenhum plano a inclui).

### Hipóteses declaradas (a validar)

- Todos os valores em R$ de mensalidade, taxa de implantação, licença, add-on e comissão de parceiro acima.
- Custo variável por cliente dedicado (hospedagem, banco, WhatsApp, suporte; IA só como hipótese de add-on futuro): não medido em operação; preços de lista de Azure e VPS em `custos-referencia.md` (consulta de 2026-11-24).
- Tarifas de WhatsApp: fontes terceiras divergentes, sem confirmação na tabela oficial (2026-11-24).
- Churn de 3% a 5% ao mês (https://www.saastr.com/the-challenge-with-smb-saas, 2026-11-24): referência de blog; CAC de SaaS de saúde no Brasil não pesquisado com fonte confiável, fica como hipótese em `go-to-market.md` e no modelo financeiro.
- Horas de implantação manual por cliente e do gerador funcionando como descrito no PBI.
- Risco de bloqueio de número em provedores não oficiais de WhatsApp.
- Gatilhos de passagem de fase.
