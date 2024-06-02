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
        const surveyCollection = client.db('surveyDB').collection('surveys')

        // GET ALL USER DATA ---------->
        app.get("/users", async(req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        // POST USER DATA ---------->
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

        // POST SURVEY ----------->
        app.post("/surveys", async(req, res) => {
            const survey = req.body
            const result = await surveyCollection.insertOne(survey)
            res.send(result)
        })

        // GET ALL SURVEY DATA --------->
        app.get("/surveys", async(req, res) =>{
            const result = await surveyCollection.find().toArray()
            res.send(result)
        })

        // GET SURVEYS BY ID ---------->
        app.get("/survey/:id", async(req, res) =>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await surveyCollection.findOne(query)
            res.send(result)
        })

        // GET SURVEYOR SURVEYS BY EMAIL ------------->
        app.get("/surveys/:email", async(req, res) =>{
            const email = req.params.email
            const query = {email : email}
            const result = await surveyCollection.find(query).toArray()
            res.send(result)
        })

        // UPDATE SURVEY ----------->
        app.patch("/survey/:id", async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    question: item.question,
                    category: item.category,
                    description: item.description,
                    deadline: item.deadline,
                },
            };
            const result = await surveyCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        // DELETE SURVEY ---------------------->
        app.delete("/survey/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await surveyCollection.deleteOne(query);
            res.send(result);
        });

        // GET ADMIN ----------->
        app.get("/users/admin/:email", async(req, res) =>{
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        // MAKE ADMIN ------------->
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

        // MAKE SURVEYOR ------------- >
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