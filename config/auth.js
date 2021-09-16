// CONFIGURANDO O PASSPORTJS PARA AUTENTICAÇÃO DE usuarios

const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("../models/Usuario") ///Model de usuario
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){
                                     // vvvvvvvvv qual campo que será analisado?  // (email/senha/done) >> function callback
    passport.use(new localStrategy({usernameField: 'email', passwordField:'senha'}, (email, senha, done) =>{

        Usuario.findOne({email:email}).lean().then((usuario) =>{
            if(!usuario){
                return done(null, false, {message:"Essa conta não existe!"})
            }
                  // vvv comparando valores encriptados
            bcrypt.compare(senha, usuario.senha, (erro, batem) =>{
                    if(batem){                   //
                        return done(null, usuario)
                    }else{
                        return done(null, false, {message:"Senha incorreta!"})

                    }
            })

        })

    }))
    // serve para salvar os dados do usuario em uma seção, ou seja, assim que usuario logar, ele sera salvo em um secao
        passport.serializeUser((usuario, done) =>{
            done(null, usuario._id)
        })
        passport.deserializeUser((id, done) =>{
            Usuario.findById(id, (err,usuario) =>{
                done(err, usuario)
            })
        })
}

