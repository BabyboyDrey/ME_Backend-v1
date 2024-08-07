const mongoose = require('mongoose')

const teachersSchema = new mongoose.Schema({
  federal_tc: [
    {
      occupational_training: {
        digital_literacy_training: {
          type: Boolean,
          default: false
        },
        pedagogy_training: {
          type: Boolean,
          default: false
        },
        trade_area: {
          type: String
        }
      },
      certified_as_NSQF_assesors: {
        type: Boolean,
        default: false
      },
      service_type: {
        type: String
      },
      certified_as_NSQF_verifiers: {
        type: Boolean,
        default: false
      },
      special_need: {
        type: String
      },
      name: {
        type: String
      },
      gender: {
        type: String
      },
      phone_number: {
        type: Number
      },
      email: {
        type: String
      },
      date_of_birth: {
        type: Date
      },
      age: {
        type: Number
      },
      designation_in_the_college: {
        type: String
      },
      date_of_appointment: {
        type: Date
      },
      years_of_experience: {
        type: Number
      },
      possible_date_of_retirement: {
        type: Date
      },
      teaching_level: {
        type: String
      },
      nature_of_engagement: {
        type: String
      },
      teaching_wing: {
        type: String
      },
      highest_level_of_education_completed: {
        type: String
      },
      highest_level_ofteacher_training: {
        type: String
      },
      professional_certificate: {
        type: String
      },
      area_of_specialization: {
        type: String
      },
      trade_area_taught_in_the_college: {
        type: String
      },
      subjects_taught_in_the_college: {
        type: [String]
      },
      ict_proficiency: {
        type: String
      },
      did_you_participate_in_the_ideas_tti_training: {
        type: String
      },
      tc_name: {
        type: String
      }
    }
  ],
  state_tc: [
    {
      occupational_training: {
        digital_literacy_training: {
          type: Boolean,
          default: false
        },
        pedagogy_training: {
          type: Boolean,
          default: false
        },
        trade_area: {
          type: String
        }
      },
      certified_as_NSQF_assesors: {
        type: Boolean,
        default: false
      },
      certified_as_NSQF_verifiers: {
        type: Boolean,
        default: false
      },
      service_type: {
        type: String
      },
      special_need: {
        type: String
      },
      school_state_location: {
        type: String
      },
      name: {
        type: String
      },
      gender: {
        type: String
      },
      phone_number: {
        type: Number
      },
      email: {
        type: String
      },
      date_of_birth: {
        type: Date
      },
      age: {
        type: Number
      },
      designation_in_the_college: {
        type: String
      },
      date_of_appointment: {
        type: Date
      },
      years_of_experience: {
        type: Number
      },
      possible_date_of_retirement: {
        type: Date
      },
      teaching_level: {
        type: String
      },
      nature_of_engagement: {
        type: String
      },
      teaching_wing: {
        type: String
      },
      highest_level_of_education_completed: {
        type: String
      },
      highest_level_ofteacher_training: {
        type: String
      },
      professional_certificate: {
        type: String
      },
      area_of_specialization: {
        type: String
      },
      trade_area_taught_in_the_college: {
        type: String
      },
      subjects_taught_in_the_college: {
        type: [String]
      },
      ict_proficiency: {
        type: String
      },
      did_you_participate_in_the_ideas_tti_training: {
        type: String
      },
      tc_name: {
        type: String
      }
    }
  ],
  total_number_of_teachers: {
    type: Number
  }
})

teachersSchema.index({ 'federal_tc.email': 1 })
teachersSchema.index({ 'state_tc.email': 1 })

module.exports = Teachers = mongoose.model('Teachers', teachersSchema)
