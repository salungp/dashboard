/**Customize the Rectangle.prototype draw method**/
Chart.elements.Rectangle.prototype.draw = function() {
  var ctx = this._chart.ctx;
  var vm = this._view;
  var left, right, top, bottom, signX, signY, borderSkipped, radius;
  var borderWidth = vm.borderWidth;

  // If radius is less than 0 or is large enough to cause drawing errors a max
  //      radius is imposed. If cornerRadius is not defined set it to 0.
  var cornerRadius = this._chart.config.options.cornerRadius;
  var fullCornerRadius = this._chart.config.options.fullCornerRadius;
  var stackedRounded = this._chart.config.options.stackedRounded;
  var typeOfChart = this._chart.config.type;

  if (cornerRadius < 0) {
    cornerRadius = 0;
  }
  if (typeof cornerRadius == 'undefined') {
    cornerRadius = 0;
  }
  if (typeof fullCornerRadius == 'undefined') {
    fullCornerRadius = false;
  }
  if (typeof stackedRounded == 'undefined') {
    stackedRounded = false;
  }

  if (!vm.horizontal) {
    // bar
    left = vm.x - vm.width / 2;
    right = vm.x + vm.width / 2;
    top = vm.y;
    bottom = vm.base;
    signX = 1;
    signY = bottom > top ? 1 : -1;
    borderSkipped = vm.borderSkipped || 'bottom';
  } else {
    // horizontal bar
    left = vm.base;
    right = vm.x;
    top = vm.y - vm.height / 2;
    bottom = vm.y + vm.height / 2;
    signX = right > left ? 1 : -1;
    signY = 1;
    borderSkipped = vm.borderSkipped || 'left';
  }

  // Canvas doesn't allow us to stroke inside the width so we can
  // adjust the sizes to fit if we're setting a stroke on the line
  if (borderWidth) {
    // borderWidth shold be less than bar width and bar height.
    var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
    borderWidth = borderWidth > barSize ? barSize : borderWidth;
    var halfStroke = borderWidth / 2;
    // Adjust borderWidth when bar top position is near vm.base(zero).
    var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
    var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
    var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
    var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
    // not become a vertical line?
    if (borderLeft !== borderRight) {
      top = borderTop;
      bottom = borderBottom;
    }
    // not become a horizontal line?
    if (borderTop !== borderBottom) {
      left = borderLeft;
      right = borderRight;
    }
  }

  ctx.beginPath();
  ctx.fillStyle = vm.backgroundColor;
  ctx.strokeStyle = vm.borderColor;
  ctx.lineWidth = borderWidth;

  // Corner points, from bottom-left to bottom-right clockwise
  // | 1 2 |
  // | 0 3 |
  var corners = [
    [left, bottom],
    [left, top],
    [right, top],
    [right, bottom]
  ];

  // Find first (starting) corner with fallback to 'bottom'
  var borders = ['bottom', 'left', 'top', 'right'];
  var startCorner = borders.indexOf(borderSkipped, 0);
  if (startCorner === -1) {
    startCorner = 0;
  }

  function cornerAt(index) {
    return corners[(startCorner + index) % 4];
  }

  // Draw rectangle from 'startCorner'
  var corner = cornerAt(0);
  ctx.moveTo(corner[0], corner[1]);


  var nextCornerId, nextCorner, width, height, x, y;
  for (var i = 1; i < 4; i++) {
    corner = cornerAt(i);
    nextCornerId = i + 1;
    if (nextCornerId == 4) {
      nextCornerId = 0
    }

    nextCorner = cornerAt(nextCornerId);

    width = corners[2][0] - corners[1][0];
    height = corners[0][1] - corners[1][1];
    x = corners[1][0];
    y = corners[1][1];

    var radius = cornerRadius;
    // Fix radius being too large
    if (radius > Math.abs(height) / 2) {
      radius = Math.floor(Math.abs(height) / 2);
    }
    if (radius > Math.abs(width) / 2) {
      radius = Math.floor(Math.abs(width) / 2);
    }

      var x_tl, x_tr, y_tl, y_tr, x_bl, x_br, y_bl, y_br;
      if (height < 0) {
        // Negative values in a standard bar chart
        x_tl = x;
        x_tr = x + width;
        y_tl = y + height;
        y_tr = y + height;

        x_bl = x;
        x_br = x + width;
        y_bl = y;
        y_br = y;

        // Draw
        ctx.moveTo(x_bl + radius, y_bl);

        ctx.lineTo(x_br - radius, y_br);

        // bottom right
        ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius);


        ctx.lineTo(x_tr, y_tr + radius);

        // top right
        fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);


        ctx.lineTo(x_tl + radius, y_tl);

        // top left
        fullCornerRadius ? ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius) : ctx.lineTo(x_tl, y_tl, x_tl, y_tl + radius);


        ctx.lineTo(x_bl, y_bl - radius);

        //  bottom left
        ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

      } else if (width < 0) {
        // Negative values in a horizontal bar chart
        x_tl = x + width;
        x_tr = x;
        y_tl = y;
        y_tr = y;

        x_bl = x + width;
        x_br = x;
        y_bl = y + height;
        y_br = y + height;

        // Draw
        ctx.moveTo(x_bl + radius, y_bl);

        ctx.lineTo(x_br - radius, y_br);

        //  Bottom right corner
        fullCornerRadius ? ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius) : ctx.lineTo(x_br, y_br, x_br, y_br - radius);

        ctx.lineTo(x_tr, y_tr + radius);

        // top right Corner
        fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);

        ctx.lineTo(x_tl + radius, y_tl);

        // top left corner
        ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius);

        ctx.lineTo(x_bl, y_bl - radius);

        //  bttom left corner
        ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

      } else {
      
          var lastVisible = 0;
        for (var findLast = 0, findLastTo = this._chart.data.datasets.length; findLast < findLastTo; findLast++) {
          if (!this._chart.getDatasetMeta(findLast).hidden) {
            lastVisible = findLast;
          }
        }
        var rounded = this._datasetIndex === lastVisible;

        if (rounded) {
        //Positive Value
          ctx.moveTo(x + radius, y);

          ctx.lineTo(x + width - radius, y);

          // top right
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);


          ctx.lineTo(x + width, y + height - radius);

          // bottom right
          if (fullCornerRadius || typeOfChart == 'horizontalBar')
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          else
            ctx.lineTo(x + width, y + height, x + width - radius, y + height);


          ctx.lineTo(x + radius, y + height);

          // bottom left
          if (fullCornerRadius)
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          else
            ctx.lineTo(x, y + height, x, y + height - radius);


          ctx.lineTo(x, y + radius);

          // top left
          if (fullCornerRadius || typeOfChart == 'bar')
            ctx.quadraticCurveTo(x, y, x + radius, y);
          else
            ctx.lineTo(x, y, x + radius, y);
        }else {
          ctx.moveTo(x, y);
          ctx.lineTo(x + width, y);
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x, y + height);
          ctx.lineTo(x, y);
        }
      }
    
  }

  ctx.fill();
  if (borderWidth) {
    ctx.stroke();
  }
};

