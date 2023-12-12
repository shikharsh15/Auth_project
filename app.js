//jshint esversion:6
import 'dotenv/config';
import express from 'express';
// import ejs, { render } from 'ejs';
import bcrypt from 'bcrypt';
import pg from 'pg';

const app = express();
const port = 3000;
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
console.log(process.env.DB_PASS);

const db = new pg.Client({
    user : 'postgres',
    password : process.env.DB_PASS,
    port : 5432,
    host : 'localhost',
    database : 'permalist'
});
db.connect();

app.get("/",async (req,res)=>{
    res.render("home.ejs");
});
app.get("/login",async (req,res)=>{
    res.render("login.ejs");
});
app.get("/register",async (req,res)=>{
    res.render("register.ejs");
});
app.post("/register",async (req,res)=>{
    let username = req.body["username"];
    let password  = req.body["password"];
    bcrypt.hash(password, 10,async function (err, hash) {
        try{
            console
            await db.query("INSERT INTO userdb(username,password) VALUES ($1,$2);",[username,hash]);
            res.render("secrets.ejs");
        }
        catch(err){
            console.log(err);
        }
    });
}
);
app.post("/login",async (req,res)=>{
    try{
        let username = req.body["username"];
        let password  = req.body["password"];
        let response = await db.query("SELECT password FROM userdb WHERE username = $1",[username]);
        bcrypt.compare(password, response.rows[0].password, async function(err, result) {
            if(err){
                console.log(err);
                res.redirect("/");
            }
            else{
                if(result){
                    res.render("secrets.ejs");
                }
                else{
                    res.redirect("/");
                }
            }
        });
        
    }
    catch(error){
        console.log(error);
        res.redirect("/");
    }
});



app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});