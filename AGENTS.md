# PROMPT PARA O JULES — Sistema de Reservas Web | Albergue Sr. Almeida
**Cliente:** XPTOTec · **Versão:** 2.0 — 2026 · **Localização do albergue:** Santa Teresa, Rio de Janeiro – RJ

---

## 0. COMO USAR ESTE PROMPT (instruções ao agente)

Você é o **Jules**, agente de codificação autônomo. Vai construir, do zero, um sistema de reservas web completo para um albergue (hostel). Siga estas regras de execução:

1. **Antes de codar, gere um plano** dividido nas fases da Seção 14 e aguarde/registre o plano no PR.
2. **Construa em fases incrementais** — não tente entregar tudo num único commit gigante. Cada fase deve ser funcional e testável.
3. **Nada da lógica de negócio abaixo deve ser simplificado ou omitido.** Se algo for ambíguo, escolha a interpretação mais segura e **documente a decisão** num arquivo `DECISIONS.md`.
4. Escreva **testes** para as regras críticas (disponibilidade/anti–double-booking, cálculo de cancelamento, RBAC).
5. Use **commits pequenos e descritivos**. Abra PR ao final de cada fase.
6. Comente o código em português; identifique cada funcionalidade com o ID correspondente (ex.: `// RF-011 / RN-011`).

> **STACK (ajustável — confirme/edite antes de iniciar):**
> - **Frontend + Backend:** Next.js 14+ (App Router) com TypeScript
> - **Banco de dados:** PostgreSQL via **Prisma ORM**
> - **Autenticação:** NextAuth/Auth.js (JWT de sessão) + **bcrypt** para hash de senha
> - **i18n:** next-intl (PT-BR / EN, troca dinâmica sem reload)
> - **Estilização:** Tailwind CSS
> - **Pagamento:** integração com gateway PCI-DSS em modo **sandbox/mock** (Stripe test mode). Não armazenar dados de cartão; usar apenas tokens.
> - **Deploy alvo:** containerizável (Docker), implantável em AWS/GCP/Azure.
>
> Se preferir outra stack (ex.: React + Express + PostgreSQL), mantenha **todos** os requisitos abaixo; apenas adapte a tecnologia.

---

## 1. CONTEXTO DO NEGÓCIO

O **Albergue do Sr. Almeida** é um hostel em Santa Teresa (RJ) que atende estudantes e turistas nacionais e estrangeiros. O sistema cobre todo o fluxo de reserva online: cadastro, consulta de disponibilidade, seleção de leitos/quartos, pagamento via cartão e cancelamento com regras de reembolso, além de painéis administrativos. Idiomas obrigatórios: **Português (BR)** e **Inglês**.

---

## 2. IDENTIDADE VISUAL E LAYOUT (especificação de interface)

### 2.1 Paleta de cores
- **Primárias:** Azul e Branco
- **Secundária (destaques/alertas/CTAs críticos):** Vermelho
- Defina tokens de tema (ex.: `--azul-principal`, `--branco`, `--vermelho-destaque`) e use-os de forma consistente.

### 2.2 Barra superior fixa (faixa azul) — presente em todas as páginas públicas
Faixa azul no topo (estilo header/barra fixa) contendo, da esquerda para a direita:
- **Esquerda:** nome do hostel **“Sr. Almeida”** em **branco** (logotipo textual).
- **Centro:** controle de **escolha de data** (abre o calendário da Seção 2.4) e controle de **número de pessoas** (abre o seletor da Seção 2.5) — a “busca rápida”.
- **Direita:** botões simples de **Perfil**, **Configurações** e **Trocar idioma** (PT-BR ⇄ EN).

A busca rápida (data + nº de pessoas) na barra alimenta diretamente a consulta de disponibilidade (Seção 7).