function makeChart(id, obj) {
  return new Chart(id, obj);
}

var Headcount = document.getElementById('Headcount').getContext('2d');
var Headcount2 = document.getElementById('Headcount2').getContext('2d');
var Headcountchart = makeChart(Headcount, {
  // The type of chart we want to create
  type: 'pie',

  // The data for our dataset
  data: {
    datasets: [{
        data: [10, 20, 30, 15, 60, 10],
        backgroundColor: ['#0FAAC0', '#7A50F2', '#FF4918', '#FE7D15', '#FFAA00', '#81C91D']
    }],
  },

  // Configuration options go here
  options: {
    responsive: true
  }
});

var Headcountchart2 = new Chart(Headcount2, {
  // The type of chart we want to create
  type: 'pie',

  // The data for our dataset
  data: {
    datasets: [{
        data: [10, 20, 30, 15, 60, 10],
        backgroundColor: ['#0FAAC0', '#7A50F2', '#FF4918', '#FE7D15', '#FFAA00', '#81C91D']
    }],
  },

  // Configuration options go here
  options: {
    responsive: true
  }
});


var long = document.getElementById('long').getContext('2d');
var longchart = new Chart(long, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 15, 12, 23, 36, 23, 34],
        backgroundColor: '#5CC0FF',
        borderDash: [10,10]
      }],
    },

    // Configuration options go here
    options: {
      cornerRadius: 20, 
      //Default: false; if true, this would round all corners of final box;
      fullCornerRadius: false, 
      //Default: false; if true, this rounds each box in the stack instead of only final box;
      stackedRounded: false,
      elements: {
        point: {
          radius: 25,
          hoverRadius: 35,
          pointStyle: 'rectRounded',

        }
      },
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            },
            barPercentage: 0.4
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var long2 = document.getElementById('long2').getContext('2d');
var long2chart = new Chart(long2, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 15, 12, 23, 36, 23, 34],
        backgroundColor: '#5CC0FF',
        borderDash: [10,10]
      }],
    },

    // Configuration options go here
    options: {
      cornerRadius: 20, 
      //Default: false; if true, this would round all corners of final box;
      fullCornerRadius: false, 
      //Default: false; if true, this rounds each box in the stack instead of only final box;
      stackedRounded: false,
      elements: {
        point: {
          radius: 25,
          hoverRadius: 35,
          pointStyle: 'rectRounded',

        }
      },
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            },
            barPercentage: 0.6
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var long3 = document.getElementById('long3').getContext('2d');
var long3chart = new Chart(long3, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 15, 12, 23, 36, 23, 34],
        backgroundColor: '#5CC0FF',
        borderDash: [10,10]
      }],
    },

    // Configuration options go here
    options: {
      cornerRadius: 20, 
      //Default: false; if true, this would round all corners of final box;
      fullCornerRadius: false, 
      //Default: false; if true, this rounds each box in the stack instead of only final box;
      stackedRounded: false,
      elements: {
        point: {
          radius: 25,
          hoverRadius: 35,
          pointStyle: 'rectRounded',

        }
      },
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            },
            barPercentage: 0.6
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var assignment = document.getElementById('risk-assigment').getContext('2d');
var assignmentchart = new Chart(assignment, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 15, 12, 23, 36, 23, 34],
        backgroundColor: '#5CC0FF',
        borderDash: [10,10]
      }],
    },

    // Configuration options go here
    options: {
      cornerRadius: 20, 
      //Default: false; if true, this would round all corners of final box;
      fullCornerRadius: false, 
      //Default: false; if true, this rounds each box in the stack instead of only final box;
      stackedRounded: false,
      elements: {
        point: {
          radius: 25,
          hoverRadius: 35,
          pointStyle: 'rectRounded',

        }
      },
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            },
            barPercentage: 0.6
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var Headcount3 = document.getElementById('Headcount3').getContext('2d');
var Headcountchart3 = new Chart(Headcount3, {
    // The type of chart we want to create
    type: 'pie',

    // The data for our dataset
    data: {
      datasets: [{
          data: [10, 20, 30, 15, 60, 10],
          backgroundColor: ['#0FAAC0', '#7A50F2', '#FF4918', '#FE7D15', '#FFAA00', '#81C91D']
      }],
    },

    // Configuration options go here
    options: {
      responsive: true
    }
});

