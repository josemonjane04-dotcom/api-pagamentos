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

// Função para extrair ID e valor da mensagem M-Pesa
function extrairIDeValor(msg) {
  try {
    // ID = entre "Confirmado " e "."
    const idMatch = msg.match(/Confirmado (\S+)\./);
    const id = idMatch ? idMatch[1] : null;

    // Valor = entre "Recebeste " e "MT"
    const valorMatch = msg.match(/Recebeste (\d+)\.?\d*MT/);
    const valor = valorMatch ? valorMatch[1] : null;

    if (id && valor) {
      return `${id}=${valor}`;
    }
  } catch (err) {
    console.error('Erro ao extrair ID e valor:', err);
  }
  return null;
}

// Rota teste raiz
app.get('/', (req, res) => {
  res.send('API de pagamentos ativa! Use /pagamentos para listar.');
});

// Listar pagamentos
app.get('/pagamentos', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(dataFile));
  res.json(pagamentos);
});

// Adicionar pagamento — extrair ID e valor
app.post('/pagamento', (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({ erro: 'Campo mensagem ausente' });
  }

  const registro = extrairIDeValor(mensagem);

  if (!registro) {
    return res.status(400).json({ erro: 'Não foi possível extrair ID e valor da mensagem' });
  }

  const pagamentos = JSON.parse(fs.readFileSync(dataFile));

  const novo = {
    id: Date.now(),
    registro: registro,
    data: new Date().toISOString()
  };

  pagamentos.push(novo);
  fs.writeFileSync(dataFile, JSON.stringify(pagamentos, null, 2));

  console.log(`🌐 SMS remote registrado: ${registro}`);

  res.json({ sucesso: true, pagamento: novo });
});

// Porta dinâmica para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API de pagamentos rodando na porta ${PORT}`);
});
