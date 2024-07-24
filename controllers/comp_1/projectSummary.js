const router = require('express').Router()
const Projectsummary = require('../../models/comp_1/projectSummary')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')

// POST REQUEST

router.post(
  '/make-project-summary',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const query = `${items.jurisdiction}_tc`
      const found_project_summary = await Projectsummary.findOne({
        [`${query}.name_of_college`]: items.name_of_college
      })

      if (found_project_summary) {
        return res.status(403).json({
          Message: 'Data exists with inputed college name'
        })
      }

      const created_project = await Projectsummary.findOneAndUpdate(
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
        .filter(e => e.name_of_college === items.name_of_college)
        .map(e => (e.toObject ? e.toObject() : e))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})

      res.status(200).json({
        success: true,
        created_data
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        Err: true,
        message: err
      })
    }
  })
)

// UPDATE REQUEST

router.put(
  '/update-project-summary',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const query = `${items.jurisdiction}_tc`

      const found_project_summary = await Projectsummary.findOne({
        [`${query}.name_of_college`]: items.name_of_college
      })

      if (!found_project_summary) {
        return res.status(404).json({
          Message: 'Data does not exists with inputed college name'
        })
      }

      const subDocIndex = found_project_summary[query].findIndex(
        e => e.name_of_college === items.name_of_college
      )
      if (subDocIndex === -1) {
        return res.status(404).json({
          Message: 'Sub-document not found'
        })
      }

      const subDoc = found_project_summary[query][subDocIndex]

      if (items.industry_partners) {
        let new_items = items.industry_partners

        if (!Array.isArray(subDoc.industry_partners)) {
          subDoc.industry_partners = []
        }

        for (let i = 0; i < new_items.length; i++) {
          if (i < subDoc.industry_partners.length) {
            if (subDoc.industry_partners[i] === new_items[i]) {
              continue
            }
            if (subDoc.industry_partners[i] !== new_items[i]) {
              subDoc.industry_partners[i] = new_items[i]
            }
          } else {
            subDoc.industry_partners.push(new_items[i])
          }
        }
      }
      if (items.priority_trades) {
        let new_items = items.priority_trades

        if (!Array.isArray(subDoc.priority_trades)) {
          subDoc.priority_trades = []
        }

        for (let i = 0; i < new_items.length; i++) {
          if (i < subDoc.priority_trades.length) {
            if (subDoc.priority_trades[i] === new_items[i]) {
              continue
            }
            if (subDoc.priority_trades[i] !== new_items[i]) {
              subDoc.priority_trades[i] = new_items[i]
            }
          } else {
            subDoc.priority_trades.push(new_items[i])
          }
        }
      }
      if (items.list_of_workshops_renovated) {
        let new_items = items.list_of_workshops_renovated

        if (!Array.isArray(subDoc.list_of_workshops_renovated)) {
          subDoc.list_of_workshops_renovated = []
        }

        for (let i = 0; i < new_items.length; i++) {
          if (i < subDoc.list_of_workshops_renovated.length) {
            if (subDoc.list_of_workshops_renovated[i] === new_items[i]) {
              continue
            }
            if (subDoc.list_of_workshops_renovated[i] !== new_items[i]) {
              subDoc.list_of_workshops_renovated[i] = new_items[i]
            }
          } else {
            subDoc.list_of_workshops_renovated.push(new_items[i])
          }
        }
      }
      if (items.list_of_workshops_equipped) {
        let new_items = items.list_of_workshops_equipped

        if (!Array.isArray(subDoc.list_of_workshops_equipped)) {
          subDoc.list_of_workshops_equipped = []
        }

        for (let i = 0; i < new_items.length; i++) {
          if (i < subDoc.list_of_workshops_equipped.length) {
            if (subDoc.list_of_workshops_equipped[i] === new_items[i]) {
              continue
            }
            if (subDoc.list_of_workshops_equipped[i] !== new_items[i]) {
              subDoc.list_of_workshops_equipped[i] = new_items[i]
            }
          } else {
            subDoc.list_of_workshops_equipped.push(new_items[i])
          }
        }
      }

      found_project_summary[query][subDocIndex] = subDoc

      await found_project_summary.save()

      res.status(200).json({
        success: true,
        result: subDoc
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        Err: true,
        message: err
      })
    }
  })
)

module.exports = router
