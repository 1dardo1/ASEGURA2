const express = require('express');
const router = express.Router();
const Event = require ('../models/event');

router.get('/', async (req, res)=>{
    try {
        const events = await Event.find();
        res.json(events);
    }catch (err){
        res.status(500).json({error: err.message})
    }
})

router.get('/random', async (req, res) => {
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: 'No hay eventos disponibles' });
    }
    const random = Math.floor(Math.random() * count);
    const event = await Event.findOne().skip(random);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;