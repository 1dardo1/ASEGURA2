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
module.exports = router;