### 2.3 Home / interface inicial
- **Imagem de destaque (hero):** imagem do hostel/quartos. Para os testes, use **imagem aleatória/placeholder** (ex.: serviço de placeholder ou asset local), com `alt` adequado e fácil de substituir depois.
- **Bloco de quartos:** apresentar as três categorias com clareza:
  - **4 leitos** — banheiro **privativo**
  - **8 leitos** — banheiro **de corredor (compartilhado)**
  - **12 leitos** — banheiro **privativo**
- **Bloco de comodidades (marketing)** — exibir em destaque:
  - Ar-condicionado em todos os quartos
  - Café da manhã gratuito (refeitório terceirizado)
  - Acesso à cozinha comunitária
  - Acesso à lavanderia comunitária
  - Kit de roupas de cama incluso (renovado a cada 7 dias)
  - Toalhas disponíveis
- **Contador de hóspedes ativos** em tempo real (ver RF-027/RN-039), atualizado com latência máx. de 5 s.

### 2.4 Interface de seleção de DATA (calendário)
- Calendário em que o cliente escolhe o **dia de entrada** (check-in) em qualquer mês e o **dia de saída** (check-out) em qualquer mês posterior.
- Data mínima de check-in = dia atual. Check-out deve ser **posterior** ao check-in.
- O nº de diárias é derivado do intervalo (check-out − check-in).
- Deixar explícito que **diárias começam e terminam ao meio-dia (12h00)** (Seção 7.2).

### 2.5 Interface de seleção de NÚMERO DE PESSOAS (três campos)
1. **Número de pessoas** (adultos) — contador, mínimo 1.
2. **Número de crianças** — contador de **0 a 4**.
3. **Pessoa(s) com deficiência?** — opção Sim/Não. Se **Sim**:
   - campo para informar **quantas** pessoas;
   - campo de **texto livre** para descrever **quais deficiências**.
   - Esta declaração dispara o alerta no painel da recepção (RF-017/RN-013) e o aviso sobre ausência de elevador.

### 2.6 Responsividade e acessibilidade
- Layout **responsivo, mobile-first** (smartphone, tablet, desktop).
- Seguir **WCAG 2.1 nível AA** (contraste, navegação por teclado, `alt`, labels). Atenção ao uso do vermelho para não depender só de cor para transmitir informação.

---

## 3. PERFIS E CONTROLE DE ACESSO — RBAC (RF-004, RNF-007, RN-005, RN-032 a RN-035)

Implementar **RBAC** com exatamente **quatro perfis**, aplicado em **todas as rotas/endpoints**:

- **Administrador Geral:** acesso irrestrito — preços (padrão/sazonal/promocional), CRUD de quartos/leitos, gestão de usuários, relatórios financeiros, moderação de feedback, configuração de taxa de cancelamento, logs de auditoria.
- **Administrativo/Financeiro:** relatórios financeiros e operacionais, gestão de reservas (status), visualização de dados de hóspedes. **Sem** alteração de estrutura (preços, quartos, usuários admin).
- **Recepcionista:** cadastro presencial de hóspedes, check-in/check-out, reservas presenciais, painel de alertas (menores/PCD/grupos). **Sem** acesso financeiro/administrativo.
- **Hóspede:** cadastro próprio, consulta de disponibilidade, reservas e cancelamentos, histórico, feedback. **Sem** acesso a painéis administrativos.

---

## 4. CADASTRO E AUTENTICAÇÃO (RF-001, RF-002, RF-003, RF-005)

### 4.1 Cadastro (RN-001, RN-002, RN-003)
- Reserva exige cadastro — **não há reserva anônima**.
- Campos obrigatórios: nome completo, **nacionalidade** (select), data de nascimento, e-mail (validar formato e unicidade), telefone (máscara internacional), documento de identificação (CPF para brasileiros).
- Se nacionalidade **≠ “Brasileira”**: exigir **número de passaporte com registro de passagem pelo Rio de Janeiro**, armazenado com **criptografia AES-256** e acesso restrito a perfis administrativos (RNF-004).

