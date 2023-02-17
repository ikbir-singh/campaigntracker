import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";

const SalesChart = (props) => {

  const { type, view, date } = props;

  // console.log(type)
  // console.log(view)
  // console.log(date)

  const chartoptions = {
    series: [
      {
        name: type,
        data: view,
      },
      // {
      //   name: "Oneplue 9",
      //   data: [0, 11, 32, 45, 32, 34, 52, 41],
      // }, 
    ],
    options: {
      chart: {
        id: 'area-datetime',
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        strokeDashArray: 3,
      },

      stroke: {
        curve: "smooth",
        width: 1,
      },
      xaxis: {
        categories: date
      },
      // xaxis: {
      //   categories: [
      //     "Jan",
      //     "Feb",
      //     "March",
      //     "April",
      //     "May",
      //     "June",
      //     "July",
      //     "Aug",
      //   ],
      // },
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