var Headcount4 = document.getElementById('Headcount4').getContext('2d');
var Headcountchart4 = new Chart(Headcount4, {
    // The type of chart we want to create
    type: 'pie',

    // The data for our dataset
    data: {
      datasets: [{
          data: [10, 20, 30, 15, 60, 10],
          backgroundColor: ['#0FAAC0', '#7A50F2', '#FF4918', '#FE7D15', '#FFAA00', '#81C91D']
      }],
    },

    // Configuration options go here
    options: {
      responsive: true
    }
});

var Headcount5 = document.getElementById('Headcount5').getContext('2d');
var Headcountchart5 = new Chart(Headcount5, {
    // The type of chart we want to create
    type: 'pie',

    // The data for our dataset
    data: {
      datasets: [{
          data: [10, 20, 30, 15, 60, 10],
          backgroundColor: ['#0FAAC0', '#7A50F2', '#FF4918', '#FE7D15', '#FFAA00', '#81C91D']
      }],
    },

    // Configuration options go here
    options: {
      responsive: true
    }
});

var chartline = document.getElementById('chart-line').getContext('2d');
var chartlinechart = new Chart(chartline, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 22, 12, 23, 36, 23, 34],
        pointStrokeColor: "#fff",
        backgroundColor: "rgba(240,80,80,0.2)",
        pointColor: "rgba(220,220,220,1)",
        borderColor: "#F05050"
      }],
    },

    // Configuration options go here
    options: {
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            }
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var chartline2 = document.getElementById('chart-line-2').getContext('2d');
var chartline2chart = new Chart(chartline2, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 22, 12, 23, 36, 23, 34],
        pointStrokeColor: "#fff",
        backgroundColor: "rgba(92,192,255,0.2)",
        pointColor: "rgba(220,220,220,1)",
        borderColor: "#5CC0FF"
      }],
    },

    // Configuration options go here
    options: {
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            }
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var chartline3 = document.getElementById('chart-line-3').getContext('2d');
var chartline3chart = new Chart(chartline3, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 22, 22, 23, 19, 23, 24],
        pointStrokeColor: "#fff",
        backgroundColor: "rgba(92,192,255,0.2)",
        pointColor: "rgba(220,220,220,1)",
        borderColor: "#5CC0FF"
      }],
    },

    // Configuration options go here
    options: {
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            }
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var chartline4 = document.getElementById('chart-line-4').getContext('2d');
var chartline4chart = new Chart(chartline4, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 22, 22, 23, 19, 23, 24],
        pointStrokeColor: "#fff",
        backgroundColor: "rgba(240,80,80,0.2)",
        pointColor: "rgba(220,220,220,1)",
        borderColor: "#F05050"
      }],
    },

    // Configuration options go here
    options: {
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            }
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var employee = document.getElementById('employee').getContext('2d');
var employeechart = new Chart(employee, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
      datasets: [{
        label: '',
        data: [20, 18, 22, 22, 23, 19, 23, 24],
        pointStrokeColor: "#fff",
        backgroundColor: "rgba(240,80,80,0.2)",
        pointColor: "rgba(220,220,220,1)",
        borderColor: "#F05050"
      }],
    },

    // Configuration options go here
    options: {
      responsive: true,
      scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: false,
                display: false,
            }
        }],
        yAxes: [{
          gridLines: {
            borderDash: [5,5]
          }
        }] 
      }
    }
});

var employee2 = document.getElementById("employee2");
var employee2chart = new Chart(employee2, {
  type: "doughnut",
  data: {
    labels: ["Red"],
    datasets: [
      {
        label: ["# of Votes"],
        data: [45, 55],
        backgroundColor: ["rgba(255,99,132,1)"],
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    circumference: Math.PI + 1,
    rotation: -Math.PI - 0.5,
    cutoutPercentage: 64,

    onClick(...args) {
      console.log(args);
    }
  }
});

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
