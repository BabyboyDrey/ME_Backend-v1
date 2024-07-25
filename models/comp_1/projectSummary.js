const mongoose = require('mongoose')

const projectSummarySchema = new mongoose.Schema({
  federal_tc: [
    {
      total_no_of_students_in_tc: {
        type: Number
      },
      name_of_college: {
        type: String
      },
      name_of_principal: {
        type: String
      },
      date_of_receipt_of_initial_grant: {
        type: Date,
        default: Date.now()
      },
      industry_partners: {
        type: [String]
      },
      project_manager: {
        type: String
      },
      procurement_officer: {
        type: String
      },
      communications_officer: {
        type: String
      },
      m_and_e_officer: {
        type: String
      },
      priority_trades: {
        type: [String]
      },
      list_of_workshops_renovated: {
        type: [String]
      },
      list_of_workshops_equipped: {
        type: [String]
      }
    }
  ],
  state_tc: [
    {
      total_no_of_students_in_tc: {
        type: Number
      },
      name_of_college: {
        type: String
      },
      name_of_principal: {
        type: String
      },
      date_of_receipt_of_initial_grant: {
        type: Date,
        default: Date.now()
      },
      industry_partners: {
        type: [String]
      },
      project_manager: {
        type: String
      },
      procurement_officer: {
        type: String
      },
      communications_officer: {
        type: String
      },
      m_and_e_officer: {
        type: String
      },
      priority_trades: {
        type: [String]
      },
      list_of_workshops_renovated: {
        type: [String]
      },
      list_of_workshops_equipped: {
        type: [String]
      },
      state: {
        type: String
      }
    }
  ]
})

projectSummarySchema.index({ 'federal_tc.name_of_college': 1 })
projectSummarySchema.index({ 'state_tc.name_of_college': 1 })

module.exports = Projectsummary = mongoose.model(
  'Projectsummary',
  projectSummarySchema
)
