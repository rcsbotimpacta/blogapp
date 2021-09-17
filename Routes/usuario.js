// criando lista de registro de usuarios para autenticação
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs") //npm install --save bcryptjs - biblioteca para encriptar e rash (rashear) a senha
// criptografia >>É REVERSIVEL  /// rash >> NÃO É REVERSIVEL
// npm install --save passport
// npm install --save passport-local  - instalador de estrategia local de autenticação
const passport = require("passport")

router.get("/registro", (req, res)=>{
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) =>{
    var erros =[]

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail Inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Inválida"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes, tente novamente!"})
    }            //^^^^^^ aparecerá na chave {{each erros}}  >>> {{texto}}

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario) =>{
            if(usuario){
                req.flash("error_msg", "Ja existe uma conta com este e-mail no nosso sistema!")
                res.redirect("/usuarios/registro")  //<<<
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                }) // salvara esse novo usuiario atragves dos dados digitados no body da pagina criar registro usuario
                bcrypt.genSalt(10,(erro,salt) =>{
                    //hash precisa 3 parametros: qual valor rashear? / salt // calback (erro/hash)
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash) =>{
                        if(erro){
                            req.flash("error_msg", " Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then( ()=>{
                            req.flash("success_msg", " Usuario criado com sucesso") // se ocorrer OK o cadastro
                            res.redirect("/")
                        }).catch((err) =>{
                            req.flash("error_msg", " Houve um erro ao criar o usuario, tente novamente!")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
                // encriptando senha; salt >> mix de letras, numeros, caracteres aleatorios
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

// ROTA PARA LOGIN DE USUARIO - FORMULARIO DE LOGIN
router.get("/login" , (req, res)=>{
    res.render("usuarios/login")
})

                    // rota de autenticação
router.post("/login", (req,res,next) =>{
            // funcao para sempre que for autenticar alguma coosa
    passport.authenticate("local", {
        successRedirect: "/",   // rota para redirecionar se estiver OK
        failureRedirect: "/usuarios/login",   //rota para redirecionar se estiver NOK
        failureFlash: true
    })(req, res, next)
})

// rota para fazer o LOGOUT
router.get('/logout', (req, res) =>{
    req.logout()
    req.flash("success_msg", "Deeslogado com sucesso!")
    res.redirect("/")
})

module.exports = router