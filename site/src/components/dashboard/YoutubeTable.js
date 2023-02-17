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
          views: (element.video_view ? millify(element.video_view) : 'N/A'),
          likes: (element.video_like ? millify(element.video_like) : 'N/A' ),
          comments: (element.video_comment ? millify(element.video_comment) : 'N/A' ),
        }
      }

    }

  }
  let tablevalue = Object.values(tableinfo);


  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Top 20 Videos or Shorts</CardTitle>
          <div id="video_table" style={{ display: "block" }}>
            <CardSubtitle className="mb-2 text-muted" tag="h6">
              Overview of the Videos / Shorts 
            </CardSubtitle>

            <Table className="no-wrap mt-3 align-middle" responsive borderless>
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {tablevalue.map((tdata, index) => (
                  <tr key={index} className="border-top">
                    <td> 
                      <h6 className="mb-0">{tdata.pagename}</h6>
                      <span className="text-muted"><a href={tdata.link} target="_blank" rel = "noopener noreferrer" style={{ color: "inherit" ,textDecoration: "inherit"}}>{tdata.link}</a></span>                    
                    </td>
                    <td>{tdata.views}</td>
                    <td>{tdata.likes}</td>
                    <td>{tdata.comments}</td>
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
