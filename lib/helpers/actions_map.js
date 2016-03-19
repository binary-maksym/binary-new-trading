function ActionsMap() {

  const actions = {
    "SET_MARKET": {
      "field": "market",
      "next": ["SET_SYMBOL"],
    },
    "SET_SYMBOL": {
      "field": "symbol",
      "next": ["SET_CATEGORY"],
    },
    "SET_CATEGORY": {
      "field": "category",
      "next": ["SET_START_TIME", "SET_STOP_TYPE", "SET_EXPIRY_TYPE"],
      "resolver": categoryResolver
    },
    "SET_START_TIME": {
      "field": "start_time",
      "next": ["EXPIRY_TYPE"]
    },
    "SET_EXPIRY_TYPE": {
      "field": "expiry_type",
      "next": ["SET_EXPIRY_DATE", "SET_DURATION_UNIT"],
      "resolver": expiryTypeResolver
    },
    "SET_EXPIRY_DATE": {
      "field": "expiry_date",
      "next": ["SET_EXPIRY_TIME"]
    },
    "SET_DURATION_UNIT": {
      "field": "duration_unit",
      "next": "SET_DURATION_AMOUNT"
    },
    "SET_EXPIRY_TIME": {
      "field": "expiry_time",
      "next": ["SET_BARRIER"]
    },
    "SET_DURATION_AMOUNT": {
      "field": "duration_amount",
      "next": ["SET_PREDICTION", "SET_BARRIER"],
      "resolver": durationAmountResolver
    },
    "SET_PREDICTION": {
      "field": "prediction",
      "next": ["SET_PAYOUT_TYPE"]
    },
    "SET_BARRIER": {
      "field": "barrier",
      "next": ["SET_BARRIER2", "SET_PAYOUT_TYPE"],
      "resolver": barrierResolver
    },
    "SET_STOP_TYPE": {
      "field": "stop_type",
      "next": "SET_STOP_LOSS"
    },
    "SET_STOP_LOSS": {
      "field": "stop_loss",
      "next": ["SET_STOP_PROFIT"]
    },
    "SET_PAYOUT_TYPE": {
      "field": "payout_type",
      "next": ["SET_PAYOUT_CURRENCY"]
    },
    "SET_PAYOUT_CURRENCY": {
      "field": "payput_currency",
      "next": ["SET_PAYOUT_AMOUNT", "SET_PAYOUT_AMOUNT_PER_POINT"],
      "resolver": payoutCurrencyResolver
    },
    "SET_PAYOUT_AMOUNT": {
      "field": "payout_amount"
    },
    "SET_PAYOUT_AMOUNT_PER_POINT": {
      "field": "payout_amount_per_point"
    }

  }
}

export default ActionsMap;