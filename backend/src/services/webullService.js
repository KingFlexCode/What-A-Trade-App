// ============================================================
//  Webull Service — API calls and trade mapping
//  Docs: https://developer.webull.com/apis/docs
// ============================================================

const axios = require('axios');

const WEBULL_TOKEN_URL   = 'https://openapi.webull.com/oauth2/token';
const WEBULL_ACCOUNT_URL = 'https://openapi.webull.com/v1/account/info';
const WEBULL_ORDERS_URL  = 'https://openapi.webull.com/v1/trade/list';

// ── Exchange auth code for tokens ─────────────────────────────
async function exchangeCodeForToken(code) {
  const response = await axios.post(WEBULL_TOKEN_URL, {
    app_key:      process.env.WEBULL_APP_KEY,
    app_secret:   process.env.WEBULL_APP_SECRET,
    grant_type:   'authorization_code',
    code,
    redirect_uri: process.env.WEBULL_REDIRECT_URI,
  });
  return response.data;
  // Returns: { access_token, refresh_token, expires_in }
}

// ── Refresh an expired access token ──────────────────────────
async function refreshToken(refreshToken) {
  const response = await axios.post(WEBULL_TOKEN_URL, {
    app_key:       process.env.WEBULL_APP_KEY,
    app_secret:    process.env.WEBULL_APP_SECRET,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  });
  return response.data;
}

// ── Get account info ──────────────────────────────────────────
async function getAccount(accessToken) {
  const response = await axios.get(WEBULL_ACCOUNT_URL, {
    headers: { access_token: accessToken },
  });
  return response.data;
}

// ── Get filled orders ─────────────────────────────────────────
async function getOrders(accessToken) {
  const response = await axios.get(WEBULL_ORDERS_URL, {
    headers: { access_token: accessToken },
    params:  {
      status:     'Filled',
      count:      500,
      // Webull supports dateBegin / dateEnd params
      dateBegin:  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateEnd:    new Date().toISOString().split('T')[0],
    },
  });
  return response.data?.orders || [];
}

// ── Map Webull order format → WhatATrade! trade format ───────────
function mapOrdersToTrades(orders) {
  return orders
    .filter(o => o.statusStr === 'Filled')
    .map(order => {
      const isBuy = order.action === 'BUY' || order.action === 'BUY_OPEN';

      return {
        brokerOrderId: order.orderId?.toString(),
        broker:        'webull',

        symbol:     order.ticker?.symbol || order.symbol,
        assetType:  order.ticker?.type   || 'EQUITY', // EQUITY, OPTION, FUTURE
        direction:  isBuy ? 'Long' : 'Short',
        quantity:   parseFloat(order.filledQuantity || order.totalQuantity),
        entryPrice: parseFloat(order.avgFilledPrice || order.price),
        exitPrice:  null,
        entryTime:  order.filledTime || order.createTime,
        exitTime:   null,

        // Options fields
        optionType:  order.ticker?.optionType  || null, // 'call' or 'put'
        strikePrice: order.ticker?.strikePrice || null,
        expiryDate:  order.ticker?.expireDate  || null,

        pnl: null,

        _raw: order,
      };
    });
}

module.exports = {
  exchangeCodeForToken,
  refreshToken,
  getAccount,
  getOrders,
  mapOrdersToTrades,
};
