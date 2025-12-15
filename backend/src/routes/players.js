const express = require('express');
const router = express.Router();
const Player = require ('../models/player');

function validarPlayer(req, res, next) {
    const { _id, name, money, salary, rent, position, insurances, skip, turn } = req.body;
    if (!_id || typeof _id !== 'string') return res.status(400).json({ error: '_id requerido y debe ser string' });
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name requerido y debe ser string' });
    if (typeof money !== 'number') return res.status(400).json({ error: 'money requerido y debe ser número' });
    if (typeof salary !== 'number') return res.status(400).json({ error: 'salary requerido y debe ser número' });
    if (typeof rent !== 'number') return res.status(400).json({ error: 'rent requerido y debe ser número' });
    if (typeof position !== 'number') return res.status(400).json({ error: 'position requerido y debe ser número' });
    if (!Array.isArray(insurances)) return res.status(400).json({ error: 'insurances requerido y debe ser array' });
    if (typeof skip !== 'boolean') return res.status(400).json({ error: 'skip requerido y debe ser boolean' });
    if (typeof turn !== 'boolean') return res.status(400).json({ error: 'turn requerido y debe ser boolean' });
    next();
}

router.get('/', async (req, res)=>{
    try {
        const players = await Player.find();
        res.json(players);
    }catch (err){
        res.status(500).json({error: err.message})
    }
})

router.post('/', validarPlayer, async (req, res) => {
    console.log('POST /players recibida:', req.body);
    try {
        const newPlayer = new Player(req.body);
        const saved = await newPlayer.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', validarPlayer, async (req, res) => {
    console.log(`PUT /players/${req.params.id} recibida:`, req.body);
    try {
        const updated = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Player not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    console.log(`DELETE /players/${req.params.id} recibida`);
    try {
        const deleted = await Player.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Player not found' });
        res.json({ message: 'Player deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.patch('/:id', async (req, res) => {
  try {
    const playerId = req.params.id;
    const updates = req.body; 

    if (!playerId) {
      return res.status(400).json({ error: 'ID del jugador requerido' });
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      updates, 
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    console.log(`Jugador ${playerId} actualizado:`, updates);
    res.json(updatedPlayer);

  } catch (error) {
    console.error('Error actualizando jugador:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;