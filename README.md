<h1 align="center"> YouCourse API </h1>

<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
</p>

### Índice
* [Descrição do Projeto](#descrição-do-projeto)
* [Status do Projeto](#status-do-projeto)
* [Funcionalidades e Demonstração da Aplicação](#funcionalidades-e-demonstração-da-aplicação)
* [Acesso ao Projeto](#acesso-ao-projeto)
* [Tecnologias utilizadas](#tecnologias-utilizadas)
* [Pessoas Desenvolvedoras do Projeto](#pessoas-desenvolvedoras-do-projeto)
* [Licença](#licença)

---

📌 **Descrição do Projeto:**
O **YouCourse API** é o core backend para um portal de cursos online, construído com NestJS. Ele utiliza Clean Architecture e DDD para gerenciar contas, cursos, unidades, aulas e avaliações, além de integração com AWS para streaming de vídeo seguro.

📌 **Status do Projeto:**
<h4 align="center"> 
    :construction: Projeto em construção :construction:
</h4>

📌 **Funcionalidades e Demonstração da Aplicação:**
# :hammer: Funcionalidades do projeto
- `Autenticação`: Gestão de sessões com JWT, Refresh Token e recuperação de senha.
- `Gestão de Cursos`: CRUD completo de cursos, unidades e lições com controle de posição (`position`) para reordenação.
- `Métricas e Ratings`: Monitoramento de engajamento (views, clicks, sales) e sistema de avaliações (score).
- `Segurança de Conteúdo`: Proteção de vídeos via Signed URLs e integração com AWS S3/CloudFront.
- `Infraestrutura`: Deploy automatizado com Docker e Proxy reverso Caddy com SSL automático.

📌 **Acesso ao projeto:**
## 📁 Acesso ao projeto
Documentação Swagger disponível em: 
> [https://youcourse-api.duckdns.org/api](https://youcourse-api.duckdns.org/api)

## 🛠️ Abrir e rodar o projeto

**1. Instalação e Configuração:**
```bash
$ pnpm install
$ cp .env.example .env
```
Preencha o .env com suas credenciais de Banco, AWS, JWT e SMTP.

**2. Docker e Bando de Dados:**
```bash
$ docker-compose up -d
$ pnpm db:deploy
```

**3. Execução e Testes:**
```bash
$ pnpm run dev       # Iniciar API em modo dev
$ pnpm run test      # Unitários
$ pnpm run test:e2e  # End-to-End
```

📌 **Tecnologias utilizadas:**

O projeto foi construído utilizando o estado da arte para garantir escalabilidade e manutenibilidade:

- **NestJS 11** | **TypeScript 5**
- **Prisma ORM** | **PostgreSQL**
- **Caddy Server** (Reverse Proxy & Auto-HTTPS)
- **AWS SDK** (S3 Storage & CloudFront Signed URLs)
- **Zod** (Validation & Type-Safety)
- **Vitest** (Unit & E2E Testing)
- **Docker & Docker Compose**

📌 **Pessoas Desenvolvedoras do Projeto:**

# Autores

<div align="center">

| [<img src="https://github.com/J-V-S-C.png" width="100px;" style="border-radius:50%;" alt="João Victor"/><br><sub><b>João Victor Sant'Ana Cortabitart</b></sub>](https://github.com/J-V-S-C) |
| :---: |

</div>

📌 **Licença:**

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
