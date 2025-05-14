const express = require('express');
const { NlpManager } = require('node-nlp');
const pool = require('../db');
const router = express.Router();

const manager = new NlpManager({
  languages: ['en'],
  nlu: { log: false }
});

const taxiPhrases = [
  'show me trips of taxi %taxiId%',
  'list rides for taxi %taxiId%',
  'display journeys for taxi %taxiId%',
  'get all trips for taxi %taxiId%',
  'query the trips of taxi %taxiId%',
  'taxi %taxiId% trips',
  'rides of taxiID %taxiId%',
  'what has taxi %taxiId% done',
  'fetch journeys taxi %taxiId%',
  'taxi id %taxiId%'
];
taxiPhrases.forEach(phr => manager.addDocument('en', phr, 'get_taxi'));

manager.addRegexEntity('taxiId','en',/\btaxi\s*ID[:\s]*(\d+)\b/i,'taxiId');
manager.addRegexEntity('taxiId','en',/\btaxi\s*(\d+)\b/i,'taxiId');
manager.addRegexEntity('taxiId','en',/(\d+)\s*taxi\b/i,'taxiId');

const timePhrases = [
  'show me trips from %start% to %end%',
  'trips between %start% and %end%',
  'get rides from %start% to %end%',
  'list journeys between %start% and %end%',
  'fetch trips from %start% to %end%',
  'trips between %start% and %end%'
];
timePhrases.forEach(phr => manager.addDocument('en', phr, 'get_time'));

manager.addRegexEntity('start','en',/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/,'start');
manager.addRegexEntity('start','en',/(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}(?:\s?[APMapm]{2})?)/,'start');
manager.addRegexEntity('start','en',/([A-Za-z]+ \d{1,2} \d{4}\s+\d{1,2}:\d{2}\s?[APMapm]{2})/,'start');

manager.addRegexEntity('end','en',/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/,'end');
manager.addRegexEntity('end','en',/(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}(?:\s?[APMapm]{2})?)/,'end');
manager.addRegexEntity('end','en',/([A-Za-z]+ \d{1,2} \d{4}\s+\d{1,2}:\d{2}\s?[APMapm]{2})/,'end');

(async () => {
  await manager.train();
  console.log('NLU model trained.');
})();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  const nlpResult = await manager.process('en', message);

  if (nlpResult.score < 0.6) {
    return res.json({
      answer: `I'm not sure what you mean by "${message}". Could you rephrase?`
    });
  }

  const taxiEnt = nlpResult.entities.find(e => e.entity === 'taxiId');
  const taxiId  =
    taxiEnt?.resolution?.strings?.[0] ??
    taxiEnt?.resolution?.value ??
    (taxiEnt?.sourceText.match(/\d+/) || [])[0] ??
    null;
  
  const callMatch = message.match(/\bcall[-_\s]?type[:=]?\s*([ABC])\b/i);
  const callType  = callMatch ? callMatch[1].toUpperCase() : null;

  const dateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g;
  const dates = message.match(dateTimePattern) || [];
  const [ start, end ] = dates.length >= 2 ? dates : [ null, null ];

  console.log('Debug - taxiId:', taxiId);
  console.log('Debug - start :', start);
  console.log('Debug -   end :', end);

  if (!taxiId && !callType && (!start || !end)) {
    return res.json({
      answer: `Sorry, I didn't understand "${message}". Try "show me trips of taxi 20000403", "Call Type A" or "trips between 2013-07-01 00:00:00 and 2013-07-02 00:00:00".`
    });
  }

  const whereClauses = [];
  const params       = [];

  if (taxiId) {
    params.push(parseInt(taxiId, 10));
    whereClauses.push(`taxi_id = $${params.length}`);
  }
  if (callType) { params.push(callType);     whereClauses.push(`call_type = $${params.length}`); }
  if (start && end) {
    params.push(`${start}`);
    params.push(`${end}`);
    whereClauses.push(
      `timestamp_ts BETWEEN $${params.length-1}::timestamptz AND $${params.length}::timestamptz`
    );
  }

  const sql = `
    SELECT
      trip_id, call_type,
      timestamp_ts::text AS ts_text,
      ST_AsGeoJSON(path_geom)::json AS path_geom
    FROM taxi_trip_raw
    WHERE ${whereClauses.join(' AND ')};
  `;

  try {
    const { rows } = await pool.query(sql, params);
    if (rows.length === 0) {
      return res.json({ answer: 'No matching trips found.', rows });
    }
    const preview = rows
      .slice(0, 5)
      .map(r => {
        const time = r.ts_text;
        
        let coordsInfo = '';
        if (r.path_geom?.coordinates?.length >= 2) {
            const start = r.path_geom.coordinates[0];
            const end   = r.path_geom.coordinates[r.path_geom.coordinates.length - 1];
            coordsInfo = ` from [${start[1].toFixed(5)}, ${start[0].toFixed(5)}] to [${end[1].toFixed(5)}, ${end[0].toFixed(5)}]`;
        }

        return `Trip ID ${r.trip_id} with Call Type ${r.call_type} at ${time}${coordsInfo}`;
      })
      .join('; ');
    res.json({
      answer: `Total ${rows.length} trips found. Examples: ${preview}`,
      rows
    });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ answer: 'Database query failed, please check server logs.' });
  }
});

module.exports = router;
