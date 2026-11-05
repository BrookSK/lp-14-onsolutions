# LP14 — Infraestrutura em Nuvem · ON Solutions Brasil

Landing page da linha **ON Solutions Brasil** focada nos serviços de
**infraestrutura em nuvem, backup, segurança e monitoramento 24 horas**.

## Objetivo

Gerar contatos comerciais diretamente pelo **WhatsApp**. O visitante
identifica seus problemas de infraestrutura na seção de desafios e esses
itens são enviados automaticamente na mensagem de orçamento, já pronta,
ao tocar em **“Pedir orçamento no WhatsApp”**.

## Estrutura de arquivos

O site fica na **raiz do repositório** para que o `index.html` seja servido
diretamente pelo domínio (evita o erro 403 quando o servidor procura o índice
na raiz).

```text
lp-14-onsolutions/
├── index.html              # Estrutura HTML5 semântica
├── css/
│   └── style.css           # Toda a identidade visual e responsividade
├── js/
│   └── script.js           # Comportamentos (Vanilla JS, sem dependências)
├── assets/
│   ├── favicon.png         # Ícone da aba do navegador
│   ├── icons/
│   │   └── logo-on.png     # Logotipo da ON Solutions (header + prévia WhatsApp)
│   ├── images/
│   │   ├── cliente-braziliana.png
│   │   ├── cliente-quatri.png
│   │   ├── cliente-brooks.png
│   │   ├── cliente-crosshr.png
│   │   ├── cliente-multilife.png
│   │   └── cliente-mafedo.png
│   └── make-assets.ps1     # Gera/recria os PNGs locais (opcional)
└── README.md
```

## Tecnologias

- **HTML5** semântico (um único `<h1>`, hierarquia correta de `<h2>`/`<h3>`).
- **CSS3** com variáveis (`:root`), grid/flex e media queries.
- **JavaScript puro (Vanilla JS)** — sem React, Vue, Angular, backend ou banco.
- **Google Fonts** (Poppins 400/500/600/700/800) e **WhatsApp** (`wa.me`) como
  únicos recursos externos.

## Como executar localmente

Por usar apenas arquivos estáticos, basta abrir o `index.html` no navegador.
Para evitar restrições de carregamento de arquivos locais, recomenda-se servir
a pasta por um servidor simples:

```bash
# Python 3
python -m http.server 8080
# depois acesse http://localhost:8080/
```

> Observação: comandos de servidor são de execução contínua. Rode-os
> manualmente no seu terminal; não os deixe num processo automatizado.

## Seções da página

1. **Header** fixo (esconde ao rolar para baixo, reaparece ao subir).
2. **Hero** com selo, H1 destacado, benefícios e prévia de conversa WhatsApp.
3. **Desafios** (`#desafios`) — seleção múltipla que compõe a mensagem.
4. **Benefícios** (`#beneficios`) — 4 cartões.
5. **Prova social / Clientes** (`#clientes`) — indicadores + carrossel infinito.
6. **Como funciona** (`#como-funciona`) — 3 passos.
7. **Oferta / Conversa gratuita** (`#oferta`).
8. **FAQ** (`#duvidas`) — `<details>`/`<summary>` expansível.
9. **CTA final** (`#conversa`).
10. **Footer** com e-mail e links de LGPD/Privacidade.
11. **Barra fixa de WhatsApp** (respeita `safe-area-inset-bottom`).

## Principais funcionalidades JavaScript (`js/script.js`)

- **`waLink(message)`** — monta o link do WhatsApp usando
  `encodeURIComponent()`.
- **Origem de campanha** — captura `utm_term`, `kw`, `utm_campaign` e `gclid`
  e, quando `ON_APPEND_ORIGIN = true`, acrescenta `Origem: anúncio …` à
  mensagem (sem adicionar campos vazios).
- **Links WhatsApp** — todos os `[data-wa]` abrem em nova aba
  (`target="_blank"`, `rel="noopener"`) com a mensagem atualizada.
