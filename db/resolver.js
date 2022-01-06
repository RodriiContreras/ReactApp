const bcryptjs = require('bcryptjs')
const Usuario = require('../models/Usuarios')
const Producto = require('../models/Producto')
const jwt = require('jsonwebtoken')
require('dotenv').config({path:'./variables.env'})


const crearToken= (usuario,secreta,expiresIn)=>{
const {id,email,nombre,apellido} = usuario;
return jwt.sign({id,email,nombre,apellido},secreta,{expiresIn})
}
const resolvers={
    Query:{
        obtenerUsuario: async(_,{token})=>{
          const usuarioId= await jwt.verify(token,process.env.SECRETO)
          return usuarioId
        },
        obtenerProductos:async()=>{
            try {
                const productos= await Producto.find({});//retorna todos los objetos
                return productos
            } catch (error) {
                console.log(error)
            }

        },
        obtenerProductoId:async(_,{id})=>{
            // reviso si el producto existe
            const existeProducto = await Producto.findById(id)
            if(!existeProducto){
                throw new error("no se encontro el producto")
            }

            return existeProducto
        }
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
       const salt = await bcryptjs.genSalt(10);//codigo por defecto de bcryptJS
       input.password = await bcryptjs.hash(password,salt)


       //guardan en DB
       try {
           const usuario = new Usuario(input);
           usuario.save()
           return usuario
       } catch (error) {
           console.log(error)
       }
     },
   
    autenticacionUsuario: async(_,{input},ctx)=>{
     const {email,password} = input;    

    const existeUsuario =  await Usuario.findOne({email});
    if(!existeUsuario){
        throw new error('El usuario no esta registrado')
    }
    
    const passwordCorrecto = await bcryptjs.compare(password,existeUsuario.password);
    if (!passwordCorrecto){
        throw new error('La contraseña es incorrecta')
    }

    return{
        token:crearToken(existeUsuario,process.env.SECRETO,'24h')
    }
    },
    nuevoProducto:async(_,{input})=>{
        
    try {
        
        const producto = new Producto(input);
        const resultado = await producto.save();
        return resultado
    } catch (error) {
        console.log(error)
    }
   
    },
    actualizarProducto:async(_,{id,input})=>{
        let existeProducto = await Producto.findById(id)
        if(!existeProducto){
            throw new error("no se encontro el producto")
        }

        existeProducto = await Producto.findOneAndUpdate({_id:id},input,{new:true});

            return existeProducto
    },
    eliminarProducto:async(_,{id})=>{
        let existeProducto = await Producto.findById(id)
        if(!existeProducto){
            throw new error("no se encontro el producto")
        }
         await Producto.findOneAndDelete({_id:id});

         return "producto eliminado"
    }
},
}


module.exports=resolvers;
