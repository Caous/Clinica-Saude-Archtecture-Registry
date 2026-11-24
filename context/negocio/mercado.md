# Mercado e nichos

> Produto: **Cuidaflux** (gestão de agenda, cadastro de pacientes (**sem prontuário clínico**: prontuário é "em breve — confirmar antes de prometer"), ordens de serviço e sessões, financeiro com parcelas, WhatsApp com bot n8n, portal do paciente, notificações, dashboards e insights de venda) para clínicas pequenas e médias e profissionais autônomos de saúde no Brasil.
> Consulta realizada em 2026-11-24 (PBI-20261124-publico-mercado-modelo-negocio, AC-1 / T-8).
> Regra: todo número tem fonte e data ou vem marcado como `hipótese`. Os números de mercado foram lidos em páginas de terceiros que citam os conselhos (nem sempre a página oficial do conselho); a "data" da tabela é a data da consulta, e a data-base do dado está dita na própria célula de tamanho. Mercado e ticket são sempre ordens de grandeza, não projeção de receita.

## Fatos do sistema usados na coluna "adequação"

- **Atende hoje** (`context/mapa-modulos.md`, `architecture-registry.yaml`): agenda com status e participantes, cadastro de pacientes com importação Excel, plano de N sessões vendido ao paciente (ordem de serviço + sessões), financeiro com parcelas (Pix, boleto, cartão), WhatsApp com bot/humano/misto, portal do paciente (agendar, confirmar, ver plano), notificações, e-mail SMTP, dashboards, insights de gestão (paciente dormente, plano acabando, parcela vencida, faltou ontem, aniversariantes), filiais, perfis de acesso, logs e marca configurável.
- **Lacunas gerais**: não existe prontuário clínico, anamnese, prescrição, convênio/TISS nem assinatura digital; resquícios de fisioterapia (patologia, check-in "Fisio/Plano", status "Banheira"); dois frontends com stacks diferentes.
- **Single-tenant**: banco único por implantação, entidades sem `TenantId`, marca em `appsettings`. Hoje vende-se **uma implantação dedicada por cliente**. No Azure atual (Fase 0) isso custa cerca de R$ 389 por mês e só fecha 60% de margem a partir de R$ 1.051; o que sustenta mensalidades de R$ 149 a R$ 419 é a **Fase 1** (servidor compartilhado entre implantações dedicadas, ainda não existe, ver `precificacao.md`). Profissional autônomo de ticket baixo só cabe na Fase 2 (multi-tenant, PBI futuro).

## Matriz de nichos

