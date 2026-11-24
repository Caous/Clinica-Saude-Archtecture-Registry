# ICP e personas — fisioterapia

> Produto: **Cuidaflux**. Nicho de entrada: fisioterapia (decisão de 2026-11-24 em `mercado.md`); expansão: estética e estúdios de pilates/bem-estar.
> Consulta realizada em 2026-11-24 (PBI-20261124-publico-mercado-modelo-negocio, AC-3 / T-10).
> Regra: todo dado de mercado traz fonte (URL) e data da consulta, ou vem marcado como `hipótese`. Não foi encontrada pesquisa nacional (COFFITO, Sebrae ou associação) com porte médio, ferramentas e faturamento das clínicas de fisioterapia; as fontes abaixo são estudos regionais, páginas de fornecedores e blogs, e valem como indício, não como retrato do mercado.
> Funcionalidades marcadas como "em breve" **não existem hoje** (Hangfire/tarefas agendadas, WhatsApp via Z-API, Google Agenda, prontuário); o roadmap é de cerca de uma semana e não pode ser prometido como pronto.

## ICP

Cliente ideal inicial (hipótese de trabalho, a validar nas primeiras conversas): clínica de fisioterapia particular, com dono/a fisioterapeuta que também atende, vendendo planos de sessões no particular (com ou sem parte de convênio), em que a falta e o plano que acaba sem renovar já custam dinheiro visível.

- Porte: clínica pequena a média, uma unidade (às vezes duas), com 3 a 10 profissionais mais 1 a 2 pessoas na recepção/administrativo. Hipótese; sem fonte nacional. Clínica com 1 a 2 profissionais fica como ICP secundário (ver persona 2), porque a implantação dedicada pesa no ticket (`mercado.md`, seção "Fatos do sistema").
- Número de profissionais: faixa de 3 a 10 como alvo, que cai nos planos propostos Clínica (3 a 6) e Dedicado (7 a 12; `precificacao.md`, PROPOSTA). Clínicas de 11 e 12 profissionais cabem no plano Dedicado, mas ficam fora do foco inicial de venda (hipótese: clínica maior tende a depender de convênio/TISS e de prontuário maduro, que o produto ainda não tem); acima de 12 é "sob consulta" (Azure dedicado). Hipótese.
- Ferramentas atuais (hipótese, a confirmar em entrevista): agenda no papel, Google Agenda ou planilha; WhatsApp pessoal ou da clínica para confirmar e cobrar; planilha ou caderno para saldo de sessões e parcelas; às vezes um software genérico de consultório (agenda + prontuário) sem controle de plano de sessões. O comparativo de um fornecedor de software (Physitrack, 2026) descreve os sistemas de gestão como a união de agenda, prontuário, cobrança e financeiro, e lista o próprio produto a R$ 169 por profissional por mês, o que dá uma referência de preço de mercado por profissional (fonte comercial, preço do fornecedor): https://www.physitrack.com/en-gb/insights/melhor-software-fisioterapia-brasil-comparativo (consulta 2026-11-24).
- Preço que já pagam hoje: referências de concorrentes em `concorrentes.md` (por exemplo iClinic a partir de R$ 99 por mês por profissional, Trinks de R$ 38 a R$ 146 por faixa, Booksy R$ 99,99 por mês); o que a clínica-alvo paga hoje de fato é hipótese até entrevistar. Faixa de mensalidade do Cuidaflux: hipótese de R$ 150 a R$ 450 por mês por implantação (`mercado.md`).
- Faturamento típico: hipótese de R$ 20 mil a R$ 80 mil por mês. Único número com fonte: material da Câmara dos Deputados que estima média de R$ 20 mil por mês para clínica de fisioterapia, com cerca de 400 pacientes (data do documento não confirmada; tratar como piso e como hipótese): https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/cdeic/apresentacoes-e-arquivos-audiencias-e-seminarios/CustoClinicaFisioterapia.doc/view (consulta 2026-11-24). A parte superior da faixa (R$ 80 mil) é hipótese própria, sem fonte.
- Mix de pagamento: hipótese de clínica que mistura particular e convênio. Há relato recorrente de defasagem na tabela paga por convênios (o Crefito-8, do Paraná, pediu renegociação e disse que a defasagem pode inviabilizar a profissão no estado; reportagem sem data confirmada): https://www.tribunapr.com.br/noticias/economia/fisioterapeutas-querem-negociar-valor-de-procedimentos/amp/ (consulta 2026-11-24). Efeito comercial: o dono quer crescer o particular, onde o plano de sessões e a renovação mandam. Preço de sessão particular citado em blog de precificação (estimativa, não oficial): R$ 120 a R$ 220 por sessão ortopédica em SP/RJ e R$ 80 a R$ 180 em outras cidades, 2026: https://www.freelasemcrise.com.br/blog/fisioterapeuta-quanto-cobrar (consulta 2026-11-24).
- Perfil de quem decide: estudo com clínicas do Rio Grande do Sul indica gestores majoritariamente mulheres de 30 a 39 anos que acumulam atendimento e gestão (amostra regional, não nacional): https://www.scielo.br/j/fp/a/VrqjpGtHjWtnLZ6K3QYp5Hj/ (consulta 2026-11-24). Consequência: pouco tempo para gestão, preferência por implantação rápida e por WhatsApp.
- Tamanho do universo: mais de 370 mil fisioterapeutas registrados (conta registros, não ativos; ver `mercado.md`). Vagas CLT em clínicas de fisioterapia (CNAE 8650-0/04): 32.239 nos últimos 12 meses segundo dados do CAGED reunidos pelo Portal Salário, que não informam profissionais por clínica: https://www.salario.com.br/empresas/atividades-de-fisioterapia/ (consulta 2026-11-24).
- Faltas: não há taxa de faltas específica de fisioterapia com fonte robusta. Como referência geral (não fisioterapia), uma revisão de absenteísmo em ambulatório cita 206 faltas em 1.296 consultas agendadas (15,9%): https://revistas.usp.br/rmrp/article/download/159626/154332/356524 (consulta 2026-11-24; lida via resumo de busca). Para a venda, a taxa de faltas da clínica-alvo deve ser medida na própria clínica, e não prometida.
- Fora do ICP inicial (por enquanto): clínicas que dependem quase só de convênio/TISS (falta o módulo), redes grandes e fisioterapeuta domiciliar sem agenda fixa.

