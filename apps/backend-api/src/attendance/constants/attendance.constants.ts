export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half_day',
    ON_LEAVE: 'on_leave',
    HOLIDAY: 'holiday',
    WEEKEND: 'weekend',
  } as const;
  
  export const ATTENDANCE_TYPE = {
    CHECK_IN: 'check_in',
    CHECK_OUT: 'check_out',
  } as const;
  
  export const LEAVE_TYPE = {
    SICK: 'sick',
    CASUAL: 'casual',
    MATERNITY: 'maternity',
    PARENTAL: 'parental',
    EARNED: 'earned',
    UNPAID: 'unpaid',
    EMERGENCY: 'emergency',
    MEDICAL_LEAVE: 'medical_leave',           // For doctors/nurses who are sick
    QUARANTINE_LEAVE: 'quarantine_leave',     // COVID-19 or infectious diseases
    COMPASSIONATE_LEAVE: 'compassionate_leave', // Family bereavement
    MATERNITY_LEAVE: 'maternity_leave',
    PATERNITY_LEAVE: 'paternity_leave',
    STUDY_LEAVE: 'study_leave',               // For medical education/training
    CONFERENCE_LEAVE: 'conference_leave',     // Attending medical conferences
    RESEARCH_LEAVE: 'research_leave',         // For medical research
    MENTAL_HEALTH_LEAVE: 'mental_health_leave', // Burnout prevention
    BURNOUT_LEAVE: 'burnout_leave',           // Special leave for healthcare workers
    EXPOSURE_LEAVE: 'exposure_leave',         // Exposed to infectious diseases
    VACCINATION_LEAVE: 'vaccination_leave',   // Time off for vaccination
    DONATION_LEAVE: 'donation_leave',         // Blood/organ donation
    CAREGIVER_LEAVE: 'caregiver_leave',       // Caring for sick family member
    CONTINUING_EDUCATION: 'continuing_education', // CME/CPD days
    MANDATORY_TRAINING: 'mandatory_training',   // Required hospital training
    ROTATION_LEAVE: 'rotation_leave',          // Between department rotations
    POST_CALL_LEAVE: 'post_call_leave',        // After 24+ hour shifts
    WELLNESS_LEAVE: 'wellness_leave', 
  } as const;
  
  export const WORK_HOURS = {
    DEFAULT_START: '09:00:00',
    DEFAULT_END: '18:00:00',
    LATE_THRESHOLD_MINUTES: 15,
    HALF_DAY_THRESHOLD_HOURS: 4,
    MIN_WORK_HOURS: 8,
    MAX_WORK_HOURS: 12,
    OVERTIME_THRESHOLD: 8,
  };
  
  export const ATTENDANCE_RULES = {
    ALLOWED_LATE_COUNT_PER_MONTH: 3,
    ALLOWED_HALF_DAYS_PER_MONTH: 2,
    WORKING_DAYS_PER_WEEK: 5,
    WEEKEND_DAYS: ['saturday', 'sunday'],
    HOLIDAYS_LIST: [
        {
          name: "New Year's Day",
          date: "01-01",
          recurring: true
        },
        {
          name: "Labour Day",
          date: "05-01",
          recurring: true
        },
        {
          name: "Madaraka Day",
          date: "06-01",
          recurring: true
        },
        {
          name: "Mazingira Day",
          date: "10-10",
          recurring: true
        },
        {
          name: "Mashujaa Day",
          date: "10-20",
          recurring: true
        },
        {
          name: "Jamhuri Day",
          date: "12-12",
          recurring: true
        },
        {
          name: "Christmas Day",
          date: "12-25",
          recurring: true
        },
        {
          name: "Boxing Day",
          date: "12-26",
          recurring: true
        },
      
        // Variable holidays (change yearly)
        {
          name: "Good Friday",
          date: null,
          recurring: false
        },
        {
          name: "Easter Monday",
          date: null,
          recurring: false
        },
        {
          name: "Idd-ul-Fitr",
          date: null,
          recurring: false
        },
        {
          name: "Idd-ul-Adha",
          date: null,
          recurring: false
        }
      ]
  };
  
  export const ATTENDANCE_ERRORS = {
    ALREADY_CHECKED_IN: 'Already checked in for today',
    NOT_CHECKED_IN: 'You need to check in first',
    INVALID_TIME: 'Invalid time provided',
    RULE_VIOLATION: 'Attendance rule violation',
    SYNC_FAILED: 'Failed to sync attendance data',
    DUPLICATE_ENTRY: 'Duplicate attendance entry',
  };