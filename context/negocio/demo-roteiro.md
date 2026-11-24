# Roteiro de demonstração

> Produto: **Cuidaflux** ("O fluxo do cuidado"). Público principal: donas e donos de clínicas de fisioterapia; secundário: fisioterapeutas autônomos. Documento do PBI-20261124-publico-mercado-modelo-negocio (AC-9, T-15).
> Tom: acolhedor, claro, confiável e leve (`Sistema-Clinica-Marca/identidade.md`). Falar com pessoas, sem jargão de tecnologia, sem prometer o que não existe.
>
> **Regras desta demonstração**
> 1. Só se mostra ao vivo o que o sistema faz hoje: agenda, pacientes, ordens de serviço e sessões (pacotes), financeiro com parcelas, bot de WhatsApp (n8n), portal do paciente, notificações, dashboards, insights de venda, multi-filial, marca configurável e e-mail em massa.
> 2. O que ainda não existe (prontuário, IA no atendimento, WhatsApp via Z-API, Google Agenda, tarefas agendadas/Hangfire, TISS/convênio, assinatura ICP-Brasil) aparece só na seção "Em breve", sempre como direção de produto e marcado **em breve — confirmar antes de prometer**. Nunca com data.
> 3. Preços e planos citados vêm de `precificacao.md` e são **PROPOSTA** (aguardam aprovação do dono do produto). A única decisão já aprovada é a margem mínima interna; ela não é assunto de demonstração.
> 4. Não prometer redução de faltas ou aumento de renovação em número. Nenhuma taxa de resultado foi medida; o que se mostra é a lista pronta de quem precisa de atenção.

## Preparação

### Ambiente de demonstração com os dados da clínica

Objetivo: a dona ver **os pacientes dela** na tela, não dados de exemplo. É o que mais convence (`icp-personas.md`, "Insights para vendas", item 1).

1. **Pedir a planilha com antecedência (3 a 5 dias).** Qualquer Excel de pacientes serve: nome, telefone, e-mail, CPF (se tiver), data de nascimento. Se tiver, também: profissional, plano/pacote contratado, sessões feitas, parcelas e vencimentos. Dizer com clareza: "Pode mandar do jeito que está, a gente arruma".
2. **Cuidar dos dados com seriedade.** Dado de paciente é sensível. Usar a planilha só no ambiente de demonstração da clínica, combinar por escrito que os dados são dela, e apagar o ambiente se ela não seguir (o prazo de exclusão é combinado por escrito, a definir).
3. **Importar os pacientes.** No ambiente de demonstração, usar a importação de pacientes por Excel (tela de pacientes, `/customer`). Conferir: contagem de linhas, telefones sem formato quebrado, datas de nascimento.
4. **Montar os pacotes e as parcelas.** A importação cobre o cadastro de pacientes. Pacotes (ordem de serviço com N sessões), sessões já realizadas e parcelas **cadastrar à mão** para uns 10 a 15 pacientes, com datas que façam os insights aparecerem: alguns planos com 1 ou 2 sessões restantes, alguns pacientes sem sessão há mais de 30 dias, algumas parcelas vencidas, alguns aniversários na semana. Nada de inventar situação: usar o que a planilha mostra; onde faltar dado, completar com o consentimento da dona.
5. **Marca da clínica.** Configurar nome, logo e cores (marca configurável) para a tela abrir já com a cara da clínica.
6. **Cadastrar a equipe.** Criar o usuário da dona (administrador) e o da recepcionista (role `Administrativo` ou `Funcionario`, conforme o que ela precisa ver), mais 1 ou 2 profissionais na agenda, com cores diferentes.
7. **Portal do paciente.** Gerar acesso para 1 paciente de teste (o telefone da própria dona ou um colega) para testar o portal no celular.
8. **WhatsApp (bot atual).** Se for mostrar a conversa ao vivo, deixar um número de teste conectado, nunca o número da clínica sem autorização. Se não der, usar os prints/gravação do plano B.
9. **Ensaio na véspera:** rodar o roteiro inteiro uma vez, com o cronômetro.

