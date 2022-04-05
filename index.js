
import express from 'express';
import mongoose from 'mongoose';
import oldSchema from './model/products.js'
import oldUserSchema from './model/users.js'
import oldTransacSchema from './model/transaction.js'
import crypto from 'crypto';
const app = express();

const port = 3000;

app.use(express.json())


app.get('/', (req, res) => {
    res.send('I got all data')
})



// for password encryption
const getHashPassword = (Password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(Password).digest('base64')
    return hash;
}
// for generating UserToken
const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}
const authTokens = {};


//=================

app.post('/account', async (req, res) => {
    const { User_Name, Email, Password, confirmPassword } = req.body

    if (Password == confirmPassword) {
        const hashedPassword = getHashPassword(Password);
        const emailCheck = await oldUserSchema.findOne({ Email: req.body.Email })
         
        if (emailCheck) {
            return res.status(200).json({
                massage: "Email Already Exist",
                data: emailCheck.Email
            })
        } else {
            const createUser = await oldUserSchema.create({
                User_Name,
                Email,
                Password: hashedPassword
            })
            if (createUser) {
                return res.status(200).json({
                    status: true,
                    massage: 'Account created successful',
                    data: createUser
                })
            } else {
                return res.status(400).json({
                    status: false,
                    massage: 'Account creation failed',
                    data: createUser
                })
            }
        }
    } else {
        return res.status(400).json({
            massage: 'Password not match',
        })
    }
})

app.post('/signin', async (req, res) => {
    const { Email, Password } = req.body
    const hashedPassword = getHashPassword(Password);
    // const Elogin = await oldUserSchema.findOne({ Email: req.body.Email })
    const Plogin = await oldUserSchema.findOne({ Email: Email, Password: hashedPassword })

    if (Plogin) {
        const authToken = generateAuthToken();
        authTokens[authToken] = Plogin;
        res.cookie('AuthToken', authToken);
        console.log('AuthToken', authToken)
        return res.status(200).json({
            status: true,
            massage: 'Login Successfull',
            data: Plogin.Email, hashedPassword
        })

    } else {
        return res.status(400).json({
            status: false,
            massage: 'Incorrect password ',
            data: Plogin
        })

    }

})

 app.post('/transac', async (req, res) => {
   const product = req.body.Product_Name
   const type = req.body.Type
   const qty = req.body.Qty
   const price = req.body.Price
   const Total_Cost = qty * price
     const done = await oldSchema.findOne({ $and: [{ Product_Name: product }, { Type: type }] })
     const { Product_Name,Type,Qty,Price} = req.body
     if (done) {
         const q = done.Qty - qty
         const ProId = done.id
         console.log(ProId)
         const sales = await oldTransacSchema.create({
             Product_Name, Type, Qty, Price, Total_Cost   
         })
         
         if (sales) {
             const salesUpdate = await oldSchema.findByIdAndUpdate({_id: ProId },{$set:{Qty:q}
             })
            
            if (salesUpdate) {
                return res.status(200).json({
                status: true,
                massage: 'Transaction successful',
                data: salesUpdate
            })
            }
         } else {
             
            return res.status(400).json({
            status: false,
            massage: 'Transaction Failed',
            data: sales
        })
         }
         
     } else {
         return res.status(400).json({
             status: false,
             massage: 'Product not found',
             data: done
         })
     }
    
     }
    
)
app.post('/product', async (req, res) => {
    const { name, type, discription, condition, color, qty, price } = req.body
    
    const AddProduct = await oldSchema.create({
        name,
        type,
        discription,
        condition,
        color,
        qty,
        price
    })
    if (AddProduct) {
        return res.status(200).json({
            status: true,
            massage: "Product added successful",
            data: AddProduct
        })
    } else {
        return res.status(400).json({
            status: false,
            massage: "Failed to add product",
            data: AddProduct
        })
    }
})
app.get('/product', async (req, res) => {
    const loadProduct = await oldSchema.find({})
    if (loadProduct) {
        return res.status(200).json({
            status: true,
            massage: "Load successful",
            data: loadProduct
        })
    } else {
        return res.status(200).json({
            status: false,
            massage: "Faild to Load data",
            data: loadProduct
        })
    }
})
app.get('/product/:id', async (req, res) => {
   
    const loadProduct = await oldSchema.findById(req.params.id)
    if (loadProduct) {
        return res.status(200).json({
            status: true,
            massage: "Load successful",
            data: loadProduct
        })
    } else {
        return res.status(200).json({
            status: false,
            massage: "Faild to Load data",
            data: loadProduct
        })
    }
})

app.patch('/product/:id', async (req, res) => {
    const UpdateProduct = await oldSchema.findByIdAndUpdate(req.params.id, req.body)
    if (UpdateProduct) {
        return res.status(200).json({
            status: true,
            massage: 'Product update successful',
            data: UpdateProduct
        })
    } else {
        return res.status(400).json({
            status: true,
            massage: 'Product update failed',
            data: UpdateProduct
        })
    }
})
app.delete('/product/:id', async (req, res) => {
    const DeleteProduct = await oldSchema.findByIdAndDelete(req.params.id)
    if (DeleteProduct) {
        return res.status(200).json({
            status: true,
            massage: 'Product delete successful',
            data: DeleteProduct
        })
    } else {
        return res.status(400).json({
            status: true,
            massage: 'Product delete failed',
            data: DeleteProduct
        })

    }
})
app.post('/pro', async (req, res) => {
    const { MyId } = req.body.Email
    console.log(MyId)
    await oldUserSchema.deleteOne(MyId, function (err, done) {
        if (err) {
            return res.status(400).json({
                status: false,
                massage: 'User not exist',
                data: done
            })

        } else {
            return res.status(200).json({
                status: true,
                massage: 'delete done',
                data: done
            })
        }
    })    

    // const DeleteProduct = await oldUserSchema.findByIdAndDelete(MyId)
    // if (DeleteProduct) {
    //     return res.status(200).json({
    //         status: true,
    //         massage: 'User delete successful',
    //         data: DeleteProduct
    //     })
    // } else {
    //     return res.status(400).json({
    //         status: true,
    //         massage: 'Product delete failed',
    //         data: DeleteProduct
    //     })

    // }
})
mongoose.connect('mongodb://localhost/zetrove', {
}).then(() => {
    console.log('you are connect to database')
}).catch(() => {
    console.log('you are not connect to database')
})



app.listen(port, () => {
    console.log('App is listening to port' + port)
})