const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagem = new Schema ({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,  // SERVE PARA COLETAR UM ID DE UM OBJETO, OU SEJA, CATEGORIA IRA ARMAZENAR ID
        ref: "categorias",   // referencia para o tipo de objeto, no caso model categoria criado
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("postagens", Postagem)