### Quem convidar

- **A dona/o dono** (decide a compra).
- **A recepcionista ou gestor administrativo** (quem opera; pode vetar ou defender a troca). Pedir que venha com uma dúvida real do dia a dia.
- Se houver sócio/a, convidar também. Profissionais da equipe: opcional.

### Duração e formato

- **30 minutos**: 3 de abertura, 20 de demonstração (passos 1 a 10; os tempos entre parênteses abaixo somam 20), 5 de proposta e próximos passos (passo 11) e 2 de folga. Se a conversa pedir mais tempo, tirar do passo 9 e do passo 10 antes de tirar do passo 6 (clímax).
- Formato: de preferência presencial ou videochamada com tela compartilhada; a recepcionista mexe no sistema em pelo menos um passo (passo 4).
- Abertura sugerida: "Obrigada por reservar esse tempo. Vou mostrar com os pacientes da clínica de vocês, para ficar real. Podem me interromper a qualquer momento."

## Passos da demonstração

### 1. Boas-vindas: a clínica com a cara dela
- **Tela:** login e página inicial (`/`, que redireciona por perfil) com logo e cores da clínica.
- **Dor que resolve:** medo de "sistema genérico que não é pra fisio"; confiança.
- **Fala sugerida:** "Isso aqui é a sua clínica, com o seu nome e as suas cores. Os pacientes que estão aí são os da sua planilha. A ideia é você abrir e reconhecer o seu dia".
- **Resultado esperado:** a dona reconhece os próprios pacientes e relaxa. (1 min)

### 2. Dashboard de operação: o dia num relance
- **Tela:** `/dashboard-operacao`.
- **Dor:** pouca visão do todo; não saber quanto cada profissional produz nem como está a agenda.
- **Fala sugerida:** "Em vez de abrir três planilhas, você vê as sessões do mês, o que foi realizado e cancelado, e como cada unidade e cada profissional está indo".
- **Resultado esperado:** a dona aponta um número e faz uma pergunta sobre a própria clínica. (2 min)

### 3. Agenda: marcar e remarcar sem confusão
- **Tela:** `/calendar`. Criar um agendamento, mostrar as cores por profissional e a mudança de status (a confirmar, confirmado pelo paciente, faltou, reagendar).
- **Dor:** conflito de agenda entre profissionais, remarcação fora de hora, confirmação sessão por sessão.
- **Fala sugerida:** "Cada profissional tem a sua cor. Remarcar é trocar o horário e confirmar. E o status mostra quem confirmou e quem faltou, sem você perguntar de novo".
- **Resultado esperado:** a recepcionista marca uma sessão sozinha em poucos cliques. (2 min)

### 4. Pacientes e pacote de sessões: saldo sem caderno
- **Tela:** `/customer` (ficha do paciente, histórico) e `/ordem-servico` (plano de N sessões, sessões feitas e restantes).
- **Dor:** "não sei quantas sessões o paciente já fez nem quanto ainda deve"; controle que só a recepção entende.
- **Fala sugerida:** "Aqui o pacote do paciente: vendeu 10 sessões, já fez 7, faltam 3. Quando a Juliana abre, ela vê o saldo na hora. Não depende de memória de ninguém". (Usar o nome real da recepcionista.)
- **Resultado esperado:** a recepcionista confirma que "é isso que a planilha dela faz". Convidá-la a registrar uma sessão. (3 min)

### 5. Financeiro e parcelas: cobrança sem constrangimento
- **Tela:** lançamentos e parcelas (transações com parcelas por forma de pagamento: Pix, boleto, cartão) e `/financeiro/despesas`.
- **Dor:** parcela do pacote vencida, cobrança feita de qualquer jeito no WhatsApp; falta de visão de entrada e saída.
- **Fala sugerida:** "O pacote pode ser parcelado e cada parcela fica registrada com vencimento. Entrada, saída e despesas ficam no mesmo lugar".
- **Resultado esperado:** a dona entende que parcela e pacote conversam entre si. Importante: o Cuidaflux **registra** e lista as parcelas; **não cobra o paciente automaticamente** hoje. (2 min)