## Persona: Dona de clínica de fisioterapia (3 a 10 profissionais)

Nome de trabalho: Camila, 30 a 45 anos, fisioterapeuta que abriu a clínica e hoje atende e administra (hipótese de perfil, apoiada em parte no estudo regional do RS acima).

- Perfil:
  - Fisioterapeuta e dona de uma clínica particular, com 3 a 10 profissionais (celetistas, PJ e parceiros) e 1 a 2 pessoas na recepção.
  - Atende pacientes pela manhã e resolve gestão à noite e no fim de semana; decide sozinha ou com sócio/a.
  - Vende pacote de sessões no particular e atende parte por convênio; usa WhatsApp o dia todo e planilha ou sistema simples para o resto.
  - Faturamento mensal em hipótese de R$ 20 mil a R$ 80 mil; margem apertada por aluguel, equipe e tabela de convênio defasada.
- Dores:
  - Paciente que falta ou desmarca em cima da hora e deixa horário de profissional vazio; reposição vira confusão de agenda por profissional.
  - Pacote de sessões que acaba e o paciente não renova; ninguém avisa que o plano está no fim.
  - Paciente que recebe alta ou some no meio do tratamento (evasão) e a clínica só percebe meses depois; falta rotina de retorno.
  - Parcela do pacote vencida e cobrança feita de forma constrangedora no WhatsApp, quando dá tempo de cobrar.
  - Não sabe quantas sessões o paciente já fez nem quanto ainda deve; controle em caderno ou planilha que só a recepção entende.
  - Pouca visão do todo: quanto cada profissional produz, quanto entra de particular versus convênio, quem está com agenda ociosa.
  - Equipe e recepção respondendo WhatsApp o dia inteiro para confirmar, remarcar e informar horário.
- Gatilhos de compra:
  - Mês com muitas faltas ou com caixa abaixo do esperado, quando percebe que o buraco está em horário perdido e parcela não recebida.
  - Contratação de mais um profissional ou abertura de segunda sala/filial, quando a planilha deixa de dar conta.
  - Troca de recepcionista ou saída da pessoa que "sabia tudo" da planilha.
  - Descoberta de pacotes vencidos há semanas sem contato (dá para mostrar com os insights de plano acabando, paciente dormente e parcela vencida do Cuidaflux).
  - Pedido do paciente por agendar ou confirmar pelo celular, ou comparação com a clínica concorrente que já tem isso.
  - Anúncio de que o WhatsApp com Z-API, as tarefas agendadas e o prontuário chegam em breve (só como direção de produto, nunca como entrega prometida).