### 4.2 Autenticação (RF-005)
- Login por e-mail + senha (mín. 8 caracteres, letras e números).
- Recuperação de senha por e-mail (link com expiração).
- Sessão via token (JWT ou equivalente). Senhas em hash **bcrypt/argon2**.

### 4.3 Aceite de Termo de Uso e LGPD (RF-003, RN-004, RN-026, RNF-006)
- Exibir **Termo de Uso** e **Política de Privacidade** **antes** de qualquer pagamento; sem aceite explícito (checkbox), o pagamento não é processado.
- Registrar de forma **imutável**: data, hora (timestamp), ID do usuário e versão do termo.

---

## 5. ESTRUTURA FÍSICA — MODELO DE DADOS DE QUARTOS/LEITOS (RN-006 a RN-010)

### 5.1 Quartos
Três categorias **rígidas**:

| Tipo | Nº de leitos | Banheiro privativo | Tarifa |
|---|---|---|---|
| A | 4  | SIM | Superior |
| B | 8  | NÃO (corredor) | Padrão |
| C | 12 | SIM | Superior |

Cada quarto possui também: **classificação de gênero** (`Masculino`, `Feminino`, `Misto`) e status ativo/inativo.
O sistema deve **impedir** que hóspedes de gêneros diferentes reservem leitos em quartos exclusivos (Masculino/Feminino) e exibir **apenas** os quartos compatíveis com a preferência informada na reserva (RF-007, RN-007, RN-010).

### 5.2 Leitos (RN-008, RN-012)
Cada leito é entidade independente com **PK única** e atributos:
- `posicao`: `beliche_superior` | `beliche_inferior` | `cama_simples`
- `localizacao`: `perto_da_porta` | `perto_da_janela` | `central`
- `incidencia_sol`: `sol_manha` | `sol_tarde` | `sem_sol`
- `status`: `disponivel` | `indisponivel` | `em_manutencao`
- **O preço NÃO varia por leito** — é atrelado ao tipo de quarto.

### 5.3 Banheiros (RN-009)
- Tipos A e C: banheiro privativo interno. Tipo B: banheiros de corredor compartilhados. Exibir essa informação em **todas** as telas de seleção.

---

## 6. CATÁLOGO E CONSULTA (RF-006, RF-008, RF-009, RF-010, RF-014, RF-028)

### 6.1 Exibição
- Lista de quartos: tipo, nº de leitos, banheiro, gênero, tarifa/diária; detalhe de cada leito (posição, localização, incidência de sol).
- Comodidades inclusas exibidas automaticamente (lista da Seção 2.3).

### 6.2 Mapa visual do albergue (RF-009, RN-021)
- Planta/mapa visual mostrando quartos, leitos, banheiros e áreas comuns, acessível antes e durante a reserva. (Pode iniciar como imagem/SVG com regiões clicáveis.)

### 6.3 Filtros combinados (RF-014)
Data de check-in (mín. hoje); nº de diárias (mín. 1); tipo de banheiro (privativo | corredor | todos); gênero (masculino | feminino | misto | todos); posição do leito; localização; incidência de sol.

### 6.4 Alertas de infraestrutura em destaque (RF-028, RN-019)
Sem elevador (apenas escadas — relevante para PCD); estacionamento rotativo limitado **sem garantia**; armários individuais com chave (seguro opcional); **proibição de pets**; **álcool proibido nas áreas comuns** (permitido só no restaurante parceiro anexo); portaria 24h.

---

## 7. MOTOR DE RESERVAS (RF-011 a RF-017, RN-011 a RN-013, RN-020, RNF-012)

### 7.1 Regra de disponibilidade e anti–double-booking (RF-011, RF-015, RN-011, RNF-012)
- Um leito só fica `Disponível` se **nenhuma reserva confirmada** se sobrepõe ao período pesquisado.
- Algoritmo de colisão: `check_in_solicitado < check_out_existente AND check_out_solicitado > check_in_existente` → colisão → indisponível.
- Verificação com **bloqueio transacional** no banco para evitar double-booking. **Escrever teste automatizado** para reservas concorrentes.

