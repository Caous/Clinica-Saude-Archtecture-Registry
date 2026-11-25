# Objeções e perguntas frequentes

> Produto: **Cuidaflux**. Público: donas e donos de clínicas de fisioterapia (principal) e fisioterapeutas autônomos. Documento do PBI-20261124-publico-mercado-modelo-negocio (AC-9, T-15).
> Tom: acolhedor, claro, confiável e leve (`Sistema-Clinica-Marca/identidade.md`). Responder como um colega da área: sem jargão, sem pressão, sem prometer o que não existe.
>
> **Regras**
> - Preços e planos citados vêm de `precificacao.md` e são **PROPOSTA** (aguardam aprovação do dono do produto).
> - Prontuário, IA no atendimento, WhatsApp via Z-API, Google Agenda, tarefas agendadas (Hangfire), TISS/convênio e assinatura ICP-Brasil **não existem hoje**; backup padronizado também não existe e é pré-requisito antes de vender. Quando citados, vêm como **em breve — confirmar antes de prometer**, sem data.
> - Sem número de resultado (faltas, renovação, faturamento): nenhum foi medido.
> - Dado de saúde: nada de "100% seguro". Dizer o que existe e o que está em preparação.

## Objeções

Formato: **o que o cliente diz** · resposta pronta · o que NÃO prometer.

### 1. "Está caro" (preço)
- **Resposta pronta:** "Entendo, a conta precisa fazer sentido. O valor proposto é por clínica, não por profissional: R$ 319 por mês no plano Clínica (3 a 6 profissionais), R$ 149 no Essencial (1 a 2), R$ 419 no Dedicado (7 a 12). É uma **proposta**, sem fidelidade; se não fizer sentido, você cancela. Uma forma de enxergar: abra a lista de 'plano acabando' e 'parcela vencida' da sua clínica e veja quanto dinheiro está parado nela. Se for pouco, talvez o sistema não compense agora, e eu te digo isso".
- **Se comparar com concorrente por profissional:** "Alguns cobram por profissional (por exemplo, a partir de R$ 99 ou R$ 169 por profissional, conforme o plano). A partir de 4 profissionais o preço fixo costuma sair melhor (por exemplo, 4 profissionais no plano de R$ 99 por profissional somam R$ 396, contra R$ 319); com 3 profissionais o preço é equivalente (R$ 297 contra R$ 319); para um profissional sozinho, há opções mais baratas, e eu não vou te dizer o contrário".
- **NÃO prometer:** desconto não aprovado, preço menor que a tabela, "vai se pagar em X meses", retorno em número. Não citar preço de multi-tenant (R$ 109/219/299): é meta hipotética, não vale hoje. Implantação grátis e preço travado por 12 meses só como **proposta de lançamento**, se aprovada.

### 2. "Já uso planilha / Google Agenda / outro sistema e funciona"
- **Resposta pronta:** "Se funciona, ótimo; o que costuma pesar é o tempo e o que escapa: pacote que acaba sem ninguém avisar, paciente que some, parcela vencida. Na demonstração eu trago os seus pacientes e mostramos essas listas prontas. Se a planilha já resolve isso, você não precisa trocar. E a planilha de hoje pode ser a nossa porta de entrada: a importação de pacientes por Excel existe".
- **Se usa outro sistema:** "O que ele faz melhor hoje para você? Se for prontuário ou convênio, talvez ele continue sendo seu aliado; o Cuidaflux é forte em agenda, pacote de sessões, financeiro e insights de renovação".
- **NÃO prometer:** importar o histórico de outro sistema, nem Google Agenda sincronizada (**em breve — confirmar antes de prometer**). Não falar mal do concorrente.

### 3. "Tenho medo de migrar e perder o histórico"
- **Resposta pronta:** "É um receio justo. Você não precisa desligar nada de uma vez: a gente importa os pacientes da sua planilha em um ambiente de teste, você confere, e só então decide. Seus dados são seus. A importação cobre o cadastro dos pacientes; pacotes, sessões já feitas e parcelas a gente organiza junto, com o seu acompanhamento".
- **NÃO prometer:** migração automática de histórico clínico ou de prontuário de outro sistema (não existe), nem prazo exato de migração antes de ver a planilha. Não dizer "zero risco". Exportação dos seus dados ao cancelar: está na proposta de lançamento, **confirmar antes de prometer** o formato.

