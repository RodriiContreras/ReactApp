const {ApolloServer}= require('apollo-server');
const typeDefs = require('./schema')

const Usuario = require('../models/Usuarios')


const resolvers={
    Query:{
      obtenerCurso:()=>"hola mundo"
    },
    Mutation:{
     nuevoUsuario: async (_,{input},ctx)=>{
         const {email,password} = input;
       //revisar si esta registrado
       const existeUsuario = await Usuario.findOne({email})
       if (existeUsuario){
           throw new Error('El usuario ya esta registrado')
       }
       //hashear password

       //guardan en DB
       try {
           const usuario = new Usuario(input);
           usuario.save()
           return usuario
       } catch (error) {
           console.log(error)
       }
     }
    }
}


module.exports=resolvers;
