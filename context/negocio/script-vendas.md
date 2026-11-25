# Script de vendas

> Produto: **Cuidaflux** — "O fluxo do cuidado." Público principal: donas e donos de clínicas de fisioterapia com 3 a 10 profissionais. Secundário: fisioterapeutas autônomos e clínicas de 1 a 2 profissionais.
> Documento do PBI-20261124-publico-mercado-modelo-negocio (AC-9, T-15). Base: `icp-personas.md`, `precificacao.md`, `concorrentes.md`, `riscos-prerequisitos.md` e `mapa-modulos.md`.
> **Duas regras que valem para cada frase deste script:**
> 1. **Honestidade sobre o produto.** Só se promete o que existe hoje (lista abaixo). Prontuário, IA no atendimento, WhatsApp via Z-API, Google Agenda, lembretes e tarefas agendadas (Hangfire), convênio/TISS e assinatura ICP-Brasil estão marcados **"em breve — confirmar antes de prometer"** e nunca aparecem como recurso entregue.
> 2. **Preço é PROPOSTA.** Todo valor vem de `precificacao.md` e está marcado **"PROPOSTA — aguarda aprovação do dono"**. Enquanto o dono não aprovar a tabela, o vendedor não fecha preço por escrito; apresenta como "valor previsto" e confirma antes.
> Tom de voz (de `identidade.md`): acolhedor, claro, confiável e leve. Fale com pessoas, não com "usuários"; frases curtas; nada de "100% garantido"; nunca ironize a rotina de quem cuida.

## Objetivo e como usar

**Objetivo:** marcar uma demonstração de 20 a 30 minutos com a dona (ou dono) da clínica, com a recepção junto, e levar a conversa até uma proposta com prazo. Não se vende "software": vende-se **menos dinheiro escapando** (falta, plano de sessões que acaba sem renovar, parcela vencida) e **menos planilha na mão da recepção**.

**Como usar:**

- Os textos estão prontos para copiar. Troque as variáveis: `[nome]` (quem recebe), `[clínica]`, `[seu nome]`, `[cidade]`, `[dia/horário]`.
- Escolha **uma** dor por mensagem (a que combina com o que você sabe da clínica). Mensagem com quatro dores vira lista de recursos.
- Ordem do funil: prospecção, qualificação, descoberta, chamada para a demo, demo (`demo-roteiro.md`), follow-up, fechamento (`proposta-modelo.md`). Objeções: `objecoes-faq.md`.
- Anote cada conversa (clínica, nº de profissionais, ferramenta atual, dor principal, objeção). As primeiras 10 a 15 conversas também validam o ICP e o preço (`icp-personas.md`, seção "Hipóteses e lacunas").

### O que o Cuidaflux faz HOJE (pode falar)

- Agenda com status (a confirmar, confirmado pelo paciente, faltou, remarcar e outros), vários profissionais e participantes.
- Cadastro de pacientes, com **importação por planilha Excel**.
- Plano de sessões vendido ao paciente (ordem de serviço com N sessões; sessão realizada, faltou ou reagendada).
- Financeiro com parcelas (Pix, boleto, cartão): parcelas vencidas e status de pagamento.
- **Insights de gestão** (listas prontas na tela): plano acabando, plano zerado sem renovar, paciente dormente, parcelas vencidas, aniversariantes, faltou ontem, sessão de amanhã não confirmada, plano sem pagamento.
- Portal do paciente: o paciente vê plano e consultas e pode solicitar, confirmar ou cancelar agendamento.
- Atendimento por WhatsApp com bot, humano ou misto (a equipe pode assumir a conversa).
- Notificações internas, e-mail em massa (SMTP da clínica), dashboards e relatórios, multi-filial, perfis de acesso (`Administrador`, `Administrativo`, `Comercial`, `Fisioterapeuta`, `Funcionario`, `CoordenadorFisioterapeuta`, `Financeiro`), logs e marca da clínica configurável.

### O que NÃO existe ainda (só com "em breve — confirmar antes de prometer")

| Item | Como falar |
|---|---|
| Prontuário e evolução do paciente | "Em breve. Hoje o Cuidaflux não substitui o prontuário; vamos confirmar a data antes de você decidir." |
| WhatsApp via Z-API, lembretes e tarefas agendadas (Hangfire) | "Em breve. Hoje há o atendimento por WhatsApp com bot/humano; o envio automático de lembretes ainda não está pronto." |
| Google Agenda | "Em breve. Ainda não sincroniza." |
| IA no atendimento | "Em breve, e ainda sem confirmação. Hoje o assistente de WhatsApp segue um roteiro de perguntas e respostas, sem IA generativa." |
| Convênio / guia TISS | "Hoje não atendemos quem depende de convênio; TISS não está no escopo atual e o roadmap é decisão do dono do produto. Seria honesto dizer que o Cuidaflux ainda não é para você." |
| Assinatura digital ICP-Brasil | "Em breve; para fisioterapia não é o ponto de partida." |

