# Banco de Ideias — Features e Inovações

> Anotado em 2026-11-24. Não são PBIs ainda. Viram PBI depois dos 3 PBIs fundadores (desvínculo, rebranding, modelo de negócio).
> Origem: ideias do dono do produto, marcadas ✅; sugestões do assistente, marcadas 💡.

## A. Agentes de IA

| # | Agente | Origem | O que faz |
|---|--------|--------|-----------|
| A1 | Atendente WhatsApp | ✅ | Entende a necessidade do contato, agenda; se for novo, cria o cadastro; fluxo de agendar, remarcar e cancelar |
| A2 | Pesquisa de NPS | ✅ | Dispara e analisa NPS pós-atendimento, alerta detratores |
| A3 | Analista financeiro | ✅ | Identifica gaps financeiros (inadimplência, ociosidade, ticket baixo, receita perdida) |
| A4 | Estrategista de vendas | ✅ | Sugere estratégias, campanhas e ofertas com base nos dados da clínica |
| A5 | Copiloto interno (chat) | ✅ | Funcionários perguntam e executam ações em linguagem natural ("remarque a Ana para quinta") |
| A6 | Redutor de faltas | 💡 | Confirma consultas, reagenda, preenche horário vago com lista de espera |
| A7 | Reativação de pacientes | 💡 | Chama pacientes dormentes, retornos e planos acabando (base: insights existentes) |
| A8 | Cobrança gentil | 💡 | Lembra parcelas vencidas, negocia dentro de regras da clínica |
| A9 | Anamnese/triagem pré-consulta | 💡 | Coleta histórico e queixa por chat antes da consulta e preenche o prontuário |
| A10 | Escriba clínico | 💡 | Transcreve/resume a consulta em prontuário (revisão obrigatória do profissional) |
| A11 | Otimizador de agenda | 💡 | Sugere encaixes, reduz buracos e balanceia profissionais |
| A12 | Marketing de conteúdo | 💡 | Gera posts, respostas de avaliações e lembretes sazonais por nicho |
| A13 | Auditor de qualidade de cadastro | 💡 | Corrige dados duplicados/incompletos (base: insights de qualidade já existentes) |
| A14 | Assistente de convênio/TISS | 💡 | Prepara guias e aponta glosas prováveis (se houver nicho com convênio) |

Requisitos transversais dos agentes: consentimento e LGPD (dado de saúde), trilha de auditoria, limite de ações autônomas (aprovação humana em ações sensíveis), custo por consumo medido por cliente (base para add-on de IA no PBI-3), handoff para humano, isolamento de dados por clínica.

## B. Plataforma e produto

| # | Item | Origem | Nota |
|---|------|--------|------|
| B1 | Multi-tenant (várias clínicas na mesma instalação) | 💡 | Pré-requisito do SaaS; verificar estado atual |
| B2 | Prontuário eletrônico configurável por especialidade | 💡 | Maior lacuna do sistema atual |
| B3 | Módulos/templates por nicho (fisio, estética, odonto, médico, psicologia, nutrição) | 💡 | Fisio herdado vira um template; vocabulário configurável (plano, sessão, procedimento) |
| B4 | Odontograma e fotos antes/depois | 💡 | Odonto e estética |
| B5 | Prescrição e atestado digitais com assinatura | 💡 | Medicina; exige análise regulatória |
| B6 | Teleconsulta | 💡 | Complemento |
| B7 | Estoque e insumos | 💡 | Estética, odonto |
| B8 | Pagamento online, Pix, cobrança recorrente, emissão de NFS-e | 💡 | Integração com gateways |
| B9 | Aplicativo/portal do paciente evoluído | 💡 | Extranet atual como base |
| B10 | Modo "profissional autônomo/informal" simplificado | ✅ | Onboarding em minutos, sem módulos pesados |
| B11 | Onboarding guiado e importação de dados de outros sistemas | 💡 | Reduz custo de implantação |
| B12 | Permissões e perfis configuráveis por clínica | 💡 | Hoje são 8 roles fixos |
| B13 | Compliance LGPD: consentimentos, exportação e exclusão de dados | 💡 | Requisito de venda |
| B14 | Limpar telas de template (TailAdmin), código `*.refactored.ts` duplicado | 💡 | Débito técnico |

## C. Contexto do template InnovaSfera (`G:\Projetos\Crm-Erp-Template-InnovaSfera`)
- Back: `dotnet new innovasfera-erp-clean`, só troca `sourceName`; README cita `CompanyName`/`ProjectName`, ausentes no `template.json`.
- Tem os mesmos módulos da clínica e multi-tenant planejado (PBI de lacunas em andamento). Decisão (2026-11-24): clínica segue independente; white-label via gerador, uma instância por cliente. Multi-tenant (B1) fica para depois. Reavaliar convergência com o template quando ele fechar as lacunas.

## D. Ordem sugerida
1. PBI-1 desvínculo → PBI-4 gerador white-label → PBI-2 rebranding → PBI-3 modelo de negócio (PBI-2 e PBI-3 podem andar em paralelo ao PBI-4).
2. Depois: B1 multi-tenant + B13 LGPD (fundação), B2/B3 prontuário e templates por nicho, A1 atendente WhatsApp (maior diferencial e base já existente de WhatsApp).
