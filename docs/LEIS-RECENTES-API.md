# Integração API – Leis Recentes (Diário da República)

A página **Leis Recentes** (`leis-recentes.html`) está preparada para receber dados de uma API que agregue publicações do Diário da República (DRE).

## Estrutura na página

- **Container:** `#leis-list` – lista de itens de legislação.
- Cada item pode ter: título, data de publicação, sumário, link para o DRE, tipo (Lei, Decreto-Lei, Portaria, etc.).

## Formato sugerido da API

Exemplo de resposta JSON por item:

```json
{
  "id": "string",
  "titulo": "string",
  "dataPublicacao": "YYYY-MM-DD",
  "sumario": "string",
  "urlDr": "https://dre.pt/...",
  "tipo": "Lei | Decreto-Lei | Portaria | ..."
}
```

## Como integrar

1. **Backend:** Criar um endpoint (ex.: `GET /api/leis-recentes`) que consulte a fonte do DRE (API oficial ou scraping) e devolva o JSON.
2. **Frontend:** Em `leis-recentes.html` (ou num módulo `src/features/leis-api.js`):
   - Fazer `fetch` ao seu endpoint.
   - Preencher `#leis-list` com os itens (substituir ou acrescentar ao conteúdo estático).
3. **Fallback:** Enquanto a API não existir, a página mostra conteúdo estático; quando a API responder, pode substituir o innerHTML de `#leis-list` ou concatenar novos nós.

## Referências DRE

- Diário da República Eletrónico: https://dre.pt
- Consulte a documentação oficial para acesso programático ou feeds, se disponíveis.