---

## Prospecção

Regra de ouro: **uma dor, uma pergunta, um próximo passo pequeno** (responder, ou marcar 20 minutos). Nunca mande tabela de preço na primeira mensagem.

### Mensagem de WhatsApp (curta) — 4 variações

**Variação 1 — faltas e horário vazio**

> Oi, [nome]! Aqui é [seu nome], do Cuidaflux. Falo com donas de clínica de fisioterapia e uma coisa que sempre aparece é o horário vazio por falta ou desmarcação em cima da hora. Como vocês lidam com isso na [clínica] hoje? Se quiser, mostro em 20 minutos como o Cuidaflux deixa a lista de "faltou ontem" e "sessão de amanhã não confirmada" pronta pra recepção.

**Variação 2 — plano de sessões que acaba sem renovar**

> Oi, [nome], tudo bem? Sou [seu nome], do Cuidaflux. Pergunta rápida: na [clínica], alguém é avisado quando o pacote de sessões de um paciente está acabando? Muita clínica só descobre depois que o paciente sumiu. O Cuidaflux lista "plano acabando" e "plano zerado sem renovar" na tela. Posso te mostrar com a planilha de vocês importada?

**Variação 3 — parcela vencida sem constrangimento**

> Oi, [nome]! [seu nome] aqui, do Cuidaflux. Cobrar parcela de pacote no WhatsApp é desconfortável e toma tempo, né? O Cuidaflux mostra quais parcelas estão vencidas e de quem, numa lista só, para você ou a recepção chamarem com calma e com os dados na mão. Quer ver como fica pra [clínica]? São 20 minutos.

**Variação 4 — agenda no papel ou na planilha**

> Oi, [nome]! Sou [seu nome], do Cuidaflux, um sistema para clínicas de fisioterapia (agenda, pacientes, plano de sessões e financeiro no mesmo lugar). Imagino que a agenda e o saldo de sessões da [clínica] estejam em papel ou planilha. Dá pra importar os pacientes da planilha e começar a usar na mesma semana, com treinamento pra recepção. Faz sentido eu te mostrar?

**Variação 5 — gatilho de crescimento (novo profissional ou segunda sala)** *(para quem acabou de contratar ou abrir sala)*

> Oi, [nome], parabéns pelo crescimento da [clínica]! Quando entra mais um profissional, a planilha costuma deixar de dar conta. Sou [seu nome], do Cuidaflux: agenda por profissional, plano de sessões e financeiro no mesmo lugar. Posso te mostrar em 20 minutos? Sem compromisso.

**Respostas rápidas (WhatsApp):**

- *"Quanto custa?"* → "Valor previsto: a partir de R$ 149 por mês por clínica, com faixas por número de profissionais (PROPOSTA — aguarda aprovação do dono; confirmo o valor exato na conversa). Sem fidelidade. Posso te mostrar o sistema antes de falar de valores?"
- *"Tem prontuário?"* → "Ainda não. Está em breve, e eu não quero te prometer data antes de confirmar. Hoje o forte é agenda, plano de sessões e financeiro. Quer que eu te avise quando sair?"
- *"Não tenho interesse."* → "Tudo bem, [nome], obrigado pela resposta! Se um dia a agenda ou a cobrança começarem a pesar, é só me chamar. Boa semana!" (e pare)

### Roteiro de ligação (até 3 minutos)

