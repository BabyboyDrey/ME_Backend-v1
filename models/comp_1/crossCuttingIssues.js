const mongoose = require('mongoose')

const crossCuttingIssuesSchema = new mongoose.Schema({
  federal_tc: [
    {
      gender_based_violence: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      greviance_redress_mechanisms: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      fraud_corruption: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      social_safeguard_issues: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      environmental_safeguard_issues: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      tc_name: {
        type: String
      }
    }
  ],
  state_tc: [
    {
      gender_based_violence: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      greviance_redress_mechanisms: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      fraud_corruption: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      social_safeguard_issues: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      environmental_safeguard_issues: {
        reported: {
          type: Number
        },
        investigated: {
          type: Number
        },
        uninvestigated: {
          type: Number
        },
        resolved: {
          type: Number
        },
        unresolved: {
          type: Number
        }
      },
      tc_name: {
        type: String
      },
      state: {
        type: String
      }
    }
  ]
})

crossCuttingIssuesSchema.index({ 'federal_tc.tc_name': 1 })
crossCuttingIssuesSchema.index({ 'state_tc.tc_name': 1 })

module.exports = CCS = mongoose.model('CCS', crossCuttingIssuesSchema)