- Objeções:
  - "Já uso planilha/Google Agenda e funciona" (custo de mudar de rotina).
  - "Tenho medo de migrar os pacientes e perder o histórico" (a importação de pacientes por Excel existe; migração de histórico clínico não).
  - "Preciso de prontuário e evolução do paciente no mesmo sistema" (prontuário ainda não existe; está em breve).
  - "Parte dos meus pacientes é convênio e preciso de guia/TISS" (lacuna declarada em `mercado.md`).
  - "Vou pagar por profissional e fica caro" (concorrentes cobram por profissional; a mensalidade da implantação dedicada é hipótese a validar).
  - "Minha recepção não vai aprender" ou "o WhatsApp da clínica é o meu número, tenho receio do bot" (o bot tem modo humano e misto; a integração com Z-API é futura).
  - "Sistema vende pensando em médico e dentista, não em fisio" (resposta: plano de sessões e insights de renovação foram o núcleo do produto).
- Critérios de decisão:
  - Controla plano de sessões e parcelas de forma que a recepção entenda (saldo de sessões, parcela vencida).
  - Reduz faltas e horários vazios de forma demonstrável (lembrete/confirmação por WhatsApp e insights de falta).
  - Preço claro por mês, sem fidelidade e sem cobrança por mensagem (a validar; ver `concorrentes.md`, espaço de diferenciação).
  - Tempo para colocar no ar: importar os pacientes e começar a usar na mesma semana, com treinamento da recepção.
  - Visão por profissional e por filial (dashboards, multi-filial).
  - Marca da clínica (marca configurável) e segurança dos dados dos pacientes (implantação dedicada).
  - Confiança na equipe do produto: suporte humano e resposta rápida no WhatsApp.

## Persona: Fisioterapeuta autônomo/a ou dono/a de clínica pequena (1 a 2 profissionais)

Nome de trabalho: Rafael, 25 a 40 anos, atende em consultório alugado, sala em clínica de terceiros ou clínica própria com 1 ou 2 profissionais (hipótese de perfil; estudos regionais indicam grande peso de autônomos e atendimento domiciliar, sem número nacional).

- Perfil:
  - Fisioterapeuta que atende sozinho ou com um colega e cuida de tudo: agenda, cobrança, WhatsApp e marketing.
  - Vende sessões avulsas e pacotes de 5 a 20 sessões no particular, com parte da renda vinda de convênio ou de domiciliar.
  - Renda variável; estudo de São Paulo (Crefito-3, 2.323 respondentes) mostrou 45% com renda bruta mensal de até R$ 3.000 e melhor remuneração para quem tem clínica própria ou atua em universidade (resumo de busca; consulta 2026-11-24): https://revistas.usp.br/fpusp/article/download/234672/212586/747815 (a confirmar no texto).
  - Hoje usa caderno, agenda do celular, Google Agenda e WhatsApp pessoal.
- Dores:
  - Falta de paciente é dinheiro que não entra no dia; sem recepção, ele mesmo confirma um a um pelo WhatsApp.
  - Esquece de cobrar, e controla pacote e parcelas de cabeça ou em planilha.
  - Paciente que não volta depois da alta ou do pacote, sem rotina para chamar de volta.
  - Agenda pessoal misturada com a profissional; reagendar vira troca de mensagens.
  - Sem tempo e sem dinheiro para sistema grande e caro; teme assinatura que não se paga.
- Gatilhos de compra:
  - Mês de poucas sessões pagas por esquecimento de cobrança ou por faltas.
  - Início de segundo profissional ou sala, ou mudança para consultório próprio.
  - Indicação de colega que já usa sistema; teste grátis ou demonstração curta.
  - Pagamento por Pix, boleto ou cartão parcelado do pacote, quando passa a vender mais pacotes.
  - Chegada de Google Agenda e do WhatsApp via Z-API (em breve) que reduzem trabalho manual.
- Objeções:
  - "Não preciso de sistema, o WhatsApp e o caderno resolvem."
  - "É caro para quem atende sozinho" (ticket de concorrentes de agenda é baixo: Trinks, Booksy, Secretaria.io; a implantação dedicada do Cuidaflux tem custo de infraestrutura que pesa no ticket solo, por isso é ICP secundário).
  - "Preciso de prontuário/evolução" (em breve, não pronto).
  - "Meus pacientes não usam portal" (o portal é opcional; o WhatsApp é o canal principal).
  - "Não quero ficar preso a contrato" (a oferta sem fidelidade precisa ser confirmada em `precificacao.md`).
- Critérios de decisão:
  - Preço mensal baixo e público, sem fidelidade.
  - Agenda e confirmação por WhatsApp que realmente reduzam faltas.
  - Controle simples de pacote de sessões e parcelas com lembrete de cobrança.
  - Uso pelo celular e curva de aprendizado de poucas horas.
  - Sincronia com Google Agenda (em breve) para não duplicar compromissos.
  - Teste ou demonstração antes de pagar.

## Persona: Recepcionista / gestor administrativo (influenciador)

