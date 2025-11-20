# 📱 MarmitaWare Mobile - App Android

App Android completo do sistema MarmitaWare, desenvolvido com React Native e Expo.


## 🚀 Como Rodar o Projeto

### 1. Instalar Dependências

```bash
cd mobile
npm install
```

### 2. Configurar URL da API

O app está configurado para se conectar ao backend. Por padrão, usa:
- **Emulador Android**: `http://10.0.2.2:5000/api`
- **Dispositivo físico**: Use o IP da sua máquina na rede Wi-Fi

#### Como Obter o IP da Máquina

1. **No Windows (PowerShell ou CMD)**, execute:

   ```powershell
   ipconfig
   ```

2. Procure pela seção **"Adaptador de Rede Sem Fio Wi-Fi"** (ou "Wireless LAN adapter Wi-Fi")

3. Anote o endereço **IPv4** (geralmente no formato `192.168.x.x`)

   Exemplo de saída:
   ```
   Adaptador de Rede Sem Fio Wi-Fi:
      IPv4. . . . . . . . . . . . . . . . . . . : 192.168.1.100
   ```

#### Alterar no app.json

Edite o arquivo `app.json` na pasta `mobile/` e altere o campo `apiUrl` com o IP que você obteve:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:5000/api"
    }
  }
}
```

**Importante**: 
- Substitua `192.168.1.100` pelo IP que você obteve com `ipconfig`
- Se estiver usando WSL 2, consulte a seção [Problemas de Rede no WSL 2](#problemas-de-rede-no-wsl-2) abaixo

### 3. Iniciar o Backend

Certifique-se de que o backend está rodando:

```bash
cd ../backend
python3 api.py
```

O backend deve estar rodando em: **http://localhost:5000**

### 4. Rodar o App

#### Expo Go (Desenvolvimento)

```bash
npm start
```

Depois escaneie o QR code com o app Expo Go no seu celular Android.

## 📦 Gerar APK

### Método 1: EAS Build (Recomendado)

1. **Criar conta no Expo** (se ainda não tiver):
   ```bash
   eas login
   ```

2. **Configurar o projeto**:
   ```bash
   eas build:configure
   ```

3. **Gerar APK**:
   ```bash
   eas build --platform android --profile preview
   ```

   Ou para produção:
   ```bash
   eas build --platform android --profile production
   ```

4. **Baixar o APK**: Após o build, você receberá um link para baixar o APK.

## 🔧 Configurações Adicionais

### Alterar Nome do App

Edite `app.json`:

```json
{
  "expo": {
    "name": "Seu Nome do App",
    "slug": "seu-slug"
  }
}
```

### Permissões

O app precisa de permissão de Internet para se conectar ao backend. Isso já está configurado em `app.json`.

## 📱 Funcionalidades

O app Android mantém todas as funcionalidades do frontend web:

- ✅ **Dashboard** - Visualize receitas, custos e lucros
- ✅ **Marmitas** - Gerencie o cardápio com cálculo de margem
- ✅ **Ingredientes** - Controle de ingredientes e preços
- ✅ **Vendas** - Registre e acompanhe vendas
- ✅ **Compras** - Controle de compras de insumos
- ✅ **Gráficos** - Visualizações de dados financeiros
- ✅ **CRUD Completo** - Criar, editar e excluir itens

## 🐛 Solução de Problemas

### Problemas de Rede no WSL 2

Esse é um problema muito comum no WSL 2. A razão é que o WSL 2 roda em uma máquina virtual leve que tem **seu próprio endereço IP**, diferente do endereço IP do seu Windows na rede Wi-Fi.

#### Modo "Mirrored" (Recomendado para Windows 11 atualizado)

As versões mais recentes do WSL permitem que o Linux compartilhe o mesmo IP do Windows. Isso resolve o problema instantaneamente.

1. No Windows, vá até a pasta do seu usuário (`C:\Users\SeuUsuario`).

2. Crie (ou edite) um arquivo chamado `.wslconfig` (note o ponto no início).

3. Cole o seguinte conteúdo:

   ```ini
   [wsl2]
   networkingMode=mirrored
   ```

4. Abra o terminal (PowerShell) e reinicie o WSL:

   ```powershell
   wsl --shutdown
   ```

5. Inicie sua API novamente. Agora o WSL usa o mesmo IP do Windows.

#### Liberar a Porta no Firewall do Windows

O Windows frequentemente bloqueia conexões de entrada de outros dispositivos na rede Wi-Fi.

1. Abra o **PowerShell como Administrador**.

2. Execute o comando para liberar a porta:

   ```powershell
   New-NetFirewallRule -DisplayName "WSL API Python" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

#### Como Acessar do Celular/Outro PC

Agora, para acessar, você **NÃO** usa o IP do WSL. Você deve usar o **IP do Windows na rede Wi-Fi**.

1. No Windows (PowerShell), digite:

   ```powershell
   ipconfig
   ```

2. Procure por "Adaptador de Rede Sem Fio Wi-Fi" e pegue o endereço **IPv4** (geralmente `192.168.x.x`).

3. No celular ou no `app.json`, configure:

   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "http://192.168.X.X:5000/api"
       }
     }
   }
   ```

#### Resumo Rápido se Der Errado

1. Garanta que o código Python está rodando com `host='0.0.0.0'` (verifique o arquivo `backend/api.py`).

2. Se usou a **Opção B**, lembre-se que o IP do WSL muda toda vez que você reinicia o PC, então terá que refazer o comando `netsh` (a Opção A resolve isso permanentemente).

3. Verifique se o celular e o PC estão na mesma rede Wi-Fi (alguns roteadores isolam a rede 5GHz da 2.4GHz ou rede de convidados).

### Erro de Conexão com API

1. Verifique se o backend está rodando
2. Para dispositivo físico, use o IP da máquina (não localhost)
3. Verifique se o firewall não está bloqueando a porta 5000
4. No emulador, use `10.0.2.2` ao invés de `localhost`

### Erro ao Instalar Dependências

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Erro no Build

1. Limpe o cache do Expo:
   ```bash
   npx expo start -c
   ```

2. Para build local, limpe o projeto Android:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

## 📚 Estrutura do Projeto

```
mobile/
├── App.js                 # Componente principal
├── app.json              # Configuração do Expo
├── package.json          # Dependências
├── src/
│   ├── components/      # Componentes React Native
│   │   ├── Dashboard.js
│   │   ├── Marmitas.js
│   │   ├── Ingredientes.js
│   │   ├── Vendas.js
│   │   ├── Compras.js
│   │   ├── Modal.js
│   │   └── StatCard.js
│   ├── services/
│   │   └── api.js        # Serviços de API
│   └── utils.js          # Funções utilitárias
└── assets/               # Imagens e recursos
```

## 🎨 Personalização

### Cores

As cores principais estão definidas nos componentes. Para alterar globalmente, crie um arquivo `src/theme.js` e importe nos componentes.

### Fontes

Por padrão, o React Native usa as fontes do sistema. Para usar fontes customizadas, adicione em `assets/fonts/` e configure em `app.json`.

## 📄 Licença

Este projeto faz parte do sistema MarmitaWare desenvolvido para a disciplina CSI-28.

## 👨‍💻 Autores

Desenvolvido com ❤️ pela equipe MarmitaWare

