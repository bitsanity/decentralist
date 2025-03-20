// query and sort posts then print out a single HTML page
//
// $ node makepage.js <loc> <cat> <yyyymmdd>

const loki = require( 'lokijs' );
const fs = require( 'fs' );

const DIVLINE = '<div style="position:absolute;top:Ypx;left:Xpx;">';
const IMGLINE = '<img src=IMGSRC width=320 height=HEIGHT alt=PMNT />';

const ONEDAYMS = 1000 * 60 * 60 * 24;

var loc = process.argv[2];
var cat = process.argv[3];
var dte = process.argv[4];
var mon = parseInt( dte.slice(4,6) ) - 1;

var dateObj = new Date( dte.slice(0,4), mon, dte.slice(6,8) );
var dayBefore = new Date( dateObj.getTime() - ONEDAYMS );
var dayAfter = new Date( dateObj.getTime() + ONEDAYMS );

var postsTable = null;
var db = new loki( 'events.db', {
  autoload: true,
  autoloadCallback: dbInit
} );

function dbInit() {
  postsTable = db.getCollection("Posts");
  if (postsTable === null)
    process.exit(1);

  doit();
}

function doit() {
  let rset = postsTable.find( { $and: [ {'locale':   loc},
                                        {'category': cat},
                                        {'day':      dte} ] } )
                       .sort( (left,right) => {
                         if (left.payment == right.payment) return 0;
                         if (left.payment < right.payment) return 1;
                         if (left.payment > right.payment) return -1;
                       } );

  let selllist = [];
  let buylist = [];
  let noticelist = [];

  for( let ii = 0; ii < rset.length; ii++ ) {
    if( rset[ii].postType == 0 ) selllist.push( rset[ii] );
    else if( rset[ii].postType == 1 ) buylist.push( rset[ii] );
    else if( rset[ii].postType == 2 ) noticelist.push( rset[ii] );
  }

  if (selllist.length == 0 && buylist.length == 0 && noticelist.length == 0)
    selfPromos( selllist, buylist, noticelist );

  let heights = [ heightOf(selllist),
                  heightOf(buylist),
                  heightOf(noticelist) ];

  let maxheight = heights[0];
  if (heights[1] > maxheight) maxheight = heights[1];
  if (heights[2] > maxheight) maxheight = heights[2];

  console.log( HEADER.replace(/LOC/g, loc)
                     .replace(/CAT/g, cat)
                     .replace(/DAY/g, dateObj.toDateString())
                     .replace(/HEIGHT/g, maxheight) );

  printPosts( selllist, 0 );
  printPosts( buylist, 325 );
  printPosts( noticelist, 650 );

  let before =
    '/' + loc + '/' + cat + '/' + formatDate( dayBefore ) + '.html';
  let after =
    '/' + loc + '/' + cat + '/' + formatDate( dayAfter ) + '.html';

  console.log( FOOTER.replace("BEFORE", before)
                     .replace("AFTER", after) );
}

function formatDate( dt ) {
  let mm = dt.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;
  else mm = '' + mm;

  let dd = dt.getDate();
  if (dd < 10) dd = "0" + dd;
  else dd = '' + dd;

  return '' + dt.getFullYear() + mm + dd;
}

function heightOf( postlist ) {
  let result = 0;
  for( let ii = 0; ii < postlist.length; ii++ ) {
    if (postlist[ii].urlType === 'image') { result += 205; }
    else if (postlist[ii].urlType === 'text') { result += 100; }
  }
  return result;
}

function printPosts( list, xpos ) {
  let yy = 0;
  for (let ii = 0; ii < list.length; ii++) {
    console.log( DIVLINE.replace('Y', yy).replace('X', xpos) );
    if (list[ii].urlType === 'image') {
      console.log( IMGLINE.replace('IMGSRC', list[ii].url)
                          .replace('HEIGHT', 200)
                          .replace('PMNT', list[ii].payment) );
      yy += 205;
    }
    else if (list[ii].urlType === 'text') {
      console.log( IMGLINE.replace('IMGSRC', list[ii].url)
                          .replace('HEIGHT', 95)
                          .replace('PMNT', list[ii].payment) );
      yy += 100;
    }
    console.log( '</div>' );
  }
}

function selfPromos( selllist, buylist, noticelist ) {
  let ix = 0;
  let files = fs.readdirSync('./webroot/images/');
  files = shuffle( files );

  for (let ii = 0; ii < 12; ii++) {
    let file = files[ii];

    if (file.endsWith('.png')) {
      item = { urlType: 'image',
	       url: '/images/' + file,
	       payment: '0' };

      if (ix % 3 == 0)
        selllist.push( item );
      else if (ix % 3 == 1)
        buylist.push( item );
      else if (ix % 3 == 2)
        noticelist.push( item );

      ix += 1;
    }
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// TEMPLATE HTML STUFF -------------------------------------------------------
const HEADER = `
<html>
<head>
  <title>DecentraList: LOC CAT</title>
  <style>
    h2 {
      font-weight: bold;
      font-family: "FreeMono", monospace;
      font-size: xx-large;
    }
    th,td {
      font-weight: bold;
      font-family: "FreeMono", monospace;
      font-size: large;
    }   
    .banner {
      background-color: blue;
      color: white;
    }
    .headfoottable {
      position: relative;
      width: 975px;
    }
    .maintable {
        position: relative;
        width: 975px;
        height: HEIGHT;
    }   
  </style>
</head>
<body>
<center>
<h2>
<a href='/'>DecentraList</a>:
<a href='/LOC'>LOC</a>
<a href='/LOC/CAT'>CAT</a>
</h2>

<div class=headfoottable>
  <table width=99%>
    <tr>
      <th colspan=3 class=banner>DAY</th>
    </tr>
    <tr>
      <th colspan=3>&nbsp;</th>
    </tr>
    <tr>
      <th width=33%>SELLING</th>
      <th width=33%>BUYING</th>
      <th width=33%>NOTICE</th>
    </tr>
  </table>
</div>

<div class=maintable>
`

const FOOTER = `
</div>
<p/>
<div class=headfoottable>
  <table width=99%>
    <tr>
      <td width=33% align=left><a href=BEFORE>&lt; PREV</a></td>
      <td width=33% align=center><a href="https://etherscan.io/address/0x05ebFb4F0d74EeB7b3AA9BFD426A80518a1686f7">Smart Contract</a></td>
      <td width=33% align=right><a href=AFTER>NEXT &gt;</a></td>
    </tr>
  </table>
</div>
</center>
</body>
</html>
`
