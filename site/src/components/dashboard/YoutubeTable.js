import React from "react";
import { Card, CardBody, CardTitle, CardSubtitle, Table } from "reactstrap";
import millify from "millify";

const YoutubeTables = (props) => {

  const { tabledata } = props;

  let tableinfo = {};
  if (tabledata) {
    var tablevalues = tabledata

    for (let i = 0; i < (tablevalues.length < 20 ? tablevalues.length : 20); i++) {

      let element = tablevalues[i].doc;
      if (element) {
        tableinfo[i] = {
          pagename: element.video_channel_name,
          link: element.video_link,
          views: (element.video_view ? parseInt(element.video_view) : 'N/A'),
          likes: (element.video_like ? parseInt(element.video_like) : 'N/A' ),
          comments: (element.video_comment ? parseInt(element.video_comment) : 'N/A' ),
        }
      }

    }

  }

  let data = Object.values(tableinfo)

  const [tablevalue, settablevalue] = React.useState([]);
  const [gettype, settype] = React.useState('');
  const [getOrderStatus, setOrderStatus] = React.useState(false);



  React.useEffect(() => {
    getSorted('views');
  }, [tabledata]);  // eslint-disable-line react-hooks/exhaustive-deps

  const getSorted = async (type = '') => {

    settablevalue([])
    // console.log(type);

    const clone = [...data];

    function comp(a, b) {
      let returnVariable;
      if (gettype) {
        if (type === gettype) {
          returnVariable = getOrderStatus ? parseInt(b[type]) - parseInt(a[type]) : parseInt(a[type]) - parseInt(b[type]);
          setOrderStatus(!getOrderStatus);
        }
        else {
          returnVariable = getOrderStatus ? parseInt(a[type]) - parseInt(b[type]) : parseInt(b[type]) - parseInt(a[type]);
        }
      }

      return returnVariable;
    }

    clone.sort(comp);

    function isAscendingOrder(arr, prop) {
      for (let i = 0; i < arr.length - 1; i++) {
        if (parseInt(arr[i][prop]) > parseInt(arr[i + 1][prop])) {
          return false;
        }
      }
      return true;
    }

    function isDescendingOrder(arr, prop) {
      for (let i = 0; i < arr.length - 1; i++) {
        if (parseInt(arr[i][prop]) < parseInt(arr[i + 1][prop])) {
          return false;
        }
      }
      return true;
    }

    var typetag = document.getElementById(type);
    var iconupclass = document.getElementsByClassName('up');
    var icondownclass = document.getElementsByClassName('down');
    while (iconupclass.length > 0) iconupclass[0].remove();
    while (icondownclass.length > 0) icondownclass[0].remove();
    var arrow_up = '<i class="bi bi-arrow-up up"></i>';
    var arrow_down = '<i class="bi bi-arrow-down down"></i>';
    if (isAscendingOrder(clone, type)) {
      typetag.innerHTML = type.charAt(0).toUpperCase() + type.slice(1) + arrow_up;
    }
    else if (isDescendingOrder(clone, type)) {
      typetag.innerHTML = type.charAt(0).toUpperCase() + type.slice(1) + arrow_down;
    }

    settablevalue(clone);
    settype(type);

  }


  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Top Videos or Shorts</CardTitle>
          <div id="video_table" style={{ display: "block" }}>
            <CardSubtitle className="mb-2 text-muted" tag="h6">
              Overview of the Videos / Shorts 
            </CardSubtitle>

            <Table className="no-wrap mt-3 align-middle" responsive borderless>
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th id="views" style={{ cursor: "pointer" }} onClick={() => getSorted('views')}>Views</th>
                  <th id="likes" style={{ cursor: "pointer" }} onClick={() => getSorted('likes')}>Likes</th>
                  <th id="comments" style={{ cursor: "pointer" }} onClick={() => getSorted('comments')}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {tablevalue.map((tdata, index) => (
                  <tr key={index} className="border-top">
                    <td> 
                      <h6 className="mb-0">{tdata.pagename}</h6>
                      <span className="text-muted"><a href={tdata.link} target="_blank" rel = "noopener noreferrer" style={{ color: "inherit" ,textDecoration: "inherit"}}>{tdata.link}</a></span>                    
                    </td>
                    <td>{(tdata.views !== 'N/A' ? millify(tdata.views) : 'N/A' )}</td>
                    <td>{(tdata.likes !== 'N/A' ? millify(tdata.likes) : 'N/A' )}</td>
                    <td>{(tdata.comments !== 'N/A' ? millify(tdata.comments) : 'N/A' )}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

          </div>
        </CardBody>
      </Card>
    </div>
  );

};

export default YoutubeTables;
