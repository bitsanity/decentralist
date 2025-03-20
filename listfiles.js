// query and sort posts then print out a single HTML page
//
// $ node listfiles.js <loc> <cat>

const fs = require( 'fs' );

var loc = process.argv[2];
var cat = process.argv[3];

// TEMPLATE HTML STUFF -------------------------------------------------------
const HTML1 = `
<html>
<head>
  <title>LOC / CAT</title>
</head>
<style>
  * {
    font-family: "FreeMono", monospace;
  }
  body {
    padding: 10px;
    border-style: solid;
    border-width: 5px;
  }
  li {
    margin: 7px 0;
  }
</style>
<body>
<center>
<h2>
<a href='/'>DecentraList</a>:
<a href='/LOC/'>LOC</a>
/
<a href='/LOC/CAT/'>CAT</a>
</h2>
</center>

<p/><hr/><p/>
<blockquote>
<ul>
`


const HTML2 =`
</ul>
</blockquote>
</body>
</html>
`
// ---------------------------------------------------------------------------

console.log( HTML1.replace(/LOC/g, loc)
                  .replace(/CAT/g, cat) );

var flist = fs.readdirSync( './webroot/' + loc + '/' + cat + '/' );
flist.sort();
flist.reverse();

for (let ii = 0; ii < flist.length; ii++) {
  if (flist[ii].endsWith('.html') && flist[ii].indexOf('index') < 0) {
    let noext = flist[ii].substring( 0, flist[ii].indexOf(".html") );
    console.log(
      '<li><a href=./' + flist[ii] + '>' + noext + '</a></li>' );
  }
}

console.log( HTML2 );