| nicho | tamanho de mercado | fonte | data | dor principal | ticket | adequação do sistema | nota |
|---|---|---|---|---|---|---|---|
| fisioterapia | mais de 370 mil fisioterapeutas registrados no sistema COFFITO/CREFITO (livro de 2025; data exata da contagem não confirmada; conta registros, não ativos) | https://editora.ufpe.br/books/catalog/download/982/978/3214?inline=1 | 2026-11-24 | faltas e remarcações, plano de sessões que acaba sem renovar, parcela vencida, paciente que some após a alta | hipótese: R$ 150 a R$ 450 por mês (clínica pequena, uma implantação) | Alta. Atende: plano de sessões, agenda, faltas, insights de renovação/dormente, parcelas, WhatsApp, portal. Lacunas: prontuário/evolução clínica, convênio, remoção de "patologia/Banheira" do vocabulário. Single-tenant tolera bem: clínica com 3+ profissionais comporta implantação dedicada. | 8.0 |
| estética | hipótese: ~200 a 300 mil clínicas e centros de estética (estimativa: 21,6% a 29% de ~1,06 milhão de salões e negócios de beleza do Sebrae; sem contagem oficial separada) | hipótese | 2026-11-24 | pacote de procedimentos vendido e não concluído, retorno e manutenção esquecidos, agenda cheia de faltas, venda de pacotes parcelados | hipótese: R$ 200 a R$ 500 por mês | Boa. Atende: pacote como ordem de serviço com N sessões, parcelas, agenda, WhatsApp, insights de retorno, aniversariantes. Lacunas: fotos antes/depois, ficha de anamnese estética com termo de consentimento, estoque de insumos, comissão. Single-tenant tolera clínicas de médio porte, pesa em esteticista solo. | 7.2 |
| odontologia | 191.689 estabelecimentos ativos com atividade odontológica principal (CNAE 8630-5/04), dado Sebrae divulgado em 2022 sem data-base exata | https://sebraepr.com.br/comunidade/artigo/sebrae-em-dados-atividades-odontologicas | 2026-11-24 | orçamento aprovado que não vira tratamento, faltas, convênios/glosas, controle de parcelas de tratamentos longos | hipótese: R$ 300 a R$ 900 por mês | Média-baixa. Atende: agenda, cadastro, parcelas, WhatsApp, insights. Lacunas críticas: odontograma, orçamento por procedimento, convênio/TISS, imagens/radiografias, exigências do CFO/CRO para o prontuário odontológico. Mercado maduro com muitos concorrentes verticais. | 6.6 |
| medicina geral/especialidades | 575.930 médicos ativos no Brasil, 2,81 por mil habitantes (Demografia Médica CFM 2024, referência janeiro de 2024) | https://medicinasa.com.br/medicos-ativos/ | 2026-11-24 | prontuário eletrônico e receita digital, faturamento de convênio (TISS), confirmação de consulta, gestão de retornos | hipótese: R$ 300 a R$ 1.200 por mês | Baixa hoje. Atende: agenda, portal, WhatsApp, financeiro. Lacunas bloqueantes: prontuário eletrônico conforme CFM, prescrição e atestado digitais com assinatura, TISS/convênios, integração com laboratórios, LGPD reforçada. Entrada exige meses de produto novo. | 6.3 |
| psicologia | hipótese: ~400 a 440 mil psicólogos (estimativa; fontes secundárias divergem entre ~437 mil ativos e mais de 562 mil registros e a página oficial do CFP não trouxe o número) | hipótese | 2026-11-24 | faltas e cancelamentos tardios, cobrança recorrente, sigilo de prontuário, agenda recorrente semanal | hipótese: R$ 60 a R$ 200 por mês (maioria solo) | Média. Atende: agenda, cobrança, portal, WhatsApp, lembretes. Lacunas: prontuário/registro psicológico sigiloso (Resolução CFP), teleatendimento com vídeo, agenda recorrente semanal. Single-tenant pesa: ticket solo não paga implantação dedicada; viável só para clínicas multi-profissional. | 6.4 |
| nutrição | 199.736 nutricionistas no sistema CFN/CRN, 1º trimestre de 2023 (apresentação na Câmara dos Deputados; a página não pôde ser reaberta no momento da conferência, valor lido no resumo da busca) | https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/ce/apresentacoes-em-eventos/eventos-2023/arquivos-2023/CarolineRomeiro.pdf | 2026-11-24 | retorno e adesão do paciente, plano alimentar e antropometria, agenda e cobrança de consulta avulsa | hipótese: R$ 60 a R$ 200 por mês (maioria solo) | Média-baixa. Atende: agenda, pacientes, portal, WhatsApp, financeiro. Lacunas: plano alimentar, antropometria e bioimpedância, banco de alimentos, evolução por consulta. Poucas sessões em "pacote". Single-tenant pesa em solo. | 5.6 |
| fonoaudiologia | 61.054 fonoaudiólogos no total geral por UF (quadro do CFFa com referência agosto de 2026, lido na tabela do PDF oficial) | https://fonoaudiologia.org.br/Anexos/202608/CFFa_Quantitativo_Fonoaudiologos_no_Brasil_por_Estado_202608.pdf | 2026-11-24 | tratamentos longos com muitas sessões, controle de faltas, relatórios para família/escola/convênio, cobrança | hipótese: R$ 100 a R$ 300 por mês | Boa no núcleo, mercado pequeno. Atende: plano de sessões, agenda, faltas, parcelas, portal para família. Lacunas: evolução clínica e relatório por sessão, convênio, materiais de terapia. Estrutura de sessões é a mais próxima da fisioterapia. | 5.8 |
| estúdios de pilates/bem-estar | hipótese: ordem de ~10 a 30 mil estúdios (estimativa; não há contagem nacional; só há fluxo noticiado de ~5,5 mil aberturas previstas para 2025, segundo fabricante de equipamentos) | hipótese | 2026-11-24 | mensalidade recorrente e inadimplência, turmas e reposição de aula, evasão de aluno, agenda de instrutor | hipótese: R$ 150 a R$ 400 por mês | Média. Atende: agenda, check-in, financeiro com parcelas, WhatsApp, insights de evasão (paciente dormente), portal. Lacunas: turma/aula em grupo com vagas, mensalidade recorrente automática, reposição de aula, catraca/controle de acesso. Proximidade com fisioterapia (muitos estúdios pertencem a fisioterapeutas). | 6.2 |
| veterinária | 78.839 estabelecimentos de médicos veterinários em painel do CFMV de 2019 (também 136.334 médicos veterinários naquele painel; dado antigo, há relato de 2025 com ~240 mil registrados) | https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-pecuarios/resistencia-aos-antimicrobianos/publicacoes/copy_of_3CFMVOficinaPANBRAGROposio10.09.2019.pdf | 2026-11-24 | cadastro de pet e tutor, vacinas e retornos, estoque de medicamentos, internação, cobrança | hipótese: R$ 200 a R$ 600 por mês | Baixa. Atende: agenda, financeiro, WhatsApp, lembretes. Lacunas estruturais: paciente é o animal (tutor + pet), carteira de vacinas, estoque, internação, banho e tosa; modelo de dados de paciente humano não serve. Exige modelagem nova. | 5.1 |
| podologia | hipótese: sem contagem oficial; ordem de ~10 a 40 mil profissionais (estimativa; maioria autônoma, só há movimentação formal de poucas centenas de admissões por ano no CAGED) | hipótese | 2026-11-24 | agenda e retorno periódico, poucas clínicas estruturadas, cobrança simples | hipótese: R$ 50 a R$ 150 por mês | Média. Atende: agenda, cadastro, WhatsApp, financeiro. Lacunas: ficha podológica com fotos, estoque de materiais. Mercado pequeno, solo e de ticket baixo; single-tenant inviável economicamente na maioria. | 4.6 |
| profissionais autônomos informais | hipótese: centenas de milhares de profissionais de saúde e bem-estar sem CNPJ estruturado (estimativa; para contexto, havia 16.560.489 MEIs no Brasil em fevereiro de 2026 segundo relatório do Sebrae, de todas as atividades, não só saúde) | hipótese | 2026-11-24 | controle de agenda no caderno ou WhatsApp, cobrança informal, sem histórico do cliente | hipótese: R$ 30 a R$ 100 por mês | Baixa hoje. Atende: agenda, cadastro, WhatsApp, cobrança básica. Lacuna principal: o modelo single-tenant exige implantação dedicada, incompatível com ticket baixo; só funciona após multi-tenant ou autoatendimento. Alta demanda, baixa disposição a pagar, suporte caro. | 5.2 |

