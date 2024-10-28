const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error } = require("console");

app.use(express.json());
app.use(cors());

//Database conexion con mongodb
mongoose.connect("mongodb://TiendaCasco:admin123@ac-wtlhlzm-shard-00-00.ycjv0fm.mongodb.net:27017,ac-wtlhlzm-shard-00-01.ycjv0fm.mongodb.net:27017,ac-wtlhlzm-shard-00-02.ycjv0fm.mongodb.net:27017/Tienda-casco?ssl=true&replicaSet=atlas-8vqwgd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0");

//Api Creacion
app.get("/", (req, res) => {
    res.send("Express App is running")
})

// image almecenamiento engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})
//creando un punto final de carga para imágenes
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

//esquema para crear productos
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

// creando API para agregar productos
app.post('/addproduct', async(req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id +1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("saved")
    res.json({
        success: true,
        name: req.body.name,
    })
})

// creando API para eliminar productos
app.post('/removeproduct', async(req, res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("remove");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// creando API para obtener todos los productos
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All products Fetched");
    res.send(products);
})

// Modelo de usuario de esquema
const User = mongoose.model('User', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

// Creando un punto final para registrar al usuario
app.post('/signup', async(req, res) => {
    let check = await User.findOne({email: req.body.email});
    if(check){
        return res.status(400).json({success: false, errors: "Existing user found with same email address"});
    }
    let cart = {};
    for (let i = 0; i < 300; i++){
        cart[i] = 0;
    }
    const user = new User({
        name: req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData: cart,
    })
    await user.save();
    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_tienda');
    res.json({success: true, token})
})

// Creación de un punto final para el inicio de sesión del usuario
app.post('/login', async (req, res) => {
    let user = await User.findOne({email:req.body.email});
    if(user) {
        const passMatch = req.body.password === user.password;
        if(passMatch){
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_tienda');
            res.json({success:true, token});
        } else {
            res.json({success:false, errors:"Wrong password"});
        } 
    } else {
        res.json({success:false, errors:"Wrong Email address"})
    }
})

// Creando un punto final para los últimos productos
app.get('/newcollections', async(req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("Newcollection Fetched")
    res.send(newcollection);
})

// Creación de puntos finales para productos populares
app.get('/popularproducts', async (req, res) => {
    let products = await Product.find({category: "men"});
    let popularproducts = products.slice(0,4);
    console.log("popular products Fetched");
    res.send(popularproducts);
})


//creando middleware para buscar usuarios
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "please authenticate using valid login"})
    } else {
        try{
            const data = jwt.verify(token, 'secret_tienda');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send({errors: "please authenticate using valid token"});
        }
    }
}

//creando un punto final para agregar productos en cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId)
    let userData = await User.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await User.findOneAndUpdate({_id:req.user.id}, {cartData: userData.cartData});
    res.send("Added");
})

// creando un punto final para eliminar cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId)
    let userData = await User.findOne({_id: req.user.id});
    if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -=1;
    await User.findOneAndUpdate({_id:req.user.id}, {cartData: userData.cartData});
    res.send("Removed");
})

// creando un punto final para obtener datos del carrito
app.post('/getcart', fetchUser, async(req, res) => {
    console.log('Get cart');
    let userData = await User.findOne({_id: req.user.id});
    res.json(userData.cartData);
})

app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on port " + port);
    } else {
        console.log("Error: " + error);
    }
}) 