### 6. Clímax: insights de venda
- **Tela:** painel de insights, depois `/insights/:chave` para cada lista: **plano acabando**, **paciente dormente**, **parcelas vencidas** (e, se der tempo, aniversariantes e "faltou ontem").
- **Dor:** pacote que acaba e o paciente não renova; paciente que some no meio do tratamento; parcela esquecida.
- **Fala sugerida:** "Esta é a lista de pacientes que estão com o pacote no fim. Hoje, quem avisa? Aqui já está pronta, com nome e telefone. Estes outros não aparecem há mais de um mês. E estas são as parcelas vencidas. Nenhum desses você precisa caçar na planilha". Pausa. Deixar a dona ler os nomes.
- **Resultado esperado:** a dona reconhece pacientes reais ("nossa, essa daqui eu nem lembrava"). Se pedir "quanto isso vai render", responder com honestidade: "Não prometo número. O que garanto é que a lista existe e é sua; o que você faz com ela é com você". (4 min)
- Ponto de atenção: usar sempre dados reais da clínica; se a lista vier vazia, cadastrar casos antes (preparação, item 4) e **avisar** que são exemplos montados.

### 7. WhatsApp: o bot atual e a conversa assumida pela equipe
- **Tela:** `/basic-tables` (atendimentos de WhatsApp) e `/dashboard-lead`; configuração em `/whatsapp/config` (somente administrador).
- **Dor:** equipe respondendo as mesmas perguntas o dia todo (horário, valor, endereço); lead que esfria.
- **Fala sugerida:** "O assistente responde as primeiras perguntas e leva o paciente para o agendamento. Se a conversa pede gente, a recepção assume na mesma tela. Dá para deixar só o robô, só a equipe ou os dois".
- **Resultado esperado:** a recepcionista vê que pode assumir a conversa e para de temer o bot. (2 min)
- **Honestidade:** o bot de hoje usa uma conexão **não oficial** com o WhatsApp, e conexão não oficial pode levar ao bloqueio do número. Se perguntarem, responder usando a resposta pronta de `objecoes-faq.md` (número de teste; decisão do provedor ainda em aberto). Não afirmar que "nunca bloqueia".

### 8. Portal do paciente: o paciente na palma da mão
- **Tela:** portal do paciente no celular (Extranet): home, calendário, plano com sessões, histórico; solicitar/confirmar/cancelar agendamento. Acesso gerado na tela de acesso do paciente (`/customer-access`).
- **Dor:** paciente pedindo horário e saldo de sessões pelo WhatsApp; comparação com a clínica concorrente que já tem aplicativo.
- **Fala sugerida:** "Seu paciente entra com o acesso dele, vê as consultas, o plano e quantas sessões faltam, e pode pedir ou confirmar um horário. Menos mensagem para a recepção, mais cuidado percebido".
- **Resultado esperado:** a dona usa o portal no próprio celular. O portal é opcional; o paciente que prefere WhatsApp continua sendo atendido por ele. (2 min)

### 9. Notificações e e-mail em massa: avisar sem esforço
- **Tela:** `/notificacoes/enviar` e `/notificacoes/historico`; envio de e-mail em massa (página de disparo de e-mail).
- **Dor:** comunicar mudança de horário, feriado ou campanha de retorno para muitos pacientes.
- **Fala sugerida:** "Comunicado de feriado ou campanha de volta para quem está sumido: escreve uma vez e envia. O histórico mostra o que foi enviado".
- **Resultado esperado:** a dona imagina um uso concreto (por exemplo, chamar os pacientes dormentes). (1 min)