## Critérios da nota

Nota final de 0 a 10 (uma casa decimal) = média ponderada de cinco subnotas de 0 a 10, atribuídas por julgamento do analista (qualitativas, revisáveis pelo dono).

| critério | peso | como pontuar |
|---|---|---|
| Tamanho | 25% | 10 = acima de 500 mil profissionais ou 150 mil estabelecimentos; 8 = 200 a 500 mil; 6 = 50 a 200 mil; 4 = abaixo de 50 mil. Número em `hipótese` perde 1 ponto de confiança implícito (não entra na conta, mas está visível na coluna fonte). |
| Dor | 20% | Intensidade e frequência da dor que o Cuidaflux já resolve (faltas, renovação de plano, inadimplência, retorno). |
| Ticket | 15% | 8 = mensalidade acima de R$ 300; 6 = R$ 150 a R$ 300; 4 a 5 = R$ 60 a R$ 150; 2 = abaixo de R$ 60 (hipóteses, não validadas com cliente). |
| Adequação | 25% | Cobertura dos módulos atuais menos as lacunas bloqueantes (prontuário, TISS, odontograma, pet) e o peso do single-tenant para o ticket do nicho. |
| Facilidade de venda | 15% | Proximidade com o produto validado (fisioterapia), poucos concorrentes verticais fortes, decisor único, ciclo curto. |

