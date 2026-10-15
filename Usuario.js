const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    senhaHash: {
        type: String,
        required: true,
        select: false
    }
}, {
    collection: 'usuarios'
});

module.exports = mongoose.model('Usuario', usuarioSchema);