### 10. Multi-filial, perfis de acesso e segurança prática
- **Tela:** cadastro de unidades (`/form-branch`), cadastro de equipe (`/form-employee`) e, para o administrador, `/logs`.
- **Dor:** "e se eu abrir uma segunda unidade?"; "quem pode ver o quê?".
- **Fala sugerida:** "Cada pessoa vê só o que o perfil dela permite: o financeiro fica com quem você escolher. Se abrir outra unidade, ela entra no mesmo sistema, e os registros de uso ficam guardados".
- **Resultado esperado:** a dona se sente no controle. **Não prometer certificação nem "segurança 100%"** (ver `objecoes-faq.md`, LGPD). (1 min)

### 11. Resumo do ganho e fechamento com a proposta
- **Tela:** voltar ao dashboard (`/dashboard-operacao`) e depois apresentar a proposta (documento `proposta-modelo.md`, preparado por outro agente) ou a tabela de planos abaixo.
- **Dor:** decidir com clareza, sem letra miúda.
- **Fala sugerida:** ver a seção "Fechamento" abaixo.
- **Resultado esperado:** a dona escolhe o plano certo para o tamanho da clínica e combina o próximo passo com data. (5 min)

## Em breve (direção de produto, nunca como entregue)

> Marcar na fala e na tela: **em breve — confirmar antes de prometer**. Não existe data. O que for citado aqui **não entra no preço** como entregue.

Mostrar no máximo 3 minutos, só se a dona perguntar ou depois do passo 10, **em slide ou conversa, nunca em tela de sistema**:

- **Prontuário e evolução do paciente (em breve).** Hoje o Cuidaflux não tem prontuário. Fala: "Estamos construindo o prontuário e a evolução do paciente. Hoje ele ainda não existe; se for imprescindível para você agora, o melhor é continuar com o seu prontuário atual e a gente conversa quando estiver pronto. Prefiro te falar isso a prometer".
- **WhatsApp com conexão mais estável (Z-API) (em breve).** Hoje o WhatsApp funciona pelo bot atual. Fala: "Estamos preparando uma conexão nova, que facilita lembretes e confirmação automáticos. Ainda não está disponível".
- **Google Agenda (em breve).** Fala: "A ideia é a agenda do Cuidaflux conversar com a sua Google Agenda para você não duplicar compromissos. Ainda não existe".
- **Lembretes automáticos agendados (em breve).** Dependem de uma rotina de tarefas agendadas que ainda não existe; hoje a lista aparece no insight, mas o envio é com a equipe.
- **IA no atendimento (em breve, sem confirmação).** Hoje o assistente de WhatsApp é um roteiro de perguntas e respostas, sem IA generativa. Fala: "Estamos avaliando IA no atendimento, mas ainda não existe e não está confirmada".
- **Convênio/TISS e assinatura digital ICP-Brasil: não estão no escopo atual; o roadmap é decisão do dono do produto.** Se perguntarem, dizer: "Hoje o Cuidaflux é para quem trabalha principalmente no particular. Guia e TISS não estão prontos nem no escopo atual, e eu prefiro te dizer isso agora".

Regra de ouro: se a pessoa disser "então eu fecho se tiver prontuário", **não fechar**. Colocar em lista de espera e registrar o contato.

## Fechamento: proposta e próximos passos

### Apresentar a proposta (sempre marcada como PROPOSTA)

> Planos propostos (`precificacao.md`; **PROPOSTA, aguarda aprovação do dono do produto**; mensalidade por clínica, sem fidelidade):

| Plano | Profissionais | Mensalidade (PROPOSTA) | Implantação (PROPOSTA) |
|---|---|---|---|
| Essencial | 1 a 2 | R$ 149,00 | R$ 0 |
| Clínica | 3 a 6 | R$ 319,00 | R$ 0 no lançamento (taxa de lista de R$ 290) |
| Dedicado | 7 a 12 | R$ 419,00 | R$ 0 no lançamento (taxa de lista de R$ 590) |