### 7.2 Diárias
- Começam e terminam ao **meio-dia (12h00)**; explicitar na reserva e na confirmação.

### 7.3 Fluxo de reserva de leito individual (RF-012)
Busca por período → filtros → leitos disponíveis → seleção → (se grupo) dados de acompanhantes → declaração de menores/PCD → resumo + valor total → aceite de termo → pagamento → confirmação com nº de reserva.

### 7.4 Reserva de quarto inteiro (RF-013, RN-022)
- Reservar todos os leitos de um quarto de uma vez, bloqueando-os no período.
- Quarto inteiro/albergue completo pode exigir **negociação direta**: disponibilizar **canal de contato** com o administrador (formulário / e-mail / WhatsApp).

### 7.5 Dados obrigatórios de grupos (RF-016, RN-012, RN-020)
- Para cada leito além do titular: **nome completo + documento** do acompanhante. **Nenhum leito sem titular nominal.**

### 7.6 Declaração de menores e PCD (RF-017, RN-013)
- Campo obrigatório: “Há menores de 18 anos ou pessoas com deficiência no grupo?”. (Integra-se ao seletor da Seção 2.5.)
- Se Sim: **alerta no painel da recepção** (priorizar beliches inferiores / quartos acessíveis) + aviso ao usuário sobre ausência de elevador.

---

## 8. PRECIFICAÇÃO (RF-019, RF-020, RN-014, RN-023, RN-024)

- Quartos com banheiro privativo (A e C): tarifa **superior**; sem privativo (B): tarifa **padrão**. Preço por **tipo de quarto**, nunca por leito.
- Administrador Geral define/edita a qualquer momento: valor **padrão**, **sazonal** (com data início/fim) e **promocional** (código/período). Toda alteração é **logada** (quem, quando, valor anterior e novo).

---

## 9. PAGAMENTO (RF-021, RN-015, RN-025, RNF-005)

- Exclusivamente **online via cartão de crédito**, gateway **PCI-DSS** (sandbox/mock nos testes).
- Dados de cartão **nunca armazenados** — apenas tokens do gateway.
- Exibir **valor total** (nº de diárias × tarifa do quarto) antes da confirmação.

---

## 10. CANCELAMENTO E REEMBOLSO (RF-022, RF-023, RN-016, RN-017, RN-028 a RN-031)

### 10.1 Política

| Antecedência ao check-in | Regra |
|---|---|
| 5 dias ou mais | Cancelamento gratuito — estorno integral |
| 1 a 4 dias | Taxa de cancelamento (configurável pelo admin: valor fixo R$ **ou** % do total) |
| No dia do check-in / no-show | Cobrança integral da primeira diária ou taxa máxima definida pelo admin |

### 10.2 Fluxo (RF-023, RN-017, RN-031)
1. Usuário solicita cancelamento na área da reserva.
2. Sistema **calcula e exibe**: valor estornado, taxa retida (se houver) e a política aplicada.
3. **Confirmação explícita em dois passos** pelo usuário.
4. Após confirmar: status → cancelada, estorno iniciado no gateway, **log de auditoria** registrado.

**Escrever testes** cobrindo cada faixa de antecedência.

---

## 11. PAINÉIS E PÁGINAS

### 11.1 Painel administrativo (Admin Geral / Adm-Financeiro)
- Dashboard: reservas ativas, hóspedes presentes, ocupação por tipo de quarto (%), receita dia/semana/mês.
- Tabela de reservas com filtros (período, quarto, status, hóspede) e alteração de status (confirmada → check-in → check-out → cancelada).
- CRUD de quartos e leitos (Admin Geral).
- Moderação de feedback (RF-025, RN-037): fila pendente → aprovar/rejeitar/responder; só aprovados aparecem publicamente.

### 11.2 Painel da recepção (Recepcionista)
- Check-ins e check-outs previstos do dia; **alertas de menores/PCD em destaque**; cadastro presencial; botões de check-in/check-out.

