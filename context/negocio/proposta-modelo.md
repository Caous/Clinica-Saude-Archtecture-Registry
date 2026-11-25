# Proposta comercial — modelo

> Modelo de proposta do **Cuidaflux**. Copie, preencha os campos entre colchetes `[ ]` e remova estas notas antes de enviar.
> **Avisos obrigatórios antes de enviar:**
> - **PROPOSTA — confirmar com o dono.** Todos os preços, planos, add-ons e a oferta de lançamento vêm de `precificacao.md` e **aguardam aprovação do dono**. Só a margem bruta mínima (60%) está aprovada. Não envie este documento como oferta firme enquanto a tabela não for aprovada.
> - **Recursos "em breve" não são entrega.** Prontuário, IA no atendimento, WhatsApp via Z-API, lembretes e tarefas agendadas (Hangfire), Google Agenda, convênio/TISS e assinatura ICP-Brasil **não existem hoje** e aparecem abaixo só marcados "em breve — confirmar antes de prometer".
> - Itens marcados **(hipótese a confirmar)** dependem de decisão do dono ou do contrato revisado por advogado.

---

## Capa

**Cuidaflux — O fluxo do cuidado.**

**Proposta comercial para [clínica]**

| Campo | Preencher |
|---|---|
| Para | [nome], [cargo], [clínica] |
| Cidade/UF | [cidade/UF] |
| Elaborada por | [seu nome], Cuidaflux |
| Contato | [telefone/WhatsApp], [e-mail] |
| Data | [AAAA-MM-DD] |
| Validade | [validade; ver seção "Validade"] |
| Versão | [1] |

[Logotipo e cores do Cuidaflux conforme `identidade.md` e `tokens-marca.json`; aplicar na versão enviada ao cliente.]

---

## Resumo da necessidade

Obrigado pela conversa, [nome]. Resumi abaixo o que ouvi. Se algo estiver diferente, me avise e eu ajusto a proposta.

| Item | O que a [clínica] nos contou |
|---|---|
| Profissionais com agenda própria | [N] |
| Pessoas na recepção/administração | [N] |
| Filiais/unidades | [N] |
| Como controla hoje agenda e sessões | [papel / planilha / Google Agenda / outro sistema] |
| Como controla hoje parcelas e cobrança | [caderno / planilha / outro] |
| Principal dor | [faltas e horários vazios / plano de sessões que acaba sem renovar / parcela vencida / agenda no papel ou na planilha / outra] |
| Segunda dor | [ ] |
| Quanto essa dor pesa (palavras da cliente, sem número prometido por nós) | ["..."] |
| Parte particular × convênio | [ ]% particular / [ ]% convênio *(se depender de convênio/TISS, o Cuidaflux ainda não atende: ver seção "O que está incluído hoje × em breve")* |
| Pacientes a importar | cerca de [N] |
| Quem decide / quem usa no dia a dia | [dona/dono] / [recepcionista] |
| O que a [clínica] espera em [prazo] | [objetivo da cliente] |

---

## Solução

O Cuidaflux reúne **agenda, pacientes, plano de sessões e financeiro** no mesmo lugar, com listas prontas do que precisa de atenção hoje. A marca da [clínica] aparece no sistema. Cada clínica tem a sua própria implantação (API e banco de dados próprios).

### O que está incluído HOJE

- **Agenda** com status (a confirmar, confirmado, faltou, remarcar e outros), vários profissionais e participantes.
- **Cadastro de pacientes**, com **importação por planilha Excel**.
- **Plano de sessões** (ordem de serviço com N sessões: realizada, faltou, reagendada) e saldo de sessões por paciente.
- **Financeiro com parcelas** (Pix, boleto e cartão), parcelas vencidas e status de pagamento.
- **Insights de gestão**: plano acabando, plano zerado sem renovar, paciente dormente, parcelas vencidas, aniversariantes, faltou ontem, sessão de amanhã não confirmada, plano sem pagamento.
- **Portal do paciente**: o paciente vê plano e consultas e pode solicitar, confirmar ou cancelar agendamento.
- **Atendimento por WhatsApp** com bot, humano ou misto (a equipe pode assumir a conversa). *Hoje a conexão é por provedor não oficial: há risco de bloqueio do número; recomendações e alternativa serão combinadas na implantação (a confirmar).*
- **Notificações internas** e **e-mail em massa** (com o SMTP da clínica).
- **Dashboards e relatórios** (agenda, financeiro, operação).
- **Multi-filial**, **perfis de acesso** (`Administrador`, `Administrativo`, `Comercial`, `Fisioterapeuta`, `Funcionario`, `CoordenadorFisioterapeuta` e `Financeiro`), **logs** e **marca da clínica configurável**.

