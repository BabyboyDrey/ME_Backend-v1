const express = require('express')
const router = express.Router()
const CCS = require('../../models/comp_1/crossCuttingIssues')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')

// POST REQUESTS

const buildUpdateQuery = items => {
  const key = `${items.jurisdiction}_tc`
  const update = {
    $push: {}
  }
  update.$push[key] = items
  console.log('Update Query:', update)
  return update
}

router.post(
  '/make-cross-cutting-issues',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      console.log('Received Items:', items)

      const existing_ccs = await CCS.findOne({
        [`${items.jurisdiction}_tc.tc_name`]: items.tc_name
      })
      console.log('Existing CCS:', existing_ccs)

      if (existing_ccs) {
        return res.status(400).json('Tc data already exists')
      }

      const updateQuery = buildUpdateQuery(items)

      const new_ccs = await CCS.findOneAndUpdate({}, updateQuery, {
        new: true,
        upsert: true
      })

      console.log('New CCS:', new_ccs)

      res.status(200).json({
        success: true,
        new_ccs
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: err.message })
    }
  })
)

// GET REQUESTS

router.get(
  '/get-cross-cutting-issues',
  asyncErrCatcher(async (req, res) => {
    try {
      const ccs_data = await CCS.find({
        [`${req.query.jurisdiction}_tc`]: {
          $exists: true
        }
      })
      const data = ccs_data[0][`${req.query.jurisdiction}_tc`]

      res.status(200).json({ success: true, data })
    } catch (err) {
      res.status(500).json({ success: false, message: err })
    }
  })
)

router.get(
  '/get-specific-cross-cutting-issue/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const existing_ccs = await CCS.findOne({
        [`${req.query.jurisdiction}_tc._id`]: req.params.id
      })

      if (!existing_ccs) {
        return res.status(404).json('No cross cutting issue with sent Id')
      }

      const subDocs = existing_ccs[`${req.query.jurisdiction}_tc`]
      const subDoc = subDocs.find(p => {
        return p._id.toString() === req.params.id
      })

      res.status(200).json({ success: true, data: subDoc })
    } catch (err) {
      res.status(500).json({ success: false, message: err })
    }
  })
)

// PUT REQUESTS

router.put(
  '/update-specific-cross-cutting-issue/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const existing_ccs = await CCS.findOne({
        [`${req.query.jurisdiction}_tc._id`]: req.params.id
      })

      if (!existing_ccs) {
        return res.status(404).json('No cross cutting issue with sent Id')
      }

      const subDocs = existing_ccs[`${req.query.jurisdiction}_tc`]
      const subDoc = subDocs.find(p => {
        return p._id.toString() === req.params.id
      })

      for (const key in items) {
        if (key in subDoc) {
          for (const subKey in items[key]) {
            if (subKey in subDoc[key]) {
              subDoc[key][subKey] = items[key][subKey]
            } else {
              subDoc[key][subKey] = items[key][subKey]
            }
          }
        }
      }

      await existing_ccs.save()

      res.status(200).json({ success: true, subDoc })
    } catch (err) {
      res.status(500).json({ success: false, message: err })
    }
  })
)

module.exports = router