### 11.3 Páginas públicas
- **Home** (Seção 2.3) · **Quartos e Leitos** · **Mapa do Albergue** (RF-009) · **Regras do Albergue** (RF-026, RN-038) · **Comodidades** · **Avaliações/Feedback** (RF-025) · **Contato/Negociação para grupos** (RF-018).
- **Página de Regras** deve conter: horários de check-in/check-out (12h), uso das áreas comuns, política de cancelamento completa, proibições (pets, álcool nas áreas comuns), ausência de elevador, regras de armários/responsabilidade, política de silêncio/convivência.

### 11.4 Área do Hóspede (Minha Conta)
- Ver/editar cadastro; histórico de reservas (passadas/futuras); detalhe de cada reserva; botão de cancelamento (com validação das regras); avaliação de estadias concluídas.

---

## 12. INTERNACIONALIZAÇÃO (RF-024, RNF-011)
- PT-BR e EN; troca **dinâmica sem reload**; traduzir textos, alertas, e-mails automáticos e mensagens de erro; respeitar locale de data e moeda. Arquitetura pronta para novos idiomas (RNF-015).

---

## 13. REQUISITOS NÃO FUNCIONAIS (RNF-001 a RNF-017)
- **Desempenho:** consulta de disponibilidade ≤ **3 s**; uptime ≥ **99,5%** (manutenções avisadas 24h antes); contador de hóspedes com latência ≤ **5 s**.
- **Segurança:** AES-256 para dados sensíveis; gateway PCI-DSS sem armazenar cartão; LGPD com aceite imutável; RBAC em todas as rotas; **HTTPS (TLS 1.2+)**; senhas com bcrypt/argon2.
- **Usabilidade:** responsivo mobile-first; WCAG 2.1 AA; i18n nativo.
- **Confiabilidade:** anti–double-booking transacional; **logs de auditoria** (reservas, cancelamentos, alterações de preço, criação/edição de usuários); **backup diário** (retenção 30 dias, restauração ≤ 4h); arquitetura modular.
- **Portabilidade:** compatível com as 2 últimas versões de Chrome, Firefox, Safari e Edge; backend em nuvem (AWS/GCP/Azure) sem dependência de SO; Docker recomendado.

---

## 14. ORDEM DE CONSTRUÇÃO (fases — abrir um PR por fase)

1. **Setup & infra:** scaffold do projeto, Prisma + PostgreSQL, Docker, Tailwind, i18n base, esqueleto de rotas e tema (azul/branco/vermelho + barra superior).
2. **Auth & RBAC:** cadastro (com passaporte/AES-256 para estrangeiros), login, recuperação de senha, 4 perfis, aceite LGPD imutável.
3. **Modelo de dados físico:** quartos (A/B/C, gênero), leitos (atributos), seed de dados de exemplo, mapa visual.
4. **Catálogo & consulta:** Home (hero + comodidades + contador), listagem, filtros, calendário (Seção 2.4), seletor de pessoas (Seção 2.5).
5. **Motor de reservas:** disponibilidade + anti–double-booking (com testes), reserva individual e de quarto inteiro, acompanhantes, declaração menores/PCD.
6. **Precificação & pagamento:** tarifas (padrão/sazonal/promocional) + cálculo de total + gateway sandbox.
7. **Cancelamento & reembolso:** cálculo por faixa (com testes), fluxo de confirmação em dois passos, logs.
8. **Painéis:** admin, financeiro, recepção (alertas), moderação de feedback.
9. **Páginas públicas restantes:** regras, comodidades, avaliações, contato/grupos, mapa.
10. **Refino:** i18n completo, acessibilidade (WCAG AA), responsividade, logs de auditoria, backup, e-mails automáticos bilíngues, hardening de segurança.

---

## 15. MODELO DE DADOS — ENTIDADES PRINCIPAIS (referência)