1. **Abertura (15 s):** "Oi, [nome], é [seu nome], do Cuidaflux. Tem um minutinho? Prometo ser rápido. Se não for um bom momento, eu ligo em outra hora."
2. **Motivo (20 s):** "Ligo porque falo com donas de clínica de fisioterapia sobre três coisas que fazem o dinheiro escapar: paciente que falta, pacote de sessões que acaba sem renovar e parcela que vence sem ninguém ver."
3. **Pergunta aberta (30 s):** "Na [clínica], como vocês controlam hoje o saldo de sessões de cada paciente: caderno, planilha, sistema?"
4. **Escuta ativa:** deixe responder. Repita a dor com as palavras dela ("então a recepção é a única que sabe onde está o saldo...").
5. **Ponte (20 s):** "É exatamente isso que o Cuidaflux organiza: plano de sessões, parcelas e uma lista pronta de quem precisa de contato hoje."
6. **Pedido (20 s):** "Posso te mostrar em 20 minutos, com a planilha de vocês importada? Se a recepção puder ver junto, melhor. [dia/horário] ou [dia/horário]?"
7. **Se não for o decisor:** "Quem cuida de agenda e cobrança aí? Posso mandar uma mensagem curta pra [nome] com o motivo da ligação?"
8. **Fechamento:** repita o combinado ("então fica [dia/horário]; te mando a confirmação por WhatsApp"). Se disser não: agradeça e encerre.

### E-mail ou Instagram DM

**E-mail**

> **Assunto:** [clínica]: saldo de sessões e parcelas num lugar só?
>
> Oi, [nome], tudo bem?
>
> Sou [seu nome], do Cuidaflux, um sistema de gestão para clínicas de fisioterapia. Escrevo porque donas e donos de clínica com equipe de 3 a 10 profissionais costumam me contar três coisas: o paciente que falta e deixa o horário vazio, o pacote de sessões que acaba sem ninguém avisar e a parcela que vence sem cobrança.
>
> No Cuidaflux, a agenda, o plano de sessões e as parcelas ficam no mesmo lugar, com listas prontas na tela (plano acabando, paciente dormente, parcela vencida, faltou ontem). Os pacientes podem ser importados de uma planilha, e a marca da clínica aparece no sistema.
>
> Posso te mostrar em 20 minutos como ficaria na [clínica]? Se for melhor, me diga um dia e horário.
>
> Um abraço,
> [seu nome] | Cuidaflux — O fluxo do cuidado.

**Instagram DM**

> Oi, [nome]! Vi o trabalho da [clínica] em [cidade], que bonito o cuidado com os pacientes. Sou [seu nome], do Cuidaflux. A gente ajuda clínicas de fisioterapia a organizar agenda, pacote de sessões e parcelas sem planilha. Posso te mandar um vídeo curto ou te mostrar em 20 minutos? Sem compromisso.

---

## Qualificação

Objetivo: descobrir **em poucos minutos** se a clínica é ICP (3 a 10 profissionais, particular, dor visível) e quem decide. Faça em tom de conversa, não de formulário. Anote as respostas.

1. "Quantos profissionais atendem na [clínica] e quantas pessoas ficam na recepção/administração?" *(ICP: 3 a 10 profissionais; 1 a 2 profissionais é secundário; 11 ou mais, fora do foco inicial.)*
2. "Como vocês controlam hoje a agenda e o saldo de sessões de cada paciente?" *(papel, planilha, Google Agenda, outro sistema.)*
3. "Qual parte dos atendimentos é particular e qual é convênio?" *(Quem depende quase só de convênio/TISS não é cliente hoje: Cuidaflux ainda não faz guia/TISS. Seja honesto.)*
4. "Quando um paciente termina o pacote de sessões, como vocês ficam sabendo e quem avisa ele?"
5. "Como está a falta de pacientes e a cobrança de parcelas nos últimos meses? Vocês têm uma ideia do que isso representa por mês?" *(Nunca prometa número; peça o dado dela.)*
6. "Você precisa de prontuário/evolução no mesmo sistema agora, ou isso pode vir depois?" *(Se "agora, é obrigatório": lista de espera, não venda. Prontuário está em breve — confirmar antes de prometer.)*
7. "Quem decide a troca de sistema? Mais alguém precisa participar da demonstração, como a recepção?"
8. "Se fizesse sentido, em quanto tempo você gostaria de estar usando? Tem algum evento próximo, como novo profissional, nova sala ou troca de recepção?"

**Sinal verde:** 3 a 10 profissionais, mistura de particular com plano de sessões, dor clara (2, 4 ou 5), decisora na conversa. **Sinal amarelo:** só convênio, ou exige prontuário já. **Sinal vermelho:** busca "o mais barato" para autônomo sem agenda fixa (explique o plano Essencial, não force).

---

## Conversa de descoberta

Duração: 15 a 20 minutos (pode ser parte da demo). Objetivo: a dona dizer, com as próprias palavras, o que a dor custa. **Fale 30%, escute 70%.**

**1. Contexto (2 min)**
- "Me conta um pouco da [clínica]: há quanto tempo, quem atende, como é um dia típico."
- "O que mais toma o seu tempo de gestão?"