Subnotas aplicadas (tamanho / dor / ticket / adequação / facilidade):

| nicho | T | D | Tk | A | F | nota |
|---|---|---|---|---|---|---|
| fisioterapia | 8 | 8 | 6 | 9 | 8 | 8.0 |
| estética | 8 | 8 | 6 | 7 | 6 | 7.2 |
| odontologia | 9 | 7 | 8 | 4 | 5 | 6.6 |
| psicologia | 8 | 7 | 4 | 6 | 6 | 6.4 |
| medicina geral/especialidades | 10 | 7 | 8 | 3 | 3 | 6.3 |
| estúdios de pilates/bem-estar | 6 | 7 | 5 | 6 | 7 | 6.2 |
| fonoaudiologia | 4 | 7 | 5 | 7 | 6 | 5.8 |
| nutrição | 7 | 6 | 4 | 5 | 5 | 5.6 |
| profissionais autônomos informais | 10 | 6 | 2 | 3 | 3 | 5.2 |
| veterinária | 7 | 6 | 6 | 3 | 3 | 5.1 |
| podologia | 3 | 5 | 4 | 6 | 5 | 4.6 |

Limites: subnotas são opinião fundamentada nos módulos do registry e nos números acima, não medição; mudar um peso pode trocar a ordem entre estética, odontologia, psicologia e medicina (todas entre 6,3 e 7,2). Todos os tickets são hipóteses até haver venda real.

## Hipóteses declaradas (a validar)

- Tamanho: estética, psicologia, pilates, podologia e autônomos informais (sem contagem oficial confiável encontrada).
- Ticket de todos os nichos (faixas plausíveis, sem pesquisa de preço de cliente).
- Datas-base: dados de odontologia (2022), veterinária (2019) e nutrição (2023) são antigos; fisioterapia sem data exata; medicina de janeiro de 2024. Reconsultar nas páginas oficiais dos conselhos antes de usar em material comercial.

## Recomendação preliminar (sem decisão)

Proposta do agente, sujeita à decisão do dono (portão da task T-9, fora deste documento).

- **Nicho de entrada sugerido: fisioterapia.** Melhor nota (8,0), maior adequação (o sistema nasceu nele e já cobre plano de sessões, faltas, renovação e parcelas), mercado grande (mais de 370 mil registros), produto utilizável sem construir prontuário novo e implantação dedicada compatível com clínicas de 3+ profissionais. É o caminho mais curto para a primeira venda.
- **Expansão sugerida 1: estética.** Segunda nota (7,2) e o conceito de pacote de sessões parceladas equivale à ordem de serviço do sistema; falta pouco (fotos, anamnese estética, comissão) e a dor de retorno e pacote parado é a mesma que os insights já resolvem.
- **Expansão sugerida 2: estúdios de pilates/bem-estar.** Vizinho natural da fisioterapia (mesmo perfil de dono, mesma canalização), com a lacuna principal bem delimitada (turmas e mensalidade recorrente). Fonoaudiologia fica como alternativa de nicho pequeno, de boa aderência técnica.
- **Fica para depois:** medicina e odontologia (mercados grandes, mas pedem prontuário, TISS e odontograma antes de vender) e autônomos informais e veterinária (exigem multi-tenant ou modelagem nova).

## Decisão de nicho

Nicho de entrada: fisioterapia
Nichos de expansão: estética, estúdios de pilates/bem-estar

Ordem de ataque definida pelo dono em 2026-11-24, a partir da recomendação preliminar acima. A ordem pode mudar: o produto vai receber novas funcionalidades na próxima semana (agendador de tarefas Hangfire, integração com WhatsApp via Z-API, integração com Google Agenda e prontuário), o que muda a coluna "adequação do sistema" de vários nichos. Reavaliar a matriz depois dessa entrega.

Aprovado por: Dono do produto (decisão registrada em conversa) em 2026-11-24
