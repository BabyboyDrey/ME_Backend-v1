const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const Generalactivities = require('../../models/comp_1/generalActivities.js')

const router = require('express').Router()

// POST REQUEST

router.post(
  '/make-general-activities',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const query = `${items.jurisdiction}_tc`
      const general_activities = await Generalactivities.findOne({
        [`${query}.tc_name`]: items.tc_name
      })

      if (general_activities) {
        return res.status(403).json({
          Message: 'Data exists with inputed tc_name'
        })
      }

      const created_project = await Generalactivities.findOneAndUpdate(
        {},
        {
          $push: {
            [`${query}`]: items
          }
        },
        {
          upsert: true,
          new: true
        }
      )

      const created_data = created_project[query]
        .filter(e => e.tc_name === items.tc_name)
        .map(e => (e.toObject ? e.toObject() : e))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})

      res.status(200).json({
        success: true,
        created_data
      })
    } catch (err) {
      consol.error(err)
      res.status(500).json({
        Error: true,
        message: err
      })
    }
  })
)

// PUT REQUEST

router.put(
  '/update-general-activities',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const query = `${items.jurisdiction}_tc`

      const general_activities = await Generalactivities.findOne({
        [`${query}.tc_name`]: items.tc_name
      })

      if (!general_activities) {
        return res.status(404).json({
          Message: 'Data does not exists with inputted college name'
        })
      }

      const subDocIndex = general_activities[query].findIndex(
        e => e.tc_name === items.tc_name
      )

      if (subDocIndex === -1) {
        return res.status(404).json({
          Message: 'Sub-document not found'
        })
      }

      const subDoc = general_activities[query][subDocIndex]

      Object.keys(items).forEach(key => {
        if (key !== 'jurisdiction' && key !== 'tc_name') {
          subDoc[key] = items[key]
        }
      })

      general_activities.markModified(`${query}.${subDocIndex}`)

      await general_activities.save()

      res.status(200).json({
        success: true,
        result: subDoc
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        Err: true,
        message: err.message
      })
    }
  })
)

// GET REQUEST

router.get(
  '/get-general-activities',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Generalactivities.find({})

      if (!found_data || found_data.length === 0) {
        res.status(404).json({
          Error: true,
          message: 'No General Activity found'
        })
      }

      res.status(200).json({
        Success: true,
        found_data: {
          federal_tc: found_data[0].federal_tc,
          state_tc: found_data[0].state_tc
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)
module.exports = router
