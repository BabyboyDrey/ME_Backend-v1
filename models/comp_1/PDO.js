const mongoose = require('mongoose')

const pdoSchema = new mongoose.Schema({
  female_enrollment_rate_in_project_supportedTc: {
    federal_tc: [
      {
        tvet_sensitization_consucted_in_host_community_by_school: {
          type: String
        },
        no_of_tvet_sensitizations_conducted_by_school: {
          value: {
            type: Number
          },
          tc_report_pdf: {
            type: String
          }
        },
        no_of_toilet_facilities_in_school: {
          type: Number
        },
        no_of_toilet_facilities_renovated_by_ideas_project: {
          type: Number
        },
        no_of_toilet_facilities_provided_with_wash_facilities_by_ideas_project:
          {
            type: Number
          },
        no_of_female_students_enrolled_in_priority_trade: {
          type: Number
        },
        total_no_of_students_enrolled_in_priority_trades: {
          type: Number
        },
        student_enrollment_data_doc_pdf: {
          type: String
        },
        tc_name: {
          type: String
        },
        percentage: {
          type: Number
        },
        status: {
          type: String,
          default: 'pending'
        },
        email_of_data_entry_personnel: {
          type: String
        }
      }
    ],
    state_tc: [
      {
        tvet_sensitization_consucted_in_host_community_by_school: {
          type: String
        },
        no_of_tvet_sensitizations_consucted_by_school: {
          value: {
            type: Number
          },
          tc_report_pdf: {
            type: String
          }
        },
        no_of_toilet_facilities_in_school: {
          type: Number
        },
        no_of_toilet_facilities_renovated_by_ideas_project: {
          type: Number
        },
        no_of_toilet_facilities_provided_with_wash_facilities_by_ideas_project:
          {
            type: Number
          },
        no_of_female_students_enrolled_in_priority_trade: {
          type: Number
        },
        total_no_of_students_enrolled_in_priority_trades: {
          type: Number
        },
        student_enrollment_data_doc_pdf: {
          type: String
        },
        tc_name: {
          type: String
        },
        percentage: {
          type: Number
        },
        status: {
          type: String,
          default: 'pending'
        },
        email_of_data_entry_personnel: {
          type: String
        }
      }
    ],
    percentage_of_female_students_across_tc: {
      type: Number
    }
  },
  beneficiaries_of_job_focused_interventions: {
    federal_tc: [
      {
        male: {
          graduates: {
            type: Number
          },
          enrolled: {
            type: Number
          },
          labour_market_workers: {
            type: Number
          },
          unemployed: {
            type: Number
          }
        },
        female: {
          graduates: {
            type: Number
          },
          enrolled: {
            type: Number
          },
          labour_market_workers: {
            type: Number
          },
          unemployed: {
            type: Number
          }
        },
        tc_name: {
          type: String
        },
        status: {
          type: String,
          default: 'pending'
        },
        email_of_data_entry_personnel: {
          type: String
        }
      }
    ],
    state_tc: [
      {
        male: {
          graduates: {
            type: Number
          },
          enrolled: {
            type: Number
          },
          labour_market_workers: {
            type: String
          },
          unemployed: {
            type: Number
          }
        },
        female: {
          graduates: {
            type: Number
          },
          enrolled: {
            type: Number
          },
          labour_market_workers: {
            type: Number
          },
          unemployed: {
            type: Number
          }
        },
        tc_name: {
          type: String
        },
        status: {
          type: String,
          default: 'pending'
        },
        email_of_data_entry_personnel: {
          type: String
        }
      }
    ]
  }
})

pdoSchema.index({
  'female_enrollment_rate_in_project_supportedTc.federal_tc.tc_name': 1
})
pdoSchema.index({
  'female_enrollment_rate_in_project_supportedTc.state_tc.tc_name': 1
})
pdoSchema.index({
  'beneficiaries_of_job_focused_interventions.federal_tc.tc_name': 1
})
pdoSchema.index({
  'beneficiaries_of_job_focused_interventions.state_tc.tc_name': 1
})

module.exports = Pdo_comp1 = mongoose.model('Pdo_comp1', pdoSchema)
