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
        obtenerUsuario: async(_,{},ctx)=>{
            return ctx.usuario
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
            console.log(cliente)

            if(!cliente){
                throw new error('Cliente no encontrado')
            }
            if (cliente.vendedor.toString()  !== ctx.usuario.id){
                throw new error('No eres el vendedor de este cliente')
            }

            return cliente;

        },
        obtenerPedidos:async()=>{
          try {
            const pedidos = await Pedido.find({})
            return pedidos
          } catch (error) {
              console.log(error)
          }
        },
        obtenerPedidosVendedor:async(_,{},ctx)=>{
            try {
                 const pedidos= await Pedido.find({vendedor:ctx.usuario.id}).populate('cliente')
                 return pedidos
            } catch (error) {
                 console.log(error)
            }
        },
        obtenerPedido:async (_,{id},ctx)=>{
         const pedido = await Pedido.findById(id);
         console.log(pedido)

         if(!pedido){
             throw new Error('El pedido no existe');//PENDIENTE
         }

          if(pedido.vendedor.toString() !== ctx.usuario.id){
             throw new Error('No eres el responsable de este pedido.');
          }

         return pedido
        },
        obtenerPedidoEstado:async(_,{estado},ctx)=>{
             const pedido = await Pedido.find({vendedor : ctx.usuario.id, estado:estado})
             return pedido
        },
        obteniendoMejoresClientes:async()=>{
            const clientes = await Pedido.aggregate([
                {$match:{estado:'Completado'}},
                {$group:{
                    _id:"$cliente",
                    total:{$sum:'$total'}
                }},
                {
                    $lookup:{
                        from:'clientes',
                        localField:'_id',
                        foreignField:'_id',
                        as:'cliente'
                    }
                }
            ])
            return clientes
        },
        obteniendoMejoresVendedor:async()=>{
            const vendedores= await Pedido.aggregate([
                {$match:{estado:'Completado'}},
                {$group:{
                    _id:"vendedor",
                    total:{$sum:'total'}
                }},
                {$lookup:{
                   from:'usuarios',
                   localField:'_id',
                   foreignField:'_id',
                   as:'vendedor'
                }},
                {$limit:2},
                 {$sort:{total:-1}}
            ])
        },
        buscarProducto:async(_,{texto})=>{
        const producto = await Producto.find({$text:{$search:texto}}).limit(10)

        return producto;
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
        throw new Error('El usuario no esta registrado')
    }
    
    const passwordCorrecto = await bcryptjs.compare(password,existeUsuario.password);
    if (!passwordCorrecto){
        throw new Error('La contraseña es incorrecta')
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
            throw new Error("no se encontro el producto")
        }

        existeProducto = await Producto.findOneAndUpdate({_id:id},input,{new:true});

            return existeProducto
    },
    eliminarProducto:async(_,{id})=>{
        let existeProducto = await Producto.findById(id)
        if(!existeProducto){
            throw new Error("no se encontro el producto")
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
        throw new Error('Cliente ya registrado')
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
          throw new Error('Este cliente no existe')
      }

      //verificar si el cliente es del vendedor (PENDIENTEs)
    },
    actualizarCliente:async(_,{id,input},ctx)=>{
        //verifica si el usuario esta registrado
     let cliente = await Cliente.findById(id)
     if(!cliente){
         throw new Error('este Cliente no existe')
     }
     //se verifica que el vendedor de ese cliente sea el que lo edite
     if (cliente.vendedor.toString()  !== ctx.usuario.id){
        throw new Error('No eres el vendedor de este cliente')
    }

    cliente= await Cliente.findOneAndUpdate({_id:id},input,{new:true});
    return cliente
    },
    eliminarClientes:async(_,{id},ctx)=>{
    let cliente = await Cliente.findById(id)
    //verifica si el usuario esta registrado
     if(!cliente){
         throw new Error('este Cliente no existe')
     }

     //se verifica que el vendedor de ese cliente sea el que lo edite
     if (cliente.vendedor.toString()  !== ctx.usuario.id){
        throw new Error('No eres el vendedor de este cliente')
    }


    await Cliente.findOneAndDelete({_id:id})
    return "Cliente Eliminado correctamente"
    },
    nuevoPedido:async(_,{input},ctx)=>{
      const {cliente} = input;
      //verifico si existe 
      const ClienteExiste = await Cliente.findById(cliente)
      if(!ClienteExiste){
          throw new Error('El usuario no existe')
      }

      if (ClienteExiste.vendedor.toString()  !== ctx.usuario.id){
        throw new Error('No eres el vendedor de este cliente')
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
},
 actualizarPedido:async(_,{id,input},ctx)=>{
    const {cliente} = input;
    const pedido = await Pedido.findById(id);
    if(!pedido){
        throw new Error('El pedido no existe');//PENDIENTE
    }
    const clienteExiste = await Cliente.findById(cliente)
    if(!clienteExiste){
        throw new Error('El cliente no existe');//PENDIENTE
    }
    if (clienteExiste.vendedor.toString()  !== ctx.usuario.id){
        throw new Error('No eres el vendedor de este cliente')
    }
    if (input.pedido){
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
    }
   
    const resultado = await Pedido.findByIdAndUpdate({_id:id},input,{new:true})
    return resultado    

 },
 eliminarPedido:async(_,{id},ctx)=>{
      const pedidoExiste= await Pedido.findById(id)
      console.log(id)
      if(!pedidoExiste){
          throw new Error('El pedido no existe')
      }
      if(pedidoExiste.vendedor.toString() !== ctx.usuario.id){
          throw new Error('No tienes los permisos debido a que no eres el vendedor de este cliente.')
      }

      await Pedido.findOneAndDelete({_id:id})
      return 'Su pedido ha sido borrada correctamente'
 }
},

}


module.exports=resolvers;
