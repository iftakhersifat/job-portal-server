const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mojyanw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    await client.connect();

    // Get the database and collection on which to run the operation
    const jobsCollection =client.db('job-portal').collection('jobs')
    // HotJob.jsx
    // get all jobs api
    app.get('/jobs', async(req, res)=>{
      // for job add find by email
      const email = req.query.email;
      let query={}
      if(email){
        query = {hr_email : email}
      }
        const cursor = jobsCollection.find(query);
        const result =await cursor.toArray();
        res.send(result);
    })

    // JobDetails.jsx
    // get single jobs 
    app.get('/jobs/:id', async(req, res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)};
        const result = await jobsCollection.findOne(query);
        res.send(result);
    })

    // AddJob.jsx
    // send job data from frontend 
    app.post('/jobs', async(req,res)=>{
      const addJobs= req.body;
      const result= await jobsCollection.insertOne(addJobs)
      res.send(result)
    })

    // get jobs which post from frontend
    // app.get('/jobsByEmail', async(req, res)=>{
    //   const email = req.query.email;
    //   const query = { hr_email: email }; 
    //   const result = await jobsCollection.findOne(query).toArray();
    //   res.send(result);
    // })





    // job application collection
    const applicationsCollection = client.db('job-portal').collection('applications')

    // JobApply.jsx
    // application send data in server (create)
    app.post('/applications', async(req, res)=>{
      const application = req.body;
      const result = await applicationsCollection.insertOne(application);
      res.send(result)
    })

    // ApplicationList.jsx
   // get application from one email
  app.get('/applications', async (req, res) => {
  const email = req.query.email;
  const query = { applicant: email }; 
  const result = await applicationsCollection.find(query).toArray(); 

  // add data from application collection
  for (const application of result) {
    const jobId = application.id; 
    const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });
    
    if (job) {
      application.company = job.company;
      application.title = job.title;
      application.company_logo = job.company_logo;
      application.location = job.location;
      application.jobType = job.jobType;
      application.category = job.category;
    }
  }

  res.send(result);
});

  //  view applications
  app.get("/applications/job/:id", async(req,res)=>{
    const id = req.params.id;
    const query= {id: id};
    const result=await applicationsCollection.find(query).toArray();
    res.send(result)
  })

  // status update
  app.patch("/applications/:id", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { status: status }
  };
  const result = await applicationsCollection.updateOne(filter, updateDoc);
  res.send(result);
});








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Job Portal Server Cooking')
})

app.listen(port, () => {
  console.log(`Job Portal Server is running on port ${port}`)
})