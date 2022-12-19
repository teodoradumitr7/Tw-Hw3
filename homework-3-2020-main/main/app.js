const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()
// TODO
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

app.post('/food-items', async (req, res) => {
    try{
        if (req.body.name == null && req.body.category == null && req.body.calories == null) {
            let eroare = new Error();
            eroare.message = "body is missing";
            throw eroare;
        }
        else {
            if (req.body.name == null || req.body.category == null || req.body.calories == null) {
                let eroare = new Error();
                eroare.message = "malformed request";
                throw eroare;
            }
            else {
                if (req.body.calories < 0) {
                    let eroare = new Error();
                    eroare.message = "calories should be a positive number";
                    throw eroare;
                }
                else {
                    if (req.body.category =="MEAT" || req.body.category == "DAIRY" || req.body.category == "VEGETABLE") {
                        FoodItem.create({
                            name: req.body.name,
                            category: req.body.category,
                            calories: req.body.calories
                        }).then((result) =>  res.status(201).json({ "message": "created" }))
                    }
                    else {

                        let eroare = new Error();
                        eroare.message = "not a valid category";
                        throw eroare;
                        
                    }

                }
            }
        }
    }
    catch (err) {
        // TODO
        if (err.message === "body is missing")
            res.status(400).json({ "message": "body is missing" })

        if (err.message === "malformed request")
            res.status(400).json({ "message": "malformed request" })

        if (err.message === "calories should be a positive number")
            res.status(400).json({ "message": "calories should be a positive number" })

        if (err.message ===  "not a valid category")
            res.status(400).json({"message": "not a valid category"})
    }}
        )

module.exports = app