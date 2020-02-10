import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import goldenGlobesData from './data/golden-globes.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/golden-globes"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Nominee = mongoose.model('Nominee', {
  nominee: String
})

const Nomination = mongoose.model('Nomination', {
  year_film: Number,
  year_award: Number,
  ceremony: Number,
  category: String,
  nominee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nominee'
  },
  film: String,
  win: Boolean
})

const distinct = (value, index, self) => {
  return self.indexOf(value) === index;
}

const nominees = goldenGlobesData.map(globe => globe.nominee).filter(distinct)

if (process.env.RESET_DATABASE) {
  console.log('Resetting database!')
  const seedDatabase = async () => {
    await Nominee.deleteMany()
    await Nomination.deleteMany()

    nominees.map(async nominee => {
      const newNominee = new Nominee({ nominee: nominee })
      await newNominee.save()

      goldenGlobesData.map(async nomination => {
        if (nominee === nomination.nominee)
          await new Nomination({
            year_film: nomination.year_film,
            year_award: nomination.year_award,
            ceremony: nomination.ceremony,
            category: nomination.category,
            nominee: newNominee,
            film: nomination.film,
            win: nomination.win
          }).save()
      })
    })
  }
  seedDatabase()
}

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable' })
  }
})

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Routes available:\nGET /nominees\nGET /nominees/{id}\nGET /nominees/{id}/nominations\nGET /nominations')
})

app.get('/nominees', async (req, res) => {
  const nominees = await Nominee.find()
  res.json(nominees)
})

app.get('/nominees/:id', async (req, res) => {
  const nominee = await Nominee.findById(req.params.id)
  if (nominee) {
    res.json(nominee)
  } else {
    res.status(404).json({ error: 'Nominee not found' })
  }

})

app.get('/nominees/:id/nominations', async (req, res) => {
  const nominee = await Nominee.findById(req.params.id)
  if (nominee) {
    const nominations = await Nomination.find({ nominee: mongoose.Types.ObjectId(nominee.id) })
    res.json(nominations)
  } else {
    res.status(404).json({ error: 'Nominee not found' })
  }
})

app.get('/nominations', async (req, res) => {
  const nominations = await Nomination.find().populate('nominee')
  res.json(nominations)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