### 4. "E o prontuário?"
- **Resposta pronta:** "Hoje o Cuidaflux ainda não tem prontuário. Estamos construindo, mas eu prefiro te falar a verdade a prometer uma data. Se o prontuário no mesmo sistema é imprescindível para você agora, o melhor é manter o seu prontuário atual e usar o Cuidaflux para agenda, pacotes, financeiro e renovação, ou entrar na lista de espera e a gente volta a conversar quando estiver pronto".
- **NÃO prometer:** data, "chega semana que vem", nem que atende à norma de prontuário do COFFITO (Resolução 414/2012, **a confirmar** no texto oficial; o sistema não atende hoje). Prontuário é **em breve — confirmar antes de prometer**. Quem exige prontuário agora: lista de espera, não venda.

### 5. "E convênio / guia TISS?"
- **Resposta pronta:** "O Cuidaflux é pensado para quem cresce no particular: pacote de sessões, renovação e cobrança. Guia e TISS ainda não existem no sistema e não estão no escopo atual; o roadmap é decisão do dono do produto. Se a maior parte da sua clínica é convênio, hoje não somos a melhor escolha, e eu prefiro te dizer isso agora. Se parte é convênio e parte é particular, o Cuidaflux ajuda no particular".
- **NÃO prometer:** faturamento de convênio, glosa, TISS, integração com operadoras, mesmo "em breve". Nem previsão.

### 6. "Meu WhatsApp pode ser banido?"
- **Resposta pronta:** "Pergunta importante. O assistente de hoje usa uma conexão que **não é a oficial** do WhatsApp, e conexões assim podem, sim, ter risco de bloqueio do número. Por isso a recomendação é testar com um número separado, não com o principal da clínica, e manter a recepção no modo humano ou misto. Estamos avaliando um caminho mais seguro; ele ainda não está definido nem pronto. Eu não vou te prometer que nunca vai acontecer".
- **Opções (todas em decisão):** conexão oficial da Meta (tem custo por mensagem e exige modelos de mensagem aprovados) ou Z-API (em breve, também não oficial).
- **NÃO prometer:** "não bane", "é seguro", "é oficial". Nem que Z-API já existe. Registrar o risco R05 em `riscos-prerequisitos.md`.

### 7. "E a LGPD? São dados de saúde"
- **Resposta pronta:** "Dado de saúde é sensível, e a gente trata com seriedade. No contrato, você, a clínica, é a responsável pelos dados dos seus pacientes; o Cuidaflux atua como operador, e cada clínica tem a sua implantação com API e banco próprios, sem misturar dados de clínicas diferentes. O programa formal de conformidade (contrato de operador, política de privacidade, encarregado, plano de incidente) ainda está sendo estruturado: não vou te dar um selo que ainda não existe".
- **NÃO prometer:** "100% conforme com a LGPD", "certificado", "totalmente seguro". Há pendências de segurança abertas internamente (R01 e R02 de `riscos-prerequisitos.md`) que precisam estar resolvidas antes da primeira implantação paga. Contrato e política: **confirmar antes de prometer**.

### 8. "Preciso de fidelidade? Fico preso?"
- **Resposta pronta:** "A proposta é sem fidelidade e sem multa de cancelamento: mensalidade mês a mês. Se deixar de fazer sentido, você cancela. Isto é a **proposta**, e eu confirmo por escrito antes de você assinar qualquer coisa".
- **NÃO prometer:** cancelamento "com um clique" ou no próprio sistema (hoje não há cobrança recorrente nem tela de cancelamento; a proposta é cancelar por solicitação ao suporte, **a confirmar**), nem reembolso: a cobrança recorrente do Cuidaflux ainda está em definição (R08). Não prometer exportação em formato específico antes de confirmar.

### 9. "E se o dono do sistema sumir?" (continuidade)
- **Resposta pronta:** "Pergunta honesta, e eu respeito. Hoje o Cuidaflux é um produto novo, com uma equipe pequena. Para te dar mais segurança, a proposta é sem fidelidade e você é dona dos seus dados. O que ainda precisa ser decidido por escrito: garantia de exportação dos dados e um plano de continuidade no contrato. Se isso for decisivo para você, me diga e levo a pergunta para o dono do produto antes de você assinar".
- **NÃO prometer:** entrega do código-fonte, escrow, que "o sistema nunca sai do ar", SLA. Nenhum SLA existe (R09). Não inventar garantias contratuais.

