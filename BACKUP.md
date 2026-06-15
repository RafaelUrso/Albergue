# Estratégia de Backup — Albergue Sr. Almeida

Este documento descreve a política e os procedimentos de backup e restauração para o sistema de reservas do Albergue Sr. Almeida.

## 1. Frequência e Retenção
- **Frequência:** O backup do banco de dados (PostgreSQL) deve ser realizado **diariamente**.
- **Retenção:** Os arquivos de backup devem ser mantidos por **30 dias**. Backups mais antigos que 30 dias serão excluídos automaticamente pelo script de backup.

## 2. Script de Backup
O script `scripts/backup-db.sh` automatiza o processo de exportação do banco de dados utilizando `pg_dump`.

### Execução Manual:
```bash
./scripts/backup-db.sh
```

### Agendamento (Cron):
Para automatizar a execução diária às 03:00 da manhã:
```bash
0 3 * * * /path/to/project/scripts/backup-db.sh >> /path/to/project/backups/backup.log 2>&1
```

## 3. Estratégia de Restauração
Em caso de falha ou corrupção de dados, siga os passos abaixo:

1.  **Identificar o backup mais recente:**
    Localize o arquivo mais recente no diretório `./backups/`.
2.  **Preparar o banco de dados:**
    Certifique-se de que o banco de dados alvo está vazio ou pronto para receber a restauração.
3.  **Executar psql:**
    Utilize o utilitário `psql` para restaurar o dump:
    ```bash
    psql $DATABASE_URL < backups/backup_YYYYMMDD_HHMMSS.sql
    ```
4.  **Verificação:**
    Valide a integridade dos dados acessando o sistema e verificando as reservas recentes.

## 4. Observações
- Os backups devem ser armazenados em um volume separado ou em um serviço de armazenamento em nuvem (ex.: AWS S3) para garantir a segurança em caso de falha no servidor de aplicação.
- A restauração deve ser testada periodicamente (ex.: trimestralmente) em um ambiente de homologação.
