const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const pagamentosFile = path.join(__dirname, 'pagamentos.json')

// ===============================
// 🔐 GARANTIR ARQUIVO
// ===============================
if (!fs.existsSync(pagamentosFile)) {
  fs.writeFileSync(pagamentosFile, '[]')
}

// ===============================
// 📥 RECEBER PAGAMENTO (WEBHOOK)
// ===============================
app.post('/pagamento', (req, res) => {
  try {
    const dados = req.body

    if (!dados.valor || !dados.numero) {
      return res.status(400).json({ erro: 'Dados obrigatórios ausentes' })
    }

    const pagamentos = JSON.parse(fs.readFileSync(pagamentosFile))

    const novoPagamento = {
      id: Date.now(),
      valor: dados.valor,
      numero: dados.numero,
      metodo: dados.metodo || 'desconhecido',
      mensagem: dados.mensagem || '',
      data: new Date().toISOString()
    }

    pagamentos.push(novoPagamento)
    fs.writeFileSync(pagamentosFile, JSON.stringify(pagamentos, null, 2))

    res.json({ sucesso: true, pagamento: novoPagamento })

  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro interno' })
  }
})

// ===============================
// 📤 LISTAR PAGAMENTOS (BOT LÊ)
// ===============================
app.get('/pagamentos', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(pagamentosFile))
  res.json(pagamentos)
})

// ===============================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('🚀 API de pagamentos rodando na porta', PORT)
})