### O que está EM BREVE (não é entrega desta proposta)

> **Em breve — confirmar antes de prometer. Sem data, sem preço adicional definido, não fazem parte do que está sendo contratado agora.**

| Recurso | Situação |
|---|---|
| Prontuário e evolução do paciente | Em breve — confirmar antes de prometer. Hoje o Cuidaflux **não substitui** o prontuário. |
| IA no atendimento | Em breve — confirmar antes de prometer. Hoje o assistente de WhatsApp é uma árvore de decisão, sem IA generativa. |
| WhatsApp via Z-API e envio automático de lembretes/tarefas agendadas (Hangfire) | Em breve — confirmar antes de prometer. |
| Sincronização com Google Agenda | Em breve — confirmar antes de prometer. |
| Convênio / guia TISS | Não atendemos hoje quem depende de convênio. |
| Assinatura digital ICP-Brasil | Em breve — confirmar antes de prometer; não é ponto de partida para fisioterapia. |

Quando esses recursos existirem, a decisão de incluí-los nos planos sem reajuste é do dono do produto (**PROPOSTA — confirmar com o dono**). O custo do WhatsApp **não** está nas mensalidades (ver add-ons).

---

## Plano recomendado e preço

> **PROPOSTA — aguarda aprovação do dono.** Valores em R$, **por clínica, por mês**, **sem fidelidade**. Faixas por número de profissionais com agenda própria. [Confirmar se os valores são com ou sem impostos: a definir com contador.]

### Os três planos propostos

| | **Essencial** | **Clínica** | **Dedicado** |
|---|---|---|---|
| Profissionais | 1 a 2 | 3 a 6 | 7 a 12 |
| **Mensalidade** (PROPOSTA) | R$ 149,00 | R$ 319,00 | R$ 419,00 |
| **Implantação** (taxa de lista; PROPOSTA) | R$ 0 | R$ 290 | R$ 590 |
| Implantação no lançamento (ver oferta) | R$ 0 | R$ 0 | R$ 0 |
| Filiais | 1 | 1 | 2 |
| Usuários (perfis `Administrativo`/`Funcionario`, hipótese de limite) | 3 | 6 | 12 |
| Suporte | por e-mail | por e-mail | por e-mail, prioritário |
| Tudo o que está incluído HOJE (seção "Solução") | sim | sim | sim |
| Marca própria da clínica, implantação com API e banco próprios | sim | sim | sim |
| Backup | **pré-requisito da Fase 1 (a implantar antes de vender); não existe hoje** | idem | idem |

- **Nenhum plano inclui IA** (ela não existe hoje; "em breve — confirmar antes de prometer"). Proposta: sem taxa de cancelamento (**a confirmar**).
- O nome "Dedicado" refere-se ao plano de 7 a 12 profissionais; **API e banco próprios por clínica não significam servidor exclusivo** (os servidores podem ser compartilhados entre implantações; isolamento de infraestrutura total é a oferta "Azure dedicado", sob consulta).
- Acima de 12 profissionais, ou com exigência de isolamento de infraestrutura: **Azure dedicado, a partir de R$ 1.099/mês, sob consulta** (PROPOSTA).
- Para este caso: **[Plano recomendado: ___ ]** — porque [motivo ligado à necessidade da cliente: nº de profissionais, dor principal, filiais].

### Add-ons (PROPOSTA — aguarda aprovação do dono)

