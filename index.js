const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv")
dotenv.config();
const cors = require('cors')
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
const uri = process.env.DB_URI;
  
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("pet-home");
    const petCollection = db.collection("pet")
    app.get("/pet", async(req,res)=>{
      const cursor = petCollection.find();
      const result = await cursor.toArray();
      
      res.send(result)
      console.log(result)
    })
    app.get("/pet/:petId", async(req,res)=>{
     const {petId} = req.params;
     const query = {_id: new ObjectId(petId)};
     const result = await petCollection.findOne(query);
     res.send(result)
    })
    app.post("/pet", async (req, res) => {
      try {
        const petData = req.body;

        const result = await petCollection.insertOne(petData);

        res.status(201).send({
          success: true,
          insertedId: result.insertedId,
          message: "Pet added successfully",
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to add pet",
        });
      }
    });
    app.get("/my-pets/:email", async (req, res) => {
      const email = req.params.email;

      const pets = await petCollection.find({ ownerEmail: email }).toArray();

      res.send(pets);
    });
    const count = await petCollection.countDocuments();

    console.log(count);

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