### 10. "Implantação dedicada é mais cara?"
- **Resposta pronta:** "Na proposta, o preço já considera que cada clínica tem a sua implantação: o plano Clínica custa R$ 319 por mês, sem taxa de implantação no lançamento (a taxa de lista seria R$ 290). 'Dedicada' quer dizer que a sua clínica tem API e banco próprios, e não que você paga um servidor só seu. Para quem exige isolamento total de infraestrutura, existe uma opção sob consulta, a partir de R$ 1.099, que não é para a maioria das clínicas. Tudo isso é **proposta**".
- **NÃO prometer:** que 'dedicado' significa servidor exclusivo no plano padrão; que o preço vai cair (multi-tenant é hipótese futura); que o lançamento é "para sempre". Implantação grátis só para os primeiros clientes e se aprovada.

### 11. "Minha recepção não vai aprender / vai atrasar o dia" (persona recepcionista)
- **Resposta pronta:** "Por isso eu pedi que ela viesse. Na demonstração ela mesma marca uma sessão. Ela terá treinamento e suporte humano nas primeiras semanas, e os dois sistemas podem rodar juntos até ela se sentir segura".
- **NÃO prometer:** "aprende em 1 hora" ou "sem treinamento". Suporte por e-mail está na proposta; atendimento mais rápido (prioritário) só no plano Dedicado, e ainda sem SLA definido.

### 12. "Meus pacientes não usam portal / não vão ligar para isso"
- **Resposta pronta:** "O portal é opcional. O WhatsApp continua sendo o canal principal para quem prefere. Quem gosta de ver o plano e pedir horário pelo celular passa a usar, e isso alivia a recepção".
- **NÃO prometer:** adesão do paciente, nem número de pacientes que vão usar.

## FAQ

### 1. Quanto custa?
**PROPOSTA**, sem fidelidade, por clínica: **Essencial** (1 a 2 profissionais) R$ 149/mês; **Clínica** (3 a 6) R$ 319/mês; **Dedicado** (7 a 12) R$ 419/mês. Acima de 12 profissionais ou com exigência de infraestrutura isolada, sob consulta. Valores aguardam aprovação do dono do produto.

### 2. Tem taxa de implantação?
Na lista, R$ 0 (Essencial), R$ 290 (Clínica) e R$ 590 (Dedicado). A **proposta de lançamento** é implantação grátis e preço travado por 12 meses para os primeiros clientes, se aprovada.

### 3. O que está incluso na mensalidade?
Agenda, pacientes, pacotes de sessões, financeiro com parcelas, portal do paciente, notificações, e-mail em massa, insights, dashboards e marca da clínica. Suporte por e-mail. O WhatsApp não está na mensalidade. O que é "em breve" não entra no preço como entregue.

### 4. Quanto tempo leva para começar?
A ideia é começar a usar na mesma semana: importar os pacientes, configurar a marca, cadastrar a equipe e treinar a recepção. O prazo exato depende do estado da sua planilha e é confirmado depois de vê-la. Não prometer prazo antes disso.

### 5. Como funciona a importação dos meus pacientes?
Você nos manda uma planilha Excel com os pacientes; nós importamos e você confere. A importação cobre o cadastro. Pacotes, sessões já feitas e parcelas nós organizamos juntos.

### 6. Quem é o dono dos dados e como ficam protegidos?
Os dados dos pacientes são da clínica. Cada clínica tem API e banco próprios, e cada pessoa vê só o que o perfil dela permite. Existe registro de uso (logs). O programa formal de privacidade (contrato, política, encarregado) está em estruturação. Não prometer "100% seguro".

### 7. Como é o suporte?
Na proposta, suporte por e-mail em todos os planos, com treinamento da recepção nas primeiras semanas; no Dedicado, suporte prioritário. Não há SLA definido ainda. Não prometer horário ou tempo de resposta.

### 8. Posso cancelar quando quiser?
Na proposta, sim: sem fidelidade e sem multa, mensalidade mês a mês, com cancelamento por solicitação ao suporte (hipótese a confirmar; o sistema ainda não tem cobrança recorrente nem tela de cancelamento). Confirmar o processo e a exportação dos dados (hoje só os insights exportam CSV/XLSX) por escrito antes de assinar.

