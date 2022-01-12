const bcryptjs = require('bcryptjs')
const Usuario = require('../models/Usuarios')
const Producto = require('../models/Producto')
const jwt = require('jsonwebtoken')
const Cliente = require('../models/Cliente')
const Pedido = require('../models/Pedido')
require('dotenv').config({path:'variables.env'})


const crearToken= (usuario,secreta,expiresIn)=>{
const {id,email,nombre,apellido} = usuario;
return jwt.sign({id,email,nombre,apellido},secreta,{expiresIn})
}
const resolvers={
    Query:{
        obtenerUsuario: async(_,{token})=>{
            console.log(token)
          const usuarioId= await jwt.verify(token,process.env.SECRETO)
          return usuarioId
        },
        obtenerProductos:async()=>{
            try {
                const productos= await Producto.find({});//retorna todos los objetos
                return productos
            }

             catch (error) {
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
        },
        obtenerClientes:async(_,)=>{
           try {
               const clientes = await Cliente.find({})
               return clientes
           }

            catch (error) {
            console.log(error)
           }
        },
        obtenerClientesVendedor:async(_,{},ctx)=>{
            try {
                const clientes = await Cliente.find({vendedor:ctx.usuario.id.toString()})
                return clientes
            }
 
             catch (error) {
             console.log(error)
            }
        },
        obtenerCliente:async(_,{id},ctx)=>{
            const cliente = await Cliente.findById(id);

            if(!cliente){
                throw new error('Cliente no encontrado')
            }
            if (cliente.vendedor.toString()  !== ctx.usuario.id){
                throw new error('No eres el vendedor de este cliente')
            }

            return cliente;

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
    },


    //CLIENTES
    nuevoCliente:async(_,{input},ctx)=>{
         //ver si el usuario esta registrado
        const {email} = input;
       const cliente = await Cliente.findOne({email});
       if(cliente){
        throw new error('Cliente ya registrado')
       }
       const nuevoCliente=  new Cliente(input);

        nuevoCliente.vendedor=ctx.usuario.id; 


       //guardar en DB
       try {

        const resultado = await nuevoCliente.save();
        return resultado
       } catch (error) {
           console.log(error)
       }
    },


    nuevoPedido:async(_,{input},ctx)=>{
      const {cliente} = input

      let clienteExiste = await Cliente.findById(cliente)
      if(!clienteExiste){
          throw new error('Este cliente no existe')
      }

      //verificar si el cliente es del vendedor (PENDIENTEs)
    },
    actualizarCliente:async(_,{id,input},ctx)=>{
        //verifica si el usuario esta registrado
     let cliente = await Cliente.findById(id)
     if(!cliente){
         throw new error('este Cliente no existe')
     }
     //se verifica que el vendedor de ese cliente sea el que lo edite
     if (cliente.vendedor.toString()  !== ctx.usuario.id){
        throw new error('No eres el vendedor de este cliente')
    }

    cliente= await Cliente.findOneAndUpdate({_id:id},input,{new:true});
    return cliente
    },
    eliminarClientes:async(_,{id},ctx   )=>{
    let cliente = await Cliente.findById(id)
    //verifica si el usuario esta registrado
     if(!cliente){
         throw new error('este Cliente no existe')
     }

     //se verifica que el vendedor de ese cliente sea el que lo edite
     if (cliente.vendedor.toString()  !== ctx.usuario.id){
        throw new error('No eres el vendedor de este cliente')
    }


    await Cliente.findOneAndDelete({_id:id})
    return "Cliente Eliminado correctamente"
    },
    nuevoPedido:async(_,{input},ctx)=>{
      const {cliente} = input;
      //verifico si existe 
      const ClienteExiste = await Cliente.findById(cliente)
      if(!ClienteExiste){
          throw new error('El usuario no existe')
      }

      if (ClienteExiste.vendedor.toString()  !== ctx.usuario.id){
        throw new error('No eres el vendedor de este cliente')
    }
    //identifico que producto de la DB es  
    for await(const articulo of input.pedido){
        const {id} = articulo;
  
        const productoEncontrado= await Producto.findById(id)

        if(articulo.cantidad > productoEncontrado.existencia){
          throw new Error('Tu pedido supera el stock que actualmente tenemos')
        }else{
            productoEncontrado.existencia = productoEncontrado.existencia - articulo.cantidad
           
           await  productoEncontrado.save()
        }
    }

    //lo guardo

    const nuevoPedido= new Pedido(input)

    nuevoPedido.vendedor= ctx.usuario.id


    const resultado = nuevoPedido.save()

    return resultado

    }

    



},
}


module.exports=resolvers;