**2. Dores (8 min)**: aprofunde uma por vez com "como funciona hoje", "o que acontece quando dá errado" e "quanto isso pesa".
- **Faltas:** "Quando alguém falta, o que acontece com aquele horário? Dá pra encaixar outro paciente? Quem confirma as sessões e como?"
- **Plano de sessões:** "Quantos pacientes você acha que estão com o pacote acabando agora? Se eu pedisse essa lista hoje, em quanto tempo você teria?"
- **Parcelas:** "Quando uma parcela vence, quem percebe e quem cobra? Já aconteceu de cobrar alguém que já tinha pago, ou de esquecer de cobrar?"
- **Visão do todo:** "Você consegue ver quanto cada profissional produziu no mês e quanto entra de particular?"
- **Recepção:** "O que mais enrola sua recepção no dia a dia?"

**3. Custo da dor (3 min)**
- "Se você pudesse recuperar metade desses horários vazios e dos pacotes que somem, o que mudaria na clínica?" *(Deixe ela calcular. Não invente número.)*

**4. Critérios (3 min)**
- "O que precisaria acontecer para você trocar a forma de trabalhar? O que te preocupa?" *(Anote objeções; responda com `objecoes-faq.md`. Preocupação comum: perder o histórico, equipe não aprender, depender de prontuário.)*

**5. Resumo e ponte**
- "Pelo que entendi, o maior vazamento hoje é [dor 1], depois [dor 2], e a recepção gasta muito tempo com [dor 3]. Correto? Então vale eu te mostrar exatamente essas três coisas, com os dados da [clínica]."

---

## Chamada para a demo

Combine **antes** de mostrar: duração (20 a 30 min), quem participa (dona e recepção), e o que trazer: uma planilha com 10 a 20 pacientes fictícios ou reais **anonimizados** (nome, telefone, plano de sessões) para a demonstração com dados parecidos com os dela. Nunca peça dados completos de pacientes antes de existir contrato e termo de tratamento de dados.

**Texto de convite (WhatsApp ou e-mail):**

> [nome], combinado! Vamos fazer assim: [dia/horário], 25 minutos, por vídeo [ou na clínica]. Se a [nome da recepcionista] puder participar, melhor, porque ela é quem mais usa a agenda e as parcelas. Eu mostro três coisas com a cara da [clínica]: (1) plano de sessões e saldo, (2) a lista de quem precisa de contato hoje (faltou, plano acabando, parcela vencida) e (3) como o paciente confirma pelo portal. Se puder, me envie uma planilha simples com 10 a 20 pacientes (pode ser fictícia ou sem sobrenome) para eu importar antes. Link: [link]. Qualquer imprevisto, me avise. Obrigado!

**Confirmação 24 h antes:** "Oi, [nome]! Passando para confirmar nossa conversa amanhã, [dia/horário]. Tudo certo pra você e pra [recepcionista]?"

**Se pedir "só um vídeo":** "Posso mandar um vídeo curto sim. Mas a demo ao vivo com os dados de vocês é onde dá pra ver o valor. Posso reservar 20 minutos?"

---

## Follow-up

Cadência de **5 toques em 14 dias** depois da demo (ou, se não houve demo, depois da primeira mensagem). Cada toque traz algo novo e um próximo passo pequeno; nunca "só passando pra saber". Pare quando responder "não" ou fechar. Registre cada toque.

| Toque | Dia | Canal | Conteúdo |
|---|---|---|---|
| 1 | D0 (mesmo dia da demo/conversa) | WhatsApp | Resumo + o combinado |
| 2 | D2 | E-mail | Proposta (modelo) e valor da dor que ela citou |
| 3 | D5 | WhatsApp | Pergunta sobre dúvida ou objeção + caso de uso |
| 4 | D9 | Ligação ou áudio | Condição de lançamento e prazo |
| 5 | D14 | WhatsApp | Encerramento gentil: "devo manter o contato?" |

**Toque 1 (D0, WhatsApp):**
> Obrigado pela conversa, [nome]! Resumindo o que combinamos: você quer enxergar [dor 1] e [dor 2] numa lista só, e a [recepcionista] precisa de poucos cliques para marcar e cobrar. Te mando amanhã a proposta com os planos e valores previstos. Se surgir qualquer dúvida, é só me chamar.

