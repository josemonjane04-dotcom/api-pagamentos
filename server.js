const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Caminho do arquivo de pagamentos
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'pagamentos.json');

// Cria pasta e arquivo se não existir
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]');

// Rota teste raiz
app.get('/', (req, res) => {
  res.send('API de pagamentos ativa! Use /pagamentos para listar.');
});

// Listar pagamentos
app.get('/pagamentos', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(dataFile));
  res.json(pagamentos);
});

// Adicionar pagamento
app.post('/pagamento', (req, res) => {
  const { valor, numero, metodo, mensagem } = req.body;
  if (!valor || !numero || !metodo) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  const pagamentos = JSON.parse(fs.readFileSync(dataFile));

  const novo = {
    id: Date.now(),
    valor,
    numero,
    metodo,
    mensagem: mensagem || '',
    data: new Date().toISOString()
  };

  pagamentos.push(novo);
  fs.writeFileSync(dataFile, JSON.stringify(pagamentos, null, 2));

  res.json({ sucesso: true, pagamento: novo });
});

// Porta dinâmica para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API de pagamentos rodando na porta ${PORT}`);
});