| Add-on | Preço | Observação |
|---|---|---|
| WhatsApp — **traga sua conta** (a clínica contrata o provedor no nome dela e conecta) | R$ 0 para o Cuidaflux; o custo do provedor é da clínica (referência: R$ 99,99 por canal ao mês, sujeito a mudança) | **Em breve — confirmar antes de prometer.** Risco de bloqueio do número por conexão não oficial (hipótese a confirmar). |
| WhatsApp **gerenciado** (o Cuidaflux contrata e opera 1 canal) | R$ 279,00 por mês | **Em breve — confirmar antes de prometer.** |
| IA no atendimento (add-on **futuro**; hipótese) | R$ 39,00 por pacote de 5.000 mensagens | **Em breve — confirmar antes de prometer.** Não existe hoje; preço é hipótese de custo. |
| Filial extra | R$ 69,00 por mês | |
| Usuário extra | R$ 19,00 por mês | |

### Resumo do investimento desta proposta

| Item | Valor (PROPOSTA — confirmar com o dono) |
|---|---|
| Plano: [Essencial / Clínica / Dedicado] | R$ [ ] por mês |
| Implantação | R$ [ ] ([lista] / R$ 0 na oferta de lançamento) |
| Add-ons escolhidos: [ ] | R$ [ ] por mês |
| **Total mensal** | **R$ [ ]** |
| Impostos | [incluídos / adicionais — a definir com contador] |
| Forma de pagamento da mensalidade | [Pix / boleto / cartão — a confirmar] |

---

## Condições

**Sem fidelidade (proposta).** A [clínica] pode cancelar a qualquer momento, sem multa e sem taxa de cancelamento, **por solicitação ao suporte** (hoje o sistema não tem cobrança recorrente nem tela de cancelamento; o processo é **a confirmar**). A mensalidade seria cobrada mês a mês. *(PROPOSTA/hipótese — confirmar com o dono; a redação final fica no contrato.)*

**Cancelamento e saída.** Ao cancelar, a [clínica] poderia receber os seus dados (pacientes, sessões, financeiro) **mediante pedido ao suporte**, em formato [planilha/arquivo — a confirmar] (hoje só os insights têm exportação CSV/XLSX; não há exportação completa pronta). Depois de um prazo de [N dias — a definir], os dados são apagados da implantação. *(hipótese a confirmar; depende do contrato revisado por advogado.)*

**Dados e LGPD, em linguagem simples.**

- Os dados dos pacientes **são da [clínica]**. A [clínica] decide como usá-los; o Cuidaflux só os trata a pedido dela, para fazer o sistema funcionar.
- Cada clínica tem **API e banco de dados próprios**: os dados da [clínica] não ficam misturados com os de outra clínica.
- Só quem a [clínica] autoriza vê os dados: o acesso é por perfil (`Administrador`, `Administrativo`, `Comercial`, `Fisioterapeuta`, `Funcionario`, `CoordenadorFisioterapeuta` e `Financeiro`) e há registro de ações (logs).
- Vamos assinar um **contrato de tratamento de dados** que explica papéis, responsabilidades, em que servidores os dados ficam e quais serviços de terceiros são usados (hospedagem, WhatsApp, e-mail). *(Contrato e política de privacidade em elaboração, a revisar por advogado de saúde/LGPD: PENDENTE — confirmar antes de assinar; região dos servidores: a confirmar.)*
- Em caso de incidente de segurança, avisamos a [clínica] [em até N horas — a definir no contrato], para que ela cumpra suas obrigações com pacientes e com a ANPD.
- Dado de saúde é sensível: **não enviamos dados clínicos por WhatsApp** e pedimos que a [clínica] também não o faça pelo canal.
- Não prometemos "segurança absoluta": prometemos cuidado, transparência e correção rápida.

**Backup.** **Pré-requisito da Fase 1 (a implantar antes de vender); não existe hoje**, nem política, prazos de recuperação (RPO/RTO) ou teste de restauração. Só incluir esta cláusula na proposta enviada depois que o backup existir. [Frequência, onde é guardado e prazo de recuperação: a confirmar.]

**Suporte.**

