window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();
var request = new XMLHttpRequest();
  request.open('GET', './sample.mp3', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      window.buffer = buffer;
      init();
    }, function() {});
}
request.send();

var init = function() {
  var res = summarizeFinal(buffer.getChannelData(0), 100);
  window.data = buffer.getChannelData(0);
  render1();
  render2();
  var startTime = new Date();
  render3();
  console.log(Date.now() - startTime);
  var startTime = new Date();
  render4();
  render5();
  renderSVG();
  console.log(Date.now() - startTime);
};


function render1() {
  var multiplier = 400;
  var summary = summarizeFinal(data, 300);
  d3.select('#ex1')
    .selectAll('div')
    .data( summary )
    .enter()
    .append('div')
    .style('height', function( pt ) {
      var sum = pt[1];
      return sum * multiplier + 'px';
    });
}

function render2() {
  var multiplier = 400;
  var summary = summarizeFinal(data, 300);
  d3.select('#ex2')
    .selectAll('div')
    .data( summary )
    .enter()
    .append('div')
    .style('height', function( pt ) {
      var sum = pt[1];
      return sum * multiplier + 'px';
    })
    .style('margin-top', function( pt ) {
      var sum = pt[1]/2;
      return - sum * multiplier + 'px';
    });
}

function render3() {
  var multiplier = 200;
  var summary = summarizeFinal(data, 300);
  d3.select('#ex3')
    .selectAll('div')
    .data( summary )
    .enter()
    .append('div')
    .style('height', function( pt ) {
      var sum = pt[1] - pt[0];
      return sum * multiplier + 'px';
    })
    .style('margin-top', function( pt ) {
      return - pt[1] * multiplier + 'px';
    });
}

function render4() {
  var multiplier = 200;
  var summary = summarizeFaster(data, 300);
  d3.select('#ex4')
    .selectAll('div')
    .data( summary )
    .enter()
    .append('div')
    .style('height', function( pt ) {
      var sum = pt[1] - pt[0];
      return sum * multiplier + 'px';
    })
    .style('margin-top', function( pt ) {
      return - pt[1] * multiplier + 'px';
    });
  d3.select('#ex5a')
    .selectAll('div')
    .data( summary )
    .enter()
    .append('div')
    .style('height', function( pt ) {
      var sum = pt[1] - pt[0];
      return sum * multiplier + 'px';
    })
    .style('margin-top', function( pt ) {
      return - pt[1] * multiplier + 'px';
    });
}

function render5() {
  var multiplier = 200;
  var summary = summarizeFaster(data, 300);
  d3.select('#ex5b')
    .selectAll('div')
    .data( summary )
    .enter()
    .append('div')
    .style('height', function( pt ) {
      var sum = pt[1] - pt[0];
      return Math.floor(sum * multiplier - 2) + 'px';
    })
    .style('margin-top', function( pt ) {
      return - Math.floor(pt[1] * multiplier) + 'px';
    })
    .style('border-top', function( pt ) {
      var remainder = pt[1] * multiplier % 1;
      var val = Math.floor( (1 - remainder) * 256 );
      var str = '1px solid rgb(' + val + ',' + val + ',' + val + ')';
      return str;
    })
    .style('border-bottom', function( pt ) {
      var remainder = Math.abs(pt[0] * multiplier % 1);
      var val = Math.floor( (1 - remainder) * 256 );
      var str = '1px solid rgb(' + val + ',' + val + ',' + val + ')';
      return str;
    })
}

function renderSVG() {
  var summary = summarizeFaster(data, 600);
  var multiplier = 200;
  var w = 0.5;
  d3.select('#ex6')
    .append('svg')
    .attr('width', 300)
    .attr('height', 150)
    .selectAll('circle')
    .data( summary )
    .enter()
      .append('rect')
      .attr('x', function(d, i) {
        return ( i * w ) + 25;
      })
      .attr('y', function(d, i) {
        return 50 - (multiplier * d[1] );
      })
      .attr('width', w)
      .attr('height', function(d) {
        return multiplier*(d[1] - d[0]);
      });
}


function summarizeFinal( data, pixels ) {
  var pixelLength = Math.round(data.length/pixels);
  var vals = [];

  // For each pixel we display
  for (var i = 0; i < pixels; i++) {
    var posSum = 0,
      negSum = 0;

    // Cycle through the data-points relevant to the pixel
    for (var j = 0; j < pixelLength; j++) {

      var val = data[ i * pixelLength + j ];

      // Keep track of positive and negative values separately
      if (val > 0) {
        posSum += val;
      } else {
        negSum += val;
      }
    }
    vals.push( [ negSum / pixelLength, posSum / pixelLength ] );
  }
  return vals;
}

function summarizeFaster( data, pixels ) {
  var pixelLength = Math.round(data.length/pixels);
  var vals = [];
  var minSample = 1000;
  sampleSize = Math.min(pixelLength, minSample);


  // For each pixel we display
  for (var i = 0; i < pixels; i++) {
    var posSum = 0,
      negSum = 0;

    // Cycle through the data-points relevant to the pixel
    for (var j = 0; j < sampleSize; j++) {
      var val = data[ i * pixelLength + j ];

      // Keep track of positive and negative values separately
      if (val > 0) {
        posSum += val;
      } else {
        negSum += val;
      }
    }
    vals.push( [ negSum / sampleSize, posSum / sampleSize ] );
  }
  return vals;
}
