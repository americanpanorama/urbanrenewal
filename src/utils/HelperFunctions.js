import d3 from 'd3';

export const getColorForRace =  function(weight) {
  if (weight >= 0.5) {
    var color1 = [44, 160, 44],
      color2 = [200,200,200],
      scale = d3.scale.linear()
        .domain([0.5, 1])
        .range([0, 1]),
      weight = scale(weight);
  } else {
    var color1 = [200,200,200],
      color2 = [163, 135, 190],
      scale = d3.scale.linear()
        .domain([0, 0.5])
        .range([0, 1]),
      weight = scale(weight);
  }

  var p = weight;
  var w = p * 2 - 1;
  var w1 = (w/1+1) / 2;
  var w2 = 1 - w1;
  var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2)];
  return 'rgb(' + rgb + ')';
};