**Toque 2 (D2, e-mail):**
> **Assunto:** Proposta Cuidaflux para a [clínica]
>
> Oi, [nome], tudo bem?
>
> Como conversamos, segue a proposta com o plano indicado para a [clínica] (faixa de [N] profissionais), o que está incluído hoje e o que está em breve. Valores previstos: PROPOSTA — aguarda aprovação do dono; confirmo o valor final antes de assinar. Sem fidelidade.
>
> O que mais pesou na nossa conversa foi [dor 1], e é por aí que eu começaria a implantação. Podemos conversar na [dia]?
>
> Um abraço, [seu nome]

**Toque 3 (D5, WhatsApp):**
> Oi, [nome]! Ficou alguma dúvida sobre a proposta ou sobre a migração dos pacientes? Posso te mandar um passo a passo da importação pela planilha, ou fazer um teste rápido com 10 pacientes da [clínica] para você ver como fica. O que ajuda mais?

**Toque 4 (D9, ligação ou áudio):**
> "[nome], é [seu nome], do Cuidaflux. Queria te contar que, para as primeiras clínicas, estamos prevendo implantação sem taxa e preço travado por 12 meses [PROPOSTA — aguarda aprovação do dono]. Dá pra decidir em uma semana? Se faltar alguma informação para você decidir, me diz qual."

**Toque 5 (D14, WhatsApp):**
> [nome], não quero ser inconveniente: vou deixar a proposta da [clínica] à disposição e parar de te chamar por enquanto. Se o momento mudar, é só me escrever "quero ver de novo" que retomamos de onde paramos. Posso te mandar um aviso quando o prontuário estiver pronto? (em breve — sem data confirmada). Obrigado pela atenção e bom trabalho com os pacientes!

---

## Fechamento

**Antes de fechar (checklist interno):**

- [ ] A tabela de preços está **aprovada pelo dono**? Se não, só se oferece "valor previsto", com aviso de que será confirmado.
- [ ] A cliente sabe o que existe hoje e o que é "em breve"?
- [ ] Ela entendeu que o Cuidaflux não substitui prontuário hoje e que convênio/TISS não faz parte?
- [ ] Combinado: quem é a pessoa responsável pela implantação na clínica e qual planilha será importada.
- [ ] **Pré-requisitos internos** (`riscos-prerequisitos.md`): venda a clínica real só quando a implantação compartilhada (Fase 1 de `precificacao.md`) estiver no ar e as pendências de segurança P0 (R01), LGPD (R02) e contrato de operador (R10) estiverem resolvidas. Se ainda não, a oferta é **piloto/lista de espera**, não contrato definitivo.

**Proposta:** envie `proposta-modelo.md` preenchido (plano da faixa, implantação, o que inclui hoje × em breve, condições, validade). Plano recomendado para clínicas de 3 a 6 profissionais: **Clínica**; de 7 a 12: **Dedicado** (valores previstos na proposta; PROPOSTA — aguarda aprovação do dono).

**Frases de fechamento (copiar):**

- **Proposta e prazo:** "[nome], a proposta vale até [data, validade a confirmar]. Se você quiser começar neste mês, eu garanto a implantação com treinamento da recepção e a importação dos pacientes da planilha. Posso reservar a data?"
- **Condição de lançamento (PROPOSTA — aguarda aprovação do dono):** "Para as primeiras [N] clínicas, a ideia é implantação sem taxa e preço travado por 12 meses nos valores da tabela. Para os 5 primeiros, 1 mês grátis em troca de depoimento, com sua autorização por escrito. Sem fidelidade para todos."
- **Pergunta de fechamento direta:** "Dá para você me confirmar hoje se seguimos com o plano [Clínica/Dedicado]? Se faltar alguma coisa, me fala o que é."
- **Se pedir mais tempo:** "Claro. O que falta para você decidir? [escute] Combinamos de falar na [dia] para eu te trazer essa resposta?"
- **Se estiver com receio de prontuário:** "Entendo. Hoje o Cuidaflux ainda não tem prontuário; está em breve, sem data prometida. Se esse é o ponto decisivo, prefiro te colocar na lista de espera a te vender o que ainda não existe."
- **Depois do sim:** "Que bom, [nome]! Agora os próximos passos são [assinatura, implantação em N dias úteis (a confirmar), treinamento da recepção, importação dos pacientes]. Eu cuido de cada um com você."

**Cuidado com pressão:** urgência só com fato verdadeiro (a condição de lançamento é por número de clínicas, não por "hoje à meia-noite"). Nada de "última chance".

---

## O que nunca dizer

### 1. Promessas de recurso inexistente