```
USUARIO(id, nome_completo, email[unique], senha_hash, telefone, nacionalidade,
        data_nascimento, documento_identificacao, passaporte[encrypted,nullable],
        perfil[admin_geral|admin_financeiro|recepcionista|hospede], ativo,
        aceite_termos_at, created_at)
QUARTO(id, nome, tipo[4_leitos|8_leitos|12_leitos], banheiro_privativo[bool],
       genero[masculino|feminino|misto], ativo, created_at)
LEITO(id, id_quarto[FK], codigo, posicao[beliche_sup|beliche_inf|simples],
      localizacao[porta|janela|central], incidencia_sol[manha|tarde|sem_sol],
      status[disponivel|indisponivel|manutencao], created_at)
RESERVA(id, id_usuario_titular[FK], status[confirmada|checkin|checkout|cancelada],
        data_checkin, data_checkout, valor_total, valor_pago, created_at)
RESERVA_LEITO(id, id_reserva[FK], id_leito[FK], id_hospede_ocupante[FK])
HOSPEDE_AVULSO(id, nome_completo, documento)
DECLARACAO_GRUPO(id, id_reserva[FK], qtd_adultos, qtd_criancas[0-4],
                 possui_pcd[bool], qtd_pcd, descricao_deficiencias[texto])
TARIFA(id, id_quarto_tipo, valor_diaria, tipo[padrao|sazonal|promocional],
       data_inicio[nullable], data_fim[nullable], criado_por[FK])
PAGAMENTO(id, id_reserva[FK], gateway_transaction_id, valor, status,
          metodo[cartao_credito], created_at)
CANCELAMENTO(id, id_reserva[FK], solicitado_em, valor_estornado, taxa_retida,
             politica_aplicada, confirmado_por_usuario[bool])
FEEDBACK(id, id_usuario[FK], id_reserva[FK], nota[1-5], comentario,
         status[pendente|aprovado|rejeitado], moderado_por[FK], created_at)
AUDIT_LOG(id, id_usuario[FK], acao, entidade, id_entidade,
          dados_anteriores[JSON], dados_novos[JSON], ip, created_at)
ACEITE_TERMOS(id, id_usuario[FK], versao_termo, aceito_em[immutable])
```

---

## 16. CRITÉRIOS DE ACEITE (verificar ao final)
- [ ] Os 4 perfis têm permissões corretas e bloqueadas no backend (não só no frontend).
- [ ] Estrangeiro não cadastra sem passaporte; passaporte salvo criptografado.
- [ ] Não é possível pagar sem aceite de termo; aceite gravado de forma imutável.
- [ ] Quartos exclusivos (M/F) não aceitam gênero incompatível.
- [ ] Disponibilidade nunca permite double-booking (teste concorrente passa).
- [ ] Diárias ao meio-dia explicitadas; cálculo de total correto.
- [ ] Cancelamento calcula corretamente as 3 faixas e exige confirmação em 2 passos.
- [ ] Preço por tipo de quarto, nunca por leito; admin configura tarifas.
- [ ] Site responsivo, AA de acessibilidade, PT-BR/EN com troca sem reload.
- [ ] Logs de auditoria em reservas, cancelamentos e alterações de preço.
- [ ] Barra azul com Sr. Almeida, busca (data + pessoas), perfil/config/idioma; comodidades e contador na Home.

---

## 17. OBSERVAÇÕES FINAIS
- Café da manhã/refeitório é operado por **empresa parceira externa** — o sistema registra a parceria, mas não gerencia a operação.
- Álcool permitido **apenas no restaurante parceiro anexo**; deixar claro nas regras.
- E-mails automáticos (confirmação, cancelamento, recuperação de senha) no idioma do usuário.
- Feedback tem **nota 1–5** + comentário livre.
- Taxa de cancelamento configurável em **valor fixo (R$) ou percentual**.
- Imagens do hero/quartos podem ser placeholders nos testes, fáceis de substituir.

*Base: Minimundo, Regras de Negócio (RN-001 a RN-039) e Requisitos (RF-001 a RF-028 | RNF-001 a RNF-017) — XPTOTec, 2026.*