| Item | Condição |
|---|---|
| Canal | E-mail: [suporte@...] e [WhatsApp de suporte, se houver] |
| Horário | [dias úteis, 9h às 18h — **hipótese a confirmar**] |
| Primeira resposta | [em até 1 dia útil — **hipótese a confirmar**] |
| Plano Dedicado | suporte prioritário [prazo — a confirmar] |
| Incidentes graves | [prazo — a definir no contrato] |

**Atualizações.** Melhorias do produto são aplicadas na implantação da [clínica] em [janela de manutenção — a definir]. Recursos "em breve" serão ativados quando existirem e forem testados, **sem data prometida nesta proposta**.

---

## Oferta de lançamento

> **PROPOSTA — aguarda aprovação do dono.** Os números (N clientes, prazos) são hipóteses.

Para as **primeiras [10] clínicas** a assinar:

- **Implantação gratuita** (R$ 0 em vez da taxa de lista de R$ 290 a R$ 590).
- **Preço travado por 12 meses** nos valores da tabela acima.
- **Clientes-fundadores (as 5 primeiras):** **1 mês grátis** em troca de um **depoimento** e do uso do nome da clínica, **somente com consentimento por escrito** da [clínica].
- **Sem fidelidade para todos.**

**Condição da oferta:** vale para quem assinar até [data] ou enquanto houver vagas (o que vier primeiro). A oferta só abre quando a implantação compartilhada estiver operando e os recursos vendidos estiverem prontos; os recursos "em breve" continuam sem data prometida.

**Quando o preço pode mudar:** se a tabela cair no futuro (mudança de arquitetura), quem entrou na oferta de lançamento **mantém o preço travado**; quem pagar a tabela cheia recebe a redução.

---

## Próximos passos

1. **Alinhar a proposta:** revisamos juntos o plano e os campos "Resumo da necessidade". Prazo: [data].
2. **Assinatura:** assinatura desta proposta e do **contrato de serviço e de tratamento de dados** (assinatura eletrônica ou física: [a confirmar]). Responsável na clínica: [nome].
3. **Implantação em [N] dias úteis** (**hipótese a confirmar**): preparamos a implantação da [clínica] (API e banco próprios, marca, usuários e perfis de acesso). Data prevista de início: [data].
4. **Importação de pacientes via planilha:** a [clínica] envia uma planilha com [nome, telefone, e-mail, CPF e plano de sessões, conforme o modelo que enviaremos]; nós importamos e conferimos juntos uma amostra. *A importação é de cadastro de pacientes; **histórico clínico não é migrado**.* Dados de pacientes só são enviados depois de assinado o contrato de tratamento de dados.
5. **Treinamento da equipe:** [N] sessão(ões) de [N] hora(s) por vídeo ou na clínica, com a recepção e os profissionais ([hipótese: 5 h no plano Clínica; confirmar]). Material de apoio: [guia/vídeos].
6. **Início do uso:** a [clínica] começa a usar em [data], com acompanhamento nas primeiras semanas (**[período — a confirmar]**).
7. **Revisão em 30 dias:** conversamos sobre faltas, planos que acabam, parcelas e o que ajustar; medimos os resultados **na própria clínica** (não prometemos número).

---

## Validade

Esta proposta é válida por **[N] dias, até [AAAA-MM-DD]** (**hipótese: 15 dias; confirmar com o dono**). Valores e condições estão sujeitos à aprovação do dono do produto (**PROPOSTA — confirmar com o dono**) e podem mudar após essa data. Os preços de referência de mercado citados em conversas são fotografias de data e não fazem parte desta proposta.

---

## Assinatura

Estou de acordo com os termos desta proposta, **desde que o plano, os valores e as condições estejam confirmados por escrito**.

| | Cuidaflux | Clínica |
|---|---|---|
| Nome | [nome do responsável] | [nome da dona/dono] |
| Cargo | [ ] | [ ] |
| CNPJ | [ ] | [ ] |
| Data | [AAAA-MM-DD] | [AAAA-MM-DD] |
| Assinatura | ____________________ | ____________________ |

Cuidaflux — O fluxo do cuidado.
