const mongoose = require('mongoose');

const alunoSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    ra: { type: String, required: true, trim: true },
    curso: { type: String, required: true, trim: true },
    turma: { type: String, required: true, trim: true }
}, {
    collection: 'alunos'
});

module.exports = mongoose.model('Aluno', alunoSchema);