- A oferta de lançamento (implantação grátis e preço travado por 12 meses para os primeiros clientes) também é **PROPOSTA** e só vale se o dono do produto aprovar.
- WhatsApp **não** está nas mensalidades; chega como add-on quando existir (em breve, sem data).
- Impostos e nota fiscal: ainda em definição; não afirmar valor "final com impostos" antes disso.

**Fala sugerida:** "Para uma clínica do tamanho da sua, o plano que faz sentido é o Clínica, R$ 319 por mês. É o preço da clínica, não por profissional; então, se entrar mais gente, o valor não sobe até a faixa. Sem fidelidade: se não fizer sentido, você cancela. Este valor é uma proposta que estamos fechando, e eu te confirmo por escrito antes de qualquer compromisso".

### Próximos passos (propor com data)

1. **Hoje:** perguntar "o que faltou ver?" e anotar objeções; responder com `objecoes-faq.md`.
2. **Em até 2 dias:** enviar a proposta por escrito (`proposta-modelo.md`) com o plano indicado.
3. **Até 1 semana:** conversa de 15 minutos para tirar dúvidas e decidir.
4. **Se decidir:** combinar a data de início, enviar a planilha final de pacientes, agendar o treinamento da recepção (primeiras semanas, com suporte humano).
5. **Se não decidir:** perguntar o que falta (preço, prontuário, convênio, receio de migrar) e registrar. Voltar em data combinada, sem insistir.

Frase de encerramento: "Obrigada pelo tempo. O combinado é: eu envio a proposta amanhã, e a gente conversa de novo na quinta. Se algo mudar no meio do caminho, é só me chamar".

## Plano B: se algo falhar na demonstração

| Situação | O que fazer |
|---|---|
| Internet ou ambiente fora do ar | Ter **um vídeo curto gravado** da demonstração (5 a 8 minutos, com os mesmos dados) e prints dos passos 3, 6, 7 e 8. Dizer com naturalidade: "Vou te mostrar gravado e a gente remarca a parte ao vivo". |
| Importação do Excel falhou ou ficou incompleta | Usar o ambiente de exemplo (dados fictícios **avisados como fictícios**) e combinar nova demonstração com os dados reais. Nunca fingir que os dados são da clínica. |
| Insights vazios ou sem sentido | Mostrar os de exemplo já preparados no ambiente reserva e explicar o que cada um listaria na clínica dela. |
| Bot de WhatsApp não responde | Mostrar os prints e a gravação do passo 7; reforçar que a conversa pode ser assumida pela equipe. Não culpar a rede em voz alta. |
| Portal do paciente não abre no celular | Mostrar no navegador do computador (mesma tela) e deixar o link de teste para ela experimentar depois. |
| Pergunta sem resposta | "Boa pergunta. Não quero te responder errado; confirmo e te retorno hoje por escrito". Registrar. |
| Recepcionista resistente | Ouvir, perguntar o que ela mais teme, e propor teste em uma semana de agenda, com treinamento. |
| Dona pede algo que não existe (prontuário, TISS, Google Agenda) | Dizer que não existe hoje; se estiver na seção "Em breve", dizer "em breve, sem data"; nunca "já vem na próxima semana". |

Sempre ter à mão: o ambiente de reserva com dados de exemplo, o vídeo gravado, este roteiro e `objecoes-faq.md`.

## Verificação antes de enviar para uso

- [ ] Todo passo mostra só o que o sistema faz hoje.
- [ ] Prontuário, IA, Z-API, Google Agenda, Hangfire, TISS e ICP-Brasil só aparecem na seção "Em breve" ou como "não estão no escopo atual".
- [ ] Preços e planos aparecem marcados como PROPOSTA e batem com `precificacao.md`.
- [ ] Rotas citadas conferidas contra `architecture-registry.yaml` e `context/mapa-modulos.md` antes da demonstração (rotas do registry podem mudar).
