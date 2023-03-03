import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";

const LinkChart = (props) => {

  var { type, view, date } = props;

  const chartoptions = {
    series: [
      {
        name: 'TOTAL',
        type: 'area',
        data: view
      },
    ],
    options: {
      chart: {
        height: 350,
        type: 'area',
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
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3, 3],
        curve: 'smooth'
      },
      markers: {
        size: [4, 7]
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
          }
        }
      ],
      // tooltip: {
      //   fixed: {
      //     enabled: true,
      //     position: 'bottomLeft', // topRight, topLeft, bottomRight, bottomLeft
      //     offsetY: 30,
      //     offsetX: 60
      //   },
      // },
      legend: {
        show: true,
        horizontalAlign: 'center',
        offsetX: 40,
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

export default LinkChart;
