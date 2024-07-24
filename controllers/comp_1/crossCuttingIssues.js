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

// USER 2/VALIDATOR GETTING ALL CCS IN HIS STATE

router.get(
  '/get-validator-ccs',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`
      const found_data = await CCS.findOne({
        [`${query}.state`]: req.query.state
      })
      if (!found_data) return res.status(404).json('No data with inputed state')

      const filteredData = found_data[query].filter(
        e => e.state === req.query.state
      )

      res.status(200).json({
        result: filteredData
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

// USER 3|NATIONAL ADMIN GET COUNT NUMBER OF ALL SUBFIELDS AND SUBDOCUMENTS AND DOCUMENT.

router.get(
  '/get-national-admin-all-count',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await CCS.findOne({}).maxTimeMS(50000)
      if (!found_data) return res.status(404).json('No teachers found')

      const federal_ccs = found_data.federal_tc.map(item => item.toObject())
      const state_ccs = found_data.state_tc.map(item => item.toObject())
      const result = {
        data_federal: {
          reported: 0,
          investigated: 0,
          uninvestigated: 0,
          resolved: 0,
          unresolved: 0
        },
        data_state: {
          reported: 0,
          investigated: 0,
          uninvestigated: 0,
          resolved: 0,
          unresolved: 0
        }
      }
      federal_ccs.map(obj => {
        Object.keys(obj).forEach(key => {
          if (
            key !== '_id' &&
            typeof obj[key] === 'object' &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            result.data_federal.reported += obj[key].reported
            result.data_federal.investigated += obj[key].investigated
            result.data_federal.uninvestigated += obj[key].uninvestigated
            result.data_federal.resolved += obj[key].resolved
            result.data_federal.unresolved += obj[key].unresolved
          }
        })
      })
      state_ccs.map(obj => {
        Object.keys(obj).forEach(key => {
          if (
            key !== '_id' &&
            typeof obj[key] === 'object' &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            result.data_state.reported += obj[key].reported
            result.data_state.investigated += obj[key].investigated
            result.data_state.uninvestigated += obj[key].uninvestigated
            result.data_state.resolved += obj[key].resolved
            result.data_state.unresolved += obj[key].unresolved
          }
        })
      })

      found_data.total_aggregated_results = result

      await found_data.save()

      res.status(200).json({
        success: true,

        result
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