- **Rastreamento** — carrega GTM / GA4 / Google Ads sob demanda e dispara os
  eventos `whatsapp_click` e `generate_lead` (serviço + posição do botão).
- **Header** — esconde/reaparece conforme a rolagem, com tolerância de 24px e
  reaparição ao receber foco por teclado.
- **Desafios** — cada botão alterna `aria-pressed`; a mensagem e a prévia do
  Hero (todos os `[data-wa-main]`) são recalculadas:
  - 0 opções → mensagem base.
  - 1 opção → `Meu maior desafio hoje: …`.
  - 2+ opções → `Meus maiores desafios hoje: …; …`.
  - Feedback via `aria-live` abaixo das opções.
- **Carrossel** — loop infinito com duplicação dos itens, velocidade
  proporcional à largura, pausa no toque e respeito a
  `prefers-reduced-motion`.

## Configurações rápidas

### Identificadores de rastreamento

No topo de `js/script.js`:

```js
var ON_TRACKING = { gtmId: "", ga4Id: "", gadsId: "", gadsConversionLabel: "" };
```

Preencha os IDs desejados para ativar o carregamento das tags. Vazio = nada é
carregado. `gadsConversionLabel` é usado junto de `gadsId` para a conversão de
clique no WhatsApp.

### Número do WhatsApp

Altere a constante em `js/script.js`:

```js
var WA_NUMBER = "5511972243329";
```

Atualize também o telefone exibido no header (`index.html`): `(11) 97224-3329`.

### Textos das mensagens

- A mensagem base por serviço vem do atributo `data-service` do `<main>`
  (`data-service="Infraestrutura"`) e/ou do atributo `data-wa` de cada botão.
- Os textos de cada desafio ficam no atributo `data-q` dos botões `.pain`.
- Os textos de feedback e os prefixos
  (`Meu maior desafio hoje:` / `Meus maiores desafios hoje:`) estão na função
  `sync()` em `js/script.js`.

### Atualizar recursos visuais (logos e favicon)

Os arquivos em `assets/icons`, `assets/images` e `assets/favicon.png` podem ser
substituídos pelos PNGs definitivos, **mantendo os mesmos nomes de arquivo** —
nenhuma alteração de código é necessária.

> **Importante sobre os logos.** A versão de referência trazia o logotipo da ON
> e os logotipos dos clientes embutidos em Base64. Os arquivos atuais em
> `assets/icons/logo-on.png` e `assets/images/cliente-*.png` foram gerados
> localmente pelo script `assets/make-assets.ps1` como representação dos mesmos
> clientes citados na referência (Braziliana, Quatri, Brooks, CrossHR,
> MultiLife, Mafedo — além do wordmark **Central RZ** no HTML). Para fidelidade
> pixel a pixel, basta sobrescrever esses PNGs pelos originais da ON Solutions.
> Para recriar as versões locais, rode:
>
> ```powershell
> powershell -ExecutionPolicy Bypass -File assets\make-assets.ps1
> ```

## Acessibilidade

- HTML semântico e navegação por teclado com estados de foco visíveis.
- `aria-pressed` nos desafios, `aria-live` no feedback dinâmico,
  `aria-label` nos grupos e ícones decorativos com `aria-hidden`.
- `prefers-reduced-motion` desativa animações.
- Textos alternativos nas imagens.

> A validação completa de WCAG exige testes manuais com tecnologias assistivas
> e revisão especializada em acessibilidade.

## SEO

- `title`: *Infraestrutura em Nuvem | ON Solutions Brasil*
- `description`: *Servidores, backup e segurança cuidados pela ON, com
  monitoramento 24 horas.*
- `canonical`: `https://onsolutionsbrasil.com.br/lp/infraestrutura-em-nuvem/`
- `robots`: `noindex,follow`
- `theme-color`: `#0B1220`

## Responsividade

Breakpoints preservados da referência: **340px, 380px, 400px, 430px e 860px**,
além do desktop. Sem rolagem horizontal indevida; alvos de toque adequados.