Nome de trabalho: Juliana, 22 a 40 anos, quem opera o dia a dia da clínica de 3 a 10 profissionais; não assina o contrato, mas pode vetar ou defender a troca (hipótese de perfil).

- Perfil:
  - Recepcionista ou gestor administrativo que marca, confirma, cobra e atende telefone e WhatsApp.
  - Conhece a planilha e o caderno de cabeça; é quem mais sofre com retrabalho e quem mais perde se o sistema for difícil.
  - Reporta ao dono/a e leva a ele os problemas do dia a dia, como faltas, parcelas atrasadas e conflitos de horário.
- Dores:
  - Confirmar sessão por sessão no WhatsApp, e ainda lidar com quem falta sem avisar.
  - Conflito de agenda entre profissionais e salas; pedido de remarcação fora do horário.
  - Saber qual paciente ainda tem sessões, quem deve parcela, quem está sumido, sem consultar três lugares.
  - Cobrar paciente de forma delicada e sem lista pronta de quem está em atraso.
  - Responder as mesmas perguntas (horário, valor, endereço) o dia todo.
- Gatilhos de compra:
  - Sobrecarga em dia de agenda cheia ou saída de colega de recepção, que a leva a pedir ferramenta ao dono/a.
  - Erro de agenda ou de cobrança que gerou reclamação de paciente.
  - Teste prático em que ela vê a lista de "faltou ontem" e "parcela vencida" pronta, sem montar planilha.
- Objeções:
  - "Vou ter que aprender tudo de novo e a clínica não pode parar."
  - "O bot vai atender mal o paciente e eu levo a culpa" (o atendimento tem modo humano e misto).
  - "A planilha é minha e eu sei onde está tudo."
  - "O sistema vai demorar mais do que o caderno."
- Critérios de decisão:
  - Facilidade: poucos cliques para marcar, remarcar e confirmar.
  - Treinamento e suporte humano nas primeiras semanas.
  - Listas prontas de pendências do dia (faltas, parcelas, planos acabando).
  - Controle de quem pode ver e fazer o quê (perfis de acesso).
  - Confiabilidade do WhatsApp e possibilidade de assumir a conversa quando o bot não resolve.

## Insights para vendas

1. Vender "renda que vaza", não "software": faltas, plano de sessões que acaba sem renovar e parcela vencida são três ralos de dinheiro que os insights do Cuidaflux (faltou ontem, plano acabando, paciente dormente, parcela vencida) já listam. Na demonstração, mostrar a lista com dados reais da clínica (importados do Excel) vale mais do que mostrar telas.
2. Falar com a dona (3 a 10 profissionais), conquistar a recepção: a decisão é da fisioterapeuta-dona, mas o veto vem de quem opera. Levar a recepcionista para a demonstração e prometer treinamento nas primeiras semanas.
3. Particular antes de convênio: a tabela de convênio é queixa recorrente da categoria, então o apelo é crescer o particular com pacote, renovação e cobrança. Ser honesto sobre a lacuna de TISS/guia e sobre quem NÃO é cliente hoje.
4. Prontuário e WhatsApp via Z-API são "em breve": usar como direção de produto, nunca como promessa. Quem exigir prontuário agora deve ser colocado em lista de espera, não vendido.
5. Preço público, sem fidelidade e sem taxa por mensagem é o espaço aberto frente a concorrentes que escondem preço ou cobram WhatsApp à parte (`concorrentes.md`); mas testar a faixa de R$ 150 a R$ 450 por mês por clínica contra a referência por profissional do mercado (iClinic R$ 99, Physitrack R$ 169 por profissional por mês), e tratar o solo como ICP secundário por causa do custo da implantação dedicada.

## Hipóteses e lacunas (a validar)

- Porte da clínica-alvo (3 a 10 profissionais), mix particular/convênio, ferramentas atuais e preço que pagam hoje: sem fonte nacional; validar em 10 a 15 entrevistas com donos de clínica antes de usar em material comercial.
- Faturamento típico: só há um documento sem data confirmada (R$ 20 mil por mês); o teto da faixa é hipótese própria.
- Taxa de faltas e de evasão em fisioterapia: sem número específico encontrado; a referência de 15,9% é de ambulatório geral e foi lida em resumo de busca.
- Renda e perfil dos autônomos: estudos regionais (SP, DF, PR, RS) não representam o país; o trecho do Crefito-3 foi lido em resumo de busca.
- Preço por sessão e defasagem de convênio: blog e reportagem sem data confirmada; sem tabela oficial atual verificada.
- Preço de fornecedor (Physitrack) é de página comercial e muda; não é preço pago pelo mercado.
- Nomes das personas são de trabalho e não representam pessoas reais.
