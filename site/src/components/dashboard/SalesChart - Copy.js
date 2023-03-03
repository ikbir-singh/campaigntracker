import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";

const SalesChart = (props) => {

  var { type, view, date } = props;

  var newarr = [];

  if (view.length && date.length) {

    newarr = [view[0]];
    // newarr = [0];
    for (let i = 1; i < view.length; i++) {
      newarr.push(view[i] - view[i - 1]);
    }
  }

  const chartoptions = {
    series: [
      {
        name: 'TOTAL',
        type: 'area',
        data: view,
        color: '#008FFB'
      },
      {
        name: 'DAY WISE',
        type: 'column',
        data: newarr,
        color: '#00E396'
      }
    ],
    options: {
      chart: {
        height: 350,
        type: 'column',
        stacked: true,
        toolbar: {
          show: true,
          tools: {
            pan: false,
            zoom: true,
            reset: true
          }
        },
      },
      grid: {
        padding: {
          left: 30, // or whatever value that works
          right: 30 // or whatever value that works
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3, 3],
        curve: 'smooth'
      },
      xaxis: {
        categories: date,
        type: 'datetime',
      },
      yaxis: [
        {
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: '#008FFB'
          },
          labels: {
            style: {
              colors: '#008FFB',
            }
          },
          title: {
            text: type,
            style: {
              color: '#008FFB',
            }
          },
          tooltip: {
            enabled: true
          }
        },
        {
          seriesName: type,
          opposite: true,
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: '#00E396'
          },
          labels: {
            style: {
              colors: '#00E396',
            },
          },
          title: {
            text: type,
            style: {
              color: '#00E396',
            }
          }
        }
      ],
      tooltip: {
        fixed: {
          enabled: true,
          position: 'bottomLeft', // topRight, topLeft, bottomRight, bottomLeft
          offsetY: 30,
          offsetX: 60
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        onItemClick: {
          toggleDataSeries: true
        },
        onItemHover: {
          highlightDataSeries: true
        },
      },
    },
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">{type}</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          {type} Report
        </CardSubtitle>
        <Chart
          type="area"
          width="100%"
          height="390"
          options={chartoptions.options}
          series={chartoptions.series}
        ></Chart>
      </CardBody>
    </Card>
  );
};

export default SalesChart;
