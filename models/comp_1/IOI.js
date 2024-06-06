const mongoose = require('mongoose')

const ioiSchema = new mongoose.Schema({
  no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership:
    {
      federal_tc: [
        {
          sch_ideas_project_team_established: {
            value: {
              type: String
            },
            report_pdf: {
              type: String
            }
          },
          no_of_mous_signed_with_industry_partners: {
            value: {
              type: Number
            },
            all_signed_mous_pdf: {
              type: String
            }
          },
          no_of_times_ciu_met_over_past_year: {
            value: {
              type: String
            },
            minutes_pdf: {
              type: String
            }
          },
          tc_name: {
            type: String,
            unique: true
          },
          count: {
            type: Number,
            default: 0
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
          sch_ideas_project_team_established: {
            value: {
              type: String
            },
            report_pdf: {
              type: String
            }
          },
          no_of_mous_signed_with_industry_partners: {
            value: {
              type: String
            },
            all_signed_mous_pdf: {
              type: String
            }
          },
          no_of_times_ciu_met_over_past_year: {
            value: {
              type: String
            },
            minutes_pdf: {
              type: String
            }
          },
          tc_name: {
            type: String,
            unique: true
          },
          count: {
            type: Number,
            default: 0
          },
          status: {
            type: String,
            default: 'pending'
          },
          state: {
            type: String
          },
          email_of_data_entry_personnel: {
            type: String
          }
        }
      ]
    },
  no_of_training_programs_delivered_monitored: {
    federal_tc: [
      {
        internship_arrangements: {
          type: String
        },
        no_of_industry_partners: {
          type: Number
        },
        no_of_internship_arrangements: {
          type: Number
        },
        development_of_short_term_skills_upgrading_courses: {
          type: String
        },
        no_of_newly_developed_short_term_skills_upgrading_courses_on_partnership_with_industry:
          {
            type: Number
          },
        latest_tc_status_report_pdf: {
          type: String
        },
        attendance_sheet_pdf: {
          type: String
        },
        tc_name: {
          type: String,
          unique: true
        },
        count: {
          type: Number,
          default: 0
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
        internship_arrangements: {
          type: String
        },
        no_of_industry_partners: {
          type: Number
        },
        no_of_internship_arrangements: {
          type: Number
        },
        development_of_short_term_skills_upgrading_courses: {
          type: String
        },
        no_of_newly_developed_short_term_skills_upgrading_courses_on_partnership_with_industry:
          {
            type: Number
          },
        latest_tc_status_report_pdf: {
          type: String
        },
        attendance_sheet_pdf: {
          type: String
        },
        tc_name: {
          type: String,
          unique: true
        },
        count: {
          type: Number,
          default: 0
        },
        status: {
          type: String,
          default: 'pending'
        },
        state: {
          type: String
        },
        email_of_data_entry_personnel: {
          type: String
        }
      }
    ]
  },
  no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth:
    {
      federal_tc: [
        {
          gbv_sensitization_conducted_by_the_school: {
            value: {
              type: String
            },
            sensitization_pdf: {
              type: String
            }
          },
          gbv_policy_developed_by_school: {
            type: String
          },
          gbv_policy_published_by_school: {
            value: {
              type: String
            },
            school_gbv_policy_pdf: {
              type: String
            }
          },
          gbv_reporting_and_referral_system_for_youths_in_place_at_the_school: {
            type: String
          },
          presence_of_grievance_redress_mechanism_at_the_school: {
            type: String
          },
          reports_showing_addressed_complaints_box_pdf: {
            type: String
          },
          tc_name: {
            type: String,
            unique: true
          },
          count: {
            type: Number,
            default: 0
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
          gbv_sensitization_conducted_by_the_school: {
            value: {
              type: String
            },
            sensitization_pdf: {
              type: String
            }
          },
          gbv_policy_developed_by_school: {
            type: String
          },
          gbv_policy_published_by_school: {
            value: {
              type: String
            },
            school_gbv_policy_pdf: {
              type: String
            }
          },
          gbv_reporting_and_referral_system_for_youths_in_place_at_the_school: {
            type: String
          },
          presence_of_grievance_redress_mechanism_at_the_school: {
            type: String
          },
          reports_showing_addressed_complaints_box_pdf: {
            type: String
          },
          tc_name: {
            type: String,
            unique: true
          },
          status: {
            type: String,
            default: 'pending'
          },
          state: {
            type: String
          },
          email_of_data_entry_personnel: {
            type: String
          }
        }
      ]
    },
  no_of_fully_functioning_upgraded_workshops_in_supported_tc: {
    federal_tc: [
      {
        workshops: {
          type: [String]
        },
        initial_disbursement_of_250kusd_received: {
          value: {
            type: String
          },
          doc_confirming_disbursment_received_pdf: {
            type: String
          }
        },
        cdp_received_by_the_npcu: {
          type: String
        },
        cdp_approved_by_the_world_bank: {
          type: String
        },
        no_of_workshops_renovated: {
          type: Number
        },
        no_of_workshops_equipped_with_modern_tools_and_ready_for_use: {
          value: {
            type: Number
          },
          status_report_pdf: {
            type: String
          }
        },
        training_of_ttis_on_the_use_of_newly_installed_tools: {
          type: String
        },
        no_of_ttis_trained_on_the_use_of_newly_installed_tools: {
          value: {
            type: Number
          },
          status_report_pdf: {
            type: String
          }
        },
        fulfilled: {
          type: String
        },
        tc_name: {
          type: String,
          unique: true
        },
        count: {
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
        workshops: {
          type: [String]
        },
        initial_disbursement_of_250kusd_received: {
          value: {
            type: String
          },
          doc_confirming_disbursment_received_pdf: {
            type: String
          }
        },
        cdp_received_by_the_npcu: {
          type: String
        },
        cdp_approved_by_the_world_bank: {
          type: String
        },
        no_of_workshops_renovated: {
          type: Number
        },
        no_of_workshops_equipped_with_modern_tools_and_ready_for_use: {
          value: {
            type: Number
          },
          status_report_pdf: {
            type: String
          }
        },
        training_of_ttis_on_the_use_of_newly_installed_tools: {
          type: String
        },
        no_of_ttis_trained_on_the_use_of_newly_installed_tools: {
          value: {
            type: Number
          },
          status_report_pdf: {
            type: String
          }
        },
        fulfilled: {
          type: String
        },
        tc_name: {
          type: String,
          unique: true
        },
        state: {
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

ioiSchema.index({
  'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_training_programs_delivered_monitored.federal_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_training_programs_delivered_monitored.state_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc.tc_name': 1
})
ioiSchema.index({
  'no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc.tc_name': 1
})

const Ioi_comp1 = mongoose.model('Ioi_comp1', ioiSchema)
module.exports = Ioi_comp1
