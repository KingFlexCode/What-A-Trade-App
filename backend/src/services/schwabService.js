// ============================================================
//  Schwab Service — API calls and trade mapping
//  Docs: https://developer.schwab.com/products/trader-api
// ============================================================

const axios = require('axios');

const SCHWAB_TOKEN_URL    = 'https://api.schwabapi.com/v1/oauth/token';
const SCHWAB_ACCOUNTS_URL = 'https://api.schwabapi.com/trader/v1/accounts';
const SCHWAB_ORDERS_URL   = (accountId) => `https://api.schwabapi.com/trader/v1/accounts/${accountId}/orders`;

// ── Exchange auth code for access + refresh tokens ───────────
async function exchangeCodeForToken(code) {
  const credentials = Buffer.from(
    `${process.env.SCHWAB_CLIENT_ID}:${process.env.SCHWAB_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(SCHWAB_TOKEN_URL,
    new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: process.env.SCHWAB_REDIRECT_URI,
    }),
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
  // Returns: { access_token, refresh_token, expires_in, token_type }
}

// ── Refresh an expired access token ──────────────────────────
async function refreshToken(refreshToken) {
  const credentials = Buffer.from(
    `${process.env.SCHWAB_CLIENT_ID}:${process.env.SCHWAB_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(SCHWAB_TOKEN_URL,
    new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
}

// ── Get accounts list ─────────────────────────────────────────
async function getAccounts(accessToken) {
  const response = await axios.get(SCHWAB_ACCOUNTS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data; // Array of account objects
}

// ── Get orders for an account ─────────────────────────────────
async function getOrders(accessToken, accountId, fromEnterTime) {
  const response = await axios.get(SCHWAB_ORDERS_URL(accountId), {
    headers: { Authorization: `Bearer ${accessToken}` },
    params:  {
      fromEnteredTime: fromEnterTime,
      toEnteredTime:   new Date().toISOString(),
      status:          'FILLED', // Only get executed trades
      maxResults:      500,
    },
  });
  return response.data; // Array of order objects
}

// ── Map Schwab order format → WhatATrade! trade format ───────────
// Schwab returns orders which contain legs (executions).
// We need to pair BUY and SELL legs into complete trades.
function mapOrdersToTrades(orders) {
  const trades = [];

  for (const order of orders) {
    // Only process fully filled orders
    if (order.status !== 'FILLED') continue;

    const legs = order.orderLegCollection || [];

    for (const leg of legs) {
      const instrument  = leg.instrument || {};
      const execLegs    = order.orderActivityCollection || [];
      const totalQty    = execLegs.reduce((sum, a) => sum + (a.quantity || 0), 0);
      const avgPrice    = execLegs.reduce((sum, a) => sum + (a.executionLegs?.[0]?.price || 0), 0)
                          / (execLegs.length || 1);

      trades.push({
        // Identifiers
        brokerOrderId: order.orderId?.toString(),
        broker:        'thinkorswim',

        // Trade details
        symbol:        instrument.symbol,
        assetType:     instrument.assetType, // EQUITY, OPTION, FUTURE
        direction:     leg.instruction === 'BUY' || leg.instruction === 'BUY_TO_OPEN' ? 'Long' : 'Short',
        quantity:      totalQty || leg.quantity,
        entryPrice:    avgPrice || order.price,
        exitPrice:     null, // Populated when matching closing order
        entryTime:     order.enteredTime,
        exitTime:      order.closeTime || null,

        // Options-specific fields
        optionType:    instrument.putCall    || null, // 'PUT' or 'CALL'
        strikePrice:   instrument.strikePrice || null,
        expiryDate:    instrument.maturityDate || null,

        // P&L (Schwab doesn't always provide this directly; calculate from entry/exit)
        pnl:           null, // Calculated by our trade service when we have both legs

        // Raw data kept for debugging
        _raw: order,
      });
    }
  }

  return trades;
}

module.exports = {
  exchangeCodeForToken,
  refreshToken,
  getAccounts,
  getOrders,
  mapOrdersToTrades,
};
