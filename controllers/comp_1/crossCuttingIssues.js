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
      const result = {
        data: {
          gender_based_violence: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          grievance_redress_mechanisms: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          fraud_corruption: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          social_safeguard_issues: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          environmental_safeguard_issues: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          }
        }
      }
      filteredData.forEach(obj => {
        if (obj.gender_based_violence) {
          result.data.gender_based_violence.reported +=
            obj.gender_based_violence.reported
          result.data.gender_based_violence.investigated +=
            obj.gender_based_violence.investigated
          result.data.gender_based_violence.uninvestigated +=
            obj.gender_based_violence.uninvestigated
          result.data.gender_based_violence.resolved +=
            obj.gender_based_violence.resolved
          result.data.gender_based_violence.unresolved +=
            obj.gender_based_violence.unresolved
        }
        if (obj.grievance_redress_mechanisms) {
          result.data.grievance_redress_mechanisms.reported +=
            obj.grievance_redress_mechanisms.reported
          result.data.grievance_redress_mechanisms.investigated +=
            obj.grievance_redress_mechanisms.investigated
          result.data.grievance_redress_mechanisms.uninvestigated +=
            obj.grievance_redress_mechanisms.uninvestigated
          result.data.grievance_redress_mechanisms.resolved +=
            obj.grievance_redress_mechanisms.resolved
          result.data.grievance_redress_mechanisms.unresolved +=
            obj.grievance_redress_mechanisms.unresolved
        }
        if (obj.fraud_corruption) {
          result.data.fraud_corruption.reported += obj.fraud_corruption.reported
          result.data.fraud_corruption.investigated +=
            obj.fraud_corruption.investigated
          result.data.fraud_corruption.uninvestigated +=
            obj.fraud_corruption.uninvestigated
          result.data.fraud_corruption.resolved += obj.fraud_corruption.resolved
          result.data.fraud_corruption.unresolved +=
            obj.fraud_corruption.unresolved
        }
        if (obj.social_safeguard_issues) {
          result.data.social_safeguard_issues.reported +=
            obj.social_safeguard_issues.reported
          result.data.social_safeguard_issues.investigated +=
            obj.social_safeguard_issues.investigated
          result.data.social_safeguard_issues.uninvestigated +=
            obj.social_safeguard_issues.uninvestigated
          result.data.social_safeguard_issues.resolved +=
            obj.social_safeguard_issues.resolved
          result.data.social_safeguard_issues.unresolved +=
            obj.social_safeguard_issues.unresolved
        }
        if (obj.environmental_safeguard_issues) {
          result.data.environmental_safeguard_issues.reported +=
            obj.environmental_safeguard_issues.reported
          result.data.environmental_safeguard_issues.investigated +=
            obj.environmental_safeguard_issues.investigated
          result.data.environmental_safeguard_issues.uninvestigated +=
            obj.environmental_safeguard_issues.uninvestigated
          result.data.environmental_safeguard_issues.resolved +=
            obj.environmental_safeguard_issues.resolved
          result.data.environmental_safeguard_issues.unresolved +=
            obj.environmental_safeguard_issues.unresolved
        }
      })

      await found_data.save()
      res.status(200).json({
        Jurisdiction_result: filteredData,
        Aggregated_data: result
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
  '/get-national_admin-subdocs',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await CCS.findOne({}).maxTimeMS(50000)
      if (!found_data) return res.status(404).json('No teachers found')

      const federal_ccs = found_data.federal_tc.map(item => item.toObject())
      const state_ccs = found_data.state_tc.map(item => item.toObject())
      const result = {
        data_federal: {
          gender_based_violence: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          grievance_redress_mechanisms: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          fraud_corruption: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          social_safeguard_issues: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          environmental_safeguard_issues: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          }
        },
        data_state: {
          gender_based_violence: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          grievance_redress_mechanisms: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          fraud_corruption: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          social_safeguard_issues: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          },
          environmental_safeguard_issues: {
            reported: 0,
            investigated: 0,
            uninvestigated: 0,
            resolved: 0,
            unresolved: 0
          }
        }
      }
      federal_ccs.forEach(obj => {
        if (obj.gender_based_violence) {
          result.data_federal.gender_based_violence.reported +=
            obj.gender_based_violence.reported
          result.data_federal.gender_based_violence.investigated +=
            obj.gender_based_violence.investigated
          result.data_federal.gender_based_violence.uninvestigated +=
            obj.gender_based_violence.uninvestigated
          result.data_federal.gender_based_violence.resolved +=
            obj.gender_based_violence.resolved
          result.data_federal.gender_based_violence.unresolved +=
            obj.gender_based_violence.unresolved
        }
        if (obj.grievance_redress_mechanisms) {
          result.data_federal.grievance_redress_mechanisms.reported +=
            obj.grievance_redress_mechanisms.reported
          result.data_federal.grievance_redress_mechanisms.investigated +=
            obj.grievance_redress_mechanisms.investigated
          result.data_federal.grievance_redress_mechanisms.uninvestigated +=
            obj.grievance_redress_mechanisms.uninvestigated
          result.data_federal.grievance_redress_mechanisms.resolved +=
            obj.grievance_redress_mechanisms.resolved
          result.data_federal.grievance_redress_mechanisms.unresolved +=
            obj.grievance_redress_mechanisms.unresolved
        }
        if (obj.fraud_corruption) {
          result.data_federal.fraud_corruption.reported +=
            obj.fraud_corruption.reported
          result.data_federal.fraud_corruption.investigated +=
            obj.fraud_corruption.investigated
          result.data_federal.fraud_corruption.uninvestigated +=
            obj.fraud_corruption.uninvestigated
          result.data_federal.fraud_corruption.resolved +=
            obj.fraud_corruption.resolved
          result.data_federal.fraud_corruption.unresolved +=
            obj.fraud_corruption.unresolved
        }
        if (obj.social_safeguard_issues) {
          result.data_federal.social_safeguard_issues.reported +=
            obj.social_safeguard_issues.reported
          result.data_federal.social_safeguard_issues.investigated +=
            obj.social_safeguard_issues.investigated
          result.data_federal.social_safeguard_issues.uninvestigated +=
            obj.social_safeguard_issues.uninvestigated
          result.data_federal.social_safeguard_issues.resolved +=
            obj.social_safeguard_issues.resolved
          result.data_federal.social_safeguard_issues.unresolved +=
            obj.social_safeguard_issues.unresolved
        }
        if (obj.environmental_safeguard_issues) {
          result.data_federal.environmental_safeguard_issues.reported +=
            obj.environmental_safeguard_issues.reported
          result.data_federal.environmental_safeguard_issues.investigated +=
            obj.environmental_safeguard_issues.investigated
          result.data_federal.environmental_safeguard_issues.uninvestigated +=
            obj.environmental_safeguard_issues.uninvestigated
          result.data_federal.environmental_safeguard_issues.resolved +=
            obj.environmental_safeguard_issues.resolved
          result.data_federal.environmental_safeguard_issues.unresolved +=
            obj.environmental_safeguard_issues.unresolved
        }
      })
      state_ccs.forEach(obj => {
        if (obj.gender_based_violence) {
          result.data_state.gender_based_violence.reported +=
            obj.gender_based_violence.reported
          result.data_state.gender_based_violence.investigated +=
            obj.gender_based_violence.investigated
          result.data_state.gender_based_violence.uninvestigated +=
            obj.gender_based_violence.uninvestigated
          result.data_state.gender_based_violence.resolved +=
            obj.gender_based_violence.resolved
          result.data_state.gender_based_violence.unresolved +=
            obj.gender_based_violence.unresolved
        }
        if (obj.grievance_redress_mechanisms) {
          result.data_state.grievance_redress_mechanisms.reported +=
            obj.grievance_redress_mechanisms.reported
          result.data_state.grievance_redress_mechanisms.investigated +=
            obj.grievance_redress_mechanisms.investigated
          result.data_state.grievance_redress_mechanisms.uninvestigated +=
            obj.grievance_redress_mechanisms.uninvestigated
          result.data_state.grievance_redress_mechanisms.resolved +=
            obj.grievance_redress_mechanisms.resolved
          result.data_state.grievance_redress_mechanisms.unresolved +=
            obj.grievance_redress_mechanisms.unresolved
        }
        if (obj.fraud_corruption) {
          result.data_state.fraud_corruption.reported +=
            obj.fraud_corruption.reported
          result.data_state.fraud_corruption.investigated +=
            obj.fraud_corruption.investigated
          result.data_state.fraud_corruption.uninvestigated +=
            obj.fraud_corruption.uninvestigated
          result.data_state.fraud_corruption.resolved +=
            obj.fraud_corruption.resolved
          result.data_state.fraud_corruption.unresolved +=
            obj.fraud_corruption.unresolved
        }
        if (obj.social_safeguard_issues) {
          result.data_state.social_safeguard_issues.reported +=
            obj.social_safeguard_issues.reported
          result.data_state.social_safeguard_issues.investigated +=
            obj.social_safeguard_issues.investigated
          result.data_state.social_safeguard_issues.uninvestigated +=
            obj.social_safeguard_issues.uninvestigated
          result.data_state.social_safeguard_issues.resolved +=
            obj.social_safeguard_issues.resolved
          result.data_state.social_safeguard_issues.unresolved +=
            obj.social_safeguard_issues.unresolved
        }
        if (obj.environmental_safeguard_issues) {
          result.data_state.environmental_safeguard_issues.reported +=
            obj.environmental_safeguard_issues.reported
          result.data_state.environmental_safeguard_issues.investigated +=
            obj.environmental_safeguard_issues.investigated
          result.data_state.environmental_safeguard_issues.uninvestigated +=
            obj.environmental_safeguard_issues.uninvestigated
          result.data_state.environmental_safeguard_issues.resolved +=
            obj.environmental_safeguard_issues.resolved
          result.data_state.environmental_safeguard_issues.unresolved +=
            obj.environmental_safeguard_issues.unresolved
        }
      })
      const total_aggregated_results = {
        gender_based_violence: {
          reported:
            result.data_federal.gender_based_violence.reported +
            result.data_state.gender_based_violence.reported,
          investigated:
            result.data_federal.gender_based_violence.investigated +
            result.data_state.gender_based_violence.investigated,
          uninvestigated:
            result.data_federal.gender_based_violence.uninvestigated +
            result.data_state.gender_based_violence.uninvestigated,
          resolved:
            result.data_federal.gender_based_violence.resolved +
            result.data_state.gender_based_violence.resolved,
          unresolved:
            result.data_federal.gender_based_violence.unresolved +
            result.data_state.gender_based_violence.unresolved
        },
        grievance_redress_mechanisms: {
          reported:
            result.data_federal.grievance_redress_mechanisms.reported +
            result.data_state.grievance_redress_mechanisms.reported,
          investigated:
            result.data_federal.grievance_redress_mechanisms.investigated +
            result.data_state.grievance_redress_mechanisms.investigated,
          uninvestigated:
            result.data_federal.grievance_redress_mechanisms.uninvestigated +
            result.data_state.grievance_redress_mechanisms.uninvestigated,
          resolved:
            result.data_federal.grievance_redress_mechanisms.resolved +
            result.data_state.grievance_redress_mechanisms.resolved,
          unresolved:
            result.data_federal.grievance_redress_mechanisms.unresolved +
            result.data_state.grievance_redress_mechanisms.unresolved
        },
        fraud_corruption: {
          reported:
            result.data_federal.fraud_corruption.reported +
            result.data_state.fraud_corruption.reported,
          investigated:
            result.data_federal.fraud_corruption.investigated +
            result.data_state.fraud_corruption.investigated,
          uninvestigated:
            result.data_federal.fraud_corruption.uninvestigated +
            result.data_state.fraud_corruption.uninvestigated,
          resolved:
            result.data_federal.fraud_corruption.resolved +
            result.data_state.fraud_corruption.resolved,
          unresolved:
            result.data_federal.fraud_corruption.unresolved +
            result.data_state.fraud_corruption.unresolved
        },
        social_safeguard_issues: {
          reported:
            result.data_federal.social_safeguard_issues.reported +
            result.data_state.social_safeguard_issues.reported,
          investigated:
            result.data_federal.social_safeguard_issues.investigated +
            result.data_state.social_safeguard_issues.investigated,
          uninvestigated:
            result.data_federal.social_safeguard_issues.uninvestigated +
            result.data_state.social_safeguard_issues.uninvestigated,
          resolved:
            result.data_federal.social_safeguard_issues.resolved +
            result.data_state.social_safeguard_issues.resolved,
          unresolved:
            result.data_federal.social_safeguard_issues.unresolved +
            result.data_state.social_safeguard_issues.unresolved
        },
        environmental_safeguard_issues: {
          reported:
            result.data_federal.environmental_safeguard_issues.reported +
            result.data_state.environmental_safeguard_issues.reported,
          investigated:
            result.data_federal.environmental_safeguard_issues.investigated +
            result.data_state.environmental_safeguard_issues.investigated,
          uninvestigated:
            result.data_federal.environmental_safeguard_issues.uninvestigated +
            result.data_state.environmental_safeguard_issues.uninvestigated,
          resolved:
            result.data_federal.environmental_safeguard_issues.resolved +
            result.data_state.environmental_safeguard_issues.resolved,
          unresolved:
            result.data_federal.environmental_safeguard_issues.unresolved +
            result.data_state.environmental_safeguard_issues.unresolved
        }
      }

      found_data.total_aggregated_results = total_aggregated_results
      found_data.total_disaggregated_results = result
      await found_data.save()

      res.status(200).json({
        success: true,
        result,
        total_aggregated_results
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