### 9. O WhatsApp está incluído?
O assistente de WhatsApp existe hoje e a equipe pode assumir a conversa (modo bot, humano ou misto). A conexão usada hoje não é a oficial, e há risco de bloqueio do número (ver objeção 6). O WhatsApp **não está nas mensalidades**; um add-on futuro é **PROPOSTA** (via Z-API, **em breve — confirmar antes de prometer**: "traga sua conta" sem custo do nosso lado, ou gerenciado a R$ 279 por mês).

### 10. O Cuidaflux manda lembrete de sessão automaticamente?
Ainda não de forma automática e agendada. Hoje o sistema mostra a lista de quem precisa de atenção (por exemplo, sessão de amanhã não confirmada) e a equipe age. Lembretes automáticos agendados são **em breve — confirmar antes de prometer**.

### 11. Como funciona o portal do paciente?
O paciente entra com um acesso gerado pela clínica, vê consultas, plano e histórico, e pode pedir, confirmar ou cancelar um agendamento. É opcional.

### 12. Que relatórios eu tenho?
Dashboards de operação e de leads; relatórios de agenda, financeiro e operacional; e insights prontos (plano acabando, paciente dormente, aniversariantes, parcelas vencidas, faltou ontem, sessão de amanhã não confirmada). Os insights têm exportação.

### 13. Funciona para mais de uma unidade?
Sim, o sistema suporta múltiplas filiais. Na proposta: 1 filial nos planos Essencial e Clínica, 2 no Dedicado, e filial extra por R$ 69 por mês (PROPOSTA).

### 14. Funciona só para fisioterapia?
O nicho de entrada é fisioterapia, e o sistema nasceu de uma clínica de fisioterapia. Estética e pilates são expansão, mas cada área tem regras próprias, e ainda não oferecemos nada específico para elas. Não prometer para medicina ou odontologia (exigem prontuário e, em medicina, assinatura digital).

### 15. Posso usar a marca da minha clínica?
Sim. A marca (nome, logo e cores) é configurável por clínica.

### 16. Funciona no celular?
O portal do paciente foi pensado para o celular. A intranet (equipe) é acessada pelo navegador; **confirmar** a experiência em celular antes de prometer.

### 17. O que é "em breve"?
São recursos que **ainda não existem** e que estamos preparando ou avaliando: prontuário e evolução, IA no atendimento, WhatsApp via Z-API, Google Agenda e lembretes automáticos agendados. Citamos como direção, sem data, e **não entram no preço como entregues**. Se algum deles for imprescindível para você agora, o melhor é aguardar.

### 18. Tem teste grátis?
Não há teste grátis definido. O que existe é a demonstração com os dados da sua clínica, sem compromisso. Teste ou mês grátis para os primeiros clientes só se a proposta de lançamento for aprovada.

## Checklist de validação (FT-1)

> Para o dono do produto verificar. Cenário FT-1 do PBI-20261124-publico-mercado-modelo-negocio: percorrer `demo-roteiro.md` e `objecoes-faq.md` contra `proposta-modelo.md`. Validação com cliente real fica como ação posterior.

- [ ] Preço presente: planos Essencial, Clínica e Dedicado, com os mesmos valores de `precificacao.md` e de `proposta-modelo.md`, sempre marcados como PROPOSTA.
- [ ] Plano presente: cada fala de preço indica o plano certo por número de profissionais.
- [ ] Próximos passos presentes: `demo-roteiro.md` termina com próximos passos com prazos; os mesmos aparecem em `proposta-modelo.md`.
- [ ] Cada objeção do ICP tem resposta: preço, planilha/outro sistema, medo de migrar, prontuário, convênio/TISS, banimento do WhatsApp, LGPD, fidelidade, dono do sistema sumir, implantação dedicada, recepção, portal.
- [ ] Cada objeção traz o que NÃO prometer.
- [ ] Nenhuma promessa de recurso inexistente: prontuário, Z-API, Google Agenda, tarefas agendadas, TISS e ICP-Brasil só aparecem como "em breve — confirmar antes de prometer" ou como "não existe hoje".
- [ ] Nenhuma promessa de resultado em número (faltas, renovação, faturamento) e nenhuma afirmação de "100% seguro" ou "100% LGPD".
- [ ] Tom acolhedor, claro, confiável e leve, conforme a identidade da marca.
- [ ] Decisões em aberto que afetam as respostas: provedor de WhatsApp, política de exportação de dados e continuidade, cobrança recorrente, suporte e SLA, impostos.

Aprovação do dono: pendente