- Nunca diga que o Cuidaflux **tem prontuário/evolução**, **tem IA no atendimento**, **envia lembrete automático por WhatsApp**, **sincroniza com Google Agenda**, **faz guia TISS/convênio** ou **assina com certificado ICP-Brasil**. Tudo isso é **em breve — confirmar antes de prometer**, sem data.
- Nunca dê data de entrega ("sai semana que vem"). Diga: "Está no nosso plano. Não vou te prometer data antes de confirmar."
- Nunca diga "o bot atende tudo sozinho". O bot tem modo humano e misto, e a equipe pode assumir a conversa.
- Nunca diga que o sistema "reduz suas faltas em X%" ou "aumenta sua receita em X%". Não há medição. Diga: "Ajuda você a enxergar e agir a tempo; o resultado depende da rotina da clínica."
- Nunca diga que a **migração do histórico clínico** é feita. Existe importação de pacientes por planilha; histórico clínico, não.
- Nunca diga "dados 100% seguros" ou "impossível vazar". Diga o que é verdade: "cada clínica tem API e banco próprios; os dados são da clínica."

| Não diga | Diga |
|---|---|
| "Tem prontuário, sim." | "Prontuário está em breve; ainda não substitui o seu." |
| "Os lembretes saem sozinhos pelo WhatsApp." | "Lembrete automático por WhatsApp está em breve; hoje você vê a lista de sessões não confirmadas e o paciente confirma pelo portal." |
| "Segurança garantida." | "Cada clínica tem API e banco próprios, e os dados são da clínica; fazemos contrato de tratamento de dados." |
| "Nosso preço é R$ 319." | "O valor previsto do plano Clínica é R$ 319 por mês (PROPOSTA — aguarda aprovação do dono)." |

### 2. Preço não aprovado

- Nunca apresente preço como definitivo, em contrato ou por escrito, antes de o dono aprovar a tabela. Todos os valores (R$ 149, R$ 319, R$ 419, add-ons, oferta de lançamento) são **PROPOSTA — aguarda aprovação do dono**.
- Nunca dê desconto ou condição fora da tabela e da oferta de lançamento proposta. Nunca prometa preço travado ou mês grátis sem a aprovação do dono.
- Nunca prometa **WhatsApp incluso** no plano. O WhatsApp (Z-API) é recurso em breve e fica fora da mensalidade (cliente traz a própria conta, ou add-on gerenciado, PROPOSTA).
- Nunca esconda que existe imposto: se a proposta não diz "com/sem impostos", confirme antes (a definir com contador).
- Nunca diga "sem fidelidade" e depois condicione o cancelamento. Hoje o sistema não tem cobrança recorrente nem tela de cancelamento: o que se propõe é cancelamento por solicitação ao suporte, sem taxa, e exportação dos dados mediante pedido — **proposta/hipótese, a confirmar no contrato**, nunca um recurso atual.
- Nunca diga que o backup já existe ou que há prazo de recuperação: backup é pré-requisito da Fase 1, a implantar antes de vender.

### 3. Comparações falsas com concorrentes

- Nunca invente defeito, preço ou funcionalidade de concorrente. Só use o que está em `concorrentes.md` (preços públicos de 2026-11-24, que mudam) e diga a data.
- Nunca diga "somos mais baratos que todos". A proposta **não vence ninguém em preço bruto**: para o autônomo, R$ 149 fica acima de iClinic Starter (R$ 99), Booksy e Trinks. O argumento é preço fixo por clínica, preço público, sem fidelidade e diferenciação (plano de sessões, insights, portal).
- Nunca diga que "o concorrente não funciona" ou fale mal de colegas. Diga: "Cada sistema tem seu foco; o nosso foco é clínica de fisioterapia que vende plano de sessões no particular."
- Nunca diga que o Cuidaflux tem "tudo que o iClinic/Amplimed tem". Não tem prontuário, TISS nem assinatura digital hoje.
- Nunca cite cliente, depoimento, prêmio ou número de clientes que não existe. Se alguém perguntar por referências: "Estamos abrindo as primeiras clínicas agora."

### 4. Outros

- Nunca peça nem aceite dados reais completos de pacientes antes de contrato e termo de tratamento de dados.
- Nunca ignore um "não". Registre, agradeça e pare.
- Nunca pressione quem exige convênio/TISS ou prontuário imediato: encaminhe para a lista de espera.
- Nunca prometa treinamento, suporte ou prazo de implantação diferentes dos da proposta (horário de suporte e prazo de implantação são hipóteses a confirmar).
