// Preprinter - run as a batch job
//
// Usage: node preprinter.js <SCA>
//
// . fetches all events since last high-water mark
// . converts each text post to a 320x100 png file saved locally
// . stores metadata (converts event block number to timestamp)

const fs = require( 'fs' );
const loki = require( 'lokijs' );
const { registerFont, createCanvas } = require( 'canvas' );
const Web3 = require( 'web3' );
const web3 =
  new Web3( new Web3.providers.WebsocketProvider("ws://localhost:8546") );

const LOCALES = {
  "AMS":true,
  "BER":true,
  "CPT":true,
  "ORD":true,
  "DUB":true,
  "EDI":true,
  "YHW":true,
  "LAX":true,
  "MAD":true,
  "MEX":true,
  "YUL":true,
  "BOM":true,
  "NYC":true,
  "YTO":true,
  "PAR":true,
  "FCO":true,
  "YQY":true,
  "YVR":true,
  "GLOBAL":true,
  "MATRIX":true
};

const CATEGORIES = {
"Animals":true,
"Boats":true,
"Cannabis":true,
"Community":true,
"Cryptocurrencies":true,
"Farm-And-Garden":true,
"Finance":true,
"Food":true,
"General-Items":true,
"Home-Rentals":true,
"Home-Sales":true,
"Jobs":true,
"Services":true,
"Sporting-Goods":true,
"Transportation":true,
"Vehicles":true,
"XXX":true
};

registerFont( 'FreeMonoBold.ttf', { family: 'MyMono' } );

var sca = process.argv[2];

var contract = new web3.eth.Contract(
  JSON.parse( fs.readFileSync(
    './DecentraList_sol_DecentraList.abi').toString() ), sca );

var db = new loki( 'events.db', {
  autoload: true,
  autoloadCallback: dbInit,
  autosave: true,
  autosaveInterval: 2000
} );

var hwmTable = null;
var postsTable = null;

function dbInit() {

  hwmTable = db.getCollection("HWM");
  if (hwmTable === null) {
    hwmTable = db.addCollection("HWM");
    hwmTable.insert( {id:1, hwm : 0} );
  }

  counterTable = db.getCollection("Counter");
  if (counterTable === null) {
    counterTable = db.addCollection("Counter");
    counterTable.insert( {id : 1, count : 1000000000} );
  }

  postsTable = db.getCollection("Posts");
  if (postsTable === null)
    postsTable = db.addCollection("Posts");

  doit();
}

async function convertEvent( evt ) {
  let decoded = web3.eth.abi.decodeParameters(
    ["string", "string", "uint256", "string", "uint256"], evt.raw.data );

  let pt = parseInt( decoded['2'] );
  if (    pt < 0 || pt > 2
       || !LOCALES[decoded['0']]
       || !CATEGORIES[decoded['1']]
       || decoded['3'].length > 256 ) return null;

  let ts = (await web3.eth.getBlock( evt.blockNumber )).timestamp * 1000;
  let dt = new Date( ts ); // javascript date months are 0-11

  var hwmdoc = hwmTable.get( 1 );
  if (hwmdoc == null) {
    console.log( 'doc is null' );
    process.exit(1);
  }

  hwmdoc.hwm = evt.blockNumber;
  hwmTable.update( hwmdoc );

  return {
    locale: decoded['0'],
    category: decoded['1'],
    postType: parseInt( decoded['2'] ),
    url: decoded['3'],
    payment: parseInt( decoded['4'] ),
    day: '' + dt.getFullYear() + '' + (dt.getMonth() + 1) + '' + dt.getDate()
  };
}

async function processImageEvent( value, index, array ) {
  let post = await convertEvent( value );
  console.log( post );
  post.urlType = 'image';
  postsTable.insert( post );
}

async function processTextEvent( value, index, array ) {
  let post = await convertEvent( value );
  let url = post.url;

  var canvas = createCanvas( 320, 95 );
  var ctx = canvas.getContext('2d');
  ctx.font = '15px "MyMono"';

  ctx.fillRect( 0, 0, 320, 95 );
  ctx.clearRect( 2, 2, 316, 91 );

  var COLS = 34;
  var lines = [
    url.slice( 0 * COLS, 1 * COLS ),
    url.slice( 1 * COLS, 2 * COLS ),
    url.slice( 2 * COLS, 3 * COLS ),
    url.slice( 3 * COLS, 4 * COLS ),
    url.slice( 4 * COLS, 5 * COLS )
  ];

  for (let ii = 0; ii < lines.length; ii++)
    ctx.fillText( lines[ii], 7, 17 + 18 * ii );

  let counterdoc = counterTable.get( 1 );
  let fname = './webroot/' + counterdoc.count + '.png';
  let lurl = '/' + counterdoc.count + '.png';
  counterdoc.count += 1;
  counterTable.update( counterdoc );

  let out = fs.createWriteStream( fname );
  let stream = canvas.createPNGStream();
  await stream.pipe( out );
  post.url = lurl;
  post.urlType = 'text';
  postsTable.insert( post );

  console.log( post );
}

function doit() {

  let hwm = hwmTable.get( 1 ).hwm;
  counter = counterTable.get( 1 ).count;
  console.log( 'HWM: ' + hwm + ', counter: ' + counter );

  contract.getPastEvents(
    'TextPosted',
    { fromBlock: hwm + 1, toBlock: 'latest' },
    (err, evts) => {
      if (!err)
        evts.forEach( processTextEvent );
      else {
        console.log( err );
        return;
      }

      contract.getPastEvents(
        'ImagePosted',
        { fromBlock: hwm + 1, toBlock: 'latest' },
        (err, evts) => {
          if (!err) {
            evts.forEach( processImageEvent );
	    console.log( "done." );
	  }
          else
            console.log( err );

          setTimeout( () => {process.exit(0);}, 10000 );
        } );
    }
  );
}

