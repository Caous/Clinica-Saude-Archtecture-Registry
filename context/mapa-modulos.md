# Mapa de Módulos e Funções — Sistema Clínica (baseline herdado do Instituto Barros)

> Baseline levantado em 2026-11-24 a partir do código atual, antes da remodelagem para "Clínica de Saúde".
> Origem: sistema de fisioterapia do Instituto Barros (licença cedida). Fonte da verdade técnica detalhada: `architecture-registry.yaml`.

## 1. Visão geral

| Aplicação | Repo | Stack | Público |
|---|---|---|---|
| API Core | Clinica-Saude-Backend | C# .NET 8, DDD + Clean Architecture, EF Core, ASP.NET Identity (JWT), Docker | — |
| Intranet (admin) | Clinica-Saude-Frontend | React 18, Vite 6, Tailwind 4, React Query 4, Zustand, React Router 7 (base TailAdmin) | Equipe interna |
| Extranet (portal paciente) | *ainda sem repo novo* (`Instituto-Barros-Extranet-Frontend`, Next.js) | Next.js + Tailwind | Paciente |
| Registry | Clinica-Saude-Archtecture-Registry | YAML + Markdown | Time |

Integrações externas identificadas: WhatsApp (maior volume de código), SMTP (e-mail). Deploy original: Azure Web App (API) + Vercel (fronts).
Testes: `tests/UnitTests`, `tests/FunctionalTests` (backend); Vitest (intranet).

## 2. Perfis de acesso (roles)

`Administrador`, `Administrativo`, `Comercial`, `Fisioterapeuta`, `CoordenadorFisioterapeuta`, `Funcionario`, `Financeiro`, `Cliente` (paciente).
Controle: `[Authorize(Roles=...)]` no back; `MENU_PERMISSIONS` em `src/services/util/rolePermissions.ts` + `RoleProtectedRoute` no front.

## 3. Módulos

Legenda de acoplamento ao domínio antigo: 🟢 genérico (reaproveitar) · 🟡 adaptar · 🔴 específico de fisioterapia.

### 3.1 Autenticação e Usuários 🟢
- **Back** `UserController`: login funcionário (`LoginUser`), login paciente (`LoginCliente`), registro, reset de senha (solicitar/resetar), CSRF token, acesso por funcionário, atribuir/remover role. `SessionManagementService` (sessões ativas, invalidar por token/usuário).
- **Front**: SignIn/SignUp, `ProtectedRoute`, `RoleProtectedRoute`, `AccessDenied`. Extranet: sign-in e first-access.

### 3.2 Pacientes (Customer) 🟡
- **Back** `CustomerController`: cadastrar, atualizar, desativar/reativar, excluir, buscar (filtros), por e-mail/id, resumo, **importação via Excel**, histórico do paciente (adicionar/listar). Entidades: `CustomerModel`, `HistoryCustomerModel`, endereço.
- **Front**: `CustomerTables`, `FormCustomer`, `FormMetaDataCustomer`.
- Campos específicos do domínio antigo: patologia (🔴) — revisar para prontuário genérico.

### 3.3 Acesso do Paciente ao Portal 🟢
- **Back** `CustomerAccessController`: gerar acesso individual/em lote, listar sem acesso, checar por CPF, listar status, desabilitar.
- **Front**: `CustomerAccess`.

### 3.4 Portal do Paciente (Extranet / `ClienteController`) 🟡
- API: meu perfil, atualizar perfil, profissionais disponíveis, minhas consultas, solicitar/confirmar/cancelar agendamento, meus planos (lista/detalhe), meu histórico.
- Páginas Extranet: home, perfil, calendário, plano (lista/detalhe), confirmação de solicitação, settings, first-access.

### 3.5 Funcionários / Profissionais 🟡
- **Back** `EmployeeController`: CRUD, desativar/reativar. Campos: cargo, cor na agenda, contato de emergência, filial, usuário vinculado.
- **Front**: `EmployeeTables`, `FormEmployee`.

### 3.6 Unidades / Filiais 🟢
- **Back** `BranchOfficeController`: CRUD, desativar/reativar. Unidades originais: Morumbi, Mooca, Paulista, Ipiranga (dados do Instituto — remover).
- **Front**: `BranchOfficeTables`, `FormBranchOffice`.

### 3.7 Catálogo de Serviços 🟡
- **Back** `CategoryServiceController` e `SubCategoryController`: CRUD + desativar/reativar. Entidades: categoria, subcategoria (serviço), `ServiceServiceModel`.
- **Front**: `ServiceCategoryTables`, `SubServiceCategoryTable`, `FormCategoryService`, `FormSubCategoryService`.

### 3.8 Tratamento / Ordem de Serviço (plano de tratamento) 🔴→🟡
- **Back** `OrderServiceController`: CRUD, status (Aberto, Análise, Aprovado, Rejeitado, Andamento, Teste), histórico, dependências, listas por prestador (abertos/fechados/enriquecido), desativar.
- **Back** `SessionServiceController`: criar/consultar sessão, resumo diário (`daily-summary`). Status de sessão: Realizada, Faltou, Reagendada.
- **Front**: `OrderServiceTables`, `FormOrderService`, `FormSession`, `FormMetaDataOrderService`, `calcularSessaoInfo` (cálculo de sessões do plano).
- Conceito central: plano de N sessões vendido ao paciente → núcleo a ser remodelado para atendimento/consulta/procedimento.

