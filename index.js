const express = require('express');
const app= express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vfffbgl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
    //   await client.connect();

        //  DATABASE COLLECTIONS --------------->
        const userCollection = client.db('surveyDB').collection('users')

        // GET ALL USER DATA ---------->
        app.get("/users", async(req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        // Post user data ---------->
        app.post("/users", async(req, res) =>{
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({
                    message: "user already exist",
                    insertedId: null,
                });
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        // make admin ------------->
        app.patch("/users/admin/:id", async (req, res) => {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        role: "admin",
                    },
                };
                const result = await userCollection.updateOne(
                    filter,
                    updateDoc
                );
                res.send(result);
            }
        );

        // Make surveyor ------------- >
        app.patch("/users/surveyor/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: "surveyor",
                },
            };
            const result = await userCollection.updateOne(
                filter,
                updateDoc
            );
            res.send(result);
        }
    );




      // Send a ping to confirm a successful connection
    //   await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get("/", (req, res) =>{
    res.send("Server is running")
})

app.listen(port, () =>{
    console.log(`App is running on port ${port}`);
})