### 3.9 Agenda 🟢
- **Back** `ScheduleController`: criar/editar/desativar/excluir, por data, próximos. `ScheduleParticipantController`: participantes por agendamento.
- Status: AConfirmar, Finalizado, ConfirmadoPeloPaciente, EmEspera, CanceladoPeloProfissional, CanceladoPeloPaciente, Faltou, PreAtendimento, Reagendar, Pagamento, OFF, Reunião, Banheira (🔴 "Banheira" específico).
- **Front**: `Calendar`.

### 3.10 Check-in 🟡
- Tipos: Fisio, Plano. Gera notificação (CheckInRealizado/Excluído). Front: `GerenciarCheckIns`. Back: `ScheduleCheckInDto` + notificações.

### 3.11 Financeiro 🟢
- **Back** `TransactionsController`: CRUD, status, forma de pagamento. `InstallmentsController`: parcelas por transação, atualizar status de parcela, vencidas.
- Formas de pagamento: Pix à vista, Boleto à vista/parcelado, Cartão crédito à vista/parcelado.
- **Front**: `Financeiro/Despesas`, `ModalNovaDespesa`, `ModalParcelas`.

### 3.12 Dashboards 🟡
- **Back** `DashboardController` (cache + `clear-cache`): pacientes ativos, agendamentos, avaliações agendadas/executadas, sessões realizadas/canceladas/mensais, distribuição por unidade, serviços mais agendados, sessões por profissional/plano, patologias agrupadas (🔴), clientes por filial, faturamento (total/mensal/comparativo/por categoria), despesas, entrada×saída, tipos de pagamento, transações por unidade.
- **Front**: `Home` (financeiro), `DashboardOperacao`, `DashboardLead`.

### 3.13 Insights / Alertas de gestão 🟢
- **Back** `InsightsController`: chaves, contadores, itens, exportação, acompanhamento (follow-up).
- Chaves: plano acabando, paciente dormente, aniversariantes, parcelas vencidas, plano zerado sem renovar, faltou ontem, sessão amanhã não confirmada, plano sem pagamento, funil de status do paciente (novo → aguardando avaliação → em avaliação → plano → em atendimento → concluído/alta/cancelado/inativo), qualidade de cadastro (e-mail/telefone/CPF/endereço/patologia/documento/filial), qualidade de cadastro de funcionários.
- **Front**: `InsightDetalhe`.

### 3.14 Notificações internas 🟢
- **Back** `NotificationsController`: CRUD, status, marcar como visto, enviar, histórico, listagem admin. Tipos: CheckInRealizado, CheckInExcluido, AgendamentoCancelado, Geral.
- **Front**: `Notifications`, `Enviar`, `Historico`, modais/filtros.

### 3.15 E-mail 🟢
- **Back** `EmailConfigurationController` (SMTP: CRUD, ativo) e `EmailDispatchController` (enviar, listar).
- **Front**: `EmailConfigurationPage`, `EmailDispatchPage`.

### 3.16 WhatsApp / Atendimento de leads 🟡
- **Back** `WhatsappController`: receber mensagem (webhook), conversas, mensagens, marcar como lida. `WhatsappNumberController`: cadastrar, atualizar, ativar/desativar, listar. Atendimento: Bot, Humano, Misto.
- **Front**: `WhatsappTableLeadComponent`, rota "Atendimento", `DashboardLead`.

### 3.17 Relatórios 🟡
- **Front**: `RelatorioAgenda`, `RelatorioFinanceiro`, `RelatorioOperacional` (consomem endpoints de dashboard/agenda/transações).

### 3.18 Auditoria / Logs 🟢
- **Back** `LogsController`: CRUD, por data, por usuário. **Front**: `Log`.

### 3.19 Documentação in-app 🟢
- **Front**: `Documentacao` (a reescrever para a nova marca).

### 3.20 Transversais
- Soft-delete (`DataDesativacao`) e `DataCadastro` em `BaseModel`; criptografia de banco (`DATABASE_ENCRYPTION_GUIDE.md`); `Moq_Data.sql` (dados de exemplo); `Dockerfile`; Swagger só em Dev/QA.
- Telas herdadas do template TailAdmin sem função de negócio (Alerts, Avatars, Badges, Buttons, Images, Videos, LineChart, BarChart, Blank, FormElements): candidatas a remoção.

## 4. Pontos de atenção para a remodelagem

1. **Marca/dados Instituto Barros**: nome, unidades, URLs Azure/Vercel, `tecnologiainstitutobarrros/...` (Docker), pacote `tailadmin-react` — trocar.
2. **Domínio fisioterapia**: patologia, sessões/planos, "Banheira", check-in Fisio/Plano.
3. **Prontuário/clínico**: não existe módulo de prontuário, anamnese, prescrição ou convênio — lacuna para clínica de saúde.
4. **Dois frontends** com stacks diferentes (Vite vs Next.js); Extranet ainda sem repo no novo GitHub.
5. **Arquivos duplicados** `*.refactored.ts` em `services/service` (migração incompleta).
6. **Segredos/licença**: revisar `appsettings`, chaves WhatsApp/SMTP e o `LICENSE.md` da Intranet antes de publicar.
7. Os repos novos no GitHub receberam o histórico completo (incluindo possíveis segredos antigos) — checar se